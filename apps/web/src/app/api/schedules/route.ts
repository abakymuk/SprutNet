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
    
    // Проверяем флаг для использования Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    
    if (useMaerskAPI) {
      try {
        console.log('🚢 Запрос к Maersk Schedules API:', { originPortId, destinationPortId, departureDateFrom, departureDateTo });
        
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
          endpointType: 'schedules',
          params: maerskParams,
        });
        
        console.log('📊 Ответ от Maersk API:', maerskResponse);
        
        if (!maerskResponse.data || !Array.isArray(maerskResponse.data)) {
          console.warn('⚠️ Неверный формат данных от Maersk API, используем fallback');
          throw new Error('Invalid Maersk API response format');
        }
        
        const maerskSchedules: any[] = maerskResponse.data;
        console.log(`📈 Получено ${maerskSchedules.length} расписаний от Maersk API`);
        
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
        
        console.log(`✅ Возвращаем ${paginatedSailings.length} расписаний из ${sailings.length} найденных`);
        return NextResponse.json(response, { status: 200 });
        
      } catch (error: any) {
        console.error('❌ Ошибка при запросе к Maersk API:', error);
        
        // Fallback на мок-данные при ошибке
        console.log('🔄 Используем fallback на мок-данные');
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
      console.log('🎭 Используем мок-данные (Maersk API отключен)');
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
