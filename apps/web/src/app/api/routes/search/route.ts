import { NextRequest, NextResponse } from 'next/server';
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

// Типы для UC1
interface RouteSearchQuery {
  originPortId: string;
  destinationPortId: string;
  departureDateFrom?: string;
  departureDateTo?: string;
  containerType?: string;
  limit?: number;
}

interface RouteSearchResult {
  success: boolean;
  routes: RouteOption[];
  total: number;
  source: 'maersk' | 'cache' | 'fallback' | 'error' | 'mock';
  cached: boolean;
  responseTime: number;
  recommendations: {
    earliest: RouteOption | null;
    shortest: RouteOption | null;
    balanced: RouteOption | null;
  };
}

interface RouteOption {
  id: string;
  originPort: {
    id: string;
    name: string;
    countryCode: string;
    countryName: string;
  };
  destinationPort: {
    id: string;
    name: string;
    countryCode: string;
    countryName: string;
  };
  departureDate: string;
  arrivalDate: string;
  duration: number; // в днях
  carrier: {
    code: string;
    name: string;
  };
  vessel: {
    name: string;
    imo: string;
  };
  transitTime: number; // в днях
  price?: {
    currency: string;
    amount: number;
  };
  reliability: number; // 0-100
  score: number; // общий скор для рекомендаций
}

