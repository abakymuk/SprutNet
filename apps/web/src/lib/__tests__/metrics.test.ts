import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  CacheMetrics, 
  ApiMetrics, 
  logCacheMetrics, 
  logApiMetrics,
  ENDPOINT_CONFIG,
  generateCacheKey 
} from '../types/metrics';

// Мокаем console.log
const mockConsoleLog = vi.fn();
global.console.log = mockConsoleLog;

describe('Metrics Utils', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  describe('logCacheMetrics', () => {
    it('should log cache metrics correctly', () => {
      const metrics: CacheMetrics = {
        cacheHit: true,
        resultCount: 5,
        latency: 150,
        endpoint: 'schedules',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        cacheKey: 'schedules:origin=CNSHA|destination=NLRTM',
        ttl: 900000,
      };

      logCacheMetrics(metrics);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"cache_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"cacheHit":true')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"resultCount":5')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"latency":150')
      );
    });

    it('should log cache miss metrics', () => {
      const metrics: CacheMetrics = {
        cacheHit: false,
        resultCount: 0,
        latency: 0,
        endpoint: 'deadlines',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      logCacheMetrics(metrics);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"cacheHit":false')
      );
    });
  });

  describe('logApiMetrics', () => {
    it('should log API success metrics', () => {
      const metrics: ApiMetrics = {
        endpoint: 'schedules',
        method: 'GET',
        status: 200,
        latency: 2500,
        retries: 0,
        cached: false,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      };

      logApiMetrics(metrics);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"api_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"status":200')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"latency":2500')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"retries":0')
      );
    });

    it('should log API error metrics', () => {
      const metrics: ApiMetrics = {
        endpoint: 'deadlines',
        method: 'GET',
        status: 429,
        latency: 5000,
        retries: 2,
        cached: false,
        timestamp: new Date('2024-01-15T10:00:00Z'),
        error: 'Rate limit exceeded',
      };

      logApiMetrics(metrics);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"status":429')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Rate limit exceeded"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"retries":2')
      );
    });
  });

  describe('generateCacheKey', () => {
    it('should generate cache key from sorted params', () => {
      const params = {
        destination: 'NLRTM',
        origin: 'CNSHA',
        from: '2024-01-15',
        to: '2024-01-30',
      };

      const key = generateCacheKey('schedules', params);

      expect(key).toBe('schedules:destination=NLRTM|from=2024-01-15|origin=CNSHA|to=2024-01-30');
    });

    it('should handle empty params', () => {
      const key = generateCacheKey('ports', {});

      expect(key).toBe('ports:');
    });

    it('should handle single param', () => {
      const key = generateCacheKey('vessels', { imo: '1234567' });

      expect(key).toBe('vessels:imo=1234567');
    });

    it('should handle complex values', () => {
      const params = {
        query: 'shanghai',
        limit: 10,
        type: 'SEAPORT',
      };

      const key = generateCacheKey('ports', params);

      expect(key).toBe('ports:limit=10|query=shanghai|type=SEAPORT');
    });
  });

  describe('ENDPOINT_CONFIG', () => {
    it('should have correct TTL for schedules', () => {
      expect(ENDPOINT_CONFIG.schedules.enabled).toBe(true);
      expect(ENDPOINT_CONFIG.schedules.ttl).toBeGreaterThan(0);
      expect(ENDPOINT_CONFIG.schedules.maxSize).toBe(100);
    });

    it('should have shorter TTL for deadlines', () => {
      expect(ENDPOINT_CONFIG.deadlines.enabled).toBe(true);
      expect(ENDPOINT_CONFIG.deadlines.ttl).toBeLessThan(ENDPOINT_CONFIG.schedules.ttl);
      expect(ENDPOINT_CONFIG.deadlines.maxSize).toBe(50);
    });

    it('should have correct TTL for ports', () => {
      expect(ENDPOINT_CONFIG.ports.enabled).toBe(true);
      expect(ENDPOINT_CONFIG.ports.ttl).toBeGreaterThan(0);
      expect(ENDPOINT_CONFIG.ports.maxSize).toBe(100);
    });

    it('should have correct TTL for vessels', () => {
      expect(ENDPOINT_CONFIG.vessels.enabled).toBe(true);
      expect(ENDPOINT_CONFIG.vessels.ttl).toBeGreaterThan(0);
      expect(ENDPOINT_CONFIG.vessels.maxSize).toBe(50);
    });

    it('should have reasonable TTL values', () => {
      // Schedules: 15 minutes
      expect(ENDPOINT_CONFIG.schedules.ttl).toBe(15 * 60 * 1000);
      
      // Deadlines: 3 minutes
      expect(ENDPOINT_CONFIG.deadlines.ttl).toBe(3 * 60 * 1000);
      
      // Ports: 15 minutes
      expect(ENDPOINT_CONFIG.ports.ttl).toBe(15 * 60 * 1000);
      
      // Vessels: 15 minutes
      expect(ENDPOINT_CONFIG.vessels.ttl).toBe(15 * 60 * 1000);
    });
  });
});
