declare module 'lru-cache' {
  export interface LRUCacheOptions<K, V> {
    max?: number;
    ttl?: number;
    updateAgeOnGet?: boolean;
    allowStale?: boolean;
    dispose?: (value: V, key: K) => void;
  }

  export class LRUCache<K, V> {
    constructor(options?: LRUCacheOptions<K, V>);
    
    get(key: K): V | undefined;
    set(key: K, value: V, options?: { ttl?: number }): void;
    delete(key: K): boolean;
    has(key: K): boolean;
    clear(): void;
    size: number;
    max: number;
    entries(): IterableIterator<[K, V]>;
    purgeStale(): void;
  }
}