/**
 * GET /api/routes/search
 * UC1: Поиск рейса (Find Route)
 * JTBD: «Мне нужно быстро понять, каким рейсом я могу отправить груз»
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Парсим параметры запроса
    const originPortId = searchParams.get('originPortId');
    const destinationPortId = searchParams.get('destinationPortId');
    const departureDateFrom = searchParams.get('departureDateFrom');
    const departureDateTo = searchParams.get('departureDateTo');
    const containerType = searchParams.get('containerType');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Валидация обязательных параметров
    if (!originPortId || !destinationPortId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'originPortId and destinationPortId are required',
          details: 'Please provide both origin and destination port IDs'
        },
        { status: 400 }
      );
    }
    
    // Логируем начало поиска
    logSearchStarted({
      originPort: originPortId || undefined,
      destinationPort: destinationPortId || undefined,
      departureDateFrom: departureDateFrom || undefined,
      departureDateTo: departureDateTo || undefined,
    });
    
    const startTime = Date.now();
    
    // Подготавливаем параметры для поиска
    const fromDate = departureDateFrom || new Date().toISOString().split('T')[0];
    const toDate = departureDateTo || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 90 дней вместо 60
    
    // Проверяем кэш в Supabase
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
      
      logger.info('Routes served from cache', {
        route: `${originPortId}-${destinationPortId}`,
        responseTime,
        dataSource: cachedData.data_source
      });
      
      // Логируем успешный поиск
      logSearchSuccess(responseTime);
      
      const routes = transformToRouteOptions(cachedData.cached_data.sailings || []);
      const recommendations = calculateRecommendations(routes);
      
      return NextResponse.json({
        success: true,
        routes: routes.slice(0, limit),
        total: routes.length,
        source: cachedData.data_source,
        cached: true,
        responseTime,
        recommendations,
        cacheAge: Date.now() - new Date(cachedData.cache_created_at).getTime()
      });
    }
    
    // Данные не найдены в кэше, запрашиваем у Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    const realDataOnly = process.env.FEATURE_REAL_DATA_ONLY === 'true';
    
    if (useMaerskAPI) {
      try {
        logger.info('Fetching routes from Maersk API', { 
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
          limit: Math.min(limit * 2, 100), // Запрашиваем больше для лучших рекомендаций
        };
        
        // Валидируем параметры
        const validationErrors = validateScheduleSearchParams(maerskParams);
        if (validationErrors.length > 0) {
          return NextResponse.json(
            { 
              success: false,
              error: `Validation errors: ${validationErrors.join(', ')}` 
            },
            { status: 400 }
          );
        }
        
        // Выполняем запрос к Maersk API
        const queryParams = new URLSearchParams({
          origin: maerskParams.origin,
          destination: maerskParams.destination,
          from: maerskParams.from,
          to: maerskParams.to,
          limit: maerskParams.limit?.toString() || '20',
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
          logger.warn('Invalid Maersk API response format', { 
            route: `${originPortId}-${destinationPortId}` 
          });
          throw new Error('Invalid Maersk API response format');
        }
        
        const maerskSchedules: any[] = maerskResponse.data;
        logger.info(`Received ${maerskSchedules.length} schedules from Maersk API`, { 
          route: `${originPortId}-${destinationPortId}` 
        });
        
        // Маппим данные в наш формат
        const routes = maerskSchedules.map((schedule: any) => {
          const originPort = {
            id: schedule.originPort?.code || originPortId,
            name: schedule.originPort?.name || 'Unknown Port',
            countryCode: schedule.originPort?.country || 'UN',
            countryName: schedule.originPort?.country || 'Unknown',
          };
          
          const destinationPort = {
            id: schedule.destinationPort?.code || destinationPortId,
            name: schedule.destinationPort?.name || 'Unknown Port',
            countryCode: schedule.destinationPort?.country || 'UN',
            countryName: schedule.destinationPort?.country || 'Unknown',
          };
          
          return mapScheduleToRouteOption(schedule, originPort, destinationPort);
        });
        
        // Вычисляем рекомендации
        const recommendations = calculateRecommendations(routes);
        
        // Сортируем маршруты по скору
        const sortedRoutes = routes.sort((a, b) => b.score - a.score);
        
        const response: RouteSearchResult = {
          success: true,
          routes: sortedRoutes.slice(0, limit),
          total: routes.length,
          source: 'maersk',
          cached: false,
          responseTime: Date.now() - startTime,
          recommendations
        };
        
        // Кэшируем данные в Supabase
        const apiResponseTime = Date.now() - startTime;
        await routeCacheService.cacheRoute(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          { sailings: maerskSchedules, total: routes.length },
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
        
        logger.info(`Returning ${sortedRoutes.slice(0, limit).length} routes from ${routes.length} found`, { 
          route: `${originPortId}-${destinationPortId}`,
          responseTime: apiResponseTime,
          cached: false
        });
        
        // Логируем успешный поиск
        logSearchSuccess(apiResponseTime);
        
        return NextResponse.json(response, { status: 200 });
        
      } catch (error: any) {
        logger.error('Error fetching from Maersk API', error as Error, { 
          endpoint: `/api/routes/search`,
          method: 'GET'
        });
        
        // Если включен режим только реальных данных, возвращаем ошибку
        if (realDataOnly) {
          logger.error('Real data only mode enabled, returning error instead of fallback', error as Error, { 
            endpoint: `/api/routes/search`,
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
            success: false,
            error: 'Unable to fetch real route data from Maersk API',
            details: realDataOnly ? 'Real data only mode is enabled' : 'API temporarily unavailable',
            source: 'error',
            cached: false,
            responseTime: Date.now() - startTime,
            routes: [],
            total: 0,
            recommendations: {
              earliest: null,
              shortest: null,
              balanced: null
            }
          }, { status: 503 });
        }
        
        // Fallback на мок-данные при ошибке (только если не включен режим реальных данных)
        logger.info('Using fallback mock data', { 
          endpoint: `/api/routes/search`,
          method: 'GET'
        });
        
        const fallbackRoutes = generateFallbackRoutes(originPortId, destinationPortId, fromDate, toDate);
        const recommendations = calculateRecommendations(fallbackRoutes);
        
        const response: RouteSearchResult = {
          success: true,
          routes: fallbackRoutes.slice(0, limit),
          total: fallbackRoutes.length,
          source: 'fallback',
          cached: false,
          responseTime: Date.now() - startTime,
          recommendations
        };
        
        // Кэшируем fallback данные
        const fallbackResponseTime = Date.now() - startTime;
        await routeCacheService.cacheRoute(
          originPortId,
          destinationPortId,
          fromDate,
          toDate,
          { sailings: fallbackRoutes, total: fallbackRoutes.length },
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
        
        logger.info(`Returning ${fallbackRoutes.slice(0, limit).length} fallback routes`, { 
          endpoint: `/api/routes/search`,
          method: 'GET'
        });
        
        // Логируем успешный поиск
        logSearchSuccess(fallbackResponseTime);
        
        return NextResponse.json(response, { status: 200 });
      }
    } else {
      // Maersk API отключен
      if (realDataOnly) {
        logger.error('Maersk API is disabled but real data only mode is enabled', new Error('Maersk API disabled'), { 
          endpoint: `/api/routes/search`,
          method: 'GET'
        });
        
        return NextResponse.json({
          success: false,
          error: 'Maersk API is disabled but real data only mode is enabled',
          details: 'Please enable FEATURE_MAERSK=true to use real data',
          source: 'error',
          cached: false,
          responseTime: Date.now() - startTime,
          routes: [],
          total: 0,
          recommendations: {
            earliest: null,
            shortest: null,
            balanced: null
          }
        }, { status: 503 });
      }
      
      // Используем моковые данные (только если не включен режим реальных данных)
      logger.info('Using mock data (Maersk API disabled)', { 
        endpoint: `/api/routes/search`,
        method: 'GET'
      });
      
      const mockRoutes = generateFallbackRoutes(originPortId, destinationPortId, fromDate, toDate);
      const recommendations = calculateRecommendations(mockRoutes);
      
      const response: RouteSearchResult = {
        success: true,
        routes: mockRoutes.slice(0, limit),
        total: mockRoutes.length,
        source: 'mock',
        cached: false,
        responseTime: Date.now() - startTime,
        recommendations
      };
      
      // Кэшируем мок данные
      const mockResponseTime = Date.now() - startTime;
      await routeCacheService.cacheRoute(
        originPortId,
        destinationPortId,
        fromDate,
        toDate,
        { sailings: mockRoutes, total: mockRoutes.length },
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
      
      logger.info(`Returning ${mockRoutes.slice(0, limit).length} mock routes`, { 
        endpoint: `/api/routes/search`,
        method: 'GET'
      });
      
      // Логируем успешный поиск
      logSearchSuccess(mockResponseTime);
      
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error('Error in routes search API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        source: 'error',
        cached: false,
        responseTime: 0,
        routes: [],
        total: 0,
        recommendations: {
          earliest: null,
          shortest: null,
          balanced: null
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routes/search
 * Поиск рейсов с JSON body
 */
