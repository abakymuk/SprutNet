import { NextRequest, NextResponse } from 'next/server';
import { searchSailings, getSailingById, getSailingsByCarrier } from '@sprutnet/shared/mocks';
import type { SailingSearchQuery, SailingSearchResult } from '@sprutnet/shared/types';

/**
 * GET /api/schedules
 * Поиск расписаний рейсов с поддержкой фильтрации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
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
    
    // Проверяем флаг для использования моков
    const useMocks = process.env.FEATURE_MAERSK !== 'true';
    
    if (useMocks) {
      // Используем моковые данные
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
    } else {
      // TODO: Интеграция с реальным Maersk API
      return NextResponse.json(
        { error: 'Maersk API integration not implemented yet' },
        { status: 501 }
      );
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
    
    // Проверяем флаг для использования моков
    const useMocks = process.env.FEATURE_MAERSK !== 'true';
    
    if (useMocks) {
      // Используем моковые данные
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
    } else {
      // TODO: Интеграция с реальным Maersk API
      return NextResponse.json(
        { error: 'Maersk API integration not implemented yet' },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error('Error in schedules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
