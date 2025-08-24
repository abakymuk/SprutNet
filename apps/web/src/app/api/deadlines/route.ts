import { NextResponse } from 'next/server';
import { Maersk } from '@/lib/maersk';
import { 
  mapMaerskDeadlineToDeadline, 
  validateDeadlineSearchParams,
  type MaerskDeadlineSearchParams,
  type MaerskDeadlineResponse 
} from '@/lib/types/deadlines';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sailingId = searchParams.get('sailingId');
    const vesselImo = searchParams.get('vesselImo');
    const voyage = searchParams.get('voyage');
    const portOfLoad = searchParams.get('portOfLoad');
    const isoCountryCode = searchParams.get('isoCountryCode');

    console.log("🔍 Deadlines API called with:", { sailingId, vesselImo, voyage, portOfLoad, isoCountryCode });

    // Проверяем флаг для использования Maersk API
    const useMaerskAPI = process.env.FEATURE_MAERSK === 'true';

    if (useMaerskAPI && vesselImo && voyage && portOfLoad && isoCountryCode) {
      // Сначала валидируем параметры
      const maerskParams: MaerskDeadlineSearchParams = {
        ISOCountryCode: isoCountryCode,
        portOfLoad,
        vesselIMONumber: vesselImo,
        voyage,
        limit: 50,
      };

      // Валидируем параметры
      const validationErrors = validateDeadlineSearchParams(maerskParams);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: `Validation errors: ${validationErrors.join(', ')}` },
          { status: 400 }
        );
      }
      try {
        console.log('⏰ Запрос к Maersk Deadlines API:', { vesselImo, voyage, portOfLoad, isoCountryCode });



        // Выполняем запрос к Maersk API
        const queryParams = new URLSearchParams({
          ISOCountryCode: maerskParams.ISOCountryCode,
          portOfLoad: maerskParams.portOfLoad,
          vesselIMONumber: maerskParams.vesselIMONumber,
          voyage: maerskParams.voyage,
          limit: maerskParams.limit?.toString() || '50',
        });

        const maerskResponse = await Maersk.fetch(`/shipment-deadlines?${queryParams}`, {
          method: 'GET',
          cache: true,
          timeout: 15000,
        });

        console.log('📊 Ответ от Maersk Deadlines API:', maerskResponse);

        if (!maerskResponse.data || !maerskResponse.data.shipmentDeadlines) {
          console.warn('⚠️ Неверный формат данных от Maersk API, используем fallback');
          throw new Error('Invalid Maersk API response format');
        }

        const maerskData: MaerskDeadlineResponse = maerskResponse.data;
        const deadlines = maerskData.shipmentDeadlines.deadlines.map(deadline =>
          mapMaerskDeadlineToDeadline(
            deadline,
            maerskData.shipmentDeadlines.terminalName,
            sailingId || 'unknown',
            portOfLoad,
            'UTC' // По умолчанию UTC, можно улучшить определение timezone
          )
        );

        console.log('✅ Успешно получены дедлайны от Maersk API:', deadlines.length);

        return NextResponse.json({
          deadlines,
          total: deadlines.length,
          source: 'maersk',
          terminalName: maerskData.shipmentDeadlines.terminalName
        });

      } catch (error: any) {
        console.error('❌ Ошибка при запросе к Maersk API:', error);
        
        // Fallback на mock данные
        console.log('🔄 Используем fallback на mock данные');
        const mockDeadlines = generateMockDeadlines(sailingId);
        
        return NextResponse.json({
          deadlines: mockDeadlines,
          total: mockDeadlines.length,
          source: 'mock (fallback)',
          error: error.message
        });
      }
    } else {
      // Используем mock данные если Maersk API не включен или нет необходимых параметров
      console.log('📅 Используем mock данные (Maersk API не включен или недостаточно параметров)');
      const mockDeadlines = generateMockDeadlines(sailingId);
      
      return NextResponse.json({
        deadlines: mockDeadlines,
        total: mockDeadlines.length,
        source: 'mock'
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при получении дедлайнов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении дедлайнов' },
      { status: 500 }
    );
  }
}

