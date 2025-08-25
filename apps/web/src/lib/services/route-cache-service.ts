import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logging/advanced-logger';

export interface RouteCacheEntry {
  id: string;
  route_key: string;
  origin_port_id: string;
  destination_port_id: string;
  departure_date_from: string;
  departure_date_to: string;
  cached_data: any;
  cache_created_at: string;
  cache_expires_at: string;
  last_accessed_at: string;
  access_count: number;
  response_time_ms: number | null;
  data_source: 'maersk' | 'mock' | 'fallback';
  error_count: number;
  last_error: string | null;
}

export interface PopularRoute {
  id: string;
  origin_port_id: string;
  destination_port_id: string;
  origin_port_name: string | null;
  destination_port_name: string | null;
  search_count: number;
  last_searched_at: string;
  priority: number;
  is_active: boolean;
}

export interface RouteUsageStats {
  id: string;
  route_key: string;
  origin_port_id: string;
  destination_port_id: string;
  request_count: number;
  cache_hit_count: number;
  cache_miss_count: number;
  average_response_time_ms: number | null;
  first_requested_at: string;
  last_requested_at: string;
}

export interface RouteCacheStats {
  total_entries: number;
  active_entries: number;
  expired_entries: number;
  total_access_count: number;
  average_access_count: number;
  cache_hit_rate: number;
  data_sources: Record<string, number>;
  oldest_entry: string | null;
  newest_entry: string | null;
}

class RouteCacheService {
  private supabase;
  private readonly cacheTTL = 2 * 60 * 60 * 1000; // 2 часа
  private readonly logger = logger;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase credentials not found, route caching will be disabled');
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Генерация ключа маршрута
   */
  private generateRouteKey(originPortId: string, destinationPortId: string): string {
    return `${originPortId}-${destinationPortId}`.toUpperCase();
  }

