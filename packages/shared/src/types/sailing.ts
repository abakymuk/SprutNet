import type { PortRef } from './port';
import type { Deadline } from './deadline';

/**
 * Sailing - Расписание рейса
 * Основной доменный тип для расписаний морских перевозок
 */
export interface Sailing {
  /** Уникальный идентификатор рейса */
  id: string;
  /** Код перевозчика */
  carrierCode: string;
  /** Название перевозчика */
  carrierName: string;
  /** Номер рейса */
  voyageNumber: string;
  /** Порт отправления */
  originPort: PortRef;
  /** Порт назначения */
  destinationPort: PortRef;
  /** Дата отправления (UTC) */
  departureDate: Date;
  /** Дата прибытия (UTC) */
  arrivalDate: Date;
  /** Локальное время отправления */
  departureLocalTime?: string;
  /** Локальное время прибытия */
  arrivalLocalTime?: string;
  /** Таймзона порта отправления */
  originTimezone?: string;
  /** Таймзона порта назначения */
  destinationTimezone?: string;
  /** Тип контейнера */
  containerType: ContainerType;
  /** Доступная вместимость (TEU) */
  availableCapacity: number;
  /** Общая вместимость (TEU) */
  totalCapacity: number;
  /** Статус рейса */
  status: SailingStatus;
  /** Судно */
  vessel: Vessel;
  /** Маршрут */
  route: Route;
  /** Тарифы */
  rates: Rate[];
  /** Дедлайны */
  deadlines: Deadline[];
  /** Время транзита (дни) */
  transitTime?: number;
  /** Задержка (дни) */
  delay?: number;
  /** Дата создания записи */
  createdAt: Date;
  /** Дата последнего обновления */
  updatedAt: Date;
}

/**
 * Типы контейнеров
 */
export enum ContainerType {
  /** 20-футовый контейнер */
  TEU_20 = '20FT',
  /** 40-футовый контейнер */
  TEU_40 = '40FT',
  /** 40-футовый высокий контейнер */
  TEU_40HC = '40HC',
  /** 45-футовый контейнер */
  TEU_45 = '45FT'
}

/**
 * Статусы рейса
 */
export enum SailingStatus {
  /** Запланирован */
  SCHEDULED = 'SCHEDULED',
  /** В пути */
  IN_TRANSIT = 'IN_TRANSIT',
  /** Завершен */
  COMPLETED = 'COMPLETED',
  /** Отменен */
  CANCELLED = 'CANCELLED',
  /** Задержан */
  DELAYED = 'DELAYED'
}

/**
 * Судно
 */
export interface Vessel {
  /** IMO номер судна */
  imoNumber: string;
  /** Название судна */
  name: string;
  /** Код судна у перевозчика */
  carrierCode: string;
  /** Вместимость (TEU) */
  capacity: number;
  /** Год постройки */
  builtYear: number;
  /** Флаг */
  flag: string;
}

/**
 * Маршрут
 */
export interface Route {
  /** Уникальный идентификатор маршрута */
  id: string;
  /** Название маршрута */
  name: string;
  /** Промежуточные порты */
  waypoints: Waypoint[];
  /** Общая продолжительность (дни) */
  duration: number;
  /** Расстояние (морские мили) */
  distance: number;
}

/**
 * Промежуточная точка маршрута
 */
export interface Waypoint {
  /** Порт */
  port: PortRef;
  /** Дата прибытия */
  arrivalDate: Date;
  /** Дата отправления */
  departureDate: Date;
  /** Тип остановки */
  type: WaypointType;
}

/**
 * Типы промежуточных точек
 */
export enum WaypointType {
  /** Погрузка */
  LOADING = 'LOADING',
  /** Выгрузка */
  DISCHARGE = 'DISCHARGE',
  /** Транзит */
  TRANSIT = 'TRANSIT'
}

/**
 * Тариф
 */
export interface Rate {
  /** Тип контейнера */
  containerType: ContainerType;
  /** Базовая ставка (USD) */
  baseRate: number;
  /** Дополнительные сборы */
  surcharges: Surcharge[];
  /** Общая стоимость */
  totalCost: number;
  /** Валюта */
  currency: string;
  /** Действителен до */
  validUntil: Date;
}

/**
 * Дополнительный сбор
 */
export interface Surcharge {
  /** Название сбора */
  name: string;
  /** Сумма */
  amount: number;
  /** Валюта */
  currency: string;
  /** Описание */
  description?: string;
}

/**
 * Поисковый запрос для расписаний
 */
export interface SailingSearchQuery {
  /** Порт отправления */
  originPortId: string;
  /** Порт назначения */
  destinationPortId: string;
  /** Дата отправления от */
  departureDateFrom?: Date;
  /** Дата отправления до */
  departureDateTo?: Date;
  /** Код перевозчика */
  carrierCode?: string;
  /** Тип контейнера */
  containerType?: ContainerType;
  /** Максимальное количество результатов */
  limit?: number;
  /** Смещение для пагинации */
  offset?: number;
}

/**
 * Результат поиска расписаний
 */
export interface SailingSearchResult {
  /** Найденные рейсы */
  sailings: Sailing[];
  /** Общее количество результатов */
  total: number;
  /** Смещение */
  offset: number;
  /** Лимит */
  limit: number;
  /** Есть ли следующая страница */
  hasNext: boolean;
}
