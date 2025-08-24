"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  TrendingUp,
  DollarSign,
  Filter,
  Settings,
  Eye,
  Bookmark,
  Share2,
  Download,
  Info,
  ChevronDown,
  ExternalLink,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Anchor,
  Navigation,
  Thermometer,
  Wind,
  Waves,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { differenceInDays } from "date-fns";
import type { Sailing } from "@sprutnet/shared/types";
import { DeadlinesModal } from "./deadlines-modal";

interface SailingResultsProps {
  sailings: Sailing[];
  isLoading: boolean;
  hasSearched: boolean;
}

type SortOption = "earliest" | "shortest" | "best" | "cheapest" | "popular";

// Skeleton component for loading state
function SailingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SailingResults({
  sailings,
  isLoading,
  hasSearched,
}: SailingResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("earliest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedContainerTypes, setSelectedContainerTypes] = useState<
    string[]
  >(["20GP", "40GP", "40HC"]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedSailing, setSelectedSailing] = useState<Sailing | null>(null);

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
        case "cheapest":
          const aPrice = a.rates[0]?.totalCost || 0;
          const bPrice = b.rates[0]?.totalCost || 0;
          return aPrice - bPrice;
        case "best":
          // Best sailing: balance between speed and cost
          const aScore =
            a.route.duration * 0.6 + (a.rates[0]?.totalCost || 0) * 0.4;
          const bScore =
            b.route.duration * 0.6 + (b.rates[0]?.totalCost || 0) * 0.4;
          return aScore - bScore;
        case "popular":
          // Sort by vessel capacity (larger vessels might be more popular)
          return b.vessel.capacity - a.vessel.capacity;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sailings, sortBy]);

  // Filter sailings based on criteria
  const filteredSailings = useMemo(() => {
    return sortedSailings.filter((sailing) => {
      const mainRate = sailing.rates[0];
      if (!mainRate) return false;

      // Price filter
      if (mainRate.totalCost > maxPrice) return false;

      // Container type filter
      if (!selectedContainerTypes.includes(mainRate.containerType))
        return false;

      return true;
    });
  }, [sortedSailings, maxPrice, selectedContainerTypes]);

  // Determine best sailings for highlighting
  const earliestSailing = filteredSailings[0];
  const shortestSailing = [...filteredSailings].sort(
    (a, b) => a.route.duration - b.route.duration
  )[0];
  const cheapestSailing = [...filteredSailings].sort(
    (a, b) => (a.rates[0]?.totalCost || 0) - (b.rates[0]?.totalCost || 0)
  )[0];
  const bestSailing = filteredSailings[0]; // Already sorted by best

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
    if (sailing.id === cheapestSailing?.id && sortBy === "cheapest") {
      return {
        label: "Самый дешевый",
        icon: DollarSign,
        variant: "outline" as const,
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

  const containerTypeOptions = [
    { id: "20GP", label: "20' GP" },
    { id: "40GP", label: "40' GP" },
    { id: "40HC", label: "40' HC" },
    { id: "45HC", label: "45' HC" },
  ];

  if (isLoading) {
    return <SailingSkeleton />;
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
          <Ship className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Начните поиск рейсов
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Выберите порты отправления и назначения, чтобы найти доступные рейсы
        </p>
      </div>
    );
  }

  if (filteredSailings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Рейсы не найдены
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Попробуйте изменить параметры поиска или даты отправления
        </p>
        <Alert className="mt-4 max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Возможно, стоит расширить диапазон дат или изменить фильтры
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Найдено рейсов: {filteredSailings.length}
            </h2>
            <p className="text-muted-foreground">
              Выберите подходящий рейс для вашего груза
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="view-mode"
                checked={viewMode === "table"}
                onCheckedChange={(checked) =>
                  setViewMode(checked ? "table" : "cards")
                }
              />
              <Label htmlFor="view-mode" className="text-sm">
                {viewMode === "table" ? "Таблица" : "Карточки"}
              </Label>
            </div>

            {/* Sort Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Сортировка
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Сортировать по</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("earliest")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Самый ранний
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("shortest")}>
                  <Zap className="h-4 w-4 mr-2" />
                  Самый быстрый
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("cheapest")}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Самый дешевый
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("best")}>
                  <Star className="h-4 w-4 mr-2" />
                  Лучший выбор
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  По популярности
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Фильтры
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Container Types */}
                <div className="p-2">
                  <Label className="text-sm font-medium">
                    Типы контейнеров
                  </Label>
                  <div className="space-y-2 mt-2">
                    {containerTypeOptions.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={type.id}
                          checked={selectedContainerTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedContainerTypes((prev) => [
                                ...prev,
                                type.id,
                              ]);
                            } else {
                              setSelectedContainerTypes((prev) =>
                                prev.filter((t) => t !== type.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={type.id} className="text-sm">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Price Range */}
                <div className="p-2">
                  <Label className="text-sm font-medium">
                    Максимальная цена: ${maxPrice.toLocaleString()}
                  </Label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Results */}
        {viewMode === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Рейс</TableHead>
                <TableHead>Маршрут</TableHead>
                <TableHead>Даты</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSailings.map((sailing) => {
                const badge = getSailingBadge(sailing);
                const transitDays = calculateTransitDays(
                  sailing.departureDate,
                  sailing.arrivalDate
                );
                const mainRate = sailing.rates[0];

                return (
                  <TableRow key={sailing.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">
                            {sailing.carrierName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {sailing.voyageNumber}
                          </div>
                        </div>
                        {badge && (
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{sailing.originPort.name}</div>
                        <div className="text-muted-foreground">→</div>
                        <div>{sailing.destinationPort.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          ETD:{" "}
                          {format(
                            new Date(sailing.departureDate),
                            "dd.MM.yyyy",
                            { locale: ru }
                          )}
                        </div>
                        <div>
                          ETA:{" "}
                          {format(new Date(sailing.arrivalDate), "dd.MM.yyyy", {
                            locale: ru,
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{transitDays} дней</div>
                        <div className="text-muted-foreground">
                          {sailing.route.duration} дней
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mainRate && (
                        <div className="text-sm">
                          <div className="font-medium">
                            ${mainRate.totalCost.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            {mainRate.containerType}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSailing(sailing)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Подробности</p>
                          </TooltipContent>
                        </Tooltip>
                        <DeadlinesModal sailing={sailing}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Clock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Дедлайны</p>
                            </TooltipContent>
                          </Tooltip>
                        </DeadlinesModal>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>В избранное</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Поделиться</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          /* Cards View */
          <div className="grid gap-6">
            {filteredSailings.map((sailing) => {
              const badge = getSailingBadge(sailing);
              const transitDays = calculateTransitDays(
                sailing.departureDate,
                sailing.arrivalDate
              );
              const mainRate = sailing.rates[0];

              return (
                <Card
                  key={sailing.id}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Ship className="h-5 w-5 text-primary" />
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

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSailing(sailing)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Подробности</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>В избранное</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Поделиться</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Schedule Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Расписание
                        </h4>
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
                              {format(
                                new Date(sailing.arrivalDate),
                                "dd.MM.yyyy",
                                { locale: ru }
                              )}
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
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
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
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              {mainRate.containerType} - $
                              {mainRate.totalCost.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {mainRate.currency} • {sailing.route.duration}{" "}
                              дней
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Подробнее
                            </Button>
                            <DeadlinesModal sailing={sailing}>
                              <Button variant="outline" size="sm">
                                <Clock className="h-4 w-4 mr-1" />
                                Дедлайны
                              </Button>
                            </DeadlinesModal>
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
        )}

        {/* Sailing Details Dialog */}
        <Dialog
          open={!!selectedSailing}
          onOpenChange={() => setSelectedSailing(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedSailing && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    {selectedSailing.carrierName} -{" "}
                    {selectedSailing.voyageNumber}
                  </DialogTitle>
                  <DialogDescription>
                    Подробная информация о рейсе
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Route Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        Маршрут
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Порт отправления</h4>
                          <div className="space-y-2">
                            <div className="text-lg font-semibold">
                              {selectedSailing.originPort.name}
                            </div>
                            <div className="text-muted-foreground">
                              {selectedSailing.originPort.cityName},{" "}
                              {selectedSailing.originPort.countryName}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Порт назначения</h4>
                          <div className="space-y-2">
                            <div className="text-lg font-semibold">
                              {selectedSailing.destinationPort.name}
                            </div>
                            <div className="text-muted-foreground">
                              {selectedSailing.destinationPort.cityName},{" "}
                              {selectedSailing.destinationPort.countryName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vessel Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Anchor className="h-5 w-5 text-primary" />
                        Информация о судне
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Название</h4>
                          <p className="text-muted-foreground">
                            {selectedSailing.vessel.name}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">IMO Number</h4>
                          <p className="text-muted-foreground">
                            {selectedSailing.vessel.imoNumber}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Вместимость</h4>
                          <p className="text-muted-foreground">
                            {selectedSailing.vessel.capacity.toLocaleString()}{" "}
                            TEU
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rates Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Тарифы
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Тип контейнера</TableHead>
                            <TableHead>Базовая ставка</TableHead>
                            <TableHead>Доплаты</TableHead>
                            <TableHead>Итого</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedSailing.rates.map((rate, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {rate.containerType}
                              </TableCell>
                              <TableCell>
                                ${rate.baseRate.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                $
                                {(
                                  rate.totalCost - rate.baseRate
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ${rate.totalCost.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Контактная информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Перевозчик</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Веб-сайт
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Email
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Телефон
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Действия</h4>
                          <div className="space-y-2">
                            <Button className="w-full" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Отправить запрос
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Скачать детали
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Поделиться
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
