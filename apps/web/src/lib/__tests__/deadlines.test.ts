import { describe, it, expect } from 'vitest';
import {
  normalizeDeadlineType,
  convertUTCToLocal,
  determineDeadlineStatus,
  mapMaerskDeadlineToDeadline,
  validateDeadlineSearchParams,
  type MaerskDeadline
} from '../types/deadlines';
import { DeadlineType, DeadlineStatus } from '@sprutnet/shared/types';

describe('Deadlines Functions', () => {
  describe('normalizeDeadlineType', () => {
    it('должен нормализовать DOC дедлайны', () => {
      expect(normalizeDeadlineType('Documents Cut-off')).toBe(DeadlineType.DOCUMENTATION);
      expect(normalizeDeadlineType('Documentation Deadline')).toBe(DeadlineType.DOCUMENTATION);
    });

    it('должен нормализовать CY дедлайны', () => {
      expect(normalizeDeadlineType('Container Yard Cut-off')).toBe(DeadlineType.CONTAINER_DELIVERY);
      expect(normalizeDeadlineType('Yard Delivery')).toBe(DeadlineType.CONTAINER_DELIVERY);
    });

    it('должен нормализовать VGM дедлайны', () => {
      expect(normalizeDeadlineType('VGM Cut-off')).toBe(DeadlineType.INSURANCE);
      expect(normalizeDeadlineType('Weight Declaration')).toBe(DeadlineType.INSURANCE);
    });

    it('должен нормализовать Customs дедлайны', () => {
      expect(normalizeDeadlineType('Customs Clearance')).toBe(DeadlineType.CUSTOMS_CLEARANCE);
      expect(normalizeDeadlineType('Таможенное оформление')).toBe(DeadlineType.CUSTOMS_CLEARANCE);
    });

    it('должен нормализовать Loading дедлайны', () => {
      expect(normalizeDeadlineType('Loading Deadline')).toBe(DeadlineType.LOADING);
      expect(normalizeDeadlineType('Погрузка')).toBe(DeadlineType.LOADING);
    });

    it('должен возвращать DOCUMENTATION по умолчанию', () => {
      expect(normalizeDeadlineType('Unknown Deadline')).toBe(DeadlineType.DOCUMENTATION);
    });
  });

  describe('convertUTCToLocal', () => {
    it('должен конвертировать UTC время в локальное', () => {
      const utcDate = '2024-01-15T10:00:00Z';
      const localDate = convertUTCToLocal(utcDate, 'CET');
      
      expect(localDate).toBeInstanceOf(Date);
      expect(localDate.getTime()).toBe(new Date(utcDate).getTime() + 60 * 60 * 1000); // +1 hour for CET
    });

    it('должен возвращать исходную дату для UTC timezone', () => {
      const utcDate = '2024-01-15T10:00:00Z';
      const localDate = convertUTCToLocal(utcDate, 'UTC');
      
      expect(localDate.getTime()).toBe(new Date(utcDate).getTime());
    });

    it('должен обрабатывать неверные даты', () => {
      const invalidDate = 'invalid-date';
      const result = convertUTCToLocal(invalidDate, 'UTC');
      
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(true);
    });
  });

  describe('determineDeadlineStatus', () => {
    it('должен определять OVERDUE для просроченных дедлайнов', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Вчера
      expect(determineDeadlineStatus(pastDate)).toBe(DeadlineStatus.OVERDUE);
    });

    it('должен определять ACTIVE для будущих дедлайнов', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Завтра
      expect(determineDeadlineStatus(futureDate)).toBe(DeadlineStatus.ACTIVE);
    });

    it('должен определять ACTIVE для дедлайнов в течение 24 часов', () => {
      const soonDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // Через 12 часов
      expect(determineDeadlineStatus(soonDate)).toBe(DeadlineStatus.ACTIVE);
    });
  });

  describe('mapMaerskDeadlineToDeadline', () => {
    const mockMaerskDeadline: MaerskDeadline = {
      deadlineName: 'Documents Cut-off',
      deadlineLocal: '2024-01-15T10:00:00Z'
    };

    it('должен маппить Maersk дедлайн в наш тип', () => {
      const result = mapMaerskDeadlineToDeadline(
        mockMaerskDeadline,
        'Test Terminal',
        'SAIL-001',
        'PORT-001',
        'UTC'
      );

      expect(result).toMatchObject({
        type: DeadlineType.DOCUMENTATION,
        name: 'Documents Cut-off',
        description: 'Подготовка и подача документов',
        sailingId: 'SAIL-001',
        isMandatory: true
      });

      // Статус может быть OVERDUE если дата в прошлом, поэтому проверяем отдельно
      expect([DeadlineStatus.ACTIVE, DeadlineStatus.OVERDUE]).toContain(result.status);

      expect(result.id).toMatch(/^deadline-\d+-\w+$/);
      expect(result.deadlineDate).toBeInstanceOf(Date);
      expect(result.port).toMatchObject({
        id: 'PORT-001',
        name: 'Test Terminal',
        countryCode: 'UN',
        countryName: 'Unknown'
      });
    });

    it('должен корректно обрабатывать timezone', () => {
      const result = mapMaerskDeadlineToDeadline(
        mockMaerskDeadline,
        'Test Terminal',
        'SAIL-001',
        'PORT-001',
        'CET'
      );

      expect(result.timezone).toBe('CET');
    });
  });

  describe('validateDeadlineSearchParams', () => {
    it('должен валидировать корректные параметры', () => {
      const params = {
        ISOCountryCode: 'US',
        portOfLoad: 'Los Angeles',
        vesselIMONumber: '1234567',
        voyage: '123E'
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toHaveLength(0);
    });

    it('должен возвращать ошибки для отсутствующих обязательных полей', () => {
      const params = {
        ISOCountryCode: '',
        portOfLoad: '',
        vesselIMONumber: '',
        voyage: ''
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toContain('ISOCountryCode is required');
      expect(errors).toContain('portOfLoad is required');
      expect(errors).toContain('vesselIMONumber is required');
      expect(errors).toContain('voyage is required');
    });

    it('должен валидировать формат ISOCountryCode', () => {
      const params = {
        ISOCountryCode: 'USA', // Неверный формат
        portOfLoad: 'Los Angeles',
        vesselIMONumber: '1234567',
        voyage: '123E'
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toContain('ISOCountryCode must be a 2-letter country code');
    });

    it('должен валидировать формат vesselIMONumber', () => {
      const params = {
        ISOCountryCode: 'US',
        portOfLoad: 'Los Angeles',
        vesselIMONumber: '123456', // Неверный формат (6 цифр вместо 7)
        voyage: '123E'
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toContain('vesselIMONumber must be a 7-digit number');
    });

    it('должен валидировать формат voyage', () => {
      const params = {
        ISOCountryCode: 'US',
        portOfLoad: 'Los Angeles',
        vesselIMONumber: '1234567',
        voyage: '123' // Правильный формат (1-4 символа)
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toHaveLength(0); // Теперь это валидный формат
    });

    it('должен валидировать limit', () => {
      const params = {
        ISOCountryCode: 'US',
        portOfLoad: 'Los Angeles',
        vesselIMONumber: '1234567',
        voyage: '123E',
        limit: 0 // Неверное значение
      };

      const errors = validateDeadlineSearchParams(params);
      expect(errors).toContain('limit must be between 1 and 100');
    });
  });
});
