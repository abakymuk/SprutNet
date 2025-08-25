import { Maersk } from '@/lib/maersk';

export interface MaerskHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  error?: string;
  endpoint: string;
  statusCode?: number;
}

export interface MaerskHealthMetrics {
  uptime: number; // Процент времени доступности за последние 24 часа
  averageResponseTime: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  lastError?: string;
  lastErrorTime?: Date;
}

class MaerskHealthMonitor {
  private healthHistory: MaerskHealthStatus[] = [];
  private readonly maxHistorySize = 1000; // Храним последние 1000 проверок
  private readonly checkInterval = 5 * 60 * 1000; // Проверяем каждые 5 минут
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Запуск мониторинга
   */
  async startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔍 Запуск мониторинга Maersk API...');
    
    // Первая проверка
    await this.performHealthCheck();
    
    // Устанавливаем интервал
    this.intervalId = setInterval(async () => {
      await this.performHealthCheck();
    }, this.checkInterval);
  }

  /**
   * Остановка мониторинга
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('🛑 Мониторинг Maersk API остановлен');
  }

  /**
   * Выполнение проверки здоровья API
   */
  private async performHealthCheck(): Promise<MaerskHealthStatus> {
    const startTime = Date.now();
    const endpoint = '/reference-data/locations?limit=1'; // Легкий запрос для проверки

    try {
      console.log('🔍 Проверка здоровья Maersk API...');
      
      const response = await Maersk.fetch(endpoint, {
        cache: false, // Не используем кэш для проверки здоровья
        timeout: 10000,
        endpointType: 'ports', // Используем ports как базовый тип
      });

      const responseTime = Date.now() - startTime;
      const status: MaerskHealthStatus = {
        isHealthy: response.status === 200,
        lastCheck: new Date(),
        responseTime,
        endpoint,
        statusCode: response.status,
      };

      if (!status.isHealthy) {
        status.error = `HTTP ${response.status}`;
      }

      this.addHealthRecord(status);
      
      const statusIcon = status.isHealthy ? '✅' : '❌';
      console.log(`${statusIcon} Maersk API: ${status.isHealthy ? 'Здоров' : 'Проблемы'} (${responseTime}ms)`);
      
      return status;

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const status: MaerskHealthStatus = {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime,
        endpoint,
        error: error.message || 'Unknown error',
      };

      this.addHealthRecord(status);
      
      console.log(`❌ Maersk API: Ошибка - ${status.error} (${responseTime}ms)`);
      
      return status;
    }
  }

  /**
   * Добавление записи в историю
   */
  private addHealthRecord(status: MaerskHealthStatus) {
    this.healthHistory.push(status);
    
    // Ограничиваем размер истории
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Получение текущего статуса здоровья
   */
  getCurrentStatus(): MaerskHealthStatus | null {
    return this.healthHistory.length > 0 
      ? this.healthHistory[this.healthHistory.length - 1] 
      : null;
  }

  /**
   * Получение метрик за последние 24 часа
   */
  getMetrics(): MaerskHealthMetrics {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentChecks = this.healthHistory.filter(
      check => check.lastCheck >= twentyFourHoursAgo
    );

    const totalChecks = recentChecks.length;
    const successfulChecks = recentChecks.filter(check => check.isHealthy).length;
    const failedChecks = totalChecks - successfulChecks;
    
    const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;
    const averageResponseTime = recentChecks.length > 0
      ? recentChecks.reduce((sum, check) => sum + check.responseTime, 0) / recentChecks.length
      : 0;

    const lastFailedCheck = recentChecks
      .filter(check => !check.isHealthy)
      .sort((a, b) => b.lastCheck.getTime() - a.lastCheck.getTime())[0];

    return {
      uptime: Math.round(uptime * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      totalChecks,
      successfulChecks,
      failedChecks,
      lastError: lastFailedCheck?.error,
      lastErrorTime: lastFailedCheck?.lastCheck,
    };
  }

  /**
   * Получение истории проверок
   */
  getHistory(limit: number = 50): MaerskHealthStatus[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Принудительная проверка здоровья
   */
  async forceHealthCheck(): Promise<MaerskHealthStatus> {
    return await this.performHealthCheck();
  }

  /**
   * Проверка, работает ли мониторинг
   */
  isMonitoring(): boolean {
    return this.isRunning;
  }
}

// Создаем глобальный экземпляр мониторинга
export const maerskHealthMonitor = new MaerskHealthMonitor();

// Graceful shutdown
process.on('SIGINT', () => {
  maerskHealthMonitor.stopMonitoring();
});

process.on('SIGTERM', () => {
  maerskHealthMonitor.stopMonitoring();
});