  /**
   * Получение данных из кэша
   */
  async getCachedRoute(
    originPortId: string,
    destinationPortId: string,
    departureDateFrom: string,
    departureDateTo: string
  ): Promise<RouteCacheEntry | null> {
    if (!this.supabase) {
      return null; // Кэширование отключено
    }

    const routeKey = this.generateRouteKey(originPortId, destinationPortId);
    
    try {
      const { data, error } = await this.supabase
        .from('route_cache')
        .select('*')
        .eq('route_key', routeKey)
        .eq('departure_date_from', departureDateFrom)
        .eq('departure_date_to', departureDateTo)
        .gt('cache_expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Запись не найдена
          this.logger.debug('Cache miss', { routeKey, departureDateFrom, departureDateTo });
          return null;
        }
        throw error;
      }

      // Обновляем время последнего доступа
      await this.updateCacheAccess(data.id);

      this.logger.info('Cache hit', { 
        routeKey, 
        accessCount: data.access_count,
        dataSource: data.data_source 
      });

      return data;
    } catch (error) {
      this.logger.error('Error getting cached route', error as Error, { endpoint: '/route-cache', method: 'GET' });
      return null;
    }
  }

  /**
   * Сохранение данных в кэш
   */
  async cacheRoute(
    originPortId: string,
    destinationPortId: string,
    departureDateFrom: string,
    departureDateTo: string,
    data: any,
    responseTimeMs: number,
    dataSource: 'maersk' | 'mock' | 'fallback' = 'maersk'
  ): Promise<void> {
    if (!this.supabase) {
      return; // Кэширование отключено
    }

    const routeKey = this.generateRouteKey(originPortId, destinationPortId);
    const expiresAt = new Date(Date.now() + this.cacheTTL);

    try {
      const { error } = await this.supabase
        .from('route_cache')
        .upsert({
          route_key: routeKey,
          origin_port_id: originPortId,
          destination_port_id: destinationPortId,
          departure_date_from: departureDateFrom,
          departure_date_to: departureDateTo,
          cached_data: data,
          cache_expires_at: expiresAt.toISOString(),
          response_time_ms: responseTimeMs,
          data_source: dataSource,
          access_count: 0,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'route_key,departure_date_from,departure_date_to'
        });

      if (error) {
        throw error;
      }

      this.logger.info('Route cached successfully', { 
        routeKey, 
        dataSource, 
        responseTimeMs,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      this.logger.error('Error caching route', error as Error, { endpoint: '/route-cache', method: 'POST' });
    }
  }

  /**
   * Обновление времени доступа к кэшу
   */
  private async updateCacheAccess(cacheId: string): Promise<void> {
    if (!this.supabase) {
      return; // Кэширование отключено
    }

    try {
      const { error } = await this.supabase
        .from('route_cache')
        .update({
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', cacheId);

      if (error) {
        this.logger.error('Error updating cache access time', error);
      }
    } catch (error) {
      this.logger.error('Error updating cache access time', error as Error);
    }
  }

  /**
   * Обновление статистики использования маршрутов
   */
  async updateRouteUsageStats(
    originPortId: string,
    destinationPortId: string,
    departureDateFrom: string,
    departureDateTo: string,
    isCacheHit: boolean,
    responseTimeMs: number
  ): Promise<void> {
    if (!this.supabase) {
      return; // Кэширование отключено
    }

    const routeKey = this.generateRouteKey(originPortId, destinationPortId);

    try {
      const { error } = await this.supabase.rpc('update_route_usage_stats', {
        p_route_key: routeKey,
        p_origin_port_id: originPortId,
        p_destination_port_id: destinationPortId,
        p_departure_date_from: departureDateFrom,
        p_departure_date_to: departureDateTo,
        p_is_cache_hit: isCacheHit,
        p_response_time_ms: responseTimeMs
      });

      if (error) {
        throw error;
      }

      this.logger.debug('Route usage stats updated', { 
        routeKey, 
        isCacheHit, 
        responseTimeMs 
      });
    } catch (error) {
      this.logger.error('Error updating route usage stats', error as Error, { endpoint: '/route-cache', method: 'UPDATE' });
    }
  }

  /**
   * Получение популярных маршрутов
   */
  async getPopularRoutes(limit: number = 20): Promise<PopularRoute[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase!.rpc('get_popular_routes', {
        limit_count: limit
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting popular routes', error as Error);
      return [];
    }
  }

  /**
   * Получение статистики кэша
   */
  async getCacheStats(): Promise<RouteCacheStats | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data, error } = await this.supabase!.rpc('get_route_cache_stats');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Error getting cache stats', error as Error);
      return null;
    }
  }

  /**
   * Очистка устаревших записей кэша
   */
  async cleanupExpiredCache(): Promise<number> {
    if (!this.supabase) {
      return 0;
    }

    try {
      const { data, error } = await this.supabase!.rpc('cleanup_expired_route_cache');

      if (error) {
        throw error;
      }

      this.logger.info('Expired cache entries cleaned up', { deletedCount: data });
      return data || 0;
    } catch (error) {
      this.logger.error('Error cleaning up expired cache', error as Error);
      return 0;
    }
  }

  /**
   * Предзагрузка популярных маршрутов
   */
  async preloadPopularRoutes(): Promise<void> {
    try {
      const popularRoutes = await this.getPopularRoutes(10);
      
      this.logger.info('Starting preload of popular routes', { 
        count: popularRoutes.length 
      });

      for (const route of popularRoutes) {
        try {
          // Генерируем даты для следующего месяца
          const fromDate = new Date();
          const toDate = new Date();
          toDate.setMonth(toDate.getMonth() + 1);

          const fromDateStr = fromDate.toISOString().split('T')[0];
          const toDateStr = toDate.toISOString().split('T')[0];

          // Проверяем, есть ли уже кэш для этого маршрута
          const existingCache = await this.getCachedRoute(
            route.origin_port_id,
            route.destination_port_id,
            fromDateStr,
            toDateStr
          );

          if (!existingCache) {
            this.logger.info('Preloading route', { 
              route: `${route.origin_port_id}-${route.destination_port_id}`,
              priority: route.priority
            });

            // Здесь можно добавить логику для загрузки данных от Maersk API
            // Пока просто логируем
          }
        } catch (error) {
          this.logger.error('Error preloading route', error as Error, { 
            endpoint: '/route-cache', method: 'PRELOAD' 
          });
        }
      }

      this.logger.info('Popular routes preload completed');
    } catch (error) {
      this.logger.error('Error preloading popular routes', error as Error);
    }
  }

  /**
   * Получение мониторинга кэша
   */
  async getCacheMonitoring(): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data, error } = await this.supabase!
        .from('route_cache_monitoring')
        .select('*');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      this.logger.error('Error getting cache monitoring', error as Error);
      return null;
    }
  }

  /**
   * Получение топ маршрутов по использованию
   */
  async getTopRoutes(limit: number = 10): Promise<RouteUsageStats[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase!
        .from('route_usage_stats')
        .select('*')
        .order('request_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting top routes', error as Error);
      return [];
    }
  }

  /**
   * Удаление конкретной записи кэша
   */
  async deleteCacheEntry(cacheId: string): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase!
        .from('route_cache')
        .delete()
        .eq('id', cacheId);

      if (error) {
        throw error;
      }

      this.logger.info('Cache entry deleted', { cacheId });
      return true;
    } catch (error) {
      this.logger.error('Error deleting cache entry', error as Error, { endpoint: '/route-cache', method: 'DELETE' });
      return false;
    }
  }

  /**
   * Очистка всего кэша
   */
  async clearAllCache(): Promise<number> {
    if (!this.supabase) {
      return 0;
    }

    try {
      const { count, error } = await this.supabase!
        .from('route_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Удаляем все записи

      if (error) {
        throw error;
      }

      this.logger.info('All cache entries cleared', { deletedCount: count });
      return count || 0;
    } catch (error) {
      this.logger.error('Error clearing all cache', error as Error);
      return 0;
    }
  }
}

// Экспортируем глобальный экземпляр сервиса
export const routeCacheService = new RouteCacheService();
