import type { PortRef } from './port';
import type { ContainerType } from './sailing';

/**
 * Deadline - Дедлайн
 * Основной доменный тип для дедлайнов грузовых операций
 */
export interface Deadline {
  /** Уникальный идентификатор дедлайна */
  id: string;
  /** Тип дедлайна */
  type: DeadlineType;
  /** Название дедлайна */
  name: string;
  /** Описание */
  description?: string;
  /** Дата и время дедлайна */
  deadlineDate: Date;
  /** Временная зона */
  timezone: string;
  /** Порт */
  port: PortRef;
  /** Рейс */
  sailingId: string;
  /** Тип контейнера */
  containerType: ContainerType;
  /** Обязательный ли дедлайн */
  isMandatory: boolean;
  /** Штраф за нарушение */
  penalty?: Penalty;
  /** Статус дедлайна */
  status: DeadlineStatus;
  /** Дата создания записи */
  createdAt: Date;
  /** Дата последнего обновления */
  updatedAt: Date;
}

/**
 * Типы дедлайнов
 */
export enum DeadlineType {
  /** Дедлайн подачи документов */
  DOCUMENTATION = 'DOCUMENTATION',
  /** Дедлайн подачи контейнера */
  CONTAINER_DELIVERY = 'CONTAINER_DELIVERY',
  /** Дедлайн погрузки */
  LOADING = 'LOADING',
  /** Дедлайн выгрузки */
  DISCHARGE = 'DISCHARGE',
  /** Дедлайн таможенного оформления */
  CUSTOMS_CLEARANCE = 'CUSTOMS_CLEARANCE',
  /** Дедлайн оплаты */
  PAYMENT = 'PAYMENT',
  /** Дедлайн страхования */
  INSURANCE = 'INSURANCE'
}

/**
 * Статусы дедлайна
 */
export enum DeadlineStatus {
  /** Активен */
  ACTIVE = 'ACTIVE',
  /** Просрочен */
  OVERDUE = 'OVERDUE',
  /** Выполнен */
  COMPLETED = 'COMPLETED',
  /** Отменен */
  CANCELLED = 'CANCELLED'
}

/**
 * Штраф за нарушение дедлайна
 */
export interface Penalty {
  /** Тип штрафа */
  type: PenaltyType;
  /** Сумма штрафа */
  amount: number;
  /** Валюта */
  currency: string;
  /** Описание */
  description?: string;
}

/**
 * Типы штрафов
 */
export enum PenaltyType {
  /** Фиксированная сумма */
  FIXED = 'FIXED',
  /** Процент от стоимости */
  PERCENTAGE = 'PERCENTAGE',
  /** За каждый день просрочки */
  DAILY = 'DAILY'
}

/**
 * Поисковый запрос для дедлайнов
 */
export interface DeadlineSearchQuery {
  /** ID рейса */
  sailingId?: string;
  /** ID порта */
  portId?: string;
  /** Тип дедлайна */
  type?: DeadlineType;
  /** Дата дедлайна от */
  deadlineDateFrom?: Date;
  /** Дата дедлайна до */
  deadlineDateTo?: Date;
  /** Статус дедлайна */
  status?: DeadlineStatus;
  /** Максимальное количество результатов */
  limit?: number;
  /** Смещение для пагинации */
  offset?: number;
}

/**
 * Результат поиска дедлайнов
 */
export interface DeadlineSearchResult {
  /** Найденные дедлайны */
  deadlines: Deadline[];
  /** Общее количество результатов */
  total: number;
  /** Смещение */
  offset: number;
  /** Лимит */
  limit: number;
  /** Есть ли следующая страница */
  hasNext: boolean;
}
