import { NextRequest, NextResponse } from 'next/server';
import { searchSailings, getSailingById, getSailingsByCarrier } from '@sprutnet/shared/mocks';
import type { SailingSearchQuery, SailingSearchResult } from '@sprutnet/shared/types';
import { Maersk } from '@/lib/maersk';
import { 
  mapMaerskScheduleToSailing, 
  validateScheduleSearchParams,
  type MaerskScheduleSearchParams,
  type MaerskScheduleResponse 
} from '@/lib/types/schedules';
import { logSearchStarted, logSearchSuccess, logSearchError } from '@/lib/telemetry/logger';
import { routeCacheService } from '@/lib/services/route-cache-service';
import { logger } from '@/lib/logging/advanced-logger';

/**
 * GET /api/schedules
 * Поиск расписаний рейсов с поддержкой фильтрации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Логируем начало поиска
    logSearchStarted({
      originPort: searchParams.get('originPortId') || undefined,
      destinationPort: searchParams.get('destinationPortId') || undefined,
      departureDateFrom: searchParams.get('departureDateFrom') || undefined,
      departureDateTo: searchParams.get('departureDateTo') || undefined,
    });
    
    // Парсим параметры запроса
    const originPortId = searchParams.get('originPortId');
    const destinationPortId = searchParams.get('destinationPortId');
    const departureDateFrom = searchParams.get('departureDateFrom') ? new Date(searchParams.get('departureDateFrom')!) : undefined;
    const departureDateTo = searchParams.get('departureDateTo') ? new Date(searchParams.get('departureDateTo')!) : undefined;
    const carrierCode = searchParams.get('carrierCode') || undefined;
    const containerType = searchParams.get('containerType') as any || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Валидация обязательных параметров
    if (!originPortId || !destinationPortId) {
      return NextResponse.json(
        { error: 'originPortId and destinationPortId are required' },
        { status: 400 }
      );
    }
    
    // Подготавливаем параметры для поиска
    const fromDate = departureDateFrom ? departureDateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const toDate = departureDateTo ? departureDateTo.toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Проверяем кэш в Supabase
    const startTime = Date.now();
    const cachedData = await routeCacheService.getCachedRoute(
      originPortId,
      destinationPortId,
      fromDate,
      toDate
    );
    
    if (cachedData) {
      // Данные найдены в кэше
      const responseTime = Date.now() - startTime;
      
      // Обновляем статистику использования
      await routeCacheService.updateRouteUsageStats(
        originPortId,
        destinationPortId,
        fromDate,
        toDate,
        true, // cache hit
        responseTime
      );
      
      logger.info('Schedules served from cache', {
        route: `${originPortId}-${destinationPortId}`,
        responseTime,
        dataSource: cachedData.data_source
      });
      
      // Логируем успешный поиск
      logSearchSuccess(responseTime);
      
      return NextResponse.json({
        success: true,
        sailings: cachedData.cached_data.sailings || [],
        total: cachedData.cached_data.total || 0,
        source: cachedData.data_source,
        cached: true,
        cacheAge: Date.now() - new Date(cachedData.cache_created_at).getTime()
      });
    }
    
    // Данные не найдены в кэше, запрашиваем у Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    const realDataOnly = process.env.FEATURE_REAL_DATA_ONLY === 'true';
    
    if (useMaerskAPI) {
      try {
        logger.info('Fetching schedules from Maersk API', { 
          route: `${originPortId}-${destinationPortId}`,
          fromDate,
          toDate
        });
        
        // Подготавливаем параметры для Maersk API
        const maerskParams: MaerskScheduleSearchParams = {
          origin: originPortId,
          destination: destinationPortId,
          from: fromDate,
          to: toDate,
          limit: limit + offset,
        };
        
        // Валидируем параметры
        const validationErrors = validateScheduleSearchParams(maerskParams);
        if (validationErrors.length > 0) {
          return NextResponse.json(
            { error: `Validation errors: ${validationErrors.join(', ')}` },
            { status: 400 }
          );
        }
        
        // Выполняем запрос к Maersk API
        const queryParams = new URLSearchParams({
          origin: maerskParams.origin,
          destination: maerskParams.destination,
          from: maerskParams.from,
          to: maerskParams.to,
          limit: maerskParams.limit?.toString() || '10',
        });
        
        const maerskResponse = await Maersk.fetch(`/products/ocean-products?${queryParams}`, {
          method: 'GET',
          cache: true,
          timeout: 15000,
          endpointType: 'schedules',
          params: maerskParams,
        });
        
        logger.info('Maersk API response received', { 
          route: `${originPortId}-${destinationPortId}`,
          status: maerskResponse.status,
          dataLength: maerskResponse.data?.length || 0
        });
        
        if (!maerskResponse.data || !Array.isArray(maerskResponse.data)) {
          logger.warn('Invalid Maersk API response format, using fallback', { 
            route: `${originPortId}-${destinationPortId}` 
          });
          throw new Error('Invalid Maersk API response format');
        }
        
        const maerskSchedules: any[] = maerskResponse.data;
        logger.info(`Received ${maerskSchedules.length} schedules from Maersk API`, { 
          route: `${originPortId}-${destinationPortId}` 
        });
        
        // Маппим данные в наш формат
        const sailings = maerskSchedules.map((schedule: any) => {
          // Получаем данные портов (можно кэшировать)
          const originPort = {
            id: schedule.originPort?.code || originPortId,
            name: schedule.originPort?.name || 'Unknown Port',
            countryCode: 'UN',
            countryName: schedule.originPort?.country || 'Unknown',
            cityName: schedule.originPort?.name || 'Unknown',
            type: 'SEAPORT' as const,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const destinationPort = {
            id: schedule.destinationPort?.code || destinationPortId,
            name: schedule.destinationPort?.name || 'Unknown Port',
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
        
        // Применяем пагинацию
        const paginatedSailings = sailings.slice(offset, offset + limit);
        
        const response: SailingSearchResult = {
          sailings: paginatedSailings,
          total: sailings.length,
          offset,
          limit,
          hasNext: offset + limit < sailings.length
        };
        
        // Кэшируем данные в Supabase
        const apiResponseTime = Date.now() - startTime;
        await routeCacheService.cacheRoute(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          response,
          apiResponseTime,
          'maersk'
        );
        
        // Обновляем статистику использования
        await routeCacheService.updateRouteUsageStats(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          false, // cache miss
          apiResponseTime
        );
        
        logger.info(`Returning ${paginatedSailings.length} schedules from ${sailings.length} found`, { 
          route: `${originPortId}-${destinationPortId}`,
          responseTime: apiResponseTime,
          cached: false
        });
        
        // Логируем успешный поиск
        logSearchSuccess(apiResponseTime);
        
        return NextResponse.json({
          ...response,
          source: 'maersk',
          cached: false,
          responseTime: apiResponseTime
        }, { status: 200 });
        
      } catch (error: any) {
        logger.error('Error fetching from Maersk API', error as Error, { 
          endpoint: `/api/schedules`,
          method: 'GET'
        });
        
        // Если включен режим только реальных данных, возвращаем ошибку
        if (realDataOnly) {
          logger.error('Real data only mode enabled, returning error instead of fallback', error as Error, { 
            endpoint: `/api/schedules`,
            method: 'GET'
          });
          
          // Логируем ошибку поиска
          logSearchError(error.message, {
            originPort: originPortId,
            destinationPort: destinationPortId,
            departureDateFrom: fromDate,
            departureDateTo: toDate,
          });
          
          return NextResponse.json({
            error: 'Unable to fetch real data from Maersk API',
            details: realDataOnly ? 'Real data only mode is enabled' : 'API temporarily unavailable',
            source: 'error',
            cached: false,
            responseTime: Date.now() - startTime
          }, { status: 503 });
        }
        
        // Fallback на мок-данные при ошибке (только если не включен режим реальных данных)
        logger.info('Using fallback mock data', { 
          endpoint: `/api/schedules`,
          method: 'GET'
        });
        
        const results = searchSailings(
          originPortId,
          destinationPortId,
          departureDateFrom,
          departureDateTo,
          carrierCode,
          containerType,
          limit + offset
        );
        
        const paginatedResults = results.slice(offset, offset + limit);
        
        const response: SailingSearchResult = {
          sailings: paginatedResults,
          total: results.length,
          offset,
          limit,
          hasNext: offset + limit < results.length
        };
        
        // Кэшируем fallback данные
        const fallbackResponseTime = Date.now() - startTime;
        await routeCacheService.cacheRoute(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          response,
          fallbackResponseTime,
          'fallback'
        );
        
        // Обновляем статистику использования
        await routeCacheService.updateRouteUsageStats(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          false, // cache miss
          fallbackResponseTime
        );
        
        logger.info(`Returning ${paginatedResults.length} fallback schedules`, { 
          endpoint: `/api/schedules`,
          method: 'GET'
        });
        
        // Логируем успешный поиск
        logSearchSuccess(fallbackResponseTime);
        
        return NextResponse.json({
          ...response,
          source: 'fallback',
          cached: false,
          responseTime: fallbackResponseTime
        }, { status: 200 });
      }
    } else {
      // Maersk API отключен
      if (realDataOnly) {
        logger.error('Maersk API is disabled but real data only mode is enabled', new Error('Maersk API disabled'), { 
          endpoint: `/api/schedules`,
          method: 'GET'
        });
        
        return NextResponse.json({
          error: 'Maersk API is disabled but real data only mode is enabled',
          details: 'Please enable FEATURE_MAERSK=true to use real data',
          source: 'error',
          cached: false,
          responseTime: Date.now() - startTime
        }, { status: 503 });
      }
      
      // Используем моковые данные (только если не включен режим реальных данных)
      logger.info('Using mock data (Maersk API disabled)', { 
        endpoint: `/api/schedules`,
        method: 'GET'
      });
      
      const results = searchSailings(
        originPortId,
        destinationPortId,
        departureDateFrom,
        departureDateTo,
        carrierCode,
        containerType,
        limit + offset
      );
      
      // Применяем пагинацию
      const paginatedResults = results.slice(offset, offset + limit);
      
      const response: SailingSearchResult = {
        sailings: paginatedResults,
        total: results.length,
        offset,
        limit,
        hasNext: offset + limit < results.length
      };
      
      // Кэшируем мок данные
      const mockResponseTime = Date.now() - startTime;
      await routeCacheService.cacheRoute(
        originPortId,
        destinationPortId,
        fromDate,
        toDate,
        response,
        mockResponseTime,
        'mock'
      );
      
      // Обновляем статистику использования
      await routeCacheService.updateRouteUsageStats(
        originPortId,
        destinationPortId,
        fromDate,
        toDate,
        false, // cache miss
        mockResponseTime
      );
      
      logger.info(`Returning ${paginatedResults.length} mock schedules`, { 
        endpoint: `/api/schedules`,
        method: 'GET'
      });
      
      // Логируем успешный поиск
      logSearchSuccess(mockResponseTime);
      
      return NextResponse.json({
        ...response,
        source: 'mock',
        cached: false,
        responseTime: mockResponseTime
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in schedules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules
 * Поиск расписаний с JSON body
 */
