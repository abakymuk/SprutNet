import { NextRequest, NextResponse } from 'next/server';
import { searchPorts, getPortsByCountry } from '@sprutnet/shared/mocks';
import type { PortSearchQuery, PortSearchResult } from '@sprutnet/shared/types';

/**
 * GET /api/ports/search
 * Поиск портов с поддержкой фильтрации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Парсим параметры запроса
    const query = searchParams.get('query') || '';
    const countryCode = searchParams.get('countryCode') || undefined;
    const type = searchParams.get('type') as any || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Проверяем флаг для использования моков
    const useMocks = process.env.FEATURE_MAERSK !== 'true';
    
    if (useMocks) {
      // Используем моковые данные
      let results;
      
      if (countryCode) {
        results = getPortsByCountry(countryCode);
      } else {
        results = searchPorts(query, limit + offset);
      }
      
      // Применяем пагинацию
      const paginatedResults = results.slice(offset, offset + limit);
      
      const response: PortSearchResult = {
        ports: paginatedResults,
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
    console.error('Error in ports search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ports/search
 * Поиск портов с JSON body
 */
export async function POST(request: NextRequest) {
  try {
    const body: PortSearchQuery = await request.json();
    
    const { query, countryCode, type, limit = 10, offset = 0 } = body;
    
    // Проверяем флаг для использования моков
    const useMocks = process.env.FEATURE_MAERSK !== 'true';
    
    if (useMocks) {
      // Используем моковые данные
      let results;
      
      if (countryCode) {
        results = getPortsByCountry(countryCode);
      } else {
        results = searchPorts(query, limit + offset);
      }
      
      // Применяем пагинацию
      const paginatedResults = results.slice(offset, offset + limit);
      
      const response: PortSearchResult = {
        ports: paginatedResults,
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
    console.error('Error in ports search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
