import { getMaerskHeaders } from './maersk-api';

// Интерфейсы для типизации
export interface MaerskRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  retries?: number;
  timeout?: number;
}

export interface MaerskResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  cached?: boolean;
}

export interface MaerskError {
  code: string;
  message: string;
  status: number;
  details?: any;
  retries?: number;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Конфигурация по умолчанию
const DEFAULT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 секунда
  maxDelay: 10000, // 10 секунд
  cacheSize: 100,
  defaultTTL: (Number(process.env.CACHE_TTL_MINUTES) || 10) * 60 * 1000, // минуты в миллисекунды
  timeout: 30000, // 30 секунд
};

// LRU-кэш с TTL
class LRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = DEFAULT_CONFIG.cacheSize) {
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Проверяем TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Перемещаем в конец (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, value: any, ttl: number = DEFAULT_CONFIG.defaultTTL): void {
    // Удаляем старые записи, если превышен размер
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Логирование событий
function logEvent(event: string, details: any = {}): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${event}:`, details);
}

// Генерация ключа кэша
function getCacheKey(url: string, config: MaerskRequestConfig): string {
  const method = config.method || 'GET';
  const body = config.body ? JSON.stringify(config.body) : '';
  return `${method}:${url}:${body}`;
}

// Экспоненциальный бэкофф
function calculateDelay(attempt: number): number {
  const delay = DEFAULT_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, DEFAULT_CONFIG.maxDelay);
}

// Основной класс Maersk HTTP-клиента
export class MaerskClient {
  private cache: LRUCache;
  private baseURL: string;

  constructor(baseURL: string = 'https://api.maersk.com') {
    this.baseURL = baseURL;
    this.cache = new LRUCache();
  }

  async fetch<T = any>(
    endpoint: string,
    config: MaerskRequestConfig = {}
  ): Promise<MaerskResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = getCacheKey(url, config);
    const shouldCache = config.cache !== false && (config.method || 'GET') === 'GET';

    // Проверяем кэш для GET-запросов
    if (shouldCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        logEvent('cache_hit', { url, cacheKey });
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          cached: true,
        };
      }
    }

    // Выполняем запрос с ретраями
    const response = await this._makeRequest(url, config, cacheKey, shouldCache);
    return response;
  }

  private async _makeRequest<T = any>(
    url: string,
    config: MaerskRequestConfig,
    cacheKey: string,
    shouldCache: boolean,
    attempt: number = 1
  ): Promise<MaerskResponse<T>> {
    try {
      const headers = {
        ...getMaerskHeaders(),
        ...config.headers,
      };

      const fetchConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
      };

      // Добавляем timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || DEFAULT_CONFIG.timeout);
      fetchConfig.signal = controller.signal;

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      // Обрабатываем успешный ответ
      if (response.ok) {
        const data = await response.json();
        
        // Сохраняем в кэш
        if (shouldCache) {
          this.cache.set(cacheKey, data);
        }

        logEvent('api_success', { url, status: response.status, cached: shouldCache });
        
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          cached: false, // Данные не из кэша, а из сети
        };
      }

      // Обрабатываем ошибки, требующие ретраев
      const shouldRetry = this._shouldRetry(response.status, attempt);
      
      if (shouldRetry) {
        const delay = calculateDelay(attempt);
        logEvent('api_retry', { 
          url, 
          status: response.status, 
          attempt, 
          delay,
          maxRetries: DEFAULT_CONFIG.maxRetries 
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this._makeRequest(url, config, cacheKey, shouldCache, attempt + 1);
      }

      // Обрабатываем ошибки без ретраев
      const errorData = await response.json().catch(() => ({}));
      const error: MaerskError = {
        code: this._getErrorCode(response.status),
        message: this._getErrorMessage(response.status, errorData),
        status: response.status,
        details: errorData,
        retries: attempt - 1,
      };

      logEvent('api_error', { url, error });
      throw error;

    } catch (error: any) {
      // Обрабатываем сетевые ошибки и timeout
      if (error.name === 'AbortError') {
        const timeoutError: MaerskError = {
          code: 'TIMEOUT',
          message: 'Запрос превысил время ожидания',
          status: 0,
          details: { timeout: config.timeout || DEFAULT_CONFIG.timeout },
          retries: attempt - 1,
        };
        logEvent('api_error', { url, error: timeoutError });
        throw timeoutError;
      }

      if (error.code) {
        // Это уже наша структурированная ошибка
        throw error;
      }

      // Неизвестная ошибка
      const unknownError: MaerskError = {
        code: 'UNKNOWN',
        message: 'Неизвестная ошибка при выполнении запроса',
        status: 0,
        details: { originalError: error.message },
        retries: attempt - 1,
      };
      logEvent('api_error', { url, error: unknownError });
      throw unknownError;
    }
  }

  private _shouldRetry(status: number, attempt: number): boolean {
    if (attempt >= DEFAULT_CONFIG.maxRetries) return false;
    
    // Ретраим только для определенных статусов
    return [429, 500, 502, 503, 504].includes(status);
  }

  private _getErrorCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMITED';
      case 500: return 'INTERNAL_SERVER_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      case 504: return 'GATEWAY_TIMEOUT';
      default: return 'HTTP_ERROR';
    }
  }

  private _getErrorMessage(status: number, errorData: any): string {
    switch (status) {
      case 400: return 'Неверный запрос к API';
      case 401: return 'Неверный API ключ или отсутствует доступ';
      case 403: return 'Доступ запрещен';
      case 404: return 'Данные не найдены';
      case 429: return 'Превышен лимит запросов';
      case 500: return 'Внутренняя ошибка сервера';
      case 502: return 'Ошибка шлюза';
      case 503: return 'Сервис временно недоступен';
      case 504: return 'Превышено время ожидания шлюза';
      default: return 'Ошибка при выполнении запроса';
    }
  }

  // Методы для управления кэшем
  clearCache(): void {
    this.cache.clear();
    logEvent('cache_cleared');
  }

  getCacheSize(): number {
    return this.cache.size();
  }
}

// Экспортируем экземпляр по умолчанию
export const Maersk = new MaerskClient();

// Экспортируем функцию для удобства
export const maerskFetch = <T = any>(
  endpoint: string,
  config?: MaerskRequestConfig
): Promise<MaerskResponse<T>> => {
  return Maersk.fetch(endpoint, config);
};
