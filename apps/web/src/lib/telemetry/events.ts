export interface TelemetryEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data?: Record<string, any>;
  context?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
  };
}

export interface TelemetryEventData {
  [key: string]: any;
}

// Типы событий
export const TELEMETRY_EVENTS = {
  // Поиск рейсов
  SEARCH_STARTED: 'search_started',
  SEARCH_SUCCESS: 'search_success',
  SEARCH_ERROR: 'search_error',
  
  // Дедлайны
  DEADLINE_OPENED: 'deadline_opened',
  DEADLINE_ERROR: 'deadline_error',
  DEADLINE_SUCCESS: 'deadline_success',
  
  // Кэш
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  
  // API
  API_RETRY: 'api_retry',
  API_ERROR: 'api_error',
  API_SUCCESS: 'api_success',
  
  // Порты
  PORT_SEARCH: 'port_search',
  PORT_SEARCH_SUCCESS: 'port_search_success',
  PORT_SEARCH_ERROR: 'port_search_error',
  
  // Судна
  VESSEL_REQUESTED: 'vessel_requested',
  VESSEL_SUCCESS: 'vessel_success',
  VESSEL_ERROR: 'vessel_error',
  
  // Fallback
  FALLBACK_USED: 'fallback_used',
  FALLBACK_SWITCH: 'fallback_switch',
  
  // UI события
  PAGE_VIEW: 'page_view',
  COMPONENT_INTERACTION: 'component_interaction',
  ERROR_DISPLAYED: 'error_displayed',
  
  // Производительность
  PERFORMANCE_MARK: 'performance_mark',
  LOAD_TIME: 'load_time',
} as const;

export type TelemetryEventType = typeof TELEMETRY_EVENTS[keyof typeof TELEMETRY_EVENTS];

// Генерация уникального ID сессии
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Получение контекста пользователя
export function getContext(): TelemetryEvent['context'] {
  if (typeof window === 'undefined') {
    return {};
  }
  
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer,
  };
}

// Создание события телеметрии
export function createTelemetryEvent(
  event: TelemetryEventType,
  data?: TelemetryEventData,
  userId?: string
): TelemetryEvent {
  return {
    event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId,
    data,
    context: getContext(),
  };
}

// Хранение sessionId
let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    // Пытаемся получить из localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('telemetry_session_id');
      if (stored) {
        sessionId = stored;
      } else {
        sessionId = generateSessionId();
        localStorage.setItem('telemetry_session_id', sessionId);
      }
    } else {
      sessionId = generateSessionId();
    }
  }
  return sessionId;
}

// Сброс sessionId (для тестов)
export function resetSessionId(): void {
  sessionId = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('telemetry_session_id');
  }
}
