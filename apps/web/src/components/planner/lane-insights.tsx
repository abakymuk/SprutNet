"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Calendar,
  TrendingUp,
  Ship,
  MapPin,
  BarChart3,
  Activity,
} from "lucide-react";
import type { Sailing } from "@sprutnet/shared/types";

interface LaneInsightsProps {
  sailings: Sailing[];
  originPort?: string;
  destinationPort?: string;
}

interface LaneMetrics {
  avgTransitTime: number;
  sailingsPerWeek: number;
  totalSailings: number;
  reliability: number;
  nextSailings: Sailing[];
}

export function LaneInsights({
  sailings,
  originPort,
  destinationPort,
}: LaneInsightsProps) {
  const metrics = useMemo((): LaneMetrics => {
    if (!sailings.length) {
      return {
        avgTransitTime: 0,
        sailingsPerWeek: 0,
        totalSailings: 0,
        reliability: 0,
        nextSailings: [],
      };
    }

    // Вычисляем среднее время транзита
    const transitTimes = sailings
      .filter((s) => s.transitTime)
      .map((s) => s.transitTime!);

    const avgTransitTime =
      transitTimes.length > 0
        ? Math.round(
            transitTimes.reduce((sum, time) => sum + time, 0) /
              transitTimes.length
          )
        : 0;

    // Вычисляем частоту рейсов в неделю
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const recentSailings = sailings.filter((s) => {
      const departureDate = new Date(s.departureDate);
      return departureDate >= fourWeeksAgo;
    });

    const sailingsPerWeek = recentSailings.length / 4;

    // Вычисляем надежность (процент рейсов без задержек)
    const onTimeSailings = sailings.filter(
      (s) => !s.delay || s.delay === 0
    ).length;
    const reliability =
      sailings.length > 0
        ? Math.round((onTimeSailings / sailings.length) * 100)
        : 0;

    // Получаем ближайшие 5 рейсов
    const nextSailings = sailings
      .filter((s) => new Date(s.departureDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.departureDate).getTime() -
          new Date(b.departureDate).getTime()
      )
      .slice(0, 5);

    return {
      avgTransitTime,
      sailingsPerWeek,
      totalSailings: sailings.length,
      reliability,
      nextSailings,
    };
  }, [sailings]);

  if (!sailings.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Аналитика направления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Нет данных для анализа. Выполните поиск рейсов.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Средний транзит
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgTransitTime}</div>
            <p className="text-xs text-muted-foreground">дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Частота рейсов
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.sailingsPerWeek.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">рейсов/неделю</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Надежность</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reliability}%</div>
            <Progress value={metrics.reliability} className="mt-2" />
            <p className="text-xs text-muted-foreground">рейсов без задержек</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего рейсов</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSailings}</div>
            <p className="text-xs text-muted-foreground">в направлении</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Маршрут
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {originPort || "Порт отправления"}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline">
                {destinationPort || "Порт назначения"}
              </Badge>
            </div>
            <Badge variant="secondary">{metrics.totalSailings} рейсов</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {metrics.nextSailings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Ближайшие рейсы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.nextSailings.map((sailing, index) => (
                <div key={sailing.id || index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        {index < metrics.nextSailings.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-1" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(sailing.departureDate).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sailing.vessel?.name || "Судно не указано"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sailing.transitTime} дней</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sailing.arrivalDate).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {index < metrics.nextSailings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
