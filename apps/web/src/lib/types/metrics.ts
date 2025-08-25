export interface CacheMetrics {
  cacheHit: boolean;
  resultCount: number;
  latency: number; // в миллисекундах
  endpoint: string;
  timestamp: Date;
  cacheKey?: string;
  ttl?: number;
}

export interface ApiMetrics {
  endpoint: string;
  method: string;
  status: number;
  latency: number;
  retries: number;
  cached: boolean;
  timestamp: Date;
  error?: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // в миллисекундах
  maxSize: number;
}

export interface EndpointConfig {
  schedules: CacheConfig;
  deadlines: CacheConfig;
  ports: CacheConfig;
  vessels: CacheConfig;
}

// Конфигурация TTL для разных эндпоинтов
export const ENDPOINT_CONFIG: EndpointConfig = {
  schedules: {
    enabled: true,
    ttl: (Number(process.env.SCHEDULES_CACHE_TTL_MINUTES) || 15) * 60 * 1000, // 15 минут
    maxSize: 100,
  },
  deadlines: {
    enabled: true,
    ttl: (Number(process.env.DEADLINES_CACHE_TTL_MINUTES) || 3) * 60 * 1000, // 3 минуты
    maxSize: 50,
  },
  ports: {
    enabled: true,
    ttl: (Number(process.env.PORTS_CACHE_TTL_MINUTES) || 15) * 60 * 1000, // 15 минут
    maxSize: 100,
  },
  vessels: {
    enabled: true,
    ttl: (Number(process.env.VESSELS_CACHE_TTL_MINUTES) || 15) * 60 * 1000, // 15 минут
    maxSize: 50,
  },
};

// Утилиты для логирования метрик
export function logCacheMetrics(metrics: CacheMetrics): void {
  const logData = {
    type: 'cache_metrics',
    ...metrics,
    timestamp: metrics.timestamp.toISOString(),
  };
  
  console.log(JSON.stringify(logData));
}

export function logApiMetrics(metrics: ApiMetrics): void {
  const logData = {
    type: 'api_metrics',
    ...metrics,
    timestamp: metrics.timestamp.toISOString(),
  };
  
  console.log(JSON.stringify(logData));
}

// Генерация ключа кэша для API эндпоинтов
export function generateCacheKey(endpoint: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('|');
  
  return `${endpoint}:${sortedParams}`;
}
