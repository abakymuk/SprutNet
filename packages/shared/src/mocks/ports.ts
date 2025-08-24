import { PortType } from '../types';
import type { PortRef, Coordinates } from '../types';

/**
 * Моковые данные портов
 * Реальные данные основных мировых портов
 */
export const mockPorts: PortRef[] = [
  {
    id: 'CNSHA',
    name: 'Shanghai Port',
    countryCode: 'CN',
    countryName: 'China',
    cityCode: 'SHA',
    cityName: 'Shanghai',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 31.2304,
      longitude: 121.4737
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SGSIN',
    name: 'Port of Singapore',
    countryCode: 'SG',
    countryName: 'Singapore',
    cityCode: 'SIN',
    cityName: 'Singapore',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 1.3521,
      longitude: 103.8198
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'NLRTM',
    name: 'Port of Rotterdam',
    countryCode: 'NL',
    countryName: 'Netherlands',
    cityCode: 'RTM',
    cityName: 'Rotterdam',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 51.9225,
      longitude: 4.4792
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEHAM',
    name: 'Port of Hamburg',
    countryCode: 'DE',
    countryName: 'Germany',
    cityCode: 'HAM',
    cityName: 'Hamburg',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 53.5511,
      longitude: 9.9937
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'USNYC',
    name: 'Port of New York and New Jersey',
    countryCode: 'US',
    countryName: 'United States',
    cityCode: 'NYC',
    cityName: 'New York',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'USLAX',
    name: 'Port of Los Angeles',
    countryCode: 'US',
    countryName: 'United States',
    cityCode: 'LAX',
    cityName: 'Los Angeles',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'AEJEA',
    name: 'Port of Jebel Ali',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    cityCode: 'DXB',
    cityName: 'Dubai',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 25.2048,
      longitude: 55.2708
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'KRKAN',
    name: 'Port of Busan',
    countryCode: 'KR',
    countryName: 'South Korea',
    cityCode: 'PUS',
    cityName: 'Busan',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 35.1796,
      longitude: 129.0756
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'JPYOK',
    name: 'Port of Yokohama',
    countryCode: 'JP',
    countryName: 'Japan',
    cityCode: 'YOK',
    cityName: 'Yokohama',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 35.4437,
      longitude: 139.6380
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'GBLON',
    name: 'Port of London',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    cityCode: 'LON',
    cityName: 'London',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Добавляем популярные российские порты
  {
    id: 'RUULU',
    name: 'Port of St. Petersburg',
    countryCode: 'RU',
    countryName: 'Russia',
    cityCode: 'LED',
    cityName: 'St. Petersburg',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 59.9311,
      longitude: 30.3609
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'RUNOV',
    name: 'Port of Novorossiysk',
    countryCode: 'RU',
    countryName: 'Russia',
    cityCode: 'NOV',
    cityName: 'Novorossiysk',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 44.7239,
      longitude: 37.7683
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'RUVVO',
    name: 'Port of Vladivostok',
    countryCode: 'RU',
    countryName: 'Russia',
    cityCode: 'VVO',
    cityName: 'Vladivostok',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 43.1198,
      longitude: 131.8869
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Добавляем популярные европейские порты
  {
    id: 'ESVLC',
    name: 'Port of Valencia',
    countryCode: 'ES',
    countryName: 'Spain',
    cityCode: 'VLC',
    cityName: 'Valencia',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 39.4699,
      longitude: -0.3763
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'ITGIT',
    name: 'Port of Gioia Tauro',
    countryCode: 'IT',
    countryName: 'Italy',
    cityCode: 'GIT',
    cityName: 'Gioia Tauro',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 38.4500,
      longitude: 15.9000
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Добавляем популярные азиатские порты
  {
    id: 'HKHKG',
    name: 'Port of Hong Kong',
    countryCode: 'HK',
    countryName: 'Hong Kong',
    cityCode: 'HKG',
    cityName: 'Hong Kong',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 22.3193,
      longitude: 114.1694
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'TWKHH',
    name: 'Port of Kaohsiung',
    countryCode: 'TW',
    countryName: 'Taiwan',
    cityCode: 'KHH',
    cityName: 'Kaohsiung',
    type: PortType.SEAPORT,
    coordinates: {
      latitude: 22.6273,
      longitude: 120.3014
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

/**
 * Поиск портов по запросу
 */
export function searchPorts(query: string, limit: number = 10): PortRef[] {
  const searchTerm = query.toLowerCase();
  
  return mockPorts
    .filter(port => 
      port.name.toLowerCase().includes(searchTerm) ||
      port.cityName?.toLowerCase().includes(searchTerm) ||
      port.countryName.toLowerCase().includes(searchTerm) ||
      port.id.toLowerCase().includes(searchTerm)
    )
    .slice(0, limit);
}

/**
 * Получение порта по ID
 */
export function getPortById(id: string): PortRef | undefined {
  return mockPorts.find(port => port.id === id);
}

/**
 * Получение портов по стране
 */
export function getPortsByCountry(countryCode: string): PortRef[] {
  return mockPorts.filter(port => port.countryCode === countryCode);
}
