import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  OptimizedCache,
  staticDataCache,
  apiResponseCache,
  userDataCache
} from '@/lib/cache/optimized-cache';

describe('Optimized Cache System', () => {
  let cache: OptimizedCache;

  beforeEach(() => {
    cache = new OptimizedCache({
      maxSize: 5,
      ttl: 60000, // 1 minute
      cleanupInterval: 30000 // 30 seconds
    });
  });

  describe('Basic Cache Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should respect TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      expect(cache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBeNull();
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('Cache Size Management', () => {
    it('should respect maxSize limit', () => {
      // Add more than maxSize
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Check that we can still get the most recent keys
      expect(cache.get('key9')).toBe('value9');
      expect(cache.get('key8')).toBe('value8');
    });

    it('should evict least recently used entries', () => {
      // Fill cache
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');

      // Access some keys to update their access patterns
      cache.get('key1'); // Most recently accessed
      cache.get('key3'); // Second most recently accessed

      // Add new key to trigger eviction
      cache.set('key6', 'value6');

      // key2, key4, key5 should be evicted (least recently used)
      expect(cache.get('key1')).toBe('value1'); // Should remain
      expect(cache.get('key3')).toBe('value3'); // Should remain
      expect(cache.get('key6')).toBe('value6'); // New key
      expect(cache.get('key2')).toBeNull(); // Should be evicted
      expect(cache.get('key4')).toBeNull(); // Should be evicted
      expect(cache.get('key5')).toBeNull(); // Should be evicted
    });
  });

  describe('Cache Statistics', () => {
    it('should track basic statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.get('key1'); // Hit
      cache.get('key2'); // Hit
      cache.get('nonexistent'); // Miss
      
      cache.delete('key1'); // Delete

      const stats = cache.getStats();
      
      expect(stats.sets).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.deletes).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(5);
      expect(stats.hitRate).toBe(66.67); // 2 hits / 3 total requests
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('nonexistent'); // Miss
      
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(66.67); // 2 hits / 3 total
    });

    it('should handle zero requests', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
      expect(stats.sets).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Global Cache Instances', () => {
    it('should have different configurations for different cache types', () => {
      const staticStats = staticDataCache.getStats();
      const apiStats = apiResponseCache.getStats();
      const userStats = userDataCache.getStats();

      expect(staticStats.maxSize).toBe(1000);
      expect(apiStats.maxSize).toBe(500);
      expect(userStats.maxSize).toBe(200);
    });

    it('should work independently', () => {
      staticDataCache.set('test', 'static_value');
      apiResponseCache.set('test', 'api_value');

      expect(staticDataCache.get('test')).toBe('static_value');
      expect(apiResponseCache.get('test')).toBe('api_value');
      expect(userDataCache.get('test')).toBeNull();
    });
  });

  describe('Cache Cleanup', () => {
    it('should cleanup expired entries', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      cache.set('key2', 'value2', 200); // 200ms TTL
      cache.set('key3', 'value3'); // Default TTL

      // Wait for first key to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Trigger cleanup manually
      cache['cleanup']();

      expect(cache.get('key1')).toBeNull(); // Expired
      expect(cache.get('key2')).toBe('value2'); // Still valid
      expect(cache.get('key3')).toBe('value3'); // Still valid
    });
  });

  describe('Cache Destruction', () => {
    it('should clean up timers on destruction', () => {
      const cacheWithTimer = new OptimizedCache({
        maxSize: 10,
        ttl: 60000,
        cleanupInterval: 1000
      });

      expect(cacheWithTimer['cleanupTimer']).toBeDefined();
      
      cacheWithTimer.destroy();
      
      expect(cacheWithTimer['cleanupTimer']).toBeUndefined();
    });
  });
});
