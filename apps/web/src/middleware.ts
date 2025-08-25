import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitorDB } from '@/lib/monitoring/performance-db';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const response = NextResponse.next();

  // Отслеживаем только API запросы
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Получаем информацию о запросе
      const endpoint = request.nextUrl.pathname;
      const method = request.method;
      const userAgent = request.headers.get('user-agent') || '';
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
      const sessionId = request.headers.get('x-session-id') || '';

      // Ждем завершения запроса
      await new Promise<void>((resolve) => {
        response.headers.set('x-response-time', '0');
        resolve();
      });

      // Вычисляем время ответа
      const responseTime = Date.now() - startTime;
      response.headers.set('x-response-time', responseTime.toString());

      // Записываем метрику в базу данных
      await performanceMonitorDB.recordMetric({
        endpoint,
        method,
        status_code: response.status,
        response_time_ms: responseTime,
        user_agent: userAgent,
        ip_address: ipAddress,
        session_id: sessionId,
        api_provider: 'internal',
        endpoint_type: 'api',
      });

    } catch (error) {
      console.error('❌ Error in performance monitoring middleware:', error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
