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
  },
  {
    imoNumber: '9456786',
    name: 'MAERSK SEVILLE',
    carrierCode: 'MAEU',
    capacity: 18000,
    builtYear: 2016,
    flag: 'Denmark'
  },
  {
    imoNumber: '9456787',
    name: 'COSCO SHIPPING UNIVERSE',
    carrierCode: 'COSU',
    capacity: 21000,
    builtYear: 2019,
    flag: 'Hong Kong'
  }
];

/**
 * Моковые данные расписаний рейсов
 */
export const mockSailings: Sailing[] = [
  // Существующие рейсы
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
  },
  {
    id: 'SAIL-003',
    carrierCode: 'CMDU',
    carrierName: 'CMA CGM',
    voyageNumber: 'CMA-003',
    originPort: mockPorts[2], // Rotterdam
    destinationPort: mockPorts[4], // New York
    departureDate: new Date('2024-03-20T08:00:00Z'),
    arrivalDate: new Date('2024-03-29T12:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1200,
    totalCapacity: 1800,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[2],
    route: {
      id: 'ROUTE-003',
      name: 'Europe-America Express',
      waypoints: [
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2024-03-20T06:00:00Z'),
          departureDate: new Date('2024-03-20T08:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[4], // New York
          arrivalDate: new Date('2024-03-29T12:00:00Z'),
          departureDate: new Date('2024-03-29T14:00:00Z'),
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
  },
  // Новые рейсы для популярных маршрутов
  {
    id: 'SAIL-004',
    carrierCode: 'MAEU',
    carrierName: 'Maersk Line',
    voyageNumber: 'MAEU-004',
    originPort: mockPorts[0], // Shanghai
    destinationPort: mockPorts[4], // New York
    departureDate: new Date('2024-02-20T10:00:00Z'),
    arrivalDate: new Date('2024-03-15T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 2000,
    totalCapacity: 2500,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[3],
    route: {
      id: 'ROUTE-004',
      name: 'Asia-America Express',
      waypoints: [
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-02-20T08:00:00Z'),
          departureDate: new Date('2024-02-20T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[4], // New York
          arrivalDate: new Date('2024-03-15T14:00:00Z'),
          departureDate: new Date('2024-03-15T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 23,
      distance: 12000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 2500,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 300,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 2800,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 4000,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 500,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 4500,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-005',
    carrierCode: 'COSU',
    carrierName: 'COSCO Shipping',
    voyageNumber: 'COSU-005',
    originPort: mockPorts[0], // Shanghai
    destinationPort: mockPorts[2], // Rotterdam
    departureDate: new Date('2024-02-18T12:00:00Z'),
    arrivalDate: new Date('2024-03-12T08:00:00Z'),
    containerType: ContainerType.TEU_40HC,
    availableCapacity: 1800,
    totalCapacity: 2200,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[4],
    route: {
      id: 'ROUTE-005',
      name: 'Asia-Europe Premium',
      waypoints: [
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-02-18T10:00:00Z'),
          departureDate: new Date('2024-02-18T12:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2024-03-12T08:00:00Z'),
          departureDate: new Date('2024-03-12T10:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 22,
      distance: 11000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 2200,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 250,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 2450,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 3500,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 400,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 3900,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-006',
    carrierCode: 'MSCU',
    carrierName: 'Mediterranean Shipping Company',
    voyageNumber: 'MSC-006',
    originPort: mockPorts[4], // New York
    destinationPort: mockPorts[0], // Shanghai
    departureDate: new Date('2024-03-01T10:00:00Z'),
    arrivalDate: new Date('2024-03-25T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1600,
    totalCapacity: 2000,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[0],
    route: {
      id: 'ROUTE-006',
      name: 'America-Asia Express',
      waypoints: [
        {
          port: mockPorts[4], // New York
          arrivalDate: new Date('2024-03-01T08:00:00Z'),
          departureDate: new Date('2024-03-01T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-03-25T14:00:00Z'),
          departureDate: new Date('2024-03-25T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 24,
      distance: 12000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 2400,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 280,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 2680,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 3800,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 450,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 4250,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Рейсы с российскими портами
  {
    id: 'SAIL-007',
    carrierCode: 'MAEU',
    carrierName: 'Maersk Line',
    voyageNumber: 'MAEU-007',
    originPort: mockPorts[10], // St. Petersburg
    destinationPort: mockPorts[0], // Shanghai
    departureDate: new Date('2024-02-22T08:00:00Z'),
    arrivalDate: new Date('2024-03-18T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1200,
    totalCapacity: 1500,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[3],
    route: {
      id: 'ROUTE-007',
      name: 'Baltic-Asia Express',
      waypoints: [
        {
          port: mockPorts[10], // St. Petersburg
          arrivalDate: new Date('2024-02-22T06:00:00Z'),
          departureDate: new Date('2024-02-22T08:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-03-18T14:00:00Z'),
          departureDate: new Date('2024-03-18T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 24,
      distance: 13000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 2800,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 350,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 3150,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 4500,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 550,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 5050,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-008',
    carrierCode: 'EGLV',
    carrierName: 'Evergreen Marine',
    voyageNumber: 'EG-008',
    originPort: mockPorts[11], // Novorossiysk
    destinationPort: mockPorts[2], // Rotterdam
    departureDate: new Date('2024-02-28T10:00:00Z'),
    arrivalDate: new Date('2024-03-20T08:00:00Z'),
    containerType: ContainerType.TEU_40HC,
    availableCapacity: 900,
    totalCapacity: 1200,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[1],
    route: {
      id: 'ROUTE-008',
      name: 'Black Sea-Europe',
      waypoints: [
        {
          port: mockPorts[11], // Novorossiysk
          arrivalDate: new Date('2024-02-28T08:00:00Z'),
          departureDate: new Date('2024-02-28T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2024-03-20T08:00:00Z'),
          departureDate: new Date('2024-03-20T10:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 20,
      distance: 9000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
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
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
        baseRate: 3200,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 400,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 3600,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'SAIL-009',
    carrierCode: 'COSU',
    carrierName: 'COSCO Shipping',
    voyageNumber: 'COSU-009',
    originPort: mockPorts[12], // Vladivostok
    destinationPort: mockPorts[0], // Shanghai
    departureDate: new Date('2024-02-25T12:00:00Z'),
    arrivalDate: new Date('2024-03-05T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1400,
    totalCapacity: 1800,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[4],
    route: {
      id: 'ROUTE-009',
      name: 'Far East-Asia',
      waypoints: [
        {
          port: mockPorts[12], // Vladivostok
          arrivalDate: new Date('2024-02-25T10:00:00Z'),
          departureDate: new Date('2024-02-25T12:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2024-03-05T14:00:00Z'),
          departureDate: new Date('2024-03-05T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 8,
      distance: 2000
    },
    rates: [
      {
        containerType: ContainerType.TEU_20,
        baseRate: 800,
        surcharges: [
          {
            name: 'Bunker Adjustment Factor',
            amount: 100,
            currency: 'USD',
            description: 'Fuel surcharge'
          }
        ],
        totalCost: 900,
        currency: 'USD',
        validUntil: new Date('2024-04-01T23:59:59Z')
      },
      {
        containerType: ContainerType.TEU_40,
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
        validUntil: new Date('2024-04-01T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Рейсы с датами в 2025 году для тестирования
  {
    id: 'SAIL-2025-001',
    carrierCode: 'MSCU',
    carrierName: 'Mediterranean Shipping Company',
    voyageNumber: 'MSC-2025-001',
    originPort: mockPorts[0], // Shanghai
    destinationPort: mockPorts[1], // Singapore
    departureDate: new Date('2025-08-25T10:00:00Z'),
    arrivalDate: new Date('2025-08-30T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1500,
    totalCapacity: 2000,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[0],
    route: {
      id: 'ROUTE-2025-001',
      name: 'Asia-Europe Express 2025',
      waypoints: [
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2025-08-25T08:00:00Z'),
          departureDate: new Date('2025-08-25T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[1], // Singapore
          arrivalDate: new Date('2025-08-30T14:00:00Z'),
          departureDate: new Date('2025-08-30T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 5,
      distance: 2800
    },
    rates: [
      {
        containerType: ContainerType.TEU_40,
        baseRate: 2000,
        surcharges: [],
        totalCost: 2000,
        currency: 'USD',
        validUntil: new Date('2025-12-31T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'SAIL-2025-002',
    carrierCode: 'COSU',
    carrierName: 'COSCO Shipping',
    voyageNumber: 'COSU-2025-002',
    originPort: mockPorts[0], // Shanghai
    destinationPort: mockPorts[2], // Rotterdam
    departureDate: new Date('2025-09-01T10:00:00Z'),
    arrivalDate: new Date('2025-09-15T14:00:00Z'),
    containerType: ContainerType.TEU_40,
    availableCapacity: 1800,
    totalCapacity: 2200,
    status: SailingStatus.SCHEDULED,
    vessel: mockVessels[4],
    route: {
      id: 'ROUTE-2025-002',
      name: 'Asia-Europe Express 2025',
      waypoints: [
        {
          port: mockPorts[0], // Shanghai
          arrivalDate: new Date('2025-09-01T08:00:00Z'),
          departureDate: new Date('2025-09-01T10:00:00Z'),
          type: WaypointType.LOADING
        },
        {
          port: mockPorts[2], // Rotterdam
          arrivalDate: new Date('2025-09-15T14:00:00Z'),
          departureDate: new Date('2025-09-15T16:00:00Z'),
          type: WaypointType.DISCHARGE
        }
      ],
      duration: 14,
      distance: 8500
    },
    rates: [
      {
        containerType: ContainerType.TEU_40,
        baseRate: 2500,
        surcharges: [],
        totalCost: 2500,
        currency: 'USD',
        validUntil: new Date('2025-12-31T23:59:59Z')
      }
    ],
    deadlines: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
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
  console.log('🔍 searchSailings called with:', {
    originPortId,
    destinationPortId,
    departureDateFrom,
    departureDateTo,
    carrierCode,
    containerType,
    limit
  });
  
  console.log('📋 Available sailings:', mockSailings.map(s => ({
    id: s.id,
    origin: s.originPort.id,
    destination: s.destinationPort.id,
    carrier: s.carrierCode
  })));
  
  const filtered = mockSailings
    .filter(sailing => {
      // Фильтр по портам
      if (sailing.originPort.id !== originPortId || sailing.destinationPort.id !== destinationPortId) {
        console.log(`❌ Port mismatch: ${sailing.originPort.id}->${sailing.destinationPort.id} vs ${originPortId}->${destinationPortId}`);
        return false;
      }
      
      // Фильтр по дате отправления
      if (departureDateFrom && sailing.departureDate < departureDateFrom) {
        console.log(`❌ Date too early: ${sailing.departureDate} < ${departureDateFrom}`);
        return false;
      }
      if (departureDateTo && sailing.departureDate > departureDateTo) {
        console.log(`❌ Date too late: ${sailing.departureDate} > ${departureDateTo}`);
        return false;
      }
      
      // Фильтр по перевозчику
      if (carrierCode && sailing.carrierCode !== carrierCode) {
        console.log(`❌ Carrier mismatch: ${sailing.carrierCode} vs ${carrierCode}`);
        return false;
      }
      
      // Фильтр по типу контейнера
      if (containerType && sailing.containerType !== containerType) {
        console.log(`❌ Container type mismatch: ${sailing.containerType} vs ${containerType}`);
        return false;
      }
      
      console.log(`✅ Sailing ${sailing.id} passed all filters`);
      return true;
    })
    .slice(0, limit);
    
  console.log('📊 Final results:', filtered.length);
  return filtered;
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
