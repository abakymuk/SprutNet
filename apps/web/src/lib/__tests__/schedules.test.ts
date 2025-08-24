import { describe, it, expect } from 'vitest';
import { 
  calculateTransitDays, 
  mapMaerskScheduleToSailing, 
  validateScheduleSearchParams,
  type MaerskSchedule,
  type MaerskScheduleSearchParams 
} from '../types/schedules';

describe('Schedules Functions', () => {
  describe('calculateTransitDays', () => {
    it('должен правильно рассчитывать время транзита', () => {
      const departureDate = new Date('2024-02-15T10:00:00Z');
      const arrivalDate = new Date('2024-02-20T14:00:00Z');
      
      const result = calculateTransitDays(departureDate, arrivalDate);
      
      expect(result).toBe(6); // 5 дней + 1 день (округление вверх)
    });

    it('должен возвращать 0 для неверных дат', () => {
      const result = calculateTransitDays(new Date('invalid'), new Date('invalid'));
      
      expect(result).toBe(0);
    });

    it('должен округлять вверх дробные дни', () => {
      const departureDate = new Date('2024-02-15T23:00:00Z');
      const arrivalDate = new Date('2024-02-16T01:00:00Z');
      
      const result = calculateTransitDays(departureDate, arrivalDate);
      
      expect(result).toBe(1); // Округляем вверх даже для 2 часов
    });

    it('должен обрабатывать одинаковые даты', () => {
      const date = new Date('2024-02-15T10:00:00Z');
      
      const result = calculateTransitDays(date, date);
      
      expect(result).toBe(0);
    });
  });

  describe('mapMaerskScheduleToSailing', () => {
    const mockOriginPort = {
      id: 'CNSHA',
      name: 'Shanghai Port',
      countryCode: 'CN',
      countryName: 'China',
      cityName: 'Shanghai',
      type: 'SEAPORT' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDestinationPort = {
      id: 'USLAX',
      name: 'Los Angeles Port',
      countryCode: 'US',
      countryName: 'United States',
      cityName: 'Los Angeles',
      type: 'SEAPORT' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('должен правильно маппить полные данные MaerskSchedule', () => {
      const maerskSchedule: MaerskSchedule = {
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
      };

      const result = mapMaerskScheduleToSailing(maerskSchedule, mockOriginPort, mockDestinationPort);

      expect(result.id).toBe('MAERSK-001');
      expect(result.carrierCode).toBe('MAEU');
      expect(result.carrierName).toBe('Maersk Line');
      expect(result.voyageNumber).toBe('MAERSK-VOYAGE-001');
      expect(result.originPort).toBe(mockOriginPort);
      expect(result.destinationPort).toBe(mockDestinationPort);
      expect(result.departureDate).toEqual(new Date('2024-02-15T10:00:00Z'));
      expect(result.arrivalDate).toEqual(new Date('2024-02-20T14:00:00Z'));
      expect(result.containerType).toBe('40FT');
      expect(result.availableCapacity).toBe(1500);
      expect(result.totalCapacity).toBe(2000);
      expect(result.status).toBe('SCHEDULED');
      expect(result.transitTime).toBe(6); // 5 дней + 1 день (округление вверх)
      expect(result.vessel.imoNumber).toBe('9456783');
      expect(result.rates).toHaveLength(1);
      expect(result.rates[0].containerType).toBe('40FT');
      expect(result.rates[0].baseRate).toBe(2000);
    });

    it('должен использовать fallback значения для отсутствующих полей', () => {
      const maerskSchedule: MaerskSchedule = {
        departureDate: '2024-02-15T10:00:00Z',
        arrivalDate: '2024-02-20T14:00:00Z',
      };

      const result = mapMaerskScheduleToSailing(maerskSchedule, mockOriginPort, mockDestinationPort);

      expect(result.id).toMatch(/^MAERSK-\d+$/);
      expect(result.carrierCode).toBe('MAEU');
      expect(result.carrierName).toBe('Maersk Line');
      expect(result.voyageNumber).toBe('MAERSK-VOYAGE');
      expect(result.containerType).toBe('40FT');
      expect(result.availableCapacity).toBe(1000);
      expect(result.totalCapacity).toBe(2000);
      expect(result.status).toBe('SCHEDULED');
      expect(result.transitTime).toBe(6);
    });

    it('должен обрабатывать пустые даты', () => {
      const maerskSchedule: MaerskSchedule = {};

      const result = mapMaerskScheduleToSailing(maerskSchedule, mockOriginPort, mockDestinationPort);

      expect(result.departureDate).toBeInstanceOf(Date);
      expect(result.arrivalDate).toBeInstanceOf(Date);
      expect(result.transitTime).toBe(0);
    });
  });

  describe('validateScheduleSearchParams', () => {
    it('должен валидировать корректные параметры', () => {
      const params: MaerskScheduleSearchParams = {
        origin: 'CNSHA',
        destination: 'USLAX',
        from: '2024-02-01',
        to: '2024-03-01',
      };

      const errors = validateScheduleSearchParams(params);

      expect(errors).toHaveLength(0);
    });

    it('должен возвращать ошибки для отсутствующих обязательных полей', () => {
      const params: MaerskScheduleSearchParams = {
        origin: '',
        destination: '',
        from: '',
        to: '',
      };

      const errors = validateScheduleSearchParams(params);

      expect(errors).toContain('origin is required');
      expect(errors).toContain('destination is required');
      expect(errors).toContain('from date is required');
      expect(errors).toContain('to date is required');
    });

    it('должен валидировать формат дат', () => {
      const params: MaerskScheduleSearchParams = {
        origin: 'CNSHA',
        destination: 'USLAX',
        from: '2024/02/01', // Неверный формат
        to: '2024-03-01',
      };

      const errors = validateScheduleSearchParams(params);

      expect(errors).toContain('from date must be in YYYY-MM-DD format');
    });

    it('должен валидировать диапазон дат', () => {
      const params: MaerskScheduleSearchParams = {
        origin: 'CNSHA',
        destination: 'USLAX',
        from: '2024-03-01', // Позже чем to
        to: '2024-02-01',
      };

      const errors = validateScheduleSearchParams(params);

      expect(errors).toContain('from date must be before to date');
    });

    it('должен валидировать максимальный диапазон дат', () => {
      const params: MaerskScheduleSearchParams = {
        origin: 'CNSHA',
        destination: 'USLAX',
        from: '2024-01-01',
        to: '2024-05-01', // Более 90 дней
      };

      const errors = validateScheduleSearchParams(params);

      expect(errors).toContain('date range cannot exceed 90 days');
    });
  });
});
