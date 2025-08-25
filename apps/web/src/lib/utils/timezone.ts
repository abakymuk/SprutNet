import { format, formatInTimeZone, toZonedTime, getTimezoneOffset as getTzOffset } from 'date-fns-tz';
import { format as formatDate, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Конвертирует UTC время в локальное время для указанной таймзоны
 * @param utcDate - UTC дата/время
 * @param timezone - таймзона (например, 'Europe/Moscow', 'Asia/Shanghai')
 * @returns локальная дата/время
 */
export function convertUTCToLocal(utcDate: Date, timezone: string): Date {
  try {
    return toZonedTime(utcDate, timezone);
  } catch (error) {
    console.warn(`Failed to convert UTC to local time for timezone ${timezone}:`, error);
    return utcDate; // Fallback to original date
  }
}

/**
 * Форматирует локальное время с учетом таймзоны
 * @param localDate - локальная дата/время
 * @param timezone - таймзона
 * @param formatString - строка форматирования (по умолчанию 'dd.MM.yyyy HH:mm')
 * @returns отформатированная строка времени
 */
export function formatLocalTime(
  localDate: Date,
  timezone: string,
  formatString: string = 'dd.MM.yyyy HH:mm'
): string {
  try {
    return formatInTimeZone(localDate, timezone, formatString, { locale: ru });
  } catch (error) {
    console.warn(`Failed to format local time for timezone ${timezone}:`, error);
    return formatDate(localDate, formatString, { locale: ru }); // Fallback
  }
}

/**
 * Получает смещение таймзоны в минутах от UTC
 * @param timezone - таймзона
 * @param date - дата для расчета (по умолчанию текущая)
 * @returns смещение в минутах
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    return getTzOffset(timezone, date);
  } catch (error) {
    console.warn(`Failed to get timezone offset for ${timezone}:`, error);
    return 0; // Fallback to UTC
  }
}

/**
 * Получает смещение таймзоны в минутах от UTC
 * @param timezone - таймзона
 * @param date - дата для расчета (по умолчанию текущая)
 * @returns смещение в минутах
 */
export function getTimezoneOffsetMinutes(timezone: string, date: Date = new Date()): number {
  try {
    const offsetMs = getTzOffset(timezone, date);
    return Math.round(offsetMs / (1000 * 60)); // Конвертируем миллисекунды в минуты
  } catch (error) {
    console.warn(`Failed to get timezone offset for ${timezone}:`, error);
    return 0; // Fallback to UTC
  }
}

/**
 * Проверяет, действует ли DST (летнее время) в указанной таймзоне
 * @param timezone - таймзона
 * @param date - дата для проверки (по умолчанию текущая)
 * @returns true если действует DST
 */
export function isDST(timezone: string, date: Date = new Date()): boolean {
  try {
    const january = new Date(date.getFullYear(), 0, 1);
    const july = new Date(date.getFullYear(), 6, 1);
    
    const januaryOffset = getTimezoneOffset(timezone, january);
    const julyOffset = getTimezoneOffset(timezone, july);
    const currentOffset = getTimezoneOffset(timezone, date);
    
    // Если текущее смещение больше зимнего, значит действует DST
    // getTimezoneOffset возвращает положительные значения для UTC+
    return currentOffset > Math.min(januaryOffset, julyOffset);
  } catch (error) {
    console.warn(`Failed to check DST for ${timezone}:`, error);
    return false;
  }
}

/**
 * Обрабатывает переходы DST (летнее/зимнее время)
 * @param date - дата для обработки
 * @param timezone - таймзона
 * @returns обработанная дата с учетом DST
 */
export function handleDSTTransitions(date: Date, timezone: string): Date {
  try {
    // Проверяем, не попадает ли дата в период перехода DST
    const localDate = toZonedTime(date, timezone);
    
    // Если разница между UTC и локальным временем нестандартная,
    // это может быть период перехода DST
    const offset = getTimezoneOffset(timezone, date);
    const standardOffset = getTimezoneOffset(timezone, new Date(date.getFullYear(), 0, 1));
    
    if (Math.abs(offset - standardOffset) > 30) {
      console.log(`DST transition detected for ${timezone} at ${date.toISOString()}`);
    }
    
    return localDate;
  } catch (error) {
    console.warn(`Failed to handle DST transitions for ${timezone}:`, error);
    return date;
  }
}

/**
 * Получает краткое название таймзоны
 * @param timezone - полное название таймзоны
 * @returns краткое название (например, 'MSK', 'CST')
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const abbreviations: Record<string, string> = {
    'Europe/Moscow': 'MSK',
    'Europe/London': 'GMT',
    'Europe/Berlin': 'CET',
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'Asia/Shanghai': 'CST',
    'Asia/Tokyo': 'JST',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Australia/Sydney': 'AEST',
    'Pacific/Auckland': 'NZST',
  };
  
  return abbreviations[timezone] || timezone.split('/').pop()?.toUpperCase() || timezone;
}

/**
 * Форматирует время для отображения в UI (Local + UTC)
 * @param utcDate - UTC дата/время
 * @param timezone - таймзона
 * @param showUTC - показывать ли UTC время (по умолчанию true)
 * @returns объект с отформатированным временем
 */
export function formatTimeForDisplay(
  utcDate: Date,
  timezone: string,
  showUTC: boolean = true
): {
  localTime: string;
  utcTime?: string;
  timezoneAbbr: string;
  isDST: boolean;
} {
  try {
    const localDate = convertUTCToLocal(utcDate, timezone);
    const localTime = formatLocalTime(localDate, timezone);
    const timezoneAbbr = getTimezoneAbbreviation(timezone);
    const dst = isDST(timezone, utcDate);
    
    const result: {
      localTime: string;
      utcTime?: string;
      timezoneAbbr: string;
      isDST: boolean;
    } = {
      localTime,
      timezoneAbbr,
      isDST: dst,
    };
    
    if (showUTC) {
      result.utcTime = formatDate(utcDate, 'dd.MM.yyyy HH:mm', { locale: ru }) + ' UTC';
    }
    
    return result;
  } catch (error) {
    console.warn(`Failed to format time for display:`, error);
    return {
      localTime: formatDate(utcDate, 'dd.MM.yyyy HH:mm', { locale: ru }),
      utcTime: showUTC ? formatDate(utcDate, 'dd.MM.yyyy HH:mm', { locale: ru }) + ' UTC' : undefined,
      timezoneAbbr: 'UTC',
      isDST: false,
    };
  }
}

/**
 * Валидирует таймзону
 * @param timezone - таймзона для проверки
 * @returns true если таймзона валидна
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Пытаемся получить смещение таймзоны
    getTzOffset(timezone, new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Получает список популярных таймзон
 * @returns массив популярных таймзон
 */
export function getPopularTimezones(): Array<{ value: string; label: string; abbr: string }> {
  return [
    { value: 'Europe/Moscow', label: 'Москва (MSK)', abbr: 'MSK' },
    { value: 'Europe/London', label: 'Лондон (GMT)', abbr: 'GMT' },
    { value: 'Europe/Berlin', label: 'Берлин (CET)', abbr: 'CET' },
    { value: 'America/New_York', label: 'Нью-Йорк (EST)', abbr: 'EST' },
    { value: 'America/Los_Angeles', label: 'Лос-Анджелес (PST)', abbr: 'PST' },
    { value: 'Asia/Shanghai', label: 'Шанхай (CST)', abbr: 'CST' },
    { value: 'Asia/Tokyo', label: 'Токио (JST)', abbr: 'JST' },
    { value: 'Asia/Dubai', label: 'Дубай (GST)', abbr: 'GST' },
    { value: 'Asia/Singapore', label: 'Сингапур (SGT)', abbr: 'SGT' },
    { value: 'Australia/Sydney', label: 'Сидней (AEST)', abbr: 'AEST' },
  ];
}
