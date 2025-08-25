// Optimized caching system for better performance
import { LRUCache } from 'lru-cache';

export interface CacheOptions {
  maxSize: number;
  ttl: number; // Время жизни в миллисекундах
  compression?: boolean;
  cleanupInterval?: number;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  averageAccessCount: number;
  oldestEntry?: number;
  newestEntry?: number;
}

export class OptimizedCache {
  private cache: LRUCache<string, CacheEntry>;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions) {
    this.cache = new LRUCache({
      max: options.maxSize,
      ttl: options.ttl,
      updateAgeOnGet: true,
      allowStale: false,
      dispose: (value: CacheEntry, key: string) => {
        this.stats.deletes++;
        console.log(`🗑️ Кэш: удалена запись ${key}`);
      },
    });

    // Запускаем периодическую очистку
    if (options.cleanupInterval) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, options.cleanupInterval);
    }

    console.log(`📦 Кэш инициализирован: max=${options.maxSize}, ttl=${options.ttl}ms`);
  }

  /**
   * Получение данных из кэша
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (entry) {
      this.stats.hits++;
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      // Логируем успешные попадания в кэш
      if (entry.accessCount % 10 === 0) {
        console.log(`🎯 Кэш hit: ${key} (доступов: ${entry.accessCount})`);
      }
      
      return entry.data;
    } else {
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Сохранение данных в кэш
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry, { ttl });
    this.stats.sets++;
    
    console.log(`💾 Кэш set: ${key} (размер: ${this.getEntrySize(entry)})`);
  }

  /**
   * Удаление данных из кэша
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      console.log(`🗑️ Кэш delete: ${key}`);
    }
    return deleted;
  }

  /**
   * Проверка наличия ключа в кэше
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Очистка всего кэша
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Кэш полностью очищен');
  }

  /**
   * Получение статистики кэша
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    const missRate = total > 0 ? (this.stats.misses / total) * 100 : 0;

    // Вычисляем среднее количество обращений
    let totalAccessCount = 0;
    let entryCount = 0;
    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;

    for (const [_, entry] of this.cache.entries()) {
      totalAccessCount += entry.accessCount;
      entryCount++;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    const averageAccessCount = entryCount > 0 ? totalAccessCount / entryCount : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      size: this.cache.size,
      maxSize: this.cache.max,
      hitRate: Math.round(hitRate * 100) / 100,
      missRate: Math.round(missRate * 100) / 100,
      averageAccessCount: Math.round(averageAccessCount * 100) / 100,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Получение размера записи (приблизительно)
   */
  private getEntrySize(entry: CacheEntry): string {
    try {
      const size = JSON.stringify(entry.data).length;
      if (size < 1024) {
        return `${size}B`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)}KB`;
      } else {
        return `${(size / (1024 * 1024)).toFixed(1)}MB`;
      }
    } catch {
      return 'unknown';
    }
  }

  /**
   * Периодическая очистка устаревших записей
   */
  private cleanup(): void {
    const beforeSize = this.cache.size;
    this.cache.purgeStale();
    const afterSize = this.cache.size;
    
    if (beforeSize !== afterSize) {
      console.log(`🧹 Кэш cleanup: удалено ${beforeSize - afterSize} устаревших записей`);
    }
  }

  /**
   * Получение ключей с наибольшим количеством обращений
   */
  getMostAccessedKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    const entries = Array.from(this.cache.entries() as Iterable<[string, CacheEntry]>)
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);

    return entries;
  }

  /**
   * Получение ключей с наименьшим количеством обращений
   */
  getLeastAccessedKeys(limit: number = 10): Array<{ key: string; accessCount: number }> {
    const entries = Array.from(this.cache.entries() as Iterable<[string, CacheEntry]>)
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, limit);

    return entries;
  }

  /**
   * Уничтожение кэша и очистка ресурсов
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.cache.clear();
    console.log('💥 Кэш уничтожен');
  }
}

// Создаем глобальные экземпляры кэша для разных типов данных
export const staticDataCache = new OptimizedCache({
  maxSize: 1000,
  ttl: 24 * 60 * 60 * 1000, // 24 часа для статических данных
  cleanupInterval: 60 * 60 * 1000, // Очистка каждый час
});

export const apiResponseCache = new OptimizedCache({
  maxSize: 500,
  ttl: 15 * 60 * 1000, // 15 минут для API ответов
  cleanupInterval: 15 * 60 * 1000, // Очистка каждые 15 минут
});

export const userDataCache = new OptimizedCache({
  maxSize: 200,
  ttl: 5 * 60 * 1000, // 5 минут для пользовательских данных
  cleanupInterval: 5 * 60 * 1000, // Очистка каждые 5 минут
});

// Graceful shutdown
process.on('SIGINT', () => {
  staticDataCache.destroy();
  apiResponseCache.destroy();
  userDataCache.destroy();
});

process.on('SIGTERM', () => {
  staticDataCache.destroy();
  apiResponseCache.destroy();
  userDataCache.destroy();
});