export async function POST(request: NextRequest) {
  try {
    const body: RouteSearchQuery = await request.json();
    
    const { 
      originPortId, 
      destinationPortId, 
      departureDateFrom, 
      departureDateTo, 
      containerType, 
      limit = 20 
    } = body;
    
    // Валидация обязательных параметров
    if (!originPortId || !destinationPortId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'originPortId and destinationPortId are required' 
        },
        { status: 400 }
      );
    }
    
    // Создаем URL с параметрами для GET запроса
    const url = new URL('/api/routes/search', request.url);
    url.searchParams.set('originPortId', originPortId);
    url.searchParams.set('destinationPortId', destinationPortId);
    if (departureDateFrom) url.searchParams.set('departureDateFrom', departureDateFrom);
    if (departureDateTo) url.searchParams.set('departureDateTo', departureDateTo);
    if (containerType) url.searchParams.set('containerType', containerType);
    url.searchParams.set('limit', limit.toString());
    
    // Выполняем GET запрос
    const getRequest = new NextRequest(url, { method: 'GET' });
    return await GET(getRequest);
    
  } catch (error) {
    console.error('Error in routes search POST API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid JSON body',
        source: 'error',
        cached: false,
        responseTime: 0,
        routes: [],
        total: 0,
        recommendations: {
          earliest: null,
          shortest: null,
          balanced: null
        }
      },
      { status: 400 }
    );
  }
}

// Вспомогательные функции

