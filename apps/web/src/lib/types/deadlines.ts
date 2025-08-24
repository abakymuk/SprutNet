import { DeadlineType, DeadlineStatus } from '@sprutnet/shared/types';
import type { Deadline } from '@sprutnet/shared/types';

/**
 * Maersk Deadlines API типы
 */

export interface MaerskDeadlineSearchParams {
  /** Двухбуквенный код страны (ISO 3166-1) */
  ISOCountryCode: string;
  /** Название порта погрузки */
  portOfLoad: string;
  /** IMO номер судна (7 цифр) */
  vesselIMONumber: string;
  /** Номер рейса (4 символа) */
  voyage: string;
  /** Лимит результатов */
  limit?: number;
}

export interface MaerskDeadlineResponse {
  /** Дедлайны для терминала */
  shipmentDeadlines: {
    /** Название терминала */
    terminalName: string;
    /** Список дедлайнов */
    deadlines: MaerskDeadline[];
  };
}

export interface MaerskDeadline {
  /** Название дедлайна */
  deadlineName: string;
  /** Дата и время дедлайна в локальном времени */
  deadlineLocal: string;
}

/**
 * Нормализация типов дедлайнов Maersk в наши типы
 */
export function normalizeDeadlineType(deadlineName: string): DeadlineType {
  const name = deadlineName.toLowerCase();
  
  if (name.includes('doc') || name.includes('document')) {
    return DeadlineType.DOCUMENTATION;
  }
  if (name.includes('cy') || name.includes('yard') || name.includes('container')) {
    return DeadlineType.CONTAINER_DELIVERY;
  }
  if (name.includes('vgm') || name.includes('weight')) {
    return DeadlineType.INSURANCE; // VGM обычно относится к страхованию
  }
  if (name.includes('customs') || name.includes('таможня') || name.includes('таможенное')) {
    return DeadlineType.CUSTOMS_CLEARANCE;
  }
  if (name.includes('loading') || name.includes('погрузка')) {
    return DeadlineType.LOADING;
  }
  if (name.includes('discharge') || name.includes('выгрузка')) {
    return DeadlineType.DISCHARGE;
  }
  if (name.includes('payment') || name.includes('оплата')) {
    return DeadlineType.PAYMENT;
  }
  
  return DeadlineType.DOCUMENTATION; // По умолчанию
}

/**
 * Конвертация времени UTC ↔ Local
 */
export function convertUTCToLocal(utcDate: string, timezone: string = 'UTC'): Date {
  try {
    const date = new Date(utcDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Если timezone не UTC, конвертируем
    if (timezone !== 'UTC') {
      // Простая конвертация для основных таймзон
      const utcTime = date.getTime();
      const localOffset = getTimezoneOffset(timezone);
      return new Date(utcTime + localOffset);
    }
    
    return date;
  } catch (error) {
    console.error('Error converting UTC to Local:', error);
    return new Date(utcDate); // Fallback
  }
}

/**
 * Получение смещения таймзоны в миллисекундах
 */
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'UTC': 0,
    'GMT': 0,
    'EST': -5 * 60 * 60 * 1000, // UTC-5
    'CST': -6 * 60 * 60 * 1000, // UTC-6
    'MST': -7 * 60 * 60 * 1000, // UTC-7
    'PST': -8 * 60 * 60 * 1000, // UTC-8
    'CET': 1 * 60 * 60 * 1000,  // UTC+1
    'EET': 2 * 60 * 60 * 1000,  // UTC+2
    'MSK': 3 * 60 * 60 * 1000,  // UTC+3
    'CST_CHINA': 8 * 60 * 60 * 1000,  // UTC+8 (China)
    'JST': 9 * 60 * 60 * 1000,  // UTC+9
    'AEST': 10 * 60 * 60 * 1000, // UTC+10
  };
  
  return offsets[timezone.toUpperCase()] || 0;
}

/**
 * Определение статуса дедлайна
 */
export function determineDeadlineStatus(deadlineDate: Date): DeadlineStatus {
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 0) {
    return DeadlineStatus.OVERDUE;
  }
  if (diffHours < 24) {
    return DeadlineStatus.ACTIVE;
  }
  return DeadlineStatus.ACTIVE;
}

/**
 * Маппинг Maersk дедлайна в наш тип Deadline
 */
export function mapMaerskDeadlineToDeadline(
  maerskDeadline: MaerskDeadline,
  terminalName: string,
  sailingId: string,
  portId: string,
  timezone: string = 'UTC'
): Deadline {
  const deadlineDate = convertUTCToLocal(maerskDeadline.deadlineLocal, timezone);
  const deadlineType = normalizeDeadlineType(maerskDeadline.deadlineName);
  const status = determineDeadlineStatus(deadlineDate);
  
  return {
    id: `deadline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: deadlineType,
    name: maerskDeadline.deadlineName,
    description: getDeadlineDescription(maerskDeadline.deadlineName),
    deadlineDate,
    timezone,
    port: {
      id: portId,
      name: terminalName,
      countryCode: 'UN',
      countryName: 'Unknown',
      cityName: 'Unknown',
      type: 'CONTAINER_TERMINAL' as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    sailingId,
    containerType: '20FT' as any,
    isMandatory: true,
    status,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Получение описания дедлайна
 */
function getDeadlineDescription(deadlineName: string): string {
  const name = deadlineName.toLowerCase();
  
  if (name.includes('doc')) {
    return 'Подготовка и подача документов';
  }
  if (name.includes('cy') || name.includes('yard')) {
    return 'Доставка контейнера на терминал';
  }
  if (name.includes('vgm')) {
    return 'Подтверждение веса груза';
  }
  if (name.includes('customs')) {
    return 'Таможенное оформление';
  }
  if (name.includes('loading')) {
    return 'Погрузка на судно';
  }
  if (name.includes('discharge')) {
    return 'Выгрузка с судна';
  }
  if (name.includes('payment')) {
    return 'Оплата услуг';
  }
  
  return 'Важный дедлайн для рейса';
}

/**
 * Валидация параметров поиска дедлайнов
 */
export function validateDeadlineSearchParams(params: MaerskDeadlineSearchParams): string[] {
  const errors: string[] = [];
  
  // Проверяем обязательные поля
  if (!params.ISOCountryCode) {
    errors.push('ISOCountryCode is required');
  } else if (!/^[A-Z]{2}$/.test(params.ISOCountryCode)) {
    errors.push('ISOCountryCode must be a 2-letter country code');
  }
  
  if (!params.portOfLoad) {
    errors.push('portOfLoad is required');
  } else if (params.portOfLoad.length < 3 || params.portOfLoad.length > 50) {
    errors.push('portOfLoad must be between 3 and 50 characters');
  }
  
  if (!params.vesselIMONumber) {
    errors.push('vesselIMONumber is required');
  } else if (!/^\d{7}$/.test(params.vesselIMONumber)) {
    errors.push('vesselIMONumber must be a 7-digit number');
  }
  
  if (!params.voyage) {
    errors.push('voyage is required');
  } else if (!/^[A-Z0-9]{4}$/.test(params.voyage)) {
    errors.push('voyage must be a 4-character alphanumeric string');
  }
  
  // Проверяем опциональные поля
  if (params.limit !== undefined && (params.limit < 1 || params.limit > 100)) {
    errors.push('limit must be between 1 and 100');
  }
  
  return errors;
}
