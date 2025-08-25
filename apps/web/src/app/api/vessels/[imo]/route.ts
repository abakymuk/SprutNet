import { NextRequest, NextResponse } from 'next/server';
import { Maersk } from '@/lib/maersk';
import { 
  mapMaerskVesselToVesselBrief,
  validateVesselSearchParams,
  type MaerskVesselSearchParams,
  type MaerskVesselResponse 
} from '@/lib/types/vessels';

/**
 * GET /api/vessels/[imo]
 * Получение информации о судне по IMO номеру
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imo: string }> }
) {
  try {
    const { imo } = await params;
    
    console.log("🚢 Vessels API called with IMO:", imo);

    // Валидация IMO
    if (!imo || !/^\d{7}$/.test(imo)) {
      return NextResponse.json(
        { 
          error: 'IMO must be a 7-digit number',
          details: `Received IMO: "${imo}" (length: ${imo?.length || 0})`,
          expected: '7-digit number (e.g., "1234567")'
        },
        { status: 400 }
      );
    }

    // Дополнительная проверка для некорректных IMO номеров
    if (imo === "0000000") {
      return NextResponse.json(
        { 
          error: 'Invalid IMO number',
          details: 'IMO "0000000" is not a valid vessel identifier',
          expected: '7-digit number (e.g., "1234567")'
        },
        { status: 400 }
      );
    }

    // Проверяем флаги для использования Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';
    const realDataOnly = process.env.FEATURE_REAL_DATA_ONLY === 'true';

    if (useMaerskAPI) {
      try {
        console.log('🚢 Запрос к Maersk Vessels API:', { imo });

        // Подготавливаем параметры для Maersk API
        const maerskParams: MaerskVesselSearchParams = {
          vesselIMONumbers: [parseInt(imo)],
          limit: 1,
        };

        // Валидируем параметры
        const validationErrors = validateVesselSearchParams(maerskParams);
        if (validationErrors.length > 0) {
          return NextResponse.json(
            { error: `Validation errors: ${validationErrors.join(', ')}` },
            { status: 400 }
          );
        }

        // Выполняем запрос к Maersk API
        const queryParams = new URLSearchParams();
        queryParams.append('vesselIMONumbers', imo);
        queryParams.append('limit', '1');

        const maerskResponse = await Maersk.fetch(`/reference-data/vessels?${queryParams}`, {
          method: 'GET',
          cache: true,
          timeout: 15000,
          endpointType: 'vessels',
          params: { imo, limit: 1 },
        });

        console.log('📊 Ответ от Maersk Vessels API:', maerskResponse);

        if (!maerskResponse.data || !Array.isArray(maerskResponse.data)) {
          console.warn('⚠️ Неверный формат данных от Maersk API, используем fallback');
          throw new Error('Invalid Maersk API response format');
        }

        const vessels = maerskResponse.data;
        
        if (vessels.length === 0) {
          return NextResponse.json(
            { error: 'Vessel not found' },
            { status: 404 }
          );
        }

        const vesselBrief = mapMaerskVesselToVesselBrief(vessels[0]);

        console.log('✅ Успешно получена информация о судне от Maersk API');

        return NextResponse.json({
          imo: vesselBrief.imo,
          name: vesselBrief.name,
          vessel: vesselBrief,
          source: 'maersk'
        });

      } catch (error: any) {
        console.error('❌ Ошибка при запросе к Maersk API:', error);
        
        // Если включен режим только реальных данных, возвращаем ошибку
        if (realDataOnly) {
          console.error('❌ Режим только реальных данных включен, возвращаем ошибку вместо fallback');
          return NextResponse.json({
            error: 'Unable to fetch real vessel data from Maersk API',
            details: realDataOnly ? 'Real data only mode is enabled' : 'API temporarily unavailable',
            source: 'error',
            imo: imo
          }, { status: 503 });
        }
        
        // Fallback на mock данные (только если не включен режим реальных данных)
        console.log('🔄 Используем fallback на mock данные');
        const mockVessel = generateMockVessel(imo);
        
        return NextResponse.json({
          imo: mockVessel.imo,
          name: mockVessel.name,
          vessel: mockVessel,
          source: 'mock (fallback)',
          error: error.message
        });
      }
    } else {
      // Maersk API отключен
      if (realDataOnly) {
        console.error('❌ Maersk API отключен, но включен режим только реальных данных');
        return NextResponse.json({
          error: 'Maersk API is disabled but real data only mode is enabled',
          details: 'Please enable FEATURE_MAERSK=true to use real data',
          source: 'error',
          imo: imo
        }, { status: 503 });
      }
      
      // Используем mock данные если Maersk API не включен (только если не включен режим реальных данных)
      console.log('📅 Используем mock данные (Maersk API не включен)');
      const mockVessel = generateMockVessel(imo);
      
      return NextResponse.json({
        imo: mockVessel.imo,
        name: mockVessel.name,
        vessel: mockVessel,
        source: 'mock'
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при получении информации о судне:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении информации о судне' },
      { status: 500 }
    );
  }
}

/**
 * Генерация mock данных о судне
 */
function generateMockVessel(imo: string) {
  const mockVessels = [
    {
      imo,
      name: 'MAERSK SEVILLE',
      operator: 'MAEU',
      size: 15000,
      flag: 'DK',
      builtYear: 2018
    },
    {
      imo,
      name: 'MAERSK SHANGHAI',
      operator: 'MAEU',
      size: 18000,
      flag: 'DK',
      builtYear: 2020
    },
    {
      imo,
      name: 'MAERSK HAMBURG',
      operator: 'MAEU',
      size: 12000,
      flag: 'DK',
      builtYear: 2019
    }
  ];

  // Выбираем случайное судно или первое если IMO совпадает
  const index = parseInt(imo) % mockVessels.length;
  return mockVessels[index];
}
