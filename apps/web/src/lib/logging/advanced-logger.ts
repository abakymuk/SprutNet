export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: any;
  error?: Error;
  duration?: number;
  tags?: string[];
}

export class AdvancedLogger {
  private static instance: AdvancedLogger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 10000;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  static getInstance(): AdvancedLogger {
    if (!AdvancedLogger.instance) {
      AdvancedLogger.instance = new AdvancedLogger();
    }
    return AdvancedLogger.instance;
  }

  /**
   * Установка уровня логирования
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Создание контекста для лога
   */
  createContext(additionalContext: Partial<LogContext> = {}): LogContext {
    return {
      timestamp: new Date(),
      ...additionalContext,
    };
  }

  /**
   * Логирование отладочной информации
   */
  debug(message: string, data?: any, context?: Partial<LogContext>, tags?: string[]): void {
    this.log(LogLevel.DEBUG, message, data, context, tags);
  }

  /**
   * Логирование информационных сообщений
   */
  info(message: string, data?: any, context?: Partial<LogContext>, tags?: string[]): void {
    this.log(LogLevel.INFO, message, data, context, tags);
  }

  /**
   * Логирование предупреждений
   */
  warn(message: string, data?: any, context?: Partial<LogContext>, tags?: string[]): void {
    this.log(LogLevel.WARN, message, data, context, tags);
  }

  /**
   * Логирование ошибок
   */
  error(message: string, error?: Error, context?: Partial<LogContext>, tags?: string[]): void {
    this.log(LogLevel.ERROR, message, undefined, context, tags, error);
  }

  /**
   * Логирование критических ошибок
   */
  fatal(message: string, error?: Error, context?: Partial<LogContext>, tags?: string[]): void {
    this.log(LogLevel.FATAL, message, undefined, context, tags, error);
  }

  /**
   * Логирование API запросов
   */
  apiRequest(method: string, endpoint: string, params?: any, context?: Partial<LogContext>): void {
    this.info(`API Request: ${method} ${endpoint}`, params, context, ['api', 'request']);
  }

  /**
   * Логирование API ответов
   */
  apiResponse(method: string, endpoint: string, status: number, duration: number, context?: Partial<LogContext>): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${endpoint}`, { status, duration }, context, ['api', 'response']);
  }

  /**
   * Логирование кэш операций
   */
  cacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, data?: any, context?: Partial<LogContext>): void {
    this.debug(`Cache ${operation}: ${key}`, data, context, ['cache', operation]);
  }

  /**
   * Логирование производительности
   */
  performance(operation: string, duration: number, data?: any, context?: Partial<LogContext>): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation}`, { duration, ...data }, context, ['performance']);
  }

  /**
   * Логирование бизнес-событий
   */
  businessEvent(event: string, data?: any, context?: Partial<LogContext>): void {
    this.info(`Business Event: ${event}`, data, context, ['business', 'event']);
  }

  /**
   * Основной метод логирования
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: Partial<LogContext>,
    tags?: string[],
    error?: Error
  ): void {
    if (level < this.logLevel) return;

    const logContext = this.createContext(context);
    const entry: LogEntry = {
      level,
      message,
      context: logContext,
      data,
      error,
      tags,
    };

    this.addLogEntry(entry);
    this.outputLog(entry);
  }

  /**
   * Добавление записи в лог
   */
  private addLogEntry(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Ограничиваем размер лога
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Вывод лога в консоль
   */
  private outputLog(entry: LogEntry): void {
    const timestamp = entry.context.timestamp.toISOString();
    const levelStr = LogLevel[entry.level];
    const tagsStr = entry.tags?.length ? ` [${entry.tags.join(', ')}]` : '';
    const contextStr = this.formatContext(entry.context);
    
    let logMessage = `${timestamp} [${levelStr}]${tagsStr} ${entry.message}`;
    
    if (contextStr) {
      logMessage += ` ${contextStr}`;
    }

    // Добавляем данные если есть
    if (entry.data) {
      logMessage += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }

    // Добавляем ошибку если есть
    if (entry.error) {
      logMessage += `\n  Error: ${entry.error.message}`;
      if (this.isDevelopment) {
        logMessage += `\n  Stack: ${entry.error.stack}`;
      }
    }

    // Выводим в консоль с соответствующим уровнем
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logMessage);
        break;
    }
  }

  /**
   * Форматирование контекста
   */
  private formatContext(context: LogContext): string {
    const parts: string[] = [];
    
    if (context.requestId) parts.push(`req=${context.requestId}`);
    if (context.userId) parts.push(`user=${context.userId}`);
    if (context.endpoint) parts.push(`endpoint=${context.endpoint}`);
    if (context.method) parts.push(`method=${context.method}`);
    
    return parts.length ? `(${parts.join(', ')})` : '';
  }

  /**
   * Получение логов по фильтрам
   */
  getLogs(filters?: {
    level?: LogLevel;
    tags?: string[];
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = this.logs;

    if (filters?.level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= filters.level!);
    }

    if (filters?.tags?.length) {
      filteredLogs = filteredLogs.filter(log => 
        log.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters?.startTime) {
      filteredLogs = filteredLogs.filter(log => 
        log.context.timestamp >= filters.startTime!
      );
    }

    if (filters?.endTime) {
      filteredLogs = filteredLogs.filter(log => 
        log.context.timestamp <= filters.endTime!
      );
    }

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(-filters.limit);
    }

    return filteredLogs;
  }

  /**
   * Получение статистики логов
   */
  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byTag: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    const byLevel: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    const recentErrors: LogEntry[] = [];

    for (const log of this.logs) {
      // Подсчет по уровням
      const levelStr = LogLevel[log.level];
      byLevel[levelStr] = (byLevel[levelStr] || 0) + 1;

      // Подсчет по тегам
      if (log.tags) {
        for (const tag of log.tags) {
          byTag[tag] = (byTag[tag] || 0) + 1;
        }
      }

      // Последние ошибки
      if (log.level >= LogLevel.ERROR) {
        recentErrors.push(log);
      }
    }

    return {
      total: this.logs.length,
      byLevel,
      byTag,
      recentErrors: recentErrors.slice(-10), // Последние 10 ошибок
    };
  }

  /**
   * Очистка логов
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Экспорт логов в JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Глобальный экземпляр логгера
export const logger = AdvancedLogger.getInstance();

// Middleware для автоматического логирования запросов
export function createRequestLogger() {
  return function requestLogger(req: any, res: any, next: any) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    const context = logger.createContext({
      requestId,
      method: req.method,
      endpoint: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    });

    // Логируем запрос
    logger.apiRequest(req.method, req.url, req.body, context);

    // Перехватываем ответ
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      logger.apiResponse(req.method, req.url, res.statusCode, duration, context);
      return originalSend.call(this, data);
    };

    next();
  };
}
