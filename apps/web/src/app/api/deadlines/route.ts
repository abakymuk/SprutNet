import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sailingId = searchParams.get('sailingId');
    const vesselImo = searchParams.get('vesselImo');
    const voyage = searchParams.get('voyage');

    console.log("🔍 Deadlines API called with:", { sailingId, vesselImo, voyage });

    if (!sailingId && !vesselImo && !voyage) {
      return NextResponse.json(
        { error: 'Необходимо указать sailingId, vesselImo или voyage' },
        { status: 400 }
      );
    }

    // Для демонстрации всегда возвращаем mock данные
    const mockDeadlines = generateMockDeadlines(sailingId);
    
    console.log("📅 Returning mock deadlines:", mockDeadlines);
    
    return NextResponse.json({
      deadlines: mockDeadlines,
      total: mockDeadlines.length,
      source: 'mock'
    });

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
