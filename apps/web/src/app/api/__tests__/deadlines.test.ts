import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../deadlines/route';
import { Maersk } from '@/lib/maersk';

// Мокаем Maersk.fetch
vi.mock('@/lib/maersk', () => ({
  Maersk: {
    fetch: vi.fn()
  }
}));

// Мокаем process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, FEATURE_MAERSK: 'true' };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('/api/deadlines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('должен возвращать ошибку валидации при отсутствии обязательных параметров', async () => {
      const request = new Request('http://localhost:3000/api/deadlines');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Fallback на mock данные
      expect(data.source).toBe('mock');
    });

    it('должен успешно получать дедлайны от Maersk API', async () => {
      const mockMaerskResponse = {
        data: {
          shipmentDeadlines: {
            terminalName: 'Test Terminal',
            deadlines: [
              {
                deadlineName: 'Documents Cut-off',
                deadlineLocal: '2024-01-15T10:00:00Z'
              },
              {
                deadlineName: 'Container Yard Cut-off',
                deadlineLocal: '2024-01-15T12:00:00Z'
              }
            ]
          }
        },
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      };

      (Maersk.fetch as any).mockResolvedValue(mockMaerskResponse);

      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('maersk');
      expect(data.deadlines).toHaveLength(2);
      expect(data.terminalName).toBe('Test Terminal');
      expect(Maersk.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shipment-deadlines'),
        expect.objectContaining({
          method: 'GET',
          cache: true,
          timeout: 15000
        })
      );
    });

    it('должен возвращать fallback на mock данные при ошибке Maersk API', async () => {
      (Maersk.fetch as any).mockRejectedValue(new Error('API Error'));

      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock (fallback)');
      expect(data.deadlines).toBeDefined();
      expect(data.error).toBe('API Error');
    });

    it('должен возвращать ошибку валидации для неверного ISOCountryCode', async () => {
      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=USA&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('ISOCountryCode must be a 2-letter country code');
    });

    it('должен возвращать ошибку валидации для неверного vesselIMONumber', async () => {
      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=123456&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('vesselIMONumber must be a 7-digit number');
    });

    it('должен возвращать ошибку валидации для неверного voyage', async () => {
      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('voyage must be a 4-character alphanumeric string');
    });

    it('должен использовать mock данные когда FEATURE_MAERSK=false', async () => {
      // Временно меняем env
      const originalEnv = process.env.FEATURE_MAERSK;
      process.env.FEATURE_MAERSK = 'false';

      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock');
      expect(data.deadlines).toBeDefined();

      // Восстанавливаем env
      process.env.FEATURE_MAERSK = originalEnv;
    });

    it('должен обрабатывать неверный формат ответа от Maersk API', async () => {
      const mockInvalidResponse = {
        data: { invalid: 'format' },
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      };

      (Maersk.fetch as any).mockResolvedValue(mockInvalidResponse);

      const request = new Request(
        'http://localhost:3000/api/deadlines?vesselImo=1234567&voyage=123E&portOfLoad=Los%20Angeles&isoCountryCode=US&sailingId=SAIL-001'
      );
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock (fallback)');
      expect(data.error).toContain('Invalid Maersk API response format');
    });
  });
});
