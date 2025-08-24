import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../vessels/[imo]/route';
import { Maersk } from '@/lib/maersk';
import { NextRequest } from 'next/server';

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

describe('/api/vessels/[imo]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('должен возвращать ошибку валидации для неверного IMO', async () => {
      const request = new NextRequest('http://localhost:3000/api/vessels/123456');
      const response = await GET(request, { params: Promise.resolve({ imo: '123456' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('IMO must be a 7-digit number');
    });

    it('должен успешно получать информацию о судне от Maersk API', async () => {
      const mockMaerskResponse = {
        data: [
          {
            vesselIMONumber: 1234567,
            carrierVesselCode: 'MAEU',
            vesselShortName: 'MAERSK SEVILLE',
            vesselLongName: 'MAERSK SEVILLE',
            vesselFlagCode: 'DK',
            vesselBuiltYear: 2018,
            vesselCallSign: 'OYGR2',
            vesselCapacityTEU: 15000
          }
        ],
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      };

      (Maersk.fetch as any).mockResolvedValue(mockMaerskResponse);

      const request = new NextRequest('http://localhost:3000/api/vessels/1234567');
      const response = await GET(request, { params: Promise.resolve({ imo: '1234567' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('maersk');
      expect(data.vessel).toMatchObject({
        imo: '1234567',
        name: 'MAERSK SEVILLE',
        operator: 'MAEU',
        size: 15000,
        flag: 'DK',
        builtYear: 2018
      });
      expect(Maersk.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reference-data/vessels'),
        expect.objectContaining({
          method: 'GET',
          cache: true,
          timeout: 15000
        })
      );
    });

    it('должен возвращать 404 если судно не найдено', async () => {
      const mockMaerskResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      };

      (Maersk.fetch as any).mockResolvedValue(mockMaerskResponse);

      const request = new NextRequest('http://localhost:3000/api/vessels/1234567');
      const response = await GET(request, { params: Promise.resolve({ imo: '1234567' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Vessel not found');
    });

    it('должен возвращать fallback на mock данные при ошибке Maersk API', async () => {
      (Maersk.fetch as any).mockRejectedValue(new Error('API Error'));

      const request = new NextRequest('http://localhost:3000/api/vessels/1234567');
      const response = await GET(request, { params: Promise.resolve({ imo: '1234567' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock (fallback)');
      expect(data.vessel).toBeDefined();
      expect(data.error).toBe('API Error');
    });

    it('должен использовать mock данные когда FEATURE_MAERSK=false', async () => {
      process.env.FEATURE_MAERSK = 'false';

      const request = new NextRequest('http://localhost:3000/api/vessels/1234567');
      const response = await GET(request, { params: Promise.resolve({ imo: '1234567' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock');
      expect(data.vessel).toBeDefined();
    });

    it('должен обрабатывать неверный формат ответа от Maersk API', async () => {
      const mockInvalidResponse = {
        data: { invalid: 'format' },
        status: 200,
        statusText: 'OK',
        headers: new Headers()
      };

      (Maersk.fetch as any).mockResolvedValue(mockInvalidResponse);

      const request = new NextRequest('http://localhost:3000/api/vessels/1234567');
      const response = await GET(request, { params: Promise.resolve({ imo: '1234567' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('mock (fallback)');
      expect(data.error).toContain('Invalid Maersk API response format');
    });
  });
});