export async function POST(request: NextRequest) {
  try {
    const body: SailingSearchQuery = await request.json();
    
    const { 
      originPortId, 
      destinationPortId, 
      departureDateFrom, 
      departureDateTo, 
      carrierCode, 
      containerType, 
      limit = 10, 
      offset = 0 
    } = body;
    
    // Валидация обязательных параметров
    if (!originPortId || !destinationPortId) {
      return NextResponse.json(
        { error: 'originPortId and destinationPortId are required' },
        { status: 400 }
      );
    }
    
    // Проверяем флаг для использования Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    
    if (useMaerskAPI) {
      try {
        console.log('🚢 POST запрос к Maersk Schedules API:', { originPortId, destinationPortId, departureDateFrom, departureDateTo });
        
        // Подготавливаем параметры для Maersk API
        const maerskParams: MaerskScheduleSearchParams = {
          origin: originPortId,
          destination: destinationPortId,
          from: departureDateFrom ? departureDateFrom.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          to: departureDateTo ? departureDateTo.toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          limit: limit + offset,
        };
        
        // Валидируем параметры
        const validationErrors = validateScheduleSearchParams(maerskParams);
        if (validationErrors.length > 0) {
          return NextResponse.json(
            { error: `Validation errors: ${validationErrors.join(', ')}` },
            { status: 400 }
          );
        }
        
        // Выполняем запрос к Maersk API
        const queryParams = new URLSearchParams({
          origin: maerskParams.origin,
          destination: maerskParams.destination,
          from: maerskParams.from,
          to: maerskParams.to,
          limit: maerskParams.limit?.toString() || '10',
        });
        
        const maerskResponse = await Maersk.fetch(`/products/ocean-products?${queryParams}`, {
          method: 'GET',
          cache: true,
          timeout: 15000,
        });
        
        console.log('📊 POST ответ от Maersk API:', maerskResponse);
        
        if (!maerskResponse.data || !Array.isArray(maerskResponse.data)) {
          console.warn('⚠️ Неверный формат данных от Maersk API, используем fallback');
          throw new Error('Invalid Maersk API response format');
        }
        
        const maerskSchedules: any[] = maerskResponse.data;
        console.log(`📈 Получено ${maerskSchedules.length} расписаний от Maersk API (POST)`);
        
        // Маппим данные в наш формат
        const sailings = maerskSchedules.map((schedule: any) => {
          // Получаем данные портов (можно кэшировать)
          const originPort = {
            id: schedule.originPort?.code || originPortId,
            name: schedule.originPort?.name || 'Unknown Port',
            countryCode: 'UN',
            countryName: schedule.originPort?.country || 'Unknown',
            cityName: schedule.originPort?.name || 'Unknown',
            type: 'SEAPORT' as const,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const destinationPort = {
            id: schedule.destinationPort?.code || destinationPortId,
            name: schedule.destinationPort?.name || 'Unknown Port',
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
        
        // Применяем пагинацию
        const paginatedSailings = sailings.slice(offset, offset + limit);
        
        const response: SailingSearchResult = {
          sailings: paginatedSailings,
          total: sailings.length,
          offset,
          limit,
          hasNext: offset + limit < sailings.length
        };
        
        console.log(`✅ POST возвращаем ${paginatedSailings.length} расписаний из ${sailings.length} найденных`);
        
        // Логируем успешный поиск
        logSearchSuccess(paginatedSailings.length, {
          total: sailings.length,
          dataSource: 'maersk',
        });
        
        return NextResponse.json(response, { status: 200 });
        
      } catch (error: any) {
        console.error('❌ Ошибка при POST запросе к Maersk API:', error);
        
        // Логируем ошибку поиска
        logSearchError(error.message || 'Maersk API error', {
          dataSource: 'maersk',
          fallback: true,
        });
        
        // Fallback на мок-данные при ошибке
        console.log('🔄 POST используем fallback на мок-данные');
        const results = searchSailings(
          originPortId,
          destinationPortId,
          departureDateFrom,
          departureDateTo,
          carrierCode,
          containerType,
          limit + offset
        );
        
        const paginatedResults = results.slice(offset, offset + limit);
        
        const response: SailingSearchResult = {
          sailings: paginatedResults,
          total: results.length,
          offset,
          limit,
          hasNext: offset + limit < results.length
        };
        
        return NextResponse.json(response, { status: 200 });
      }
    } else {
      // Используем моковые данные
      console.log('🎭 POST используем мок-данные (Maersk API отключен)');
      const results = searchSailings(
        originPortId,
        destinationPortId,
        departureDateFrom,
        departureDateTo,
        carrierCode,
        containerType,
        limit + offset
      );
      
      // Применяем пагинацию
      const paginatedResults = results.slice(offset, offset + limit);
      
      const response: SailingSearchResult = {
        sailings: paginatedResults,
        total: results.length,
        offset,
        limit,
        hasNext: offset + limit < results.length
      };
      
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error('Error in schedules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
