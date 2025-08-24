/**
 * @sprutnet/shared - Общие типы для SprutNet
 * 
 * Этот пакет содержит все доменные типы, используемые в приложении:
 * - PortRef: типы для работы с портами
 * - Sailing: типы для расписаний рейсов
 * - Deadline: типы для дедлайнов
 */

// Экспортируем все типы из модулей
export * from './port';
export * from './sailing';
export * from './deadline';

// Re-export common types (enum'ы экспортируем как значения, интерфейсы как типы)
export { PortType } from './port';
export type { PortRef, Coordinates, PortSearchQuery, PortSearchResult } from './port';

export { 
  ContainerType, 
  SailingStatus, 
  WaypointType 
} from './sailing';
export type { 
  Sailing, 
  Vessel, 
  Route, 
  Waypoint, 
  Rate, 
  Surcharge, 
  SailingSearchQuery, 
  SailingSearchResult 
} from './sailing';

export { 
  DeadlineType, 
  DeadlineStatus, 
  PenaltyType 
} from './deadline';
export type { 
  Deadline, 
  Penalty, 
  DeadlineSearchQuery, 
  DeadlineSearchResult 
} from './deadline';
