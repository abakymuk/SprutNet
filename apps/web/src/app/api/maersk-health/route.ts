import { NextRequest, NextResponse } from 'next/server';
import { maerskHealthMonitor } from '@/lib/monitoring/maersk-health';

/**
 * GET /api/maersk-health
 * Получение статуса здоровья Maersk API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (action) {
      case 'status':
        const currentStatus = maerskHealthMonitor.getCurrentStatus();
        return NextResponse.json({
          success: true,
          data: currentStatus,
          monitoring: maerskHealthMonitor.isMonitoring(),
        });

      case 'metrics':
        const metrics = maerskHealthMonitor.getMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case 'history':
        const history = maerskHealthMonitor.getHistory(limit);
        return NextResponse.json({
          success: true,
          data: history,
          count: history.length,
        });

      case 'check':
        // Принудительная проверка
        const healthCheck = await maerskHealthMonitor.forceHealthCheck();
        return NextResponse.json({
          success: true,
          data: healthCheck,
        });

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие. Доступные: status, metrics, history, check' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Ошибка в API мониторинга Maersk:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статуса здоровья' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/maersk-health
 * Управление мониторингом
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'start':
        await maerskHealthMonitor.startMonitoring();
        return NextResponse.json({
          success: true,
          message: 'Мониторинг Maersk API запущен',
        });

      case 'stop':
        maerskHealthMonitor.stopMonitoring();
        return NextResponse.json({
          success: true,
          message: 'Мониторинг Maersk API остановлен',
        });

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие. Доступные: start, stop' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Ошибка в управлении мониторингом Maersk:', error);
    return NextResponse.json(
      { error: 'Ошибка при управлении мониторингом' },
      { status: 500 }
    );
  }
}
