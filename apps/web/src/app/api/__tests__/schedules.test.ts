import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../schedules/route';
import { NextRequest } from 'next/server';

// Мокаем Maersk.fetch
vi.mock('@/lib/maersk', () => ({
  Maersk: {
    fetch: vi.fn(),
  },
}));

// Мокаем shared mocks
vi.mock('@sprutnet/shared/mocks', () => ({
  searchSailings: vi.fn(() => [
    {
      id: 'SAIL-001',
      carrierCode: 'MSCU',
      carrierName: 'Mediterranean Shipping Company',
      voyageNumber: 'MSC-001',
      originPort: {
        id: 'CNSHA',
        name: 'Shanghai Port',
        countryCode: 'CN',
        countryName: 'China',
        cityName: 'Shanghai',
        type: 'SEAPORT',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      destinationPort: {
        id: 'USLAX',
        name: 'Los Angeles Port',
        countryCode: 'US',
        countryName: 'United States',
        cityName: 'Los Angeles',
        type: 'SEAPORT',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      departureDate: new Date('2024-02-15T10:00:00Z'),
      arrivalDate: new Date('2024-02-20T14:00:00Z'),
      containerType: '40FT',
      availableCapacity: 1500,
      totalCapacity: 2000,
      status: 'SCHEDULED',
      vessel: {
        imoNumber: '9456783',
        name: 'MSC OSCAR',
        carrierCode: 'MSCU',
        capacity: 19224,
        builtYear: 2015,
        flag: 'Panama',
      },
      route: {
        id: 'ROUTE-001',
        name: 'Asia-US Route',
        waypoints: [],
        duration: 5,
        distance: 5000,
      },
      rates: [
        {
          containerType: '40FT',
          baseRate: 2000,
          surcharges: [],
          totalCost: 2000,
          currency: 'USD',
          validUntil: new Date('2024-03-15T23:59:59Z'),
        },
      ],
      deadlines: [],
      transitTime: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}));

describe('Schedules API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем переменные окружения
    delete process.env.FEATURE_MAERSK;
  });

  describe('GET /api/schedules', () => {
    it('должен возвращать ошибку при отсутствии обязательных параметров', async () => {
      const request = new Request('http://localhost:3000/api/schedules') as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('originPortId and destinationPortId are required');
    });

    it('должен успешно возвращать расписания с мок-данными', async () => {
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sailings).toBeDefined();
      expect(Array.isArray(data.sailings)).toBe(true);
      expect(data.sailings.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
      expect(data.offset).toBe(0);
      expect(data.limit).toBe(10);
      expect(data.hasNext).toBe(false);
    });

    it('должен обрабатывать параметры дат', async () => {
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&departureDateFrom=2024-02-01T00:00:00Z&departureDateTo=2024-03-01T00:00:00Z'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sailings).toBeDefined();
    });

    it('должен обрабатывать параметры пагинации', async () => {
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX&limit=5&offset=0'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.limit).toBe(5);
      expect(data.offset).toBe(0);
    });

    it('должен обрабатывать ошибки и возвращать fallback', async () => {
      // Симулируем ошибку
      const { searchSailings } = await import('@sprutnet/shared/mocks');
      vi.mocked(searchSailings).mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /api/schedules', () => {
    it('должен возвращать ошибку при отсутствии обязательных параметров', async () => {
      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }) as NextRequest;
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('originPortId and destinationPortId are required');
    });

    it('должен успешно обрабатывать POST запрос с корректными данными', async () => {
      const requestBody = {
        originPortId: 'CNSHA',
        destinationPortId: 'USLAX',
        departureDateFrom: '2024-02-01T00:00:00Z',
        departureDateTo: '2024-03-01T00:00:00Z',
        limit: 5,
        offset: 0,
      };
      
      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }) as NextRequest;
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sailings).toBeDefined();
      expect(Array.isArray(data.sailings)).toBe(true);
      expect(data.sailings.length).toBeGreaterThan(0);
      expect(data.limit).toBe(5);
      expect(data.offset).toBe(0);
    });

    it('должен обрабатывать ошибки в POST запросе', async () => {
      // Симулируем ошибку
      const { searchSailings } = await import('@sprutnet/shared/mocks');
      vi.mocked(searchSailings).mockImplementationOnce(() => {
        throw new Error('Mock error');
      });
      
      const requestBody = {
        originPortId: 'CNSHA',
        destinationPortId: 'USLAX',
      };
      
      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }) as NextRequest;
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Maersk API Integration', () => {
    it('должен использовать Maersk API когда FEATURE_MAERSK=true', async () => {
      process.env.FEATURE_MAERSK = 'true';
      
      const { Maersk } = await import('@/lib/maersk');
      vi.mocked(Maersk.fetch).mockResolvedValueOnce({
        data: [
          {
            id: 'MAERSK-001',
            carrierCode: 'MAEU',
            carrierName: 'Maersk Line',
            voyageNumber: 'MAERSK-VOYAGE-001',
            departureDate: '2024-02-15T10:00:00Z',
            arrivalDate: '2024-02-20T14:00:00Z',
            containerType: '40FT',
            availableCapacity: 1500,
            totalCapacity: 2000,
            status: 'SCHEDULED',
            vessel: {
              imoNumber: '9456783',
              name: 'MAERSK VESSEL',
              capacity: 2000,
              builtYear: 2015,
              flag: 'Denmark',
            },
            route: {
              id: 'ROUTE-001',
              name: 'Asia-US Route',
              duration: 5,
              distance: 5000,
            },
            rates: [
              {
                containerType: '40FT',
                baseRate: 2000,
                currency: 'USD',
                validUntil: '2024-03-15T23:59:59Z',
              },
            ],
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        cached: false,
      });
      
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sailings).toBeDefined();
      expect(data.sailings.length).toBeGreaterThan(0);
      expect(Maersk.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/ocean-products'),
        expect.objectContaining({
          method: 'GET',
          cache: true,
          timeout: 15000,
        })
      );
    });

    it('должен fallback на мок-данные при ошибке Maersk API', async () => {
      process.env.FEATURE_MAERSK = 'true';
      
      const { Maersk } = await import('@/lib/maersk');
      vi.mocked(Maersk.fetch).mockRejectedValueOnce(new Error('Maersk API error'));
      
      const request = new Request(
        'http://localhost:3000/api/schedules?originPortId=CNSHA&destinationPortId=USLAX'
      ) as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sailings).toBeDefined();
      expect(data.sailings.length).toBeGreaterThan(0);
    });
  });
});
