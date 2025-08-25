"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  Calendar,
  TrendingUp,
  Ship,
  MapPin,
  BarChart3,
  Activity,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
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
  routeEfficiency: number;
  capacityUtilization: number;
}

export function LaneInsights({
  sailings,
  originPort,
  destinationPort,
}: LaneInsightsProps) {
  const [hoveredSailing, setHoveredSailing] = useState<string | null>(null);

  const metrics = useMemo((): LaneMetrics => {
    if (!sailings.length) {
      return {
        avgTransitTime: 0,
        sailingsPerWeek: 0,
        totalSailings: 0,
        reliability: 0,
        nextSailings: [],
        routeEfficiency: 0,
        capacityUtilization: 0,
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

    // Вычисляем частоту рейсов в неделю (за последние 4 недели)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const recentSailings = sailings.filter((s) => {
      const departureDate = new Date(s.departureDate);
      return departureDate >= fourWeeksAgo;
    });

    const sailingsPerWeek = Math.round((recentSailings.length / 4) * 10) / 10;

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

    // Вычисляем эффективность маршрута (на основе времени транзита и частоты)
    const routeEfficiency = Math.min(
      100,
      Math.round(
        (100 - avgTransitTime * 2 + sailingsPerWeek * 10 + reliability) / 3
      )
    );

    // Вычисляем утилизацию вместимости
    const capacityUtilization =
      sailings.length > 0
        ? Math.round(
            (sailings.reduce((sum, s) => sum + (s.availableCapacity || 0), 0) /
              sailings.reduce((sum, s) => sum + (s.totalCapacity || 2000), 0)) *
              100
          )
        : 0;

    return {
      avgTransitTime,
      sailingsPerWeek,
      totalSailings: sailings.length,
      reliability,
      nextSailings,
      routeEfficiency,
      capacityUtilization,
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
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Нет данных для анализа. Выполните поиск рейсов.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600";
    if (efficiency >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 80)
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (efficiency >= 60) return <Target className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Route Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Маршрут {originPort} → {destinationPort}
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Ship className="h-3 w-3" />
                {metrics.totalSailings} рейсов
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Средний транзит
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {metrics.avgTransitTime}
              </div>
              <p className="text-xs text-muted-foreground">дней</p>
              <Progress
                value={Math.min(100, (metrics.avgTransitTime / 30) * 100)}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Частота рейсов
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.sailingsPerWeek}
              </div>
              <p className="text-xs text-muted-foreground">рейсов/неделю</p>
              <div className="flex items-center gap-1 mt-2">
                <Zap className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">
                  {metrics.sailingsPerWeek >= 3
                    ? "Высокая"
                    : metrics.sailingsPerWeek >= 1
                      ? "Средняя"
                      : "Низкая"}{" "}
                  частота
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Надежность</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.reliability}%
              </div>
              <Progress value={metrics.reliability} className="mt-2" />
              <p className="text-xs text-muted-foreground">
                рейсов без задержек
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Эффективность
              </CardTitle>
              {getEfficiencyIcon(metrics.routeEfficiency)}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getEfficiencyColor(metrics.routeEfficiency)}`}
              >
                {metrics.routeEfficiency}%
              </div>
              <Progress value={metrics.routeEfficiency} className="mt-2" />
              <p className="text-xs text-muted-foreground">общий показатель</p>
            </CardContent>
          </Card>
        </div>

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
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {metrics.nextSailings.map((sailing, index) => (
                    <Tooltip key={sailing.id || index}>
                      <TooltipTrigger asChild>
                        <div
                          className="relative flex items-center gap-4 cursor-pointer group"
                          onMouseEnter={() =>
                            setHoveredSailing(sailing.id || index.toString())
                          }
                          onMouseLeave={() => setHoveredSailing(null)}
                        >
                          {/* Timeline dot */}
                          <div
                            className={`relative z-10 w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                              hoveredSailing ===
                              (sailing.id || index.toString())
                                ? "bg-primary border-primary scale-125"
                                : "bg-background border-primary"
                            }`}
                          />

                          {/* Sailing info */}
                          <div className="flex-1 flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <p className="font-medium">
                                  {new Date(
                                    sailing.departureDate
                                  ).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {sailing.vessel?.name || "Судно не указано"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium text-primary">
                                  {sailing.transitTime} дней
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    sailing.arrivalDate
                                  ).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">
                            {sailing.vessel?.name || "Судно не указано"}
                          </p>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Отправление:</strong>{" "}
                              {new Date(sailing.departureDate).toLocaleString(
                                "ru-RU"
                              )}
                            </p>
                            <p>
                              <strong>Прибытие:</strong>{" "}
                              {new Date(sailing.arrivalDate).toLocaleString(
                                "ru-RU"
                              )}
                            </p>
                            <p>
                              <strong>Время в пути:</strong>{" "}
                              {sailing.transitTime} дней
                            </p>
                            {sailing.rates?.[0] && (
                              <p>
                                <strong>Стоимость:</strong>{" "}
                                {sailing.rates[0].totalCost}{" "}
                                {sailing.rates[0].currency}
                              </p>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route Summary */}
        <Card className="bg-gradient-to-r from-muted/50 to-background">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Общая оценка</p>
                <p
                  className={`text-lg font-bold ${getEfficiencyColor(metrics.routeEfficiency)}`}
                >
                  {metrics.routeEfficiency >= 80
                    ? "Отлично"
                    : metrics.routeEfficiency >= 60
                      ? "Хорошо"
                      : "Требует внимания"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Рекомендация</p>
                <p className="text-lg font-bold text-primary">
                  {metrics.sailingsPerWeek >= 3
                    ? "Стабильный маршрут"
                    : metrics.sailingsPerWeek >= 1
                      ? "Умеренная частота"
                      : "Редкие рейсы"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Риск</p>
                <p
                  className={`text-lg font-bold ${
                    metrics.reliability >= 90
                      ? "text-green-600"
                      : metrics.reliability >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {metrics.reliability >= 90
                    ? "Низкий"
                    : metrics.reliability >= 70
                      ? "Средний"
                      : "Высокий"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