// Вспомогательные функции
function getDeadlineType(deadlineName: string): string {
  const name = deadlineName.toLowerCase();
  
  if (name.includes('doc') || name.includes('document')) return 'DOC';
  if (name.includes('cy') || name.includes('yard')) return 'CY';
  if (name.includes('vgm') || name.includes('weight')) return 'VGM';
  if (name.includes('customs') || name.includes('таможня')) return 'CUSTOMS';
  if (name.includes('booking') || name.includes('бронирование')) return 'BOOKING';
  if (name.includes('gate in') || name.includes('въезд')) return 'GATE_IN';
  if (name.includes('gate out') || name.includes('выезд')) return 'GATE_OUT';
  if (name.includes('loading') || name.includes('погрузка')) return 'LOADING';
  
  return 'OTHER';
}

function getDeadlineDescription(deadlineName: string): string {
  const name = deadlineName.toLowerCase();
  
  if (name.includes('doc')) return 'Подготовка и подача документов';
  if (name.includes('cy')) return 'Доставка контейнера на терминал';
  if (name.includes('vgm')) return 'Подтверждение веса груза';
  if (name.includes('customs')) return 'Таможенное оформление';
  if (name.includes('booking')) return 'Подтверждение бронирования';
  if (name.includes('gate in')) return 'Въезд на терминал';
  if (name.includes('gate out')) return 'Выезд с терминала';
  if (name.includes('loading')) return 'Погрузка на судно';
  
  return 'Важный дедлайн для рейса';
}

function getDeadlineStatus(deadlineDate: Date | null): string {
  if (!deadlineDate) return 'UPCOMING';
  
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 0) return 'OVERDUE';
  if (diffHours < 24) return 'DUE_SOON';
  if (diffHours < 72) return 'UPCOMING';
  return 'COMPLETED';
}

function generateMockDeadlines(sailingId: string | null) {
  const now = new Date();
  const baseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Завтра
  
  // Создаем разные дедлайны в зависимости от sailingId для разнообразия
  const deadlines = [
    {
      id: '1',
      name: 'Documents Cut-off',
      type: 'DOC',
      deadlineLocal: new Date(baseDate.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      description: 'Подготовка и подача документов',
      status: 'UPCOMING'
    },
    {
      id: '2',
      name: 'Container Yard Cut-off',
      type: 'CY',
      deadlineLocal: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      description: 'Доставка контейнера на терминал',
      status: 'DUE_SOON'
    },
    {
      id: '3',
      name: 'VGM Cut-off',
      type: 'VGM',
      deadlineLocal: new Date(baseDate.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      description: 'Подтверждение веса груза',
      status: 'DUE_SOON'
    },
    {
      id: '4',
      name: 'Customs Clearance',
      type: 'CUSTOMS',
      deadlineLocal: new Date(baseDate.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      description: 'Таможенное оформление',
      status: 'OVERDUE'
    },
    {
      id: '5',
      name: 'Gate In',
      type: 'GATE_IN',
      deadlineLocal: new Date(baseDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'Въезд на терминал',
      status: 'OVERDUE'
    },
    {
      id: '6',
      name: 'Loading',
      type: 'LOADING',
      deadlineLocal: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      description: 'Погрузка на судно',
      status: 'UPCOMING'
    }
  ];

  // Добавляем дополнительные дедлайны для некоторых рейсов
  if (sailingId && sailingId.includes('SAIL-001')) {
    deadlines.push({
      id: '7',
      name: 'Booking Confirmation',
      type: 'BOOKING',
      deadlineLocal: new Date(baseDate.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      description: 'Подтверждение бронирования',
      status: 'COMPLETED'
    });
  }

  return deadlines;
}
