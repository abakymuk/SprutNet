import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../ports/search/route';
import { Maersk } from '@/lib/maersk';
import { NextRequest } from 'next/server';

// Мокаем Maersk.fetch
vi.mock('@/lib/maersk', () => ({
  Maersk: {
    fetch: vi.fn(),
  },
}));

const mockMaerskFetch = vi.mocked(Maersk.fetch);

// Вспомогательная функция для создания NextRequest в тестах
function createNextRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('Ports Search API', () => {
  beforeEach(() => {
    mockMaerskFetch.mockClear();
    vi.clearAllMocks();
  });

  describe('GET /api/ports/search', () => {
    it('должен возвращать пустой массив для пустого запроса', async () => {
      const request = new Request('http://localhost:3000/api/ports/search?q=') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: [],
        total: 0,
      });
    });

    it('должен использовать мок-данные когда Maersk API отключен', async () => {
      // Временно отключаем Maersk API
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'false';

      const request = new Request('http://localhost:3000/api/ports/search?q=sha') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some((port: any) => port.name.includes('Shanghai'))).toBe(true);

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен успешно обрабатывать запрос к Maersk API', async () => {
      // Включаем Maersk API
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'true';

      // Мокаем успешный ответ от Maersk API
      const mockLocations = [
        {
          carrierGeoID: 'CNSHA',
          locationName: 'Shanghai Port',
          cityName: 'Shanghai',
          countryName: 'China',
          unLocationCode: 'CNSHA',
          locationType: 'port',
        },
        {
          carrierGeoID: 'SGSIN',
          locationName: 'Singapore Port',
          cityName: 'Singapore',
          countryName: 'Singapore',
          unLocationCode: 'SGSIN',
          locationType: 'port',
        },
        {
          carrierGeoID: 'CNSHA',
          locationName: 'Shanghai Airport',
          cityName: 'Shanghai',
          countryName: 'China',
          unLocationCode: 'CNSHA',
          locationType: 'airport',
        },
      ];

      mockMaerskFetch.mockResolvedValue({
        data: mockLocations,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        cached: false,
      });

      const request = new Request('http://localhost:3000/api/ports/search?q=sha') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some((port: any) => port.name.includes('Shanghai'))).toBe(true);

      // Проверяем, что был вызван Maersk.fetch
      expect(mockMaerskFetch).toHaveBeenCalledWith('/reference-data/locations', {
        cache: true,
        timeout: 10000,
      });

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен обрабатывать ошибки Maersk API с fallback на мок-данные', async () => {
      // Включаем Maersk API
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'true';

      // Мокаем ошибку от Maersk API
      mockMaerskFetch.mockRejectedValue(new Error('API Error'));

      const request = new Request('http://localhost:3000/api/ports/search?q=sha') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data.some((port: any) => port.name.includes('Shanghai'))).toBe(true);

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен обрабатывать неверный формат данных от Maersk API', async () => {
      // Включаем Maersk API
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'true';

      // Мокаем неверный формат данных
      mockMaerskFetch.mockResolvedValue({
        data: 'invalid data',
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        cached: false,
      });

      const request = new Request('http://localhost:3000/api/ports/search?q=sha') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен обрабатывать общие ошибки', async () => {
      // Включаем Maersk API и мокаем ошибку
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'true';

      // Мокаем ошибку от Maersk.fetch
      mockMaerskFetch.mockRejectedValue(new Error('Network error'));

      const request = new Request('http://localhost:3000/api/ports/search?q=sha') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      // При ошибке API должен вернуться fallback на мок-данные
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен уважать параметр limit', async () => {
      // Включаем Maersk API
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'true';

      // Мокаем много данных
      const mockLocations = Array.from({ length: 20 }, (_, i) => ({
        carrierGeoID: `PORT${i}`,
        locationName: `Port ${i}`,
        cityName: `City ${i}`,
        countryName: 'Test Country',
        unLocationCode: `PORT${i}`,
        locationType: 'port',
      }));

      mockMaerskFetch.mockResolvedValue({
        data: mockLocations,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        cached: false,
      });

      const request = new Request('http://localhost:3000/api/ports/search?q=port&limit=5') as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(5);

      // Восстанавливаем переменную окружения
      process.env.FEATURE_MAERSK = originalEnv;
    });
  });
});
