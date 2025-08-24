"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Ship,
  Calendar,
  Clock,
  MapPin,
  Star,
  Zap,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { differenceInDays } from "date-fns";
import type { Sailing } from "@sprutnet/shared/types";

interface SailingResultsProps {
  sailings: Sailing[];
  isLoading: boolean;
  hasSearched: boolean;
}

type SortOption = "earliest" | "shortest" | "best";

export function SailingResults({
  sailings,
  isLoading,
  hasSearched,
}: SailingResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("earliest");

  // Sorting logic
  const sortedSailings = useMemo(() => {
    if (!sailings.length) return [];

    const sorted = [...sailings].sort((a, b) => {
      switch (sortBy) {
        case "earliest":
          return (
            new Date(a.departureDate).getTime() -
            new Date(b.departureDate).getTime()
          );
        case "shortest":
          return a.route.duration - b.route.duration;
        case "best":
          // Best sailing: balance between speed and cost
          const aScore =
            a.route.duration * 0.6 + (a.rates[0]?.totalCost || 0) * 0.4;
          const bScore =
            b.route.duration * 0.6 + (b.rates[0]?.totalCost || 0) * 0.4;
          return aScore - bScore;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sailings, sortBy]);

  // Determine best sailings for highlighting
  const earliestSailing = sortedSailings[0];
  const shortestSailing = [...sailings].sort(
    (a, b) => a.route.duration - b.route.duration
  )[0];
  const bestSailing = sortedSailings[0]; // Already sorted by best

  const getSailingBadge = (sailing: Sailing) => {
    if (sailing.id === earliestSailing?.id && sortBy === "earliest") {
      return {
        label: "Самый ранний",
        icon: Calendar,
        variant: "default" as const,
      };
    }
    if (sailing.id === shortestSailing?.id && sortBy === "shortest") {
      return {
        label: "Самый быстрый",
        icon: Zap,
        variant: "secondary" as const,
      };
    }
    if (sailing.id === bestSailing?.id && sortBy === "best") {
      return { label: "Лучший выбор", icon: Star, variant: "default" as const };
    }
    return null;
  };

  const calculateTransitDays = (departureDate: Date, arrivalDate: Date) => {
    return differenceInDays(new Date(arrivalDate), new Date(departureDate));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Поиск рейсов...</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <Ship className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Начните поиск рейсов
        </h3>
        <p className="text-muted-foreground">
          Выберите порты отправления и назначения, чтобы найти доступные рейсы
        </p>
      </div>
    );
  }

  if (sailings.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Рейсы не найдены
        </h3>
        <p className="text-muted-foreground">
          Попробуйте изменить параметры поиска или даты
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Найдено рейсов: {sailings.length}
          </h2>
          <p className="text-muted-foreground">
            Выберите подходящий рейс для вашего груза
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === "earliest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("earliest")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Самый ранний
          </Button>
          <Button
            variant={sortBy === "shortest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("shortest")}
          >
            <Zap className="h-4 w-4 mr-1" />
            Самый быстрый
          </Button>
          <Button
            variant={sortBy === "best" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("best")}
          >
            <Star className="h-4 w-4 mr-1" />
            Лучший выбор
          </Button>
        </div>
      </div>

      <Separator />

      {/* Results Grid */}
      <div className="grid gap-6">
        {sortedSailings.map((sailing) => {
          const badge = getSailingBadge(sailing);
          const transitDays = calculateTransitDays(
            sailing.departureDate,
            sailing.arrivalDate
          );
          const mainRate = sailing.rates[0];

          return (
            <Card
              key={sailing.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {sailing.carrierName} - {sailing.voyageNumber}
                      </CardTitle>
                      {badge && (
                        <Badge
                          variant={badge.variant}
                          className="flex items-center gap-1"
                        >
                          <badge.icon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {sailing.originPort.name} →{" "}
                          {sailing.destinationPort.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{sailing.route.duration} дней</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Schedule Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Расписание</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">ETD:</span>
                        <span>
                          {format(
                            new Date(sailing.departureDate),
                            "dd.MM.yyyy",
                            { locale: ru }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">ETA:</span>
                        <span>
                          {format(new Date(sailing.arrivalDate), "dd.MM.yyyy", {
                            locale: ru,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">Время в пути:</span>
                        <span>{transitDays} дней</span>
                      </div>
                    </div>
                  </div>

                  {/* Vessel Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">
                      Информация о судне
                    </h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Название:</span>
                        <div className="text-muted-foreground">
                          {sailing.vessel.name}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">IMO:</span>
                        <div className="text-muted-foreground">
                          {sailing.vessel.imoNumber}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Вместимость:</span>
                        <div className="text-muted-foreground">
                          {sailing.vessel.capacity.toLocaleString()} TEU
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rate Information */}
                {mainRate && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">
                          {mainRate.containerType} - $
                          {mainRate.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mainRate.currency} • {sailing.route.duration} дней
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Подробнее
                        </Button>
                        <Button className="flex-1">Выбрать рейс</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
