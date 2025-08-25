import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  performanceMonitor, 
  createPerformanceMetric, 
  PerformanceMetric,
  PerformanceStats 
} from '@/lib/monitoring/performance';

describe('Performance Monitoring System', () => {
  beforeEach(() => {
    // Clear metrics before each test
    performanceMonitor['metrics'] = [];
  });

  describe('createPerformanceMetric', () => {
    it('should create a valid performance metric', () => {
      const metric = createPerformanceMetric(
        '/api/ports/search',
        'GET',
        200,
        150,
        1024,
        true,
        0
      );

      expect(metric).toEqual({
        endpoint: '/api/ports/search',
        method: 'GET',
        status: 200,
        duration: 150,
        timestamp: expect.any(Number),
        dataSize: 1024,
        cacheHit: true,
        retries: 0,
        error: undefined
      });

      expect(metric.timestamp).toBeGreaterThan(Date.now() - 1000);
      expect(metric.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should create metric with error information', () => {
      const metric = createPerformanceMetric(
        '/api/schedules',
        'GET',
        500,
        2000,
        undefined,
        false,
        3,
        'Internal Server Error'
      );

      expect(metric.error).toBe('Internal Server Error');
      expect(metric.retries).toBe(3);
      expect(metric.cacheHit).toBe(false);
    });
  });

  describe('PerformanceMonitor - Basic Operations', () => {
    it('should add and retrieve metrics', () => {
      const metric = createPerformanceMetric('/api/test', 'GET', 200, 100);
      performanceMonitor.addMetric(metric);

      const recentMetrics = performanceMonitor.getRecentMetrics(10);
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0]).toEqual(metric);
    });

    it('should limit metrics to maxMetrics', () => {
      const maxMetrics = performanceMonitor['maxMetrics'];
      
      // Add more than maxMetrics
      for (let i = 0; i < maxMetrics + 10; i++) {
        const metric = createPerformanceMetric(`/api/test${i}`, 'GET', 200, 100);
        performanceMonitor.addMetric(metric);
      }

      const recentMetrics = performanceMonitor.getRecentMetrics();
      expect(recentMetrics.length).toBeLessThanOrEqual(maxMetrics);
    });

    it('should return metrics in reverse chronological order', () => {
      const metric1 = createPerformanceMetric('/api/test1', 'GET', 200, 100);
      const metric2 = createPerformanceMetric('/api/test2', 'GET', 200, 100);
      
      performanceMonitor.addMetric(metric1);
      performanceMonitor.addMetric(metric2);

      const recentMetrics = performanceMonitor.getRecentMetrics(10);
      expect(recentMetrics[0]).toEqual(metric2);
      expect(recentMetrics[1]).toEqual(metric1);
    });
  });

  describe('PerformanceMonitor - Statistics', () => {
    it('should calculate correct overall stats', () => {
      // Add various metrics
      performanceMonitor.addMetric(createPerformanceMetric('/api/test1', 'GET', 200, 100, 512, true));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test2', 'GET', 200, 200, 1024, false));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test3', 'GET', 404, 50, 0, false));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test4', 'GET', 500, 300, 0, false));

      const stats = performanceMonitor.getOverallStats();

      expect(stats.totalRequests).toBe(4);
      expect(stats.successfulRequests).toBe(2);
      expect(stats.failedRequests).toBe(2);
      expect(stats.averageResponseTime).toBe(162); // (100 + 200 + 50 + 300) / 4
      expect(stats.minResponseTime).toBe(50);
      expect(stats.maxResponseTime).toBe(300);
      expect(stats.cacheHitRate).toBe(25); // 1 out of 4
      expect(stats.errorRate).toBe(50); // 2 out of 4
    });

    it('should calculate endpoint-specific stats', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/ports', 'GET', 200, 100, 512, true));
      performanceMonitor.addMetric(createPerformanceMetric('/api/ports', 'GET', 200, 150, 1024, false));
      performanceMonitor.addMetric(createPerformanceMetric('/api/vessels', 'GET', 200, 200, 2048, true));

      const portsStats = performanceMonitor.getEndpointStats('/api/ports');
      const vesselsStats = performanceMonitor.getEndpointStats('/api/vessels');

      expect(portsStats.totalRequests).toBe(2);
      expect(portsStats.successfulRequests).toBe(2);
      expect(portsStats.averageResponseTime).toBe(125);
      expect(portsStats.cacheHitRate).toBe(50);

      expect(vesselsStats.totalRequests).toBe(1);
      expect(vesselsStats.successfulRequests).toBe(1);
      expect(vesselsStats.averageResponseTime).toBe(200);
      expect(vesselsStats.cacheHitRate).toBe(100);
    });

    it('should handle time window filtering', () => {
      const oldMetric = createPerformanceMetric('/api/test', 'GET', 200, 100);
      oldMetric.timestamp = Date.now() - 7200000; // 2 hours ago
      performanceMonitor.addMetric(oldMetric);

      const newMetric = createPerformanceMetric('/api/test', 'GET', 200, 200);
      performanceMonitor.addMetric(newMetric);

      const stats = performanceMonitor.getOverallStats(3600000); // 1 hour window
      expect(stats.totalRequests).toBe(1); // Only the new metric
    });
  });

  describe('PerformanceMonitor - Special Queries', () => {
    it('should return slowest requests', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/slow1', 'GET', 200, 1000));
      performanceMonitor.addMetric(createPerformanceMetric('/api/slow2', 'GET', 200, 2000));
      performanceMonitor.addMetric(createPerformanceMetric('/api/fast', 'GET', 200, 100));

      const slowest = performanceMonitor.getSlowestRequests(2);
      expect(slowest).toHaveLength(2);
      expect(slowest[0].duration).toBe(2000);
      expect(slowest[1].duration).toBe(1000);
    });

    it('should return failed requests', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/success', 'GET', 200, 100));
      performanceMonitor.addMetric(createPerformanceMetric('/api/error1', 'GET', 404, 50));
      performanceMonitor.addMetric(createPerformanceMetric('/api/error2', 'GET', 500, 200));

      const failed = performanceMonitor.getFailedRequests(10);
      expect(failed).toHaveLength(2);
      expect(failed.every(m => m.status >= 400)).toBe(true);
    });

    it('should return endpoints performance', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/ports', 'GET', 200, 100));
      performanceMonitor.addMetric(createPerformanceMetric('/api/vessels', 'GET', 200, 200));

      const endpoints = performanceMonitor.getEndpointsPerformance();
      
      expect(endpoints).toHaveProperty('/api/ports');
      expect(endpoints).toHaveProperty('/api/vessels');
      expect(endpoints['/api/ports'].totalRequests).toBe(1);
      expect(endpoints['/api/vessels'].totalRequests).toBe(1);
    });
  });

  describe('PerformanceMonitor - Cache Performance', () => {
    it('should calculate cache performance correctly', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/test1', 'GET', 200, 100, 512, true));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test2', 'GET', 200, 150, 1024, false));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test3', 'GET', 200, 200, 2048, true));

      const cacheStats = performanceMonitor.getCachePerformance();

      expect(cacheStats.totalRequests).toBe(3);
      expect(cacheStats.cacheHits).toBe(2);
      expect(cacheStats.cacheMisses).toBe(1);
      expect(cacheStats.hitRate).toBe(66.67);
      expect(cacheStats.missRate).toBe(33.33);
    });

    it('should handle cache performance with no cache hits', () => {
      performanceMonitor.addMetric(createPerformanceMetric('/api/test1', 'GET', 200, 100, 512, false));
      performanceMonitor.addMetric(createPerformanceMetric('/api/test2', 'GET', 200, 150, 1024, false));

      const cacheStats = performanceMonitor.getCachePerformance();

      expect(cacheStats.hitRate).toBe(0);
      expect(cacheStats.missRate).toBe(100);
    });
  });

  describe('PerformanceMonitor - Data Management', () => {
    it('should clear old metrics', () => {
      const oldMetric = createPerformanceMetric('/api/old', 'GET', 200, 100);
      oldMetric.timestamp = Date.now() - 86400000; // 24 hours ago
      performanceMonitor.addMetric(oldMetric);

      const newMetric = createPerformanceMetric('/api/new', 'GET', 200, 100);
      performanceMonitor.addMetric(newMetric);

      performanceMonitor.clearOldMetrics(3600000); // Clear older than 1 hour

      const recentMetrics = performanceMonitor.getRecentMetrics();
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0]).toEqual(newMetric);
    });

    it('should export and import metrics', () => {
      const metric1 = createPerformanceMetric('/api/test1', 'GET', 200, 100);
      const metric2 = createPerformanceMetric('/api/test2', 'GET', 200, 200);
      
      performanceMonitor.addMetric(metric1);
      performanceMonitor.addMetric(metric2);

      const exported = performanceMonitor.exportMetrics();
      expect(exported).toHaveLength(2);
      expect(exported).toContainEqual(metric1);
      expect(exported).toContainEqual(metric2);

      // Clear and import
      performanceMonitor['metrics'] = [];
      performanceMonitor.importMetrics(exported);

      const recentMetrics = performanceMonitor.getRecentMetrics();
      expect(recentMetrics).toHaveLength(2);
    });
  });

  describe('PerformanceMonitor - Edge Cases', () => {
    it('should handle empty metrics gracefully', () => {
      const stats = performanceMonitor.getOverallStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
    });

    it('should handle non-existent endpoints', () => {
      const stats = performanceMonitor.getEndpointStats('/api/nonexistent');
      expect(stats.totalRequests).toBe(0);
    });

    it('should handle metrics with undefined cacheHit', () => {
      const metric = createPerformanceMetric('/api/test', 'GET', 200, 100);
      metric.cacheHit = undefined;
      performanceMonitor.addMetric(metric);

      const stats = performanceMonitor.getOverallStats();
      expect(stats.cacheHitRate).toBe(0);
    });
  });
});
