// Performance monitoring system for Maersk API
export interface PerformanceMetric {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  dataSize?: number;
  cacheHit?: boolean;
  retries?: number;
  error?: string;
}

export interface PerformanceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number; // requests per minute
}

export interface EndpointPerformance {
  endpoint: string;
  stats: PerformanceStats;
  recentMetrics: PerformanceMetric[];
  hourlyStats: Record<string, PerformanceStats>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private hourlyStats: Record<string, EndpointPerformance> = {};

  // Add a new performance metric
  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Update hourly stats
    this.updateHourlyStats(metric);
  }

  // Get performance stats for a specific endpoint
  getEndpointStats(endpoint: string, timeWindow: number = 3600000): PerformanceStats {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const endpointMetrics = this.metrics.filter(
      m => m.endpoint === endpoint && m.timestamp >= windowStart
    );

    if (endpointMetrics.length === 0) {
      return this.getEmptyStats();
    }

    const successful = endpointMetrics.filter(m => m.status >= 200 && m.status < 300);
    const failed = endpointMetrics.filter(m => m.status >= 400);
    const cacheHits = endpointMetrics.filter(m => m.cacheHit === true);
    
    const durations = endpointMetrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    const timeWindowMinutes = timeWindow / 60000;
    const throughput = endpointMetrics.length / timeWindowMinutes;

    return {
      totalRequests: endpointMetrics.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: Math.round(avgDuration),
      minResponseTime: minDuration,
      maxResponseTime: maxDuration,
      cacheHitRate: endpointMetrics.length > 0 ? (cacheHits.length / endpointMetrics.length) * 100 : 0,
      errorRate: endpointMetrics.length > 0 ? (failed.length / endpointMetrics.length) * 100 : 0,
      throughput: Math.round(throughput * 100) / 100
    };
  }

  // Get overall performance stats
  getOverallStats(timeWindow: number = 3600000): PerformanceStats {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    if (recentMetrics.length === 0) {
      return this.getEmptyStats();
    }

    const successful = recentMetrics.filter(m => m.status >= 200 && m.status < 300);
    const failed = recentMetrics.filter(m => m.status >= 400);
    const cacheHits = recentMetrics.filter(m => m.cacheHit === true);
    
    const durations = recentMetrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    const timeWindowMinutes = timeWindow / 60000;
    const throughput = recentMetrics.length / timeWindowMinutes;

    return {
      totalRequests: recentMetrics.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: Math.round(avgDuration),
      minResponseTime: minDuration,
      maxResponseTime: maxDuration,
      cacheHitRate: recentMetrics.length > 0 ? (cacheHits.length / recentMetrics.length) * 100 : 0,
      errorRate: recentMetrics.length > 0 ? (failed.length / recentMetrics.length) * 100 : 0,
      throughput: Math.round(throughput * 100) / 100
    };
  }

  // Get performance by endpoint
  getEndpointsPerformance(timeWindow: number = 3600000): Record<string, PerformanceStats> {
    const endpoints = [...new Set(this.metrics.map(m => m.endpoint))];
    const result: Record<string, PerformanceStats> = {};
    
    endpoints.forEach(endpoint => {
      result[endpoint] = this.getEndpointStats(endpoint, timeWindow);
    });
    
    return result;
  }

  // Get recent metrics
  getRecentMetrics(limit: number = 50): PerformanceMetric[] {
    return this.metrics.slice(-limit).reverse();
  }

  // Get slowest requests
  getSlowestRequests(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get failed requests
  getFailedRequests(limit: number = 20): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.status >= 400)
      .slice(-limit)
      .reverse();
  }

  // Clear old metrics
  clearOldMetrics(olderThan: number = 86400000): void { // Default: 24 hours
    const cutoff = Date.now() - olderThan;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }

  // Get cache performance
  getCachePerformance(timeWindow: number = 3600000): {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    const cacheHits = recentMetrics.filter(m => m.cacheHit === true).length;
    const cacheMisses = recentMetrics.filter(m => m.cacheHit === false).length;
    const total = cacheHits + cacheMisses;
    
    return {
      hitRate: total > 0 ? (cacheHits / total) * 100 : 0,
      missRate: total > 0 ? (cacheMisses / total) * 100 : 0,
      totalRequests: total,
      cacheHits,
      cacheMisses
    };
  }

  // Update hourly statistics
  private updateHourlyStats(metric: PerformanceMetric): void {
    const hour = new Date(metric.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
    
    if (!this.hourlyStats[hour]) {
      this.hourlyStats[hour] = {
        endpoint: metric.endpoint,
        stats: this.getEmptyStats(),
        recentMetrics: [],
        hourlyStats: {}
      };
    }
    
    this.hourlyStats[hour].recentMetrics.push(metric);
    
    // Recalculate stats for this hour
    this.hourlyStats[hour].stats = this.calculateStatsFromMetrics(
      this.hourlyStats[hour].recentMetrics
    );
  }

  // Calculate stats from metrics array
  private calculateStatsFromMetrics(metrics: PerformanceMetric[]): PerformanceStats {
    if (metrics.length === 0) {
      return this.getEmptyStats();
    }

    const successful = metrics.filter(m => m.status >= 200 && m.status < 300);
    const failed = metrics.filter(m => m.status >= 400);
    const cacheHits = metrics.filter(m => m.cacheHit === true);
    
    const durations = metrics.map(m => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalRequests: metrics.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: Math.round(avgDuration),
      minResponseTime: minDuration,
      maxResponseTime: maxDuration,
      cacheHitRate: metrics.length > 0 ? (cacheHits.length / metrics.length) * 100 : 0,
      errorRate: metrics.length > 0 ? (failed.length / metrics.length) * 100 : 0,
      throughput: 0 // Will be calculated based on time window
    };
  }

  // Get empty stats object
  private getEmptyStats(): PerformanceStats {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0
    };
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Import metrics (for testing or data migration)
  importMetrics(metrics: PerformanceMetric[]): void {
    this.metrics = [...this.metrics, ...metrics];
    this.metrics.sort((a, b) => a.timestamp - b.timestamp);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to create performance metric
export function createPerformanceMetric(
  endpoint: string,
  method: string,
  status: number,
  duration: number,
  dataSize?: number,
  cacheHit?: boolean,
  retries?: number,
  error?: string
): PerformanceMetric {
  return {
    endpoint,
    method,
    status,
    duration,
    timestamp: Date.now(),
    dataSize,
    cacheHit,
    retries,
    error
  };
}

// Performance monitoring decorator for API functions
export function monitorPerformance(endpoint: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let status = 200;
      let error: string | undefined;
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        performanceMonitor.addMetric(createPerformanceMetric(
          endpoint,
          'GET',
          status,
          duration,
          JSON.stringify(result).length
        ));
        
        return result;
      } catch (err: any) {
        const duration = Date.now() - startTime;
        status = err.status || 500;
        error = err.message;
        
        performanceMonitor.addMetric(createPerformanceMetric(
          endpoint,
          'GET',
          status,
          duration,
          undefined,
          undefined,
          undefined,
          error
        ));
        
        throw err;
      }
    };
  };
}
