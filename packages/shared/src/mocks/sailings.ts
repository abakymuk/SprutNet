import { ContainerType, SailingStatus, WaypointType } from '../types';
import type { Sailing, Vessel, Route, Waypoint, Rate, Surcharge } from '../types';
import { mockPorts } from './ports';

/**
 * Моковые данные судов
 */
const mockVessels: Vessel[] = [
  {
    imoNumber: '9456783',
    name: 'MSC OSCAR',
    carrierCode: 'MSCU',
    capacity: 19224,
    builtYear: 2015,
    flag: 'Panama'
  },
  {
    imoNumber: '9456784',
    name: 'EVER GIVEN',
    carrierCode: 'EGLV',
    capacity: 20124,
    builtYear: 2018,
    flag: 'Panama'
  },
  {
    imoNumber: '9456785',
    name: 'CMA CGM MARCO POLO',
    carrierCode: 'CMDU',
    capacity: 16020,
    builtYear: 2012,
    flag: 'United Kingdom'
  }
];

/**
 * Моковые данные расписаний рейсов
 */
export const mockSailings: Sailing[] = [
  {
    id: 'SAIL-001',
    carrierCode: 'MSCU',
    carrierName: 'Mediterranean Shipping Company',
    voyageNumber: 'MSC-001',
    originPort: mockPorts[0], // Shanghai
    destinationPort: mockPorts[1], // Singapore
    departureDate: new Date('2024-02-15T10:00:00Z'),
    arrivalDate: new Date('2024-02-20T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1500,
    totalCapacity: 2000,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[0],
    route: {
      id: 'ROUTE-001',
      name: 'Asia-Europe Express',
      waypoints: [
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-02-15T08:00:00Z'),
          departureDate: new Date('2024-02-15T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[1], // Singapore
          arrivalDate: new Date('2024-02-20T14:00:00Z'),
          departureDate: new Date('2024-02-20T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 5,
      distance: 2800
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 1200,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 150,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 1350,
        currency: 'USD',
        validUntil: new Date('2024-03-15T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 2000,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 250,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 2250,
        currency: 'USD',
        validUntil: new Date('2024-03-15T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-002',
    carrierCode: 'EGLV',
    carrierName: 'Evergreen Marine',
    voyageNumber: 'EG-002',
    originPort: mockPorts[1], // Singapore
    destinationPort: mockPorts[2], // Rotterdam
    departureDate: new Date('2024-02-25T12:00:00Z'),
    arrivalDate: new Date('2024-03-15T08:00:00Z'),
    containerType: ContainerType.TEU_40HC,
    availableCapacity: 800,
    totalCapacity: 1200,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[1],
    route: {
      id: 'ROUTE-002',
      name: 'Asia-Europe Main',
      waypoints: [
        {
          port: mockPorts[1], // Singapore
          arrivalDate: new Date('2024-02-25T10:00:00Z'),
          departureDate: new Date('2024-02-25T12:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[6], // Dubai
          arrivalDate: new Date('2024-03-05T14:00:00Z'),
          departureDate: new Date('2024-03-05T16:00:00Z'),
          type: WaypointType.TRANSIT
        },
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2024-03-15T08:00:00Z'),
          departureDate: new Date('2024-03-15T10:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 18,
      distance: 8500
    },
    rates: [
      {
        containerType: ContainerType.TEU_40HC,
        baseRate: 2800,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 300,
            currency: 'USD',
            description: 'Fuel surcharge'
          },
          {
            name: 'Peak Season Surcharge',
            amount: 200,
            currency: 'USD',
            description: 'Peak season additional charge'
          }
        ],
        totalCost: 3300,
        currency: 'USD',
        validUntil: new Date('2024-04-15T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-003',
    carrierCode: 'CMDU',
    carrierName: 'CMA CGM',
    voyageNumber: 'CMA-003',
    originPort: mockPorts[2], // Rotterdam
    destinationPort: mockPorts[4], // New York
    departureDate: new Date('2024-03-01T16:00:00Z'),
    arrivalDate: new Date('2024-03-10T12:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 2000,
    totalCapacity: 2500,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[2],
    route: {
      id: 'ROUTE-003',
      name: 'Europe-America Express',
      waypoints: [
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2024-03-01T14:00:00Z'),
          departureDate: new Date('2024-03-01T16:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[4], // New York
          arrivalDate: new Date('2024-03-10T12:00:00Z'),
          departureDate: new Date('2024-03-10T14:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 9,
      distance: 3500
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 1800,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 200,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 2000,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 3000,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 350,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 3350,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

/**
 * Поиск расписаний по запросу
 */
export function searchSailings(
  originPortId: string,
  destinationPortId: string,
  departureDateFrom?: Date,
  departureDateTo?: Date,
  carrierCode?: string,
  containerType?: ContainerType,
  limit: number = 10
): Sailing[] {
  return mockSailings
    .filter(sailing => {
      // Фильтр по портам
      if (sailing.originPort.id !== originPortId || sailing.destinationPort.id !== destinationPortId) {
        return false;
      }
      
      // Фильтр по дате отправления
      if (departureDateFrom && sailing.departureDate < departureDateFrom) {
        return false;
      }
      if (departureDateTo && sailing.departureDate > departureDateTo) {
        return false;
      }
      
      // Фильтр по перевозчику
      if (carrierCode && sailing.carrierCode !== carrierCode) {
        return false;
      }
      
      // Фильтр по типу контейнера
      if (containerType && sailing.containerType !== containerType) {
        return false;
      }
      
      return true;
    })
    .slice(0, limit);
}

/**
 * Получение расписания по ID
 */
export function getSailingById(id: string): Sailing | undefined {
  return mockSailings.find(sailing => sailing.id === id);
}

/**
 * Получение расписаний по перевозчику
 */
export function getSailingsByCarrier(carrierCode: string): Sailing[] {
  return mockSailings.filter(sailing => sailing.carrierCode === carrierCode);
}
