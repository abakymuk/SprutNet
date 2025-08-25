import { NextRequest, NextResponse } from 'next/server';
import { telemetryLogger } from '@/lib/telemetry/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'health';

  try {
    switch (action) {
      case 'health':
        return await getHealthCheck();
      case 'api-status':
        return await getApiStatus();
      case 'validate-response':
        return await validateApiResponse(request);
      case 'test-endpoints':
        return await testEndpoints();
      case 'logs':
        return await getRecentLogs();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return NextResponse.json(
      { error: 'Diagnostic failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Полная проверка здоровья системы
async function getHealthCheck() {
  const checks = {
    timestamp: new Date().toISOString(),
    system: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      FEATURE_MAERSK: process.env.FEATURE_MAERSK === 'true',
      CACHE_ENABLED: process.env.CACHE_ENABLED === 'true',
    },
    telemetry: {
      totalEvents: telemetryLogger.getEvents().length,
      recentErrors: telemetryLogger.getEvents()
        .filter(e => e.event.includes('error'))
        .slice(-5)
        .map(e => ({ event: e.event, timestamp: e.timestamp, data: e.data })),
    },
    api: {
      ports: await testEndpoint('/api/ports/search?q=sha'),
      schedules: await testEndpoint('/api/schedules?originPortId=CNSHA&destinationPortId=USLAX'),
      deadlines: await testEndpoint('/api/deadlines?vesselImo=1234567&voyage=123&portOfLoad=CNSHA'),
    },
  };

  const isHealthy = checks.api.ports.status === 200 && 
                   checks.api.schedules.status === 200;

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    checks,
    recommendations: isHealthy ? [] : [
      'Check Maersk API connectivity',
      'Verify environment variables',
      'Review recent error logs',
    ],
  });
}

// Детальный статус API
async function getApiStatus() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/maersk-status`);
    const data = await response.json();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      maerskStatus: data,
      environment: {
        MAERSK_CONSUMER_KEY: process.env.MAERSK_CONSUMER_KEY ? 'configured' : 'missing',
        MAERSK_CLIENT_SECRET: process.env.MAERSK_CLIENT_SECRET ? 'configured' : 'missing',
        MAERSK_API_BASE_URL: process.env.MAERSK_API_BASE_URL || 'default',
      },
      recommendations: data.success ? [] : [
        'Check Maersk API credentials',
        'Verify product activation in Maersk Developer Portal',
        'Review API rate limits',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check Maersk API status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Валидация ответов API
async function validateApiResponse(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const expectedFields = searchParams.get('fields')?.split(',') || [];

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter required' }, { status: 400 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();

    const hasExpectedFields = expectedFields.every(field => {
      return data && typeof data === 'object' && field in data;
    });
    
    const validation = {
      endpoint,
      status: response.status,
      responseTime: Date.now(),
      hasExpectedFields,
      fieldTypes: expectedFields.reduce((acc, field) => {
        acc[field] = data?.[field] ? typeof data[field] : 'missing';
        return acc;
      }, {} as Record<string, string>),
      dataStructure: analyzeDataStructure(data),
    };

    const isValid = validation.status === 200 && validation.hasExpectedFields;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      validation,
      isValid: validation.status === 200 && validation.hasExpectedFields,
      recommendations: isValid ? [] : [
        'Check API response structure',
        'Verify field mappings',
        'Review API documentation',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Validation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Тестирование всех endpoints
async function testEndpoints() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoints = [
    { path: '/api/ports/search?q=sha', name: 'Ports Search' },
    { path: '/api/schedules?originPortId=CNSHA&destinationPortId=USLAX', name: 'Schedules' },
    { path: '/api/deadlines?vesselImo=1234567&voyage=123&portOfLoad=CNSHA', name: 'Deadlines' },
    { path: '/api/vessels/1234567', name: 'Vessels' },
    { path: '/api/telemetry?action=stats', name: 'Telemetry' },
  ];

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const start = Date.now();
      try {
        const response = await fetch(`${baseUrl}${endpoint.path}`);
        const data = await response.json();
        const duration = Date.now() - start;

        return {
          name: endpoint.name,
          path: endpoint.path,
          status: response.status,
          duration,
          success: response.status === 200,
          hasData: data && Object.keys(data).length > 0,
        };
      } catch (error) {
        return {
          name: endpoint.name,
          path: endpoint.path,
          status: 0,
          duration: Date.now() - start,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  const failedEndpoints = results.filter(r => !r.success);
  const slowEndpoints = results.filter(r => r.duration > 1000);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: failedEndpoints.length,
      slow: slowEndpoints.length,
    },
    recommendations: [
      ...(failedEndpoints.length > 0 ? ['Check failed endpoints configuration'] : []),
      ...(slowEndpoints.length > 0 ? ['Optimize slow endpoints performance'] : []),
    ],
  });
}

// Получение последних логов
async function getRecentLogs() {
  const events = telemetryLogger.getEvents().slice(-20);
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalEvents: telemetryLogger.getEvents().length,
    recentEvents: events.map(event => ({
      timestamp: new Date(event.timestamp).toISOString(),
      event: event.event,
      data: event.data,
      sessionId: event.sessionId,
    })),
    errorEvents: events.filter(e => e.event.includes('error')),
    apiEvents: events.filter(e => e.event.includes('api')),
    cacheEvents: events.filter(e => e.event.includes('cache')),
  });
}

// Вспомогательные функции
async function testEndpoint(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}${path}`);
    return {
      status: response.status,
      success: response.status === 200,
      duration: Date.now(),
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function analyzeDataStructure(data: any): any {
  if (!data || typeof data !== 'object') {
    return { type: typeof data, value: data };
  }

  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      sample: data.slice(0, 3),
    };
  }

  return {
    type: 'object',
    keys: Object.keys(data),
    sample: Object.fromEntries(
      Object.entries(data).slice(0, 5).map(([key, value]) => [
        key,
        typeof value === 'object' ? { type: typeof value, keys: Object.keys(value || {}).slice(0, 3) } : typeof value
      ])
    ),
  };
}
