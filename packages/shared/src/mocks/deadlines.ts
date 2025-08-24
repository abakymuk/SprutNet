import { DeadlineType, DeadlineStatus, PenaltyType, ContainerType } from '../types';
import type { Deadline, Penalty } from '../types';
import { mockPorts } from './ports';

/**
 * Моковые данные дедлайнов
 */
export const mockDeadlines: Deadline[] = [
  {
    id: 'DEAD-001',
    type: DeadlineType.DOCUMENTATION,
    name: 'Documentation Cut-off',
    description: 'Deadline for submitting all required shipping documents',
    deadlineDate: new Date('2024-02-10T17:00:00Z'),
    timezone: 'Asia/Shanghai',
    port: mockPorts[0], // Shanghai
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: true,
    penalty: {
      type: PenaltyType.FIXED,
      amount: 500,
      currency: 'USD',
      description: 'Fixed penalty for late documentation'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-002',
    type: DeadlineType.CONTAINER_DELIVERY,
    name: 'Container Delivery Cut-off',
    description: 'Deadline for delivering empty containers to terminal',
    deadlineDate: new Date('2024-02-12T12:00:00Z'),
    timezone: 'Asia/Shanghai',
    port: mockPorts[0], // Shanghai
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: true,
    penalty: {
      type: PenaltyType.DAILY,
      amount: 200,
      currency: 'USD',
      description: 'Daily penalty for late container delivery'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-003',
    type: DeadlineType.LOADING,
    name: 'Loading Cut-off',
    description: 'Deadline for completing cargo loading',
    deadlineDate: new Date('2024-02-14T18:00:00Z'),
    timezone: 'Asia/Shanghai',
    port: mockPorts[0], // Shanghai
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: true,
    penalty: {
      type: PenaltyType.PERCENTAGE,
      amount: 5,
      currency: 'USD',
      description: '5% penalty of total freight cost'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-004',
    type: DeadlineType.DISCHARGE,
    name: 'Discharge Deadline',
    description: 'Deadline for completing cargo discharge',
    deadlineDate: new Date('2024-02-22T16:00:00Z'),
    timezone: 'Asia/Singapore',
    port: mockPorts[1], // Singapore
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: true,
    penalty: {
      type: PenaltyType.DAILY,
      amount: 300,
      currency: 'USD',
      description: 'Daily demurrage charge'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-005',
    type: DeadlineType.CUSTOMS_CLEARANCE,
    name: 'Customs Clearance Deadline',
    description: 'Deadline for customs clearance procedures',
    deadlineDate: new Date('2024-02-23T12:00:00Z'),
    timezone: 'Asia/Singapore',
    port: mockPorts[1], // Singapore
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: false,
    penalty: {
      type: PenaltyType.FIXED,
      amount: 250,
      currency: 'USD',
      description: 'Administrative fee for delayed clearance'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-006',
    type: DeadlineType.PAYMENT,
    name: 'Payment Deadline',
    description: 'Deadline for freight payment',
    deadlineDate: new Date('2024-02-08T17:00:00Z'),
    timezone: 'UTC',
    port: mockPorts[0], // Shanghai
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: true,
    penalty: {
      type: PenaltyType.PERCENTAGE,
      amount: 2,
      currency: 'USD',
      description: '2% late payment fee'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'DEAD-007',
    type: DeadlineType.INSURANCE,
    name: 'Insurance Deadline',
    description: 'Deadline for cargo insurance confirmation',
    deadlineDate: new Date('2024-02-09T17:00:00Z'),
    timezone: 'UTC',
    port: mockPorts[0], // Shanghai
    sailingId: 'SAIL-001',
    containerType: ContainerType.TEU_40,
    isMandatory: false,
    penalty: {
      type: PenaltyType.FIXED,
      amount: 100,
      currency: 'USD',
      description: 'Insurance processing fee'
    },
    status: DeadlineStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

/**
 * Поиск дедлайнов по запросу
 */
export function searchDeadlines(
  sailingId?: string,
  portId?: string,
  type?: DeadlineType,
  deadlineDateFrom?: Date,
  deadlineDateTo?: Date,
  status?: DeadlineStatus,
  limit: number = 10
): Deadline[] {
  return mockDeadlines
    .filter(deadline => {
      // Фильтр по рейсу
      if (sailingId && deadline.sailingId !== sailingId) {
        return false;
      }
      
      // Фильтр по порту
      if (portId && deadline.port.id !== portId) {
        return false;
      }
      
      // Фильтр по типу
      if (type && deadline.type !== type) {
        return false;
      }
      
      // Фильтр по дате дедлайна
      if (deadlineDateFrom && deadline.deadlineDate < deadlineDateFrom) {
        return false;
      }
      if (deadlineDateTo && deadline.deadlineDate > deadlineDateTo) {
        return false;
      }
      
      // Фильтр по статусу
      if (status && deadline.status !== status) {
        return false;
      }
      
      return true;
    })
    .slice(0, limit);
}

/**
 * Получение дедлайна по ID
 */
export function getDeadlineById(id: string): Deadline | undefined {
  return mockDeadlines.find(deadline => deadline.id === id);
}

/**
 * Получение дедлайнов по рейсу
 */
export function getDeadlinesBySailing(sailingId: string): Deadline[] {
  return mockDeadlines.filter(deadline => deadline.sailingId === sailingId);
}

/**
 * Получение дедлайнов по порту
 */
export function getDeadlinesByPort(portId: string): Deadline[] {
  return mockDeadlines.filter(deadline => deadline.port.id === portId);
}

/**
 * Получение дедлайнов по типу
 */
export function getDeadlinesByType(type: DeadlineType): Deadline[] {
  return mockDeadlines.filter(deadline => deadline.type === type);
}
