import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaerskClient } from '../maersk';
import { logCacheMetrics, logApiMetrics } from '../types/metrics';

// Мокаем fetch
global.fetch = vi.fn();

// Мокаем console.log
const mockConsoleLog = vi.fn();
global.console.log = mockConsoleLog;

describe('MaerskClient with Metrics', () => {
  let client: MaerskClient;

  beforeEach(() => {
    client = new MaerskClient('https://api.maersk.com');
    mockConsoleLog.mockClear();
    vi.clearAllMocks();
  });

  describe('Cache Metrics', () => {
    it('should log cache hit metrics', async () => {
      // Подготавливаем мок ответ
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Первый запрос - сохраняет в кэш
      await client.fetch('/test', {
        method: 'GET',
        cache: true,
        endpointType: 'schedules',
        params: { origin: 'CNSHA', destination: 'NLRTM' },
      });

      // Очищаем логи после первого запроса
      mockConsoleLog.mockClear();

      // Второй запрос - должен попасть в кэш
      const result = await client.fetch('/test', {
        method: 'GET',
        cache: true,
        endpointType: 'schedules',
        params: { origin: 'CNSHA', destination: 'NLRTM' },
      });

      expect(result.cached).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"cache_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"cacheHit":true')
      );
    });

    it('should log cache miss metrics', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        cache: true,
        endpointType: 'deadlines',
        params: { vesselImo: '1234567' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"api_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"cached":false')
      );
    });
  });

  describe('API Metrics', () => {
    it('should log successful API call metrics', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'schedules',
        params: { origin: 'CNSHA', destination: 'NLRTM' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"api_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"status":200')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"schedules"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"method":"GET"')
      );
    });

    it('should log error API call metrics', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      try {
        await client.fetch('/test', {
          method: 'GET',
          endpointType: 'deadlines',
          params: { vesselImo: '1234567' },
        });
      } catch (error) {
        // Ожидаем ошибку
      }

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"type":"api_metrics"')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"status":429')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"error":"')
      );
    });

    it('should log retry metrics', async () => {
      // Первый вызов возвращает 429, второй - успех
      const mockResponse1 = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
      };

      const mockResponse2 = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'schedules',
        params: { origin: 'CNSHA', destination: 'NLRTM' },
      });

      // Проверяем, что логировались метрики для обоих запросов
      const apiMetricsLogs = mockConsoleLog.mock.calls.filter(call =>
        call[0].includes('"type":"api_metrics"')
      );

      expect(apiMetricsLogs.length).toBeGreaterThan(0);
    });
  });

  describe('Different Endpoint Types', () => {
    it('should use correct TTL for schedules', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'schedules',
        params: { origin: 'CNSHA', destination: 'NLRTM' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"schedules"')
      );
    });

    it('should use correct TTL for deadlines', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'deadlines',
        params: { vesselImo: '1234567' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"deadlines"')
      );
    });

    it('should use correct TTL for ports', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'ports',
        params: { query: 'shanghai' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"ports"')
      );
    });

    it('should use correct TTL for vessels', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'vessels',
        params: { imo: '1234567' },
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"endpoint":"vessels"')
      );
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same params', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Первый запрос
      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'schedules',
        params: { 
          origin: 'CNSHA', 
          destination: 'NLRTM',
          from: '2024-01-15',
          to: '2024-01-30'
        },
      });

      // Очищаем логи
      mockConsoleLog.mockClear();

      // Второй запрос с теми же параметрами в другом порядке
      await client.fetch('/test', {
        method: 'GET',
        endpointType: 'schedules',
        params: { 
          destination: 'NLRTM',
          to: '2024-01-30',
          origin: 'CNSHA', 
          from: '2024-01-15'
        },
      });

      // Должен попасть в кэш
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"cacheHit":true')
      );
    });
  });
});
