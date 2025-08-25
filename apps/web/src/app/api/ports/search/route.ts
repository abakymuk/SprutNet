import { NextRequest, NextResponse } from 'next/server';
import { Maersk } from '@/lib/maersk';
import { 
  MaerskLocation, 
  PortSearchResponse, 
  mapLocationToPortRef, 
  filterPorts,
  searchPorts 
} from '@/lib/types/ports';
import { PortRef, PortType } from '@sprutnet/shared/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('🔍 Port search request:', { query, limit });

    // Если запрос пустой, возвращаем пустой результат
    if (!query.trim()) {
      const response: PortSearchResponse = {
        success: true,
        data: [],
        total: 0,
      };
      return NextResponse.json(response);
    }

    // Проверяем, включен ли Maersk API
    if (process.env.FEATURE_MAERSK !== 'true') {
      console.log('⚠️ Maersk API отключен, возвращаем мок-данные');
      return NextResponse.json(getMockPorts(query));
    }

    try {
      // Выполняем запрос к Maersk Locations API
      const locationsResponse = await Maersk.fetch('/reference-data/locations', {
        cache: true, // Используем кэш для оптимизации
        timeout: 10000, // 10 секунд timeout
        endpointType: 'ports',
        params: { query, limit },
      });

      if (!locationsResponse.data || !Array.isArray(locationsResponse.data)) {
        console.error('❌ Неверный формат данных от Maersk API');
        return NextResponse.json(getMockPorts(query));
      }

      const locations: MaerskLocation[] = locationsResponse.data;
      console.log(`📊 Получено ${locations.length} локаций от Maersk API`);

      // Фильтруем только порты
      const ports = filterPorts(locations);
      console.log(`🚢 Отфильтровано ${ports.length} портов`);

      // Маппим данные в наш формат
      const portRefs: PortRef[] = ports.map(mapLocationToPortRef);

      // Выполняем поиск по запросу
      const searchResults = searchPorts(portRefs, query).slice(0, limit);

      console.log(`✅ Найдено ${searchResults.length} портов для запроса "${query}"`);

      const response: PortSearchResponse = {
        success: true,
        data: searchResults,
        total: searchResults.length,
      };

      return NextResponse.json(response);

    } catch (error: any) {
      console.error('❌ Ошибка при запросе к Maersk API:', error);
      
      // Fallback на мок-данные при ошибке API
      return NextResponse.json(getMockPorts(query));
    }

  } catch (error) {
    console.error('❌ Ошибка в API поиска портов:', error);
    
    const errorResponse: PortSearchResponse = {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Функция для возврата мок-данных при ошибках или отключенном API
function getMockPorts(query: string): PortSearchResponse {
  const mockPorts: PortRef[] = [
    { 
      id: 'CNSHA', 
      name: 'Shanghai', 
      countryCode: 'CN',
      countryName: 'China',
      cityName: 'Shanghai',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'SGSIN', 
      name: 'Singapore', 
      countryCode: 'SG',
      countryName: 'Singapore',
      cityName: 'Singapore',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'NLRTM', 
      name: 'Rotterdam', 
      countryCode: 'NL',
      countryName: 'Netherlands',
      cityName: 'Rotterdam',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'USNYC', 
      name: 'New York', 
      countryCode: 'US',
      countryName: 'United States',
      cityName: 'New York',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'DEHAM', 
      name: 'Hamburg', 
      countryCode: 'DE',
      countryName: 'Germany',
      cityName: 'Hamburg',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'JPTYO', 
      name: 'Tokyo', 
      countryCode: 'JP',
      countryName: 'Japan',
      cityName: 'Tokyo',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'KRPUS', 
      name: 'Busan', 
      countryCode: 'KR',
      countryName: 'South Korea',
      cityName: 'Busan',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'AEDXB', 
      name: 'Dubai', 
      countryCode: 'AE',
      countryName: 'United Arab Emirates',
      cityName: 'Dubai',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'GBLGP', 
      name: 'London Gateway', 
      countryCode: 'GB',
      countryName: 'United Kingdom',
      cityName: 'London',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { 
      id: 'FRLEH', 
      name: 'Le Havre', 
      countryCode: 'FR',
      countryName: 'France',
      cityName: 'Le Havre',
      type: PortType.SEAPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  if (!query.trim()) {
    return {
      success: true,
      data: [],
      total: 0,
    };
  }

  const filteredPorts = searchPorts(mockPorts, query);
  
  return {
    success: true,
    data: filteredPorts,
    total: filteredPorts.length,
  };
}
