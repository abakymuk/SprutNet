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
        ports: [],
        data: [],
        total: 0,
      };
      return NextResponse.json(response);
    }

    // Проверяем флаги для использования Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    const realDataOnly = process.env.FEATURE_REAL_DATA_ONLY === 'true';

    if (!useMaerskAPI) {
      if (realDataOnly) {
        console.error('❌ Maersk API отключен, но включен режим только реальных данных');
        return NextResponse.json({
          success: false,
          error: 'Maersk API is disabled but real data only mode is enabled',
          details: 'Please enable FEATURE_MAERSK=true to use real data',
          ports: [],
          data: [],
          total: 0
        }, { status: 503 });
      }
      
      console.log('⚠️ Maersk API отключен, возвращаем мок-данные');
      return NextResponse.json(getMockPorts(query));
    }

    try {
      // Выполняем запрос к Maersk Locations API
      const locationsResponse = await Maersk.fetch('/reference-data/locations', {
        cache: true, // Используем кэш для оптимизации
        timeout: 10000, // 10 секунд timeout
        endpointType: 'ports',
        params: {}, // Locations API не принимает параметры query и limit
      });

      if (!locationsResponse.data || !Array.isArray(locationsResponse.data)) {
        console.error('❌ Неверный формат данных от Maersk API');
        return NextResponse.json(getMockPorts(query));
      }

      const locations: MaerskLocation[] = locationsResponse.data;
      console.log(`📊 Получено ${locations.length} локаций от Maersk API`);
      console.log('🔍 Первые 3 локации:', locations.slice(0, 3));

      // Фильтруем только порты
      const ports = filterPorts(locations);
      console.log(`🚢 Отфильтровано ${ports.length} портов`);
      console.log('🔍 Первые 3 порта:', ports.slice(0, 3));

      // Маппим данные в наш формат
      const portRefs: PortRef[] = ports.map(mapLocationToPortRef);

      // Выполняем поиск по запросу
      const searchResults = searchPorts(portRefs, query).slice(0, limit);

      console.log(`✅ Найдено ${searchResults.length} портов для запроса "${query}"`);

      const response: PortSearchResponse = {
        success: true,
        ports: searchResults,
        data: searchResults,
        total: searchResults.length,
      };

      return NextResponse.json(response);

    } catch (error: any) {
      console.error('❌ Ошибка при запросе к Maersk API:', error);
      
      // Если включен режим только реальных данных, возвращаем ошибку
      if (realDataOnly) {
        console.error('❌ Режим только реальных данных включен, возвращаем ошибку вместо fallback');
        return NextResponse.json({
          success: false,
          error: 'Unable to fetch real port data from Maersk API',
          details: realDataOnly ? 'Real data only mode is enabled' : 'API temporarily unavailable',
          ports: [],
          data: [],
          total: 0
        }, { status: 503 });
      }
      
      // Fallback на мок-данные при ошибке API (только если не включен режим реальных данных)
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
    // Китай
    { id: 'CNSHA', name: 'Shanghai', countryCode: 'CN', countryName: 'China', cityName: 'Shanghai', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNSZX', name: 'Shenzhen', countryCode: 'CN', countryName: 'China', cityName: 'Shenzhen', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNTAO', name: 'Qingdao', countryCode: 'CN', countryName: 'China', cityName: 'Qingdao', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNNGB', name: 'Ningbo', countryCode: 'CN', countryName: 'China', cityName: 'Ningbo', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNTXG', name: 'Tianjin', countryCode: 'CN', countryName: 'China', cityName: 'Tianjin', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNDAL', name: 'Dalian', countryCode: 'CN', countryName: 'China', cityName: 'Dalian', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNXMN', name: 'Xiamen', countryCode: 'CN', countryName: 'China', cityName: 'Xiamen', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CNGZG', name: 'Guangzhou', countryCode: 'CN', countryName: 'China', cityName: 'Guangzhou', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // США
    { id: 'USLAX', name: 'Los Angeles', countryCode: 'US', countryName: 'United States', cityName: 'Los Angeles', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USNYC', name: 'New York', countryCode: 'US', countryName: 'United States', cityName: 'New York', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USLGB', name: 'Long Beach', countryCode: 'US', countryName: 'United States', cityName: 'Long Beach', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USSAV', name: 'Savannah', countryCode: 'US', countryName: 'United States', cityName: 'Savannah', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USHOU', name: 'Houston', countryCode: 'US', countryName: 'United States', cityName: 'Houston', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USCHS', name: 'Charleston', countryCode: 'US', countryName: 'United States', cityName: 'Charleston', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USNWK', name: 'Newark', countryCode: 'US', countryName: 'United States', cityName: 'Newark', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USSEA', name: 'Seattle', countryCode: 'US', countryName: 'United States', cityName: 'Seattle', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'USOAK', name: 'Oakland', countryCode: 'US', countryName: 'United States', cityName: 'Oakland', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Европа
    { id: 'NLRTM', name: 'Rotterdam', countryCode: 'NL', countryName: 'Netherlands', cityName: 'Rotterdam', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'DEHAM', name: 'Hamburg', countryCode: 'DE', countryName: 'Germany', cityName: 'Hamburg', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'DEBRV', name: 'Bremerhaven', countryCode: 'DE', countryName: 'Germany', cityName: 'Bremerhaven', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'GBLGP', name: 'London Gateway', countryCode: 'GB', countryName: 'United Kingdom', cityName: 'London', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'GBFXT', name: 'Felixstowe', countryCode: 'GB', countryName: 'United Kingdom', cityName: 'Felixstowe', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'FRLEH', name: 'Le Havre', countryCode: 'FR', countryName: 'France', cityName: 'Le Havre', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'FRMRS', name: 'Marseille', countryCode: 'FR', countryName: 'France', cityName: 'Marseille', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ESVLC', name: 'Valencia', countryCode: 'ES', countryName: 'Spain', cityName: 'Valencia', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ESBCN', name: 'Barcelona', countryCode: 'ES', countryName: 'Spain', cityName: 'Barcelona', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ITGIT', name: 'Gioia Tauro', countryCode: 'IT', countryName: 'Italy', cityName: 'Gioia Tauro', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ITLIV', name: 'Livorno', countryCode: 'IT', countryName: 'Italy', cityName: 'Livorno', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'BEANR', name: 'Antwerp', countryCode: 'BE', countryName: 'Belgium', cityName: 'Antwerp', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'PLGDN', name: 'Gdansk', countryCode: 'PL', countryName: 'Poland', cityName: 'Gdansk', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Азия
    { id: 'SGSIN', name: 'Singapore', countryCode: 'SG', countryName: 'Singapore', cityName: 'Singapore', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'JPTYO', name: 'Tokyo', countryCode: 'JP', countryName: 'Japan', cityName: 'Tokyo', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'JPYOK', name: 'Yokohama', countryCode: 'JP', countryName: 'Japan', cityName: 'Yokohama', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'JPKOB', name: 'Kobe', countryCode: 'JP', countryName: 'Japan', cityName: 'Kobe', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'KRPUS', name: 'Busan', countryCode: 'KR', countryName: 'South Korea', cityName: 'Busan', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'KRINC', name: 'Incheon', countryCode: 'KR', countryName: 'South Korea', cityName: 'Incheon', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'TWKHH', name: 'Kaohsiung', countryCode: 'TW', countryName: 'Taiwan', cityName: 'Kaohsiung', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'HKHKG', name: 'Hong Kong', countryCode: 'HK', countryName: 'Hong Kong', cityName: 'Hong Kong', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'MYPNG', name: 'Port Klang', countryCode: 'MY', countryName: 'Malaysia', cityName: 'Port Klang', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'THLCH', name: 'Laem Chabang', countryCode: 'TH', countryName: 'Thailand', cityName: 'Laem Chabang', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'VNSGN', name: 'Ho Chi Minh City', countryCode: 'VN', countryName: 'Vietnam', cityName: 'Ho Chi Minh City', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'IDTPP', name: 'Tanjung Priok', countryCode: 'ID', countryName: 'Indonesia', cityName: 'Jakarta', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'PHMNL', name: 'Manila', countryCode: 'PH', countryName: 'Philippines', cityName: 'Manila', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Ближний Восток
    { id: 'AEDXB', name: 'Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', cityName: 'Dubai', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'AEJEA', name: 'Jebel Ali', countryCode: 'AE', countryName: 'United Arab Emirates', cityName: 'Jebel Ali', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'SAJED', name: 'Jeddah', countryCode: 'SA', countryName: 'Saudi Arabia', cityName: 'Jeddah', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'QAQAH', name: 'Hamad', countryCode: 'QA', countryName: 'Qatar', cityName: 'Doha', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Австралия и Океания
    { id: 'AUSYD', name: 'Sydney', countryCode: 'AU', countryName: 'Australia', cityName: 'Sydney', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'AUMEL', name: 'Melbourne', countryCode: 'AU', countryName: 'Australia', cityName: 'Melbourne', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'AUBRI', name: 'Brisbane', countryCode: 'AU', countryName: 'Australia', cityName: 'Brisbane', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'NZAKL', name: 'Auckland', countryCode: 'NZ', countryName: 'New Zealand', cityName: 'Auckland', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Америка
    { id: 'CAMTR', name: 'Montreal', countryCode: 'CA', countryName: 'Canada', cityName: 'Montreal', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CAVAN', name: 'Vancouver', countryCode: 'CA', countryName: 'Canada', cityName: 'Vancouver', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'MXVER', name: 'Veracruz', countryCode: 'MX', countryName: 'Mexico', cityName: 'Veracruz', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'MXMAN', name: 'Manzanillo', countryCode: 'MX', countryName: 'Mexico', cityName: 'Manzanillo', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'BRSSZ', name: 'Santos', countryCode: 'BR', countryName: 'Brazil', cityName: 'Santos', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'BRRIO', name: 'Rio de Janeiro', countryCode: 'BR', countryName: 'Brazil', cityName: 'Rio de Janeiro', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'CLVAP', name: 'Valparaiso', countryCode: 'CL', countryName: 'Chile', cityName: 'Valparaiso', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'PECLL', name: 'Callao', countryCode: 'PE', countryName: 'Peru', cityName: 'Lima', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'COBUN', name: 'Buenaventura', countryCode: 'CO', countryName: 'Colombia', cityName: 'Buenaventura', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Африка
    { id: 'ZADUR', name: 'Durban', countryCode: 'ZA', countryName: 'South Africa', cityName: 'Durban', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ZACPT', name: 'Cape Town', countryCode: 'ZA', countryName: 'South Africa', cityName: 'Cape Town', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'EGALY', name: 'Alexandria', countryCode: 'EG', countryName: 'Egypt', cityName: 'Alexandria', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'EGPSD', name: 'Port Said', countryCode: 'EG', countryName: 'Egypt', cityName: 'Port Said', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'KENAI', name: 'Mombasa', countryCode: 'KE', countryName: 'Kenya', cityName: 'Mombasa', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'NGTIN', name: 'Lagos', countryCode: 'NG', countryName: 'Nigeria', cityName: 'Lagos', type: PortType.SEAPORT, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

      if (!query.trim()) {
      return {
        success: true,
        ports: [],
        data: [],
        total: 0,
      };
    }

  const filteredPorts = searchPorts(mockPorts, query);
  
  return {
    success: true,
    ports: filteredPorts,
    data: filteredPorts,
    total: filteredPorts.length,
  };
}
