import type { Vessel } from '@sprutnet/shared/types';

/**
 * Maersk Vessels API типы
 */

export interface MaerskVesselSearchParams {
  /** IMO номера судов */
  vesselIMONumbers?: number[];
  /** Коды судов перевозчика */
  carrierVesselCodes?: string[];
  /** Названия судов */
  vesselNames?: string[];
  /** Коды флагов судов */
  vesselFlagCodes?: string[];
  /** Лимит результатов */
  limit?: number;
  /** Страница */
  page?: string;
}

export interface MaerskVesselResponse {
  /** Список судов */
  vessels: MaerskVessel[];
}

export interface MaerskVessel {
  /** IMO номер судна */
  vesselIMONumber: number;
  /** Код судна у перевозчика */
  carrierVesselCode: string;
  /** Короткое название судна */
  vesselShortName: string;
  /** Полное название судна */
  vesselLongName: string;
  /** Код флага судна */
  vesselFlagCode?: string;
  /** Год постройки */
  vesselBuiltYear?: number;
  /** Позывной сигнал */
  vesselCallSign?: string;
  /** Вместимость в TEU */
  vesselCapacityTEU?: number;
}

/**
 * Краткая информация о судне для UI
 */
export interface VesselBrief {
  /** IMO номер судна */
  imo: string;
  /** Название судна */
  name: string;
  /** Оператор/перевозчик */
  operator: string;
  /** Размер/вместимость в TEU */
  size: number;
  /** Флаг судна */
  flag?: string;
  /** Год постройки */
  builtYear?: number;
}

/**
 * Маппинг Maersk судна в наш тип Vessel
 */
export function mapMaerskVesselToVessel(maerskVessel: MaerskVessel): Vessel {
  return {
    imoNumber: maerskVessel.vesselIMONumber.toString(),
    name: maerskVessel.vesselLongName || maerskVessel.vesselShortName,
    carrierCode: maerskVessel.carrierVesselCode,
    capacity: maerskVessel.vesselCapacityTEU || 0,
    builtYear: maerskVessel.vesselBuiltYear || 0,
    flag: maerskVessel.vesselFlagCode || 'Unknown'
  };
}

/**
 * Маппинг Maersk судна в VesselBrief для UI
 */
export function mapMaerskVesselToVesselBrief(maerskVessel: MaerskVessel): VesselBrief {
  return {
    imo: maerskVessel.vesselIMONumber.toString(),
    name: maerskVessel.vesselLongName || maerskVessel.vesselShortName,
    operator: maerskVessel.carrierVesselCode,
    size: maerskVessel.vesselCapacityTEU || 0,
    flag: maerskVessel.vesselFlagCode,
    builtYear: maerskVessel.vesselBuiltYear
  };
}

/**
 * Валидация параметров поиска судов
 */
export function validateVesselSearchParams(params: MaerskVesselSearchParams): string[] {
  const errors: string[] = [];
  
  // Проверяем IMO номера
  if (params.vesselIMONumbers) {
    if (!Array.isArray(params.vesselIMONumbers)) {
      errors.push('vesselIMONumbers must be an array');
    } else if (params.vesselIMONumbers.length > 50) {
      errors.push('vesselIMONumbers cannot exceed 50 items');
    } else {
      for (const imo of params.vesselIMONumbers) {
        if (!Number.isInteger(imo) || imo.toString().length !== 7) {
          errors.push('vesselIMONumbers must be 7-digit integers');
          break;
        }
      }
    }
  }
  
  // Проверяем коды перевозчиков
  if (params.carrierVesselCodes) {
    if (!Array.isArray(params.carrierVesselCodes)) {
      errors.push('carrierVesselCodes must be an array');
    } else if (params.carrierVesselCodes.length > 50) {
      errors.push('carrierVesselCodes cannot exceed 50 items');
    } else {
      for (const code of params.carrierVesselCodes) {
        if (typeof code !== 'string' || code.length !== 3) {
          errors.push('carrierVesselCodes must be 3-character strings');
          break;
        }
      }
    }
  }
  
  // Проверяем названия судов
  if (params.vesselNames) {
    if (!Array.isArray(params.vesselNames)) {
      errors.push('vesselNames must be an array');
    } else if (params.vesselNames.length > 50) {
      errors.push('vesselNames cannot exceed 50 items');
    } else {
      for (const name of params.vesselNames) {
        if (typeof name !== 'string' || name.length < 2) {
          errors.push('vesselNames must be strings with at least 2 characters');
          break;
        }
      }
    }
  }
  
  // Проверяем коды флагов
  if (params.vesselFlagCodes) {
    if (!Array.isArray(params.vesselFlagCodes)) {
      errors.push('vesselFlagCodes must be an array');
    } else if (params.vesselFlagCodes.length > 50) {
      errors.push('vesselFlagCodes cannot exceed 50 items');
    } else {
      for (const flag of params.vesselFlagCodes) {
        if (typeof flag !== 'string' || flag.length !== 2) {
          errors.push('vesselFlagCodes must be 2-character strings');
          break;
        }
      }
    }
  }
  
  // Проверяем лимит
  if (params.limit !== undefined && (params.limit < 1 || params.limit > 100)) {
    errors.push('limit must be between 1 and 100');
  }
  
  return errors;
}
