import { NextRequest } from 'next/server';

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  success: boolean;
  hasData: boolean;
  error?: string;
  data?: any;
}

export interface ApiTestSuite {
  name: string;
  description: string;
  tests: ApiTest[];
}

export interface ApiTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  params?: Record<string, string>;
  expectedStatus?: number;
  expectedFields?: string[];
  description?: string;
}

export class ApiTestRunner {
  private baseUrl: string;
  private results: ApiTestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async runTest(test: ApiTest): Promise<ApiTestResult> {
    const startTime = Date.now();
    const url = new URL(test.endpoint, this.baseUrl);
    
    // Добавляем параметры к URL
    if (test.params) {
      Object.entries(test.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json().catch(() => null);

      const result: ApiTestResult = {
        endpoint: test.endpoint,
        method: test.method,
        status: response.status,
        responseTime,
        success: response.status === (test.expectedStatus || 200),
        hasData: data && Object.keys(data).length > 0,
        data,
      };

      // Проверяем ожидаемые поля
      if (test.expectedFields && data) {
        const missingFields = test.expectedFields.filter(field => !(field in data));
        if (missingFields.length > 0) {
          result.error = `Missing expected fields: ${missingFields.join(', ')}`;
          result.success = false;
        }
      }

      this.results.push(result);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: ApiTestResult = {
        endpoint: test.endpoint,
        method: test.method,
        status: 0,
        responseTime,
        success: false,
        hasData: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.results.push(result);
      return result;
    }
  }

  async runSuite(suite: ApiTestSuite): Promise<ApiTestResult[]> {
    console.log(`🧪 Running test suite: ${suite.name}`);
    console.log(`📝 Description: ${suite.description}`);
    
    const results: ApiTestResult[] = [];
    
    for (const test of suite.tests) {
      console.log(`  🔍 Testing: ${test.name}`);
      const result = await this.runTest(test);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`    ${status} ${test.endpoint} - ${result.status} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`    ⚠️ Error: ${result.error}`);
      }
    }
    
    return results;
  }

  getResults(): ApiTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / total;
    const slowRequests = this.results.filter(r => r.responseTime > 1000).length;

    return {
      total,
      successful,
      failed,
      successRate: (successful / total) * 100,
      avgResponseTime: Math.round(avgResponseTime),
      slowRequests,
    };
  }

  clearResults() {
    this.results = [];
  }
}

// Определение тест-сьютов
export const API_TEST_SUITES: ApiTestSuite[] = [
  {
    name: 'Core API Endpoints',
    description: 'Тестирование основных API endpoints',
    tests: [
      {
        name: 'Ports Search',
        endpoint: '/api/ports/search',
        method: 'GET',
        params: { q: 'sha' },
        expectedStatus: 200,
        expectedFields: ['ports', 'total'],
        description: 'Поиск портов по запросу',
      },
      {
        name: 'Schedules Search',
        endpoint: '/api/schedules',
        method: 'GET',
        params: {
          originPortId: 'CNSHA',
          destinationPortId: 'USLAX',
          departureDateFrom: '2024-01-01',
          departureDateTo: '2024-01-31',
        },
        expectedStatus: 200,
        expectedFields: ['sailings', 'total'],
        description: 'Поиск расписаний рейсов',
      },
      {
        name: 'Deadlines Search',
        endpoint: '/api/deadlines',
        method: 'GET',
        params: {
          vesselImo: '1234567',
          voyage: '123',
          portOfLoad: 'CNSHA',
          isoCountryCode: 'CN',
        },
        expectedStatus: 200,
        expectedFields: ['deadlines'],
        description: 'Получение дедлайнов отправки',
      },
             {
         name: 'Vessel Info',
         endpoint: '/api/vessels/1234567',
         method: 'GET',
         expectedStatus: 200,
         expectedFields: ['imo', 'name', 'vessel'],
         description: 'Получение информации о судне',
       },
    ],
  },
  {
    name: 'Data Management',
    description: 'Тестирование управления данными',
    tests: [
      {
        name: 'Vessels List',
        endpoint: '/api/vessels',
        method: 'GET',
        expectedStatus: 200,
        description: 'Получение списка судов',
      },
      {
        name: 'Ocean Products',
        endpoint: '/api/ocean-products',
        method: 'GET',
        expectedStatus: 200,
        description: 'Получение океанских продуктов',
      },
      {
        name: 'Load Vessels Data',
        endpoint: '/api/load-data',
        method: 'POST',
        params: { type: 'vessels' },
        expectedStatus: 200,
        description: 'Загрузка данных о судах',
      },
    ],
  },
  {
    name: 'Monitoring & Diagnostics',
    description: 'Тестирование мониторинга и диагностики',
    tests: [
      {
        name: 'Performance Overview',
        endpoint: '/api/performance',
        method: 'GET',
        params: { action: 'overview' },
        expectedStatus: 200,
        expectedFields: ['data'],
        description: 'Обзор производительности',
      },
      {
        name: 'Performance Recent',
        endpoint: '/api/performance',
        method: 'GET',
        params: { action: 'recent', limit: '10' },
        expectedStatus: 200,
        expectedFields: ['data'],
        description: 'Последние метрики производительности',
      },
      {
        name: 'Diagnostics Health',
        endpoint: '/api/diagnostics',
        method: 'GET',
        params: { action: 'health' },
        expectedStatus: 200,
        expectedFields: ['status', 'checks'],
        description: 'Проверка здоровья системы',
      },
      {
        name: 'Diagnostics API Status',
        endpoint: '/api/diagnostics',
        method: 'GET',
        params: { action: 'api-status' },
        expectedStatus: 200,
        description: 'Статус API endpoints',
      },
      {
        name: 'Telemetry Stats',
        endpoint: '/api/telemetry',
        method: 'GET',
        params: { action: 'stats' },
        expectedStatus: 200,
        expectedFields: ['data'],
        description: 'Статистика телеметрии',
      },
      {
        name: 'Maersk Status',
        endpoint: '/api/maersk-status',
        method: 'GET',
        expectedStatus: 200,
        expectedFields: ['success', 'message'],
        description: 'Статус подключения к Maersk API',
      },
    ],
  },
  {
    name: 'Error Handling',
    description: 'Тестирование обработки ошибок',
    tests: [
      {
        name: 'Invalid Port Search',
        endpoint: '/api/ports/search',
        method: 'GET',
        params: { q: '' },
        expectedStatus: 400,
        description: 'Поиск портов с пустым запросом',
      },
      {
        name: 'Invalid Vessel IMO',
        endpoint: '/api/vessels/invalid',
        method: 'GET',
        expectedStatus: 400,
        description: 'Запрос с неверным IMO номером',
      },
      {
        name: 'Missing Required Params',
        endpoint: '/api/schedules',
        method: 'GET',
        expectedStatus: 400,
        description: 'Запрос расписаний без обязательных параметров',
      },
      {
        name: 'Invalid Performance Action',
        endpoint: '/api/performance',
        method: 'GET',
        params: { action: 'invalid' },
        expectedStatus: 400,
        description: 'Неверное действие для мониторинга производительности',
      },
    ],
  },
];

// Функция для запуска всех тестов
export async function runAllApiTests(baseUrl?: string): Promise<{
  results: ApiTestResult[];
  summary: any;
  suites: { name: string; results: ApiTestResult[] }[];
}> {
  const runner = new ApiTestRunner(baseUrl);
  const suites = [];

  console.log('🚀 Starting comprehensive API testing...\n');

  for (const suite of API_TEST_SUITES) {
    const suiteResults = await runner.runSuite(suite);
    suites.push({ name: suite.name, results: suiteResults });
    console.log(''); // Пустая строка между сьютами
  }

  const allResults = runner.getResults();
  const summary = runner.getSummary();

  console.log('📊 Test Summary:');
  console.log(`  Total tests: ${summary.total}`);
  console.log(`  Successful: ${summary.successful}`);
  console.log(`  Failed: ${summary.failed}`);
  console.log(`  Success rate: ${summary.successRate.toFixed(1)}%`);
  console.log(`  Average response time: ${summary.avgResponseTime}ms`);
  console.log(`  Slow requests (>1s): ${summary.slowRequests}`);

  return {
    results: allResults,
    summary,
    suites,
  };
}

// Функция для экспорта результатов в JSON
export function exportTestResults(results: ApiTestResult[], summary: any) {
  return {
    timestamp: new Date().toISOString(),
    summary,
    results,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    },
  };
}
