import { NextRequest, NextResponse } from 'next/server';
import { routeCacheService } from '@/lib/services/route-cache-service';
import { logger } from '@/lib/logging/advanced-logger';

/**
 * GET /api/route-cache
 * Получение информации о кэше маршрутов
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (action) {
      case 'stats':
        const stats = await routeCacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'monitoring':
        const monitoring = await routeCacheService.getCacheMonitoring();
        return NextResponse.json({
          success: true,
          data: monitoring,
        });

      case 'popular-routes':
        const popularRoutes = await routeCacheService.getPopularRoutes(limit);
        return NextResponse.json({
          success: true,
          data: popularRoutes,
          count: popularRoutes.length,
        });

      case 'top-routes':
        const topRoutes = await routeCacheService.getTopRoutes(limit);
        return NextResponse.json({
          success: true,
          data: topRoutes,
          count: topRoutes.length,
        });

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие. Доступные: stats, monitoring, popular-routes, top-routes' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in route cache API', error as Error, {
      endpoint: '/api/route-cache',
      method: 'GET'
    });
    
    return NextResponse.json(
      { error: 'Ошибка при получении данных кэша' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/route-cache
 * Управление кэшем маршрутов
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'cleanup':
        const deletedCount = await routeCacheService.cleanupExpiredCache();
        return NextResponse.json({
          success: true,
          message: `Очищено ${deletedCount} устаревших записей кэша`,
          deletedCount,
        });

      case 'clear-all':
        const clearedCount = await routeCacheService.clearAllCache();
        return NextResponse.json({
          success: true,
          message: `Очищен весь кэш (${clearedCount} записей)`,
          clearedCount,
        });

      case 'preload':
        // Запускаем предзагрузку популярных маршрутов
        const { PopularRoutesPreloader } = await import('@/scripts/preload-popular-routes');
        const preloader = new PopularRoutesPreloader();
        
        // Запускаем в фоне
        preloader.preloadPopularRoutes().catch(error => {
          logger.error('Error in background preload', error as Error, {
            endpoint: '/api/route-cache',
            method: 'POST'
          });
        });

        return NextResponse.json({
          success: true,
          message: 'Предзагрузка популярных маршрутов запущена в фоне',
        });

      case 'delete-entry':
        const cacheId = searchParams.get('cacheId');
        if (!cacheId) {
          return NextResponse.json(
            { error: 'cacheId обязателен для удаления записи' },
            { status: 400 }
          );
        }

        const deleted = await routeCacheService.deleteCacheEntry(cacheId);
        if (deleted) {
          return NextResponse.json({
            success: true,
            message: 'Запись кэша удалена',
            cacheId,
          });
        } else {
          return NextResponse.json(
            { error: 'Не удалось удалить запись кэша' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие. Доступные: cleanup, clear-all, preload, delete-entry' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error in route cache management API', error as Error, {
      endpoint: '/api/route-cache',
      method: 'POST'
    });
    
    return NextResponse.json(
      { error: 'Ошибка при управлении кэшем' },
      { status: 500 }
    );
  }
}
