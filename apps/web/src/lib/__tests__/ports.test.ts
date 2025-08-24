import { describe, it, expect } from 'vitest';
import { 
  mapLocationToPortRef, 
  filterPorts, 
  searchPorts,
  type MaerskLocation
} from '../types/ports';
import { PortType, type PortRef } from '@sprutnet/shared/types';

describe('Ports Functions', () => {
  describe('mapLocationToPortRef', () => {
    it('должен правильно маппить полные данные локации', () => {
      const location: MaerskLocation = {
        carrierGeoID: 'CNSHA',
        locationName: 'Shanghai Port',
        cityName: 'Shanghai',
        countryName: 'China',
        unLocationCode: 'CNSHA',
        locationType: 'port',
        countryCode: 'CN',
      };

      const result = mapLocationToPortRef(location);

      expect(result).toEqual({
        id: 'CNSHA',
        name: 'Shanghai Port',
        countryCode: 'CN',
        countryName: 'China',
        cityName: 'Shanghai',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('должен использовать fallback значения при отсутствующих полях', () => {
      const location: MaerskLocation = {
        carrierGeoID: undefined as any,
        locationName: undefined as any,
        cityName: 'Shanghai',
        countryName: undefined as any,
        unLocationCode: 'CNSHA',
        countryCode: 'CN',
      };

      const result = mapLocationToPortRef(location);

      expect(result).toEqual({
        id: 'CNSHA', // Использует unLocationCode как fallback
        name: 'Shanghai', // Использует cityName как fallback
        countryCode: 'CN',
        countryName: '',
        cityName: 'Shanghai',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('должен обрабатывать полностью пустые данные', () => {
      const location: MaerskLocation = {
        carrierGeoID: '',
        locationName: '',
      };

      const result = mapLocationToPortRef(location);

      expect(result).toEqual({
        id: '',
        name: '',
        countryCode: '',
        countryName: '',
        cityName: undefined,
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('filterPorts', () => {
    it('должен фильтровать только порты', () => {
      const locations: MaerskLocation[] = [
        {
          carrierGeoID: 'CNSHA',
          locationName: 'Shanghai Port',
          locationType: 'port',
        },
        {
          carrierGeoID: 'CNSHA',
          locationName: 'Shanghai Airport',
          locationType: 'airport',
        },
        {
          carrierGeoID: 'SGSIN',
          locationName: 'Singapore Port',
          locationType: 'seaport',
        },
        {
          carrierGeoID: 'USNYC',
          locationName: 'New York City',
          locationType: 'city',
        },
        {
          carrierGeoID: 'DEHAM',
          locationName: 'Hamburg',
          unLocationCode: 'DEHAM',
        },
      ];

      const result = filterPorts(locations);

      expect(result).toHaveLength(3);
      expect(result[0].locationName).toBe('Shanghai Port');
      expect(result[1].locationName).toBe('Singapore Port');
      expect(result[2].locationName).toBe('Hamburg');
    });

    it('должен включать локации с UNLOCODE длиной 5 символов', () => {
      const locations: MaerskLocation[] = [
        {
          carrierGeoID: 'TEST1',
          locationName: 'Test Port 1',
          unLocationCode: 'TEST1',
        },
        {
          carrierGeoID: 'TEST2',
          locationName: 'Test Port 2',
          unLocationCode: 'TEST',
        },
      ];

      const result = filterPorts(locations);

      expect(result).toHaveLength(1);
      expect(result[0].locationName).toBe('Test Port 1');
    });

    it('должен возвращать пустой массив для не-портов', () => {
      const locations: MaerskLocation[] = [
        {
          carrierGeoID: 'CNSHA',
          locationName: 'Shanghai Airport',
          locationType: 'airport',
        },
        {
          carrierGeoID: 'USNYC',
          locationName: 'New York City',
          locationType: 'city',
        },
      ];

      const result = filterPorts(locations);

      expect(result).toHaveLength(0);
    });
  });

  describe('searchPorts', () => {
    const mockPorts: PortRef[] = [
      { 
        id: 'CNSHA', 
        name: 'Shanghai', 
        countryCode: 'CN',
        countryName: 'China',
        cityName: 'Shanghai',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: 'SGSIN', 
        name: 'Singapore', 
        countryCode: 'SG',
        countryName: 'Singapore',
        cityName: 'Singapore',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: 'NLRTM', 
        name: 'Rotterdam', 
        countryCode: 'NL',
        countryName: 'Netherlands',
        cityName: 'Rotterdam',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: 'USNYC', 
        name: 'New York', 
        countryCode: 'US',
        countryName: 'United States',
        cityName: 'New York',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        id: 'DEHAM', 
        name: 'Hamburg', 
        countryCode: 'DE',
        countryName: 'Germany',
        cityName: 'Hamburg',
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('должен находить порты по коду', () => {
      const result = searchPorts(mockPorts, 'CNSHA');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shanghai');
    });

    it('должен находить порты по названию', () => {
      const result = searchPorts(mockPorts, 'shanghai');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CNSHA');
    });

    it('должен находить порты по стране', () => {
      const result = searchPorts(mockPorts, 'china');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shanghai');
    });

    it('должен быть нечувствительным к регистру', () => {
      const result = searchPorts(mockPorts, 'SHANGHAI');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CNSHA');
    });

    it('должен возвращать пустой массив для пустого запроса', () => {
      const result = searchPorts(mockPorts, '');

      expect(result).toHaveLength(0);
    });

    it('должен возвращать пустой массив для запроса из пробелов', () => {
      const result = searchPorts(mockPorts, '   ');

      expect(result).toHaveLength(0);
    });

    it('должен ограничивать результаты до 10', () => {
      const manyPorts: PortRef[] = Array.from({ length: 15 }, (_, i) => ({
        id: `PORT${i}`,
        name: `Port ${i}`,
        countryCode: 'TS',
        countryName: 'Test',
        cityName: `Port ${i}`,
        type: PortType.SEAPORT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = searchPorts(manyPorts, 'port');

      expect(result).toHaveLength(10);
    });

    it('должен возвращать все совпадения для частичного запроса', () => {
      const result = searchPorts(mockPorts, 'sh');

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(port => 
        port.name.toLowerCase().includes('sh') ||
        port.id.toLowerCase().includes('sh') ||
        port.countryName.toLowerCase().includes('sh')
      )).toBe(true);
    });
  });
});
