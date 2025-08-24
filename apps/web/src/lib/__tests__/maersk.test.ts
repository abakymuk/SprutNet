import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MaerskClient, MaerskRequestConfig } from '../maersk';

// Мокаем fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Мокаем console.log для проверки логирования
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('MaerskClient', () => {
  let client: MaerskClient;

  beforeEach(() => {
    client = new MaerskClient('https://api.maersk.com');
    mockFetch.mockClear();
    mockConsoleLog.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    client.clearCache();
  });

  describe('Ретраи при 429 ошибке', () => {
    it('должен делать до 3 попыток с экспоненциальной задержкой', async () => {
      // Мокаем fetch для возврата 429 ошибки
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: () => Promise.resolve({ message: 'Rate limited' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: () => Promise.resolve({ message: 'Rate limited' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve({ data: 'success' }),
        });

      const startTime = Date.now();
      const result = await client.fetch('/test-endpoint');
      const endTime = Date.now();

      // Проверяем, что было 3 вызова fetch
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Проверяем логирование ретраев
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('api_retry'),
        expect.objectContaining({
          status: 429,
          attempt: 1,
          delay: 1000,
        })
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('api_retry'),
        expect.objectContaining({
          status: 429,
          attempt: 2,
          delay: 2000,
        })
      );

      // Проверяем, что общее время больше суммы задержек (1s + 2s = 3s)
      expect(endTime - startTime).toBeGreaterThan(3000);

      // Проверяем успешный результат
      expect(result.data).toEqual({ data: 'success' });
      expect(result.status).toBe(200);
    });

    it('должен прекратить ретраи после 3 неудачных попыток', async () => {
      // Мокаем fetch для возврата 429 ошибки 4 раза
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ message: 'Rate limited' }),
      });

      await expect(client.fetch('/test-endpoint')).rejects.toThrow();

      // Проверяем, что было ровно 3 вызова fetch
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Проверяем логирование ошибки
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('api_error'),
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'RATE_LIMITED',
            retries: 2,
          }),
        })
      );
    });
  });

  describe('Кэширование', () => {
    it('должен возвращать данные из кэша для одинаковых GET-запросов', async () => {
      const mockData = { vessels: [{ id: 1, name: 'Test Vessel' }] };

      // Мокаем успешный ответ
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      // Первый запрос
      const result1 = await client.fetch('/vessels');
      expect(result1.data).toEqual(mockData);
      expect(result1.cached).toBe(false);

      // Второй запрос (должен быть из кэша)
      const result2 = await client.fetch('/vessels');
      expect(result2.data).toEqual(mockData);
      expect(result2.cached).toBe(true);

      // Проверяем логирование cache_hit
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cache_hit'),
        expect.objectContaining({
          url: 'https://api.maersk.com/vessels',
        })
      );

      // Проверяем, что fetch был вызван только один раз
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('не должен кэшировать POST-запросы', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      const config: MaerskRequestConfig = {
        method: 'POST',
        body: { test: 'data' },
      };

      // Первый запрос
      await client.fetch('/test', config);
      // Второй запрос
      await client.fetch('/test', config);

      // Проверяем, что fetch был вызван дважды
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('должен уважать настройку cache: false', async () => {
      const mockData = { data: 'test' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      const config: MaerskRequestConfig = {
        cache: false,
      };

      // Первый запрос
      await client.fetch('/test', config);
      // Второй запрос
      await client.fetch('/test', config);

      // Проверяем, что fetch был вызван дважды
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Обработка ошибок', () => {
    it('должен возвращать структурированную ошибку для 401', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid API key' }),
      });

      await expect(client.fetch('/test')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Неверный API ключ или отсутствует доступ',
        status: 401,
        retries: 0,
      });

      // Проверяем логирование ошибки
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('api_error'),
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        })
      );
    });

    it('должен обрабатывать timeout', async () => {
      // Мокаем fetch для имитации timeout
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      const config: MaerskRequestConfig = {
        timeout: 50, // Короткий timeout
      };

      await expect(client.fetch('/test', config)).rejects.toMatchObject({
        code: 'TIMEOUT',
        message: 'Запрос превысил время ожидания',
        status: 0,
      });
    });

    it('должен обрабатывать сетевые ошибки', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.fetch('/test')).rejects.toMatchObject({
        code: 'UNKNOWN',
        message: 'Неизвестная ошибка при выполнении запроса',
        status: 0,
      });
    });
  });

  describe('Успешные запросы', () => {
    it('должен логировать успешные запросы', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      await client.fetch('/test');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('api_success:'),
        expect.objectContaining({
          url: 'https://api.maersk.com/test',
          status: 200,
        })
      );
    });

    it('должен сохранять данные в кэш для успешных GET-запросов', async () => {
      const mockData = { data: 'test' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      await client.fetch('/test');

      // Проверяем размер кэша
      expect(client.getCacheSize()).toBe(1);
    });
  });

  describe('Управление кэшем', () => {
    it('должен очищать кэш', async () => {
      const mockData = { data: 'test' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockData),
      });

      // Делаем запрос для заполнения кэша
      await client.fetch('/test');
      expect(client.getCacheSize()).toBe(1);

      // Очищаем кэш
      client.clearCache();
      expect(client.getCacheSize()).toBe(0);

      // Проверяем логирование
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('cache_cleared:'),
        expect.objectContaining({})
      );
    });
  });
});
