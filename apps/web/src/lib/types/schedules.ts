import { Sailing, SailingSearchQuery, SailingSearchResult } from '@sprutnet/shared/types';

// Интерфейс для данных расписания от Maersk API
export interface MaerskSchedule {
  id?: string;
  carrierCode?: string;
  carrierName?: string;
  voyageNumber?: string;
  originPort?: {
    code?: string;
    name?: string;
    country?: string;
  };
  destinationPort?: {
    code?: string;
    name?: string;
    country?: string;
  };
  departureDate?: string;
  arrivalDate?: string;
  containerType?: string;
  availableCapacity?: number;
  totalCapacity?: number;
  status?: string;
  vessel?: {
    imoNumber?: string;
    name?: string;
    capacity?: number;
    builtYear?: number;
    flag?: string;
  };
  route?: {
    id?: string;
    name?: string;
    duration?: number;
    distance?: number;
  };
  rates?: Array<{
    containerType?: string;
    baseRate?: number;
    currency?: string;
    validUntil?: string;
  }>;
}

// Интерфейс для параметров поиска расписаний
export interface MaerskScheduleSearchParams {
  origin: string; // Port code (e.g., CNSHA)
  destination: string; // Port code (e.g., USLAX)
  from: string; // ISO date (YYYY-MM-DD)
  to: string; // ISO date (YYYY-MM-DD)
  limit?: number;
  offset?: number;
}

// Интерфейс для ответа Maersk API
export interface MaerskScheduleResponse {
  success: boolean;
  data?: MaerskSchedule[];
  total?: number;
  error?: string;
}

// Функция для расчета времени транзита
export function calculateTransitDays(departureDate: Date, arrivalDate: Date): number {
  if (!departureDate || !arrivalDate) {
    return 0;
  }
  
  // Проверяем, что даты валидны
  if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
    return 0;
  }
  
  const timeDiff = arrivalDate.getTime() - departureDate.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  
  // Округляем вверх до целого числа дней
  return Math.ceil(daysDiff);
}

// Функция для маппинга MaerskSchedule в Sailing
export function mapMaerskScheduleToSailing(
  maerskSchedule: MaerskSchedule,
  originPort: any,
  destinationPort: any
): Sailing {
  const departureDate = maerskSchedule.departureDate ? new Date(maerskSchedule.departureDate) : new Date();
  const arrivalDate = maerskSchedule.arrivalDate ? new Date(maerskSchedule.arrivalDate) : new Date();
  
  return {
    id: maerskSchedule.id || `MAERSK-${Date.now()}`,
    carrierCode: maerskSchedule.carrierCode || 'MAEU',
    carrierName: maerskSchedule.carrierName || 'Maersk Line',
    voyageNumber: maerskSchedule.voyageNumber || 'MAERSK-VOYAGE',
    originPort: originPort,
    destinationPort: destinationPort,
    departureDate: departureDate,
    arrivalDate: arrivalDate,
    containerType: maerskSchedule.containerType as any || '40FT',
    availableCapacity: maerskSchedule.availableCapacity || 1000,
    totalCapacity: maerskSchedule.totalCapacity || 2000,
    status: (maerskSchedule.status as any) || 'SCHEDULED',
    vessel: {
      imoNumber: maerskSchedule.vessel?.imoNumber || '9456783',
      name: maerskSchedule.vessel?.name || 'MAERSK VESSEL',
      carrierCode: maerskSchedule.carrierCode || 'MAEU',
      capacity: maerskSchedule.vessel?.capacity || 2000,
      builtYear: maerskSchedule.vessel?.builtYear || 2015,
      flag: maerskSchedule.vessel?.flag || 'Denmark',
    },
    route: {
      id: maerskSchedule.route?.id || 'ROUTE-001',
      name: maerskSchedule.route?.name || 'Maersk Route',
      waypoints: [],
      duration: maerskSchedule.route?.duration || calculateTransitDays(departureDate, arrivalDate),
      distance: maerskSchedule.route?.distance || 5000,
    },
    rates: maerskSchedule.rates?.map(rate => ({
      containerType: rate.containerType as any || '40FT',
      baseRate: rate.baseRate || 2000,
      surcharges: [],
      totalCost: rate.baseRate || 2000,
      currency: rate.currency || 'USD',
      validUntil: rate.validUntil ? new Date(rate.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })) || [],
    deadlines: [],
    transitTime: calculateTransitDays(departureDate, arrivalDate),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Функция для валидации параметров поиска
export function validateScheduleSearchParams(params: MaerskScheduleSearchParams): string[] {
  const errors: string[] = [];
  
  if (!params.origin) {
    errors.push('origin is required');
  }
  
  if (!params.destination) {
    errors.push('destination is required');
  }
  
  if (!params.from) {
    errors.push('from date is required');
  }
  
  if (!params.to) {
    errors.push('to date is required');
  }
  
  // Валидация формата дат
  if (params.from && !/^\d{4}-\d{2}-\d{2}$/.test(params.from)) {
    errors.push('from date must be in YYYY-MM-DD format');
  }
  
  if (params.to && !/^\d{4}-\d{2}-\d{2}$/.test(params.to)) {
    errors.push('to date must be in YYYY-MM-DD format');
  }
  
  // Валидация диапазона дат
  if (params.from && params.to) {
    const fromDate = new Date(params.from);
    const toDate = new Date(params.to);
    
    if (fromDate > toDate) {
      errors.push('from date must be before to date');
    }
    
    // Проверяем, что диапазон не превышает 90 дней
    const daysDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 90) {
      errors.push('date range cannot exceed 90 days');
    }
  }
  
  return errors;
}
