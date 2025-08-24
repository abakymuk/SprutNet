import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const originPortId = searchParams.get('originPortId');
    const destinationPortId = searchParams.get('destinationPortId');

    if (!originPortId || !destinationPortId) {
      return NextResponse.json(
        { error: 'Необходимо указать originPortId и destinationPortId' },
        { status: 400 }
      );
    }

    // Получаем все рейсы для данного направления через TransportLeg
    const transportLegs = await prisma.transportLeg.findMany({
      where: {
        facilities: {
          some: {
            carrierSiteGeoId: {
              in: [originPortId, destinationPortId]
            }
          }
        }
      },
      include: {
        facilities: true,
        transports: {
          include: {
            vessel: true
          }
        }
      },
      orderBy: {
        departureDateTime: 'desc',
      },
    });

    // Преобразуем данные в формат Sailing
    const sailings = transportLegs.map(leg => {
      const originFacility = leg.facilities.find(f => f.carrierSiteGeoId === originPortId);
      const destinationFacility = leg.facilities.find(f => f.carrierSiteGeoId === destinationPortId);
      const transport = leg.transports[0];

      if (!originFacility || !destinationFacility || !transport) return null;

      // Вычисляем время транзита
      const transitTime = leg.departureDateTime && leg.arrivalDateTime 
        ? Math.ceil((new Date(leg.arrivalDateTime).getTime() - new Date(leg.departureDateTime).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        id: leg.id,
        carrierCode: transport.carrierCode || '',
        carrierName: transport.carrierServiceName || '',
        voyageNumber: transport.carrierDepartureVoyageNumber || '',
        originPort: {
          id: originFacility.carrierSiteGeoId,
          name: originFacility.locationName || '',
          code: originFacility.carrierSiteGeoId
        },
        destinationPort: {
          id: destinationFacility.carrierSiteGeoId,
          name: destinationFacility.locationName || '',
          code: destinationFacility.carrierSiteGeoId
        },
        departureDate: leg.departureDateTime || new Date(),
        arrivalDate: leg.arrivalDateTime || new Date(),
        transitTime,
        delay: 0, // По умолчанию нет задержек
        vessel: transport.vessel ? {
          imoNumber: transport.vessel.id.toString(),
          name: transport.vesselName || transport.vessel.vesselLongName || '',
          carrierCode: transport.carrierVesselCode || '',
          capacity: transport.vessel.vesselCapacityTeu || 0,
          builtYear: transport.vessel.vessel_built_year || 0,
          flag: transport.vessel.vesselFlagCode || ''
        } : undefined,
        route: {
          id: leg.id,
          name: transport.carrierTradeLaneName || '',
          waypoints: [],
          duration: transitTime || 0,
          distance: 0
        },
        rates: [],
        deadlines: [],
        createdAt: leg.createdAt || new Date(),
        updatedAt: leg.updatedAt || new Date()
      };
    }).filter(Boolean) as any[];

    // Вычисляем аналитические метрики
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Среднее время транзита
    const transitTimes = sailings
      .filter(s => s.transitTime)
      .map(s => s.transitTime!);
    
    const avgTransitTime = transitTimes.length > 0 
      ? Math.round(transitTimes.reduce((sum, time) => sum + time, 0) / transitTimes.length)
      : 0;

    // Частота рейсов в неделю (за последние 4 недели)
    const recentSailings = sailings.filter(s => {
      const departureDate = new Date(s.departureDate);
      return departureDate >= fourWeeksAgo;
    });

    const sailingsPerWeek = recentSailings.length / 4;

    // Надежность (процент рейсов без задержек)
    const onTimeSailings = sailings.filter(s => !s.delay || s.delay === 0).length;
    const reliability = sailings.length > 0 
      ? Math.round((onTimeSailings / sailings.length) * 100)
      : 0;

    // Ближайшие 5 рейсов
    const nextSailings = sailings
      .filter(s => new Date(s.departureDate) >= now)
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
      .slice(0, 5);

    // Статистика по месяцам
    const monthlyStats = sailings.reduce((acc, sailing) => {
      const month = new Date(sailing.departureDate).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, avgTransit: 0, totalTransit: 0 };
      }
      acc[month].count++;
      if (sailing.transitTime) {
        acc[month].totalTransit += sailing.transitTime;
      }
      return acc;
    }, {} as Record<string, { count: number; avgTransit: number; totalTransit: number }>);

    // Вычисляем средние значения для каждого месяца
    Object.keys(monthlyStats).forEach(month => {
      if (monthlyStats[month].count > 0) {
        monthlyStats[month].avgTransit = Math.round(monthlyStats[month].totalTransit / monthlyStats[month].count);
      }
    });

    const insights = {
      avgTransitTime,
      sailingsPerWeek: Math.round(sailingsPerWeek * 10) / 10, // Округляем до 1 знака
      totalSailings: sailings.length,
      reliability,
      nextSailings,
      monthlyStats,
      originPort: sailings[0]?.originPort,
      destinationPort: sailings[0]?.destinationPort,
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('❌ Ошибка при получении аналитики направления:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аналитики направления' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
