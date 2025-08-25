import { NextRequest, NextResponse } from 'next/server';
import { telemetryLogger } from '@/lib/telemetry/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'events':
        const events = telemetryLogger.getEvents();
        return NextResponse.json({
          success: true,
          data: {
            events,
            count: events.length,
            timestamp: new Date().toISOString(),
          },
        });
        
      case 'export':
        const exportData = telemetryLogger.exportEvents();
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="telemetry-events.json"',
          },
        });
        
      case 'clear':
        telemetryLogger.clearEvents();
        return NextResponse.json({
          success: true,
          message: 'Events cleared successfully',
        });
        
      case 'stats':
        const allEvents = telemetryLogger.getEvents();
        const stats = {
          totalEvents: allEvents.length,
          eventsByType: {} as Record<string, number>,
          recentEvents: allEvents.slice(-10),
          sessionCount: new Set(allEvents.map(e => e.sessionId)).size,
          timeRange: {
            first: allEvents[0]?.timestamp,
            last: allEvents[allEvents.length - 1]?.timestamp,
          },
        };
        
        // Подсчет событий по типам
        allEvents.forEach(event => {
          stats.eventsByType[event.event] = (stats.eventsByType[event.event] || 0) + 1;
        });
        
        return NextResponse.json({
          success: true,
          data: stats,
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: events, export, clear, or stats',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Telemetry API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, userId } = body;
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event type is required',
      }, { status: 400 });
    }
    
    telemetryLogger.logEvent(event, data, userId);
    
    return NextResponse.json({
      success: true,
      message: 'Event logged successfully',
    });
  } catch (error) {
    console.error('Telemetry POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