function mapScheduleToRouteOption(schedule: any, originPort: any, destinationPort: any): RouteOption {
  const departureDate = new Date(schedule.departureDate || schedule.originDate);
  const arrivalDate = new Date(schedule.arrivalDate || schedule.destinationDate);
  const duration = Math.ceil((arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Вычисляем скор на основе различных факторов
  const reliability = calculateReliability(schedule);
  const score = calculateScore(schedule, duration, reliability);
  
  return {
    id: schedule.id || `${schedule.carrier?.code || 'UNK'}-${departureDate.getTime()}`,
    originPort,
    destinationPort,
    departureDate: departureDate.toISOString(),
    arrivalDate: arrivalDate.toISOString(),
    duration,
    carrier: {
      code: schedule.carrier?.code || 'UNK',
      name: schedule.carrier?.name || 'Unknown Carrier'
    },
    vessel: {
      name: schedule.vessel?.name || 'Unknown Vessel',
      imo: schedule.vessel?.imo || '0000000'
    },
    transitTime: duration,
    price: schedule.price ? {
      currency: schedule.price.currency || 'USD',
      amount: schedule.price.amount || 0
    } : undefined,
    reliability,
    score
  };
}

function calculateReliability(schedule: any): number {
  // Простая логика расчета надежности
  let reliability = 70; // базовая надежность
  
  if (schedule.carrier?.code === 'MAEU') reliability += 20; // Maersk более надежен
  if (schedule.vessel?.builtYear && schedule.vessel.builtYear > 2015) reliability += 10; // новый корабль
  
  return Math.min(reliability, 100);
}

function calculateScore(schedule: any, duration: number, reliability: number): number {
  // Вычисляем общий скор для рекомендаций
  let score = 50; // базовый скор
  
  // Фактор времени в пути (короче = лучше)
  if (duration <= 7) score += 30;
  else if (duration <= 14) score += 20;
  else if (duration <= 21) score += 10;
  
  // Фактор надежности
  score += (reliability - 70) * 0.3;
  
  // Фактор перевозчика
  if (schedule.carrier?.code === 'MAEU') score += 15;
  
  return Math.max(0, Math.min(100, score));
}

function calculateRecommendations(routes: RouteOption[]): {
  earliest: RouteOption | null;
  shortest: RouteOption | null;
  balanced: RouteOption | null;
} {
  if (routes.length === 0) {
    return {
      earliest: null,
      shortest: null,
      balanced: null
    };
  }
  
  // Earliest - самый ранний рейс
  const earliest = routes.reduce((earliest, current) => 
    new Date(current.departureDate) < new Date(earliest.departureDate) ? current : earliest
  );
  
  // Shortest - самый короткий рейс
  const shortest = routes.reduce((shortest, current) => 
    current.duration < shortest.duration ? current : shortest
  );
  
  // Balanced - лучший по общему скору
  const balanced = routes.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  return { earliest, shortest, balanced };
}

function transformToRouteOptions(sailings: any[]): RouteOption[] {
  return sailings.map(sailing => {
    const originPort = {
      id: sailing.originPort?.id || sailing.originPortId,
      name: sailing.originPort?.name || 'Unknown Port',
      countryCode: sailing.originPort?.countryCode || 'UN',
      countryName: sailing.originPort?.countryName || 'Unknown',
    };
    
    const destinationPort = {
      id: sailing.destinationPort?.id || sailing.destinationPortId,
      name: sailing.destinationPort?.name || 'Unknown Port',
      countryCode: sailing.destinationPort?.countryCode || 'UN',
      countryName: sailing.destinationPort?.countryName || 'Unknown',
    };
    
    return mapScheduleToRouteOption(sailing, originPort, destinationPort);
  });
}

function generateFallbackRoutes(originPortId: string, destinationPortId: string, fromDate: string, toDate: string): RouteOption[] {
  const routes: RouteOption[] = [];
  const carriers = ['MAEU', 'MSC', 'CMA', 'ONE', 'COSCO', 'EVERGREEN', 'YANG MING', 'HAPAG-LLOYD'];
  const vessels = [
    'MAERSK SEVILLE', 'MAERSK SHANGHAI', 'MAERSK HAMBURG', 'MSC OSCAR', 
    'MSC GÜLSÜN', 'CMA CGM MARCO POLO', 'EVER GIVEN', 'COSCO SHIPPING UNIVERSE',
    'YANG MING ENDURANCE', 'HAPAG-LLOYD BARCELONA'
  ];
  
  // Генерируем больше рейсов для лучшего покрытия
  const numberOfRoutes = 20; // Увеличиваем с 10 до 20
  
  for (let i = 0; i < numberOfRoutes; i++) {
    const departureDate = new Date(fromDate);
    // Распределяем рейсы более равномерно по всему периоду
    const daysToAdd = Math.floor((i * (90 / numberOfRoutes)) + Math.random() * 3);
    departureDate.setDate(departureDate.getDate() + daysToAdd);
    
    // Убеждаемся, что дата не выходит за пределы запрошенного периода
    if (departureDate > new Date(toDate)) {
      break;
    }
    
    // Различные варианты времени в пути для разных маршрутов
    const transitTimeOptions = [12, 14, 16, 18, 20, 22, 25, 28];
    const transitTime = transitTimeOptions[i % transitTimeOptions.length];
    
    const arrivalDate = new Date(departureDate);
    arrivalDate.setDate(arrivalDate.getDate() + transitTime);
    
    const duration = Math.ceil((arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24));
    
    routes.push({
      id: `fallback-${i}`,
      originPort: {
        id: originPortId,
        name: originPortId === 'CNSHA' ? 'Shanghai' : 'Unknown Port',
        countryCode: originPortId.startsWith('CN') ? 'CN' : 'UN',
        countryName: originPortId.startsWith('CN') ? 'China' : 'Unknown',
      },
      destinationPort: {
        id: destinationPortId,
        name: destinationPortId === 'USLAX' ? 'Los Angeles' : 'Unknown Port',
        countryCode: destinationPortId.startsWith('US') ? 'US' : 'UN',
        countryName: destinationPortId.startsWith('US') ? 'United States' : 'Unknown',
      },
      departureDate: departureDate.toISOString(),
      arrivalDate: arrivalDate.toISOString(),
      duration,
      carrier: {
        code: carriers[i % carriers.length],
        name: carriers[i % carriers.length] === 'MAEU' ? 'Maersk' : 'Unknown Carrier'
      },
      vessel: {
        name: vessels[i % vessels.length],
        imo: `123456${i}`
      },
      transitTime: duration,
      price: {
        currency: 'USD',
        amount: 2000 + Math.random() * 1000
      },
      reliability: 70 + Math.random() * 20,
      score: 50 + Math.random() * 30
    });
  }
  
  return routes.sort((a, b) => b.score - a.score);
}
