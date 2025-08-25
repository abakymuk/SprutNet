import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const timeWindow = parseInt(searchParams.get('timeWindow') || '3600000'); // Default: 1 hour
    const endpoint = searchParams.get('endpoint');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📊 Performance monitoring request:', { action, timeWindow, endpoint, limit });

    switch (action) {
      case 'overview':
        const overallStats = performanceMonitor.getOverallStats(timeWindow);
        const endpointsPerformance = performanceMonitor.getEndpointsPerformance(timeWindow);
        const cachePerformance = performanceMonitor.getCachePerformance(timeWindow);
        
        return NextResponse.json({
          success: true,
          data: {
            overall: overallStats,
            endpoints: endpointsPerformance,
            cache: cachePerformance,
            timestamp: new Date().toISOString()
          }
        });

      case 'endpoint':
        if (!endpoint) {
          return NextResponse.json({
            success: false,
            error: 'Endpoint parameter is required'
          }, { status: 400 });
        }
        
        const endpointStats = performanceMonitor.getEndpointStats(endpoint, timeWindow);
        const recentMetrics = performanceMonitor.getRecentMetrics(limit);
        
        return NextResponse.json({
          success: true,
          data: {
            endpoint,
            stats: endpointStats,
            recentMetrics: recentMetrics.filter(m => m.endpoint === endpoint),
            timestamp: new Date().toISOString()
          }
        });

      case 'slowest':
        const slowestRequests = performanceMonitor.getSlowestRequests(limit);
        
        return NextResponse.json({
          success: true,
          data: {
            slowestRequests,
            timestamp: new Date().toISOString()
          }
        });

      case 'failed':
        const failedRequests = performanceMonitor.getFailedRequests(limit);
        
        return NextResponse.json({
          success: true,
          data: {
            failedRequests,
            timestamp: new Date().toISOString()
          }
        });

      case 'recent':
        const recent = performanceMonitor.getRecentMetrics(limit);
        
        return NextResponse.json({
          success: true,
          data: {
            recentMetrics: recent,
            timestamp: new Date().toISOString()
          }
        });

      case 'cache':
        const cache = performanceMonitor.getCachePerformance(timeWindow);
        
        return NextResponse.json({
          success: true,
          data: {
            cachePerformance: cache,
            timestamp: new Date().toISOString()
          }
        });

      case 'export':
        const metrics = performanceMonitor.exportMetrics();
        
        return NextResponse.json({
          success: true,
          data: {
            metrics,
            count: metrics.length,
            timestamp: new Date().toISOString()
          }
        });

      case 'clear':
        performanceMonitor.clearOldMetrics();
        
        return NextResponse.json({
          success: true,
          message: 'Old metrics cleared successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: overview, endpoint, slowest, failed, recent, cache, export, clear'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in performance monitoring API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
