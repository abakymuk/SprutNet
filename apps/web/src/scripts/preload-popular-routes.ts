#!/usr/bin/env tsx

/**
 * Скрипт для предзагрузки популярных маршрутов
 * Запускается периодически для обеспечения быстрого доступа к популярным маршрутам
 */

import { routeCacheService } from '@/lib/services/route-cache-service';
import { logger } from '@/lib/logging/advanced-logger';
import { Maersk } from '@/lib/maersk';
import { 
  validateScheduleSearchParams,
  mapMaerskScheduleToSailing,
  type MaerskScheduleSearchParams 
} from '@/lib/types/schedules';

interface PreloadResult {
  route: string;
  success: boolean;
  error?: string;
  responseTime?: number;
  schedulesCount?: number;
  source?: 'maersk' | 'mock' | 'fallback';
}

class PopularRoutesPreloader {
  private logger = logger;
  private results: PreloadResult[] = [];

  /**
   * Основной метод предзагрузки
   */
  async preloadPopularRoutes(): Promise<void> {
    const startTime = Date.now();
    
          this.logger.info('Starting popular routes preload', {
        endpoint: '/scripts/preload-popular-routes',
        method: 'SCRIPT'
      });

    try {
      // Получаем популярные маршруты
      const popularRoutes = await routeCacheService.getPopularRoutes(20);
      
      this.logger.info(`Found ${popularRoutes.length} popular routes to preload`, {
        endpoint: '/scripts/preload-popular-routes',
        method: 'SCRIPT'
      });

      // Генерируем даты для следующего месяца
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setMonth(toDate.getMonth() + 1);

      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];

      // Предзагружаем каждый маршрут
      const preloadPromises = popularRoutes.map(route => 
        this.preloadRoute(route, fromDateStr, toDateStr)
      );

      const results = await Promise.allSettled(preloadPromises);
      
      // Обрабатываем результаты
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.results.push(result.value);
        } else {
          this.results.push({
            route: `${popularRoutes[index].origin_port_id}-${popularRoutes[index].destination_port_id}`,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Выводим статистику
      this.printStatistics(startTime);

    } catch (error) {
      this.logger.error('Error in popular routes preload', error as Error, {
        endpoint: '/scripts/preload-popular-routes',
        method: 'SCRIPT'
      });
    }
  }

  /**
   * Предзагрузка конкретного маршрута
   */
  private async preloadRoute(
    route: any, 
    fromDate: string, 
    toDate: string
  ): Promise<PreloadResult> {
    const routeKey = `${route.origin_port_id}-${route.destination_port_id}`;
    const startTime = Date.now();

    try {
      // Проверяем, есть ли уже кэш для этого маршрута
      const existingCache = await routeCacheService.getCachedRoute(
        route.origin_port_id,
        route.destination_port_id,
        fromDate,
        toDate
      );

      if (existingCache) {
        this.logger.debug('Route already cached, skipping', {
          route: routeKey,
          script: 'preload-popular-routes'
        });

        return {
          route: routeKey,
          success: true,
          responseTime: Date.now() - startTime,
          schedulesCount: existingCache.cached_data.sailings?.length || 0,
          source: existingCache.data_source
        };
      }

      // Загружаем данные от Maersk API
      const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
      
      if (useMaerskAPI) {
        return await this.preloadFromMaersk(route, fromDate, toDate, startTime);
      } else {
        return await this.preloadMockData(route, fromDate, toDate, startTime);
      }

    } catch (error) {
      this.logger.error('Error preloading route', error as Error, {
        endpoint: '/scripts/preload-popular-routes',
        method: 'SCRIPT'
      });

      return {
        route: routeKey,
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Предзагрузка данных от Maersk API
   */
  private async preloadFromMaersk(
    route: any,
    fromDate: string,
    toDate: string,
    startTime: number
  ): Promise<PreloadResult> {
    const routeKey = `${route.origin_port_id}-${route.destination_port_id}`;

    try {
      // Подготавливаем параметры для Maersk API
      const maerskParams: MaerskScheduleSearchParams = {
        origin: route.origin_port_id,
        destination: route.destination_port_id,
        from: fromDate,
        to: toDate,
        limit: 50, // Загружаем больше данных для предзагрузки
      };

      // Валидируем параметры
      const validationErrors = validateScheduleSearchParams(maerskParams);
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Выполняем запрос к Maersk API
      const queryParams = new URLSearchParams({
        origin: maerskParams.origin,
        destination: maerskParams.destination,
        from: maerskParams.from,
        to: maerskParams.to,
        limit: maerskParams.limit?.toString() || '50',
      });

      const maerskResponse = await Maersk.fetch(`/products/ocean-products?${queryParams}`, {
        method: 'GET',
        cache: false, // Не используем кэш для предзагрузки
        timeout: 15000,
        endpointType: 'schedules',
        params: maerskParams,
      });

      if (!maerskResponse.data || !Array.isArray(maerskResponse.data)) {
        throw new Error('Invalid Maersk API response format');
      }

      const maerskSchedules: any[] = maerskResponse.data;
      
      // Маппим данные в наш формат
      const sailings = maerskSchedules.map((schedule: any) => {
        const originPort = {
          id: schedule.originPort?.code || route.origin_port_id,
          name: schedule.originPort?.name || route.origin_port_name || 'Unknown Port',
          countryCode: 'UN',
          countryName: schedule.originPort?.country || 'Unknown',
          cityName: schedule.originPort?.name || 'Unknown',
          type: 'SEAPORT' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const destinationPort = {
          id: schedule.destinationPort?.code || route.destination_port_id,
          name: schedule.destinationPort?.name || route.destination_port_name || 'Unknown Port',
          countryCode: 'UN',
          countryName: schedule.destinationPort?.country || 'Unknown',
          cityName: schedule.destinationPort?.name || 'Unknown',
          type: 'SEAPORT' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return mapMaerskScheduleToSailing(schedule, originPort, destinationPort);
      });

      const response = {
        sailings,
        total: sailings.length,
        offset: 0,
        limit: sailings.length,
        hasNext: false
      };

      // Кэшируем данные
      const responseTime = Date.now() - startTime;
      await routeCacheService.cacheRoute(
        route.origin_port_id,
        route.destination_port_id,
        fromDate,
        toDate,
        response,
        responseTime,
        'maersk'
      );

      this.logger.info('Route preloaded from Maersk API', {
        route: routeKey,
        schedulesCount: sailings.length,
        responseTime,
        script: 'preload-popular-routes'
      });

      return {
        route: routeKey,
        success: true,
        responseTime,
        schedulesCount: sailings.length,
        source: 'maersk'
      };

    } catch (error) {
      this.logger.warn('Failed to preload from Maersk API, using fallback', {
        route: routeKey,
        error: (error as Error).message,
        script: 'preload-popular-routes'
      });

      // Fallback на мок-данные
      return await this.preloadMockData(route, fromDate, toDate, startTime);
    }
  }

  /**
   * Предзагрузка мок-данных
   */
  private async preloadMockData(
    route: any,
    fromDate: string,
    toDate: string,
    startTime: number
  ): Promise<PreloadResult> {
    const routeKey = `${route.origin_port_id}-${route.destination_port_id}`;

    try {
      // Импортируем мок-данные
      const { searchSailings } = await import('@sprutnet/shared/mocks');

      const results = searchSailings(
        route.origin_port_id,
        route.destination_port_id,
        new Date(fromDate),
        new Date(toDate),
        undefined,
        undefined,
        50
      );

      const response = {
        sailings: results,
        total: results.length,
        offset: 0,
        limit: results.length,
        hasNext: false
      };

      // Кэшируем данные
      const responseTime = Date.now() - startTime;
      await routeCacheService.cacheRoute(
        route.origin_port_id,
        route.destination_port_id,
        fromDate,
        toDate,
        response,
        responseTime,
        'mock'
      );

      this.logger.info('Route preloaded with mock data', {
        route: routeKey,
        schedulesCount: results.length,
        responseTime,
        script: 'preload-popular-routes'
      });

      return {
        route: routeKey,
        success: true,
        responseTime,
        schedulesCount: results.length,
        source: 'mock'
      };

    } catch (error) {
      this.logger.error('Error preloading mock data', error as Error, {
        endpoint: '/scripts/preload-popular-routes',
        method: 'SCRIPT'
      });

      return {
        route: routeKey,
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Вывод статистики предзагрузки
   */
  private printStatistics(startTime: number): void {
    const totalTime = Date.now() - startTime;
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalSchedules = this.results
      .filter(r => r.success && r.schedulesCount)
      .reduce((sum, r) => sum + (r.schedulesCount || 0), 0);

    const avgResponseTime = this.results
      .filter(r => r.success && r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      this.results.filter(r => r.success && r.responseTime).length;

    const sources = this.results
      .filter(r => r.success && r.source)
      .reduce((acc, r) => {
        acc[r.source!] = (acc[r.source!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    this.logger.info('Popular routes preload completed', {
      totalRoutes: this.results.length,
      successful,
      failed,
      totalSchedules,
      avgResponseTime: Math.round(avgResponseTime),
      totalTime,
      sources,
      script: 'preload-popular-routes'
    });

    // Выводим детальную статистику
    console.log('\n📊 Popular Routes Preload Statistics:');
    console.log(`⏱️  Total time: ${totalTime}ms`);
    console.log(`✅ Successful: ${successful}/${this.results.length}`);
    console.log(`❌ Failed: ${failed}/${this.results.length}`);
    console.log(`🚢 Total schedules: ${totalSchedules}`);
    console.log(`📈 Average response time: ${Math.round(avgResponseTime)}ms`);
    
    if (Object.keys(sources).length > 0) {
      console.log('📊 Data sources:');
      Object.entries(sources).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} routes`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ Failed routes:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   ${r.route}: ${r.error}`);
        });
    }
  }
}

// Запуск скрипта
async function main() {
  const preloader = new PopularRoutesPreloader();
  await preloader.preloadPopularRoutes();
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error running preload script:', error);
    process.exit(1);
  });
}

export { PopularRoutesPreloader };
