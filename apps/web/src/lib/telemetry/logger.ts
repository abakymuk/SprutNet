import { 
  TelemetryEvent, 
  TelemetryEventType, 
  TelemetryEventData,
  createTelemetryEvent 
} from './events';

export interface TelemetryLogger {
  log(event: TelemetryEvent): void;
  logEvent(eventType: TelemetryEventType, data?: TelemetryEventData, userId?: string): void;
  getEvents(): TelemetryEvent[];
  clearEvents(): void;
  exportEvents(): string;
}

// In-memory хранилище событий
let events: TelemetryEvent[] = [];

// Максимальное количество событий в памяти
const MAX_EVENTS = 1000;

// Добавление события с ограничением размера
function addEvent(event: TelemetryEvent): void {
  events.push(event);
  
  // Ограничиваем размер массива
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
}

// Логирование в консоль
function logToConsole(event: TelemetryEvent): void {
  const timestamp = new Date(event.timestamp).toISOString();
  const logData = {
    timestamp,
    sessionId: event.sessionId,
    event: event.event,
    data: event.data,
    context: event.context,
  };
  
  console.log(`📊 [TELEMETRY] ${event.event}`, logData);
}

// Логирование в файл (серверная сторона)
function logToFile(event: TelemetryEvent): void {
  if (typeof window !== 'undefined') {
    return; // Только на сервере
  }
  
  const logEntry = JSON.stringify({
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
  }) + '\n';
  
  // В продакшене здесь можно писать в файл или отправлять в систему логирования
  console.log(`📊 [SERVER TELEMETRY] ${event.event}`, event);
}

// Основной класс логгера
class TelemetryLoggerImpl implements TelemetryLogger {
  log(event: TelemetryEvent): void {
    addEvent(event);
    logToConsole(event);
    logToFile(event);
  }
  
  logEvent(eventType: TelemetryEventType, data?: TelemetryEventData, userId?: string): void {
    const event = createTelemetryEvent(eventType, data, userId);
    this.log(event);
  }
  
  getEvents(): TelemetryEvent[] {
    return [...events];
  }
  
  clearEvents(): void {
    events = [];
  }
  
  exportEvents(): string {
    return JSON.stringify(events, null, 2);
  }
}

// Создание экземпляра логгера
export const telemetryLogger = new TelemetryLoggerImpl();

// Удобные функции для логирования
export function logSearchStarted(params: {
  originPort?: string;
  destinationPort?: string;
  departureDateFrom?: string;
  departureDateTo?: string;
}): void {
  telemetryLogger.logEvent('search_started', params);
}

export function logSearchSuccess(count: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('search_success', {
    resultCount: count,
    ...params,
  });
}

export function logSearchError(error: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('search_error', {
    error,
    ...params,
  });
}

export function logDeadlineOpened(sailingId: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('deadline_opened', {
    sailingId,
    ...params,
  });
}

export function logDeadlineError(error: string, sailingId?: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('deadline_error', {
    error,
    sailingId,
    ...params,
  });
}

export function logDeadlineSuccess(sailingId: string, deadlineCount: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('deadline_success', {
    sailingId,
    deadlineCount,
    ...params,
  });
}

export function logCacheHit(endpoint: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('cache_hit', {
    endpoint,
    ...params,
  });
}

export function logCacheMiss(endpoint: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('cache_miss', {
    endpoint,
    ...params,
  });
}

export function logApiRetry(endpoint: string, attempt: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('api_retry', {
    endpoint,
    attempt,
    ...params,
  });
}

export function logApiError(endpoint: string, error: string, status?: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('api_error', {
    endpoint,
    error,
    status,
    ...params,
  });
}

export function logApiSuccess(endpoint: string, latency: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('api_success', {
    endpoint,
    latency,
    ...params,
  });
}

export function logPortSearch(query: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('port_search', {
    query,
    ...params,
  });
}

export function logPortSearchSuccess(query: string, resultCount: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('port_search_success', {
    query,
    resultCount,
    ...params,
  });
}

export function logPortSearchError(query: string, error: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('port_search_error', {
    query,
    error,
    ...params,
  });
}

export function logVesselRequested(imo: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('vessel_requested', {
    imo,
    ...params,
  });
}

export function logVesselSuccess(imo: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('vessel_success', {
    imo,
    ...params,
  });
}

export function logVesselError(imo: string, error: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('vessel_error', {
    imo,
    error,
    ...params,
  });
}

export function logFallbackUsed(reason: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('fallback_used', {
    reason,
    ...params,
  });
}

export function logFallbackSwitch(from: string, to: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('fallback_switch', {
    from,
    to,
    ...params,
  });
}

export function logPageView(page: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('page_view', {
    page,
    ...params,
  });
}

export function logComponentInteraction(component: string, action: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('component_interaction', {
    component,
    action,
    ...params,
  });
}

export function logErrorDisplayed(error: string, component: string, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('error_displayed', {
    error,
    component,
    ...params,
  });
}

export function logPerformanceMark(mark: string, duration: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('performance_mark', {
    mark,
    duration,
    ...params,
  });
}

export function logLoadTime(page: string, loadTime: number, params?: TelemetryEventData): void {
  telemetryLogger.logEvent('load_time', {
    page,
    loadTime,
    ...params,
  });
}
