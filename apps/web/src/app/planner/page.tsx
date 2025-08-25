"use client";

import { useState } from "react";
import { SearchForm } from "@/components/planner/SearchForm";
import { SailingResults } from "@/components/planner/SailingResults";
import { LaneInsights } from "@/components/planner/lane-insights";
import type { PortRef, Sailing } from "@sprutnet/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Ship,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  Info,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useSearchContext } from "@/contexts/search-context";

// Функция для преобразования RouteOption в Sailing
function convertRouteToSailing(route: any): any {
  return {
    id: route.id,
    carrierCode: route.carrier?.code || "UNK",
    carrierName: route.carrier?.name || "Unknown Carrier",
    voyageNumber: route.id,
    originPort: route.originPort,
    destinationPort: route.destinationPort,
    departureDate: new Date(route.departureDate),
    arrivalDate: new Date(route.arrivalDate),
    containerType: "40FT" as any, // По умолчанию
    availableCapacity: 1000,
    totalCapacity: 2000,
    status: "SCHEDULED" as any,
    vessel: {
      imoNumber: route.vessel?.imo || "0000000",
      name: route.vessel?.name || "Unknown Vessel",
      carrierCode: route.carrier?.code || "UNK",
      capacity: 2000,
      builtYear: 2020,
      flag: "Unknown",
    },
    route: {
      id: `${route.originPort.id}-${route.destinationPort.id}`,
      originPort: route.originPort,
      destinationPort: route.destinationPort,
      transitTime: route.transitTime || route.duration,
      duration: route.transitTime || route.duration, // Добавляем duration для совместимости
      distance: 0,
      type: "OCEAN" as any,
    },
    rates: route.price
      ? [
          {
            id: `rate-${route.id}`,
            containerType: "40FT" as any,
            currency: route.price.currency || "USD",
            amount: route.price.amount || 0,
            totalCost: route.price.amount || 0, // Добавляем totalCost для совместимости
            validFrom: new Date(route.departureDate),
            validTo: new Date(route.arrivalDate),
            type: "BASE" as any,
          },
        ]
      : [],
    deadlines: [],
    transitTime: route.transitTime || route.duration,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function PlannerPage() {
  const { searchState, setSearchResults } = useSearchContext();
  const [dataSource, setDataSource] = useState<
    "maersk" | "mock" | "mock (fallback)"
  >("maersk");
  const [apiError, setApiError] = useState<string | undefined>();
  const { searchResults, originPort, destinationPort } = searchState;

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (
    originPort: PortRef | null,
    destinationPort: PortRef | null,
    departureDateFrom: Date | null,
    departureDateTo: Date | null,
    options?: any
  ) => {
    console.log("🔍 handleSearch called with:", {
      originPort: originPort?.id,
      destinationPort: destinationPort?.id,
      departureDateFrom,
      departureDateTo,
    });

    if (!originPort || !destinationPort) {
      console.log("❌ Ports not selected:", { originPort, destinationPort });
      setError("Пожалуйста, выберите порты отправления и назначения");
      return;
    }

    if (!originPort.id || !destinationPort.id) {
      console.log("❌ Port IDs missing:", {
        originPortId: originPort.id,
        destinationPortId: destinationPort.id,
      });
      setError(
        "Пожалуйста, выберите корректные порты отправления и назначения"
      );
      return;
    }

    // Валидация порядка дат
    if (departureDateFrom && departureDateTo) {
      if (departureDateFrom > departureDateTo) {
        console.log("❌ Invalid date order:", {
          from: departureDateFrom.toISOString().split("T")[0],
          to: departureDateTo.toISOString().split("T")[0],
        });
        setError(
          "Дата 'от' должна быть раньше даты 'до'. Пожалуйста, выберите корректный диапазон дат."
        );
        return;
      }

      const daysDiff =
        (departureDateTo.getTime() - departureDateFrom.getTime()) /
        (1000 * 3600 * 24);
      if (daysDiff > 90) {
        console.log("❌ Date range too large:", daysDiff, "days");
        setError(
          "Диапазон дат не может превышать 90 дней. Пожалуйста, выберите более короткий период."
        );
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        originPortId: originPort.id,
        destinationPortId: destinationPort.id,
        limit: "10",
      });

      // Устанавливаем разумные значения по умолчанию, если даты не выбраны
      const fromDate = departureDateFrom || new Date();
      const toDate =
        departureDateTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 дней

      params.append("departureDateFrom", fromDate.toISOString().split("T")[0]);
      params.append("departureDateTo", toDate.toISOString().split("T")[0]);

      const url = `/api/routes/search?${params.toString()}`;
      console.log("🔍 Making request to:", url);
      console.log("📋 Request params:", {
        originPortId: originPort.id,
        destinationPortId: destinationPort.id,
        departureDateFrom: fromDate.toISOString().split("T")[0],
        departureDateTo: toDate.toISOString().split("T")[0],
      });

      const response = await fetch(url);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error(
          `Failed to fetch schedules: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📥 Received data from API:", data);
      console.log("📊 Routes count:", data.routes?.length || 0);

      // Обновляем источник данных
      setDataSource(data.source || "maersk");
      setApiError(undefined);
      // Преобразуем routes в sailings для совместимости с компонентом
      const sailings = (data.routes || []).map(convertRouteToSailing);
      setSearchResults(sailings);
    } catch (error) {
      console.error("Error searching schedules:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при поиске рейсов";
      setError("Произошла ошибка при поиске рейсов. Попробуйте еще раз.");
      setApiError(errorMessage);
      setDataSource("mock (fallback)");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Главная
            </Link>
          </Button>
          <span className="text-foreground">Планировщик</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Ship className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Планировщик морских перевозок
              </h1>
              <p className="text-muted-foreground">
                Найдите оптимальные маршруты для ваших грузов
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              API Maersk подключен
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Реальное время
            </Badge>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Main Content */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Поиск рейсов
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Результаты
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Помощь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Поиск маршрутов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Поиск рейсов...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={undefined} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Анализируем доступные маршруты и рассчитываем оптимальные
                      варианты
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <LaneInsights
              sailings={searchResults}
              originPort={originPort?.name || ""}
              destinationPort={destinationPort?.name || ""}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Результаты поиска
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SailingResults
                  sailings={searchResults || []}
                  isLoading={isLoading}
                  hasSearched={hasSearched}
                  dataSource={dataSource}
                  error={apiError}
                  onSwitchToMock={() => {
                    setDataSource("mock");
                    setApiError(undefined);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Как использовать планировщик
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Выбор портов
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Выберите порт отправления (POL) и порт назначения (POD) из
                      выпадающих списков
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Даты отправления
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Укажите желаемый период отправления для поиска доступных
                      рейсов
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Поиск рейсов
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Нажмите кнопку &ldquo;Найти рейсы&rdquo; для получения
                      списка доступных маршрутов
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Анализ результатов
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Сравните рейсы по времени в пути, стоимости и датам
                      отправления
                    </p>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Совет:</strong> Используйте фильтры &ldquo;Самый
                    ранний&rdquo;, &ldquo;Самый быстрый&rdquo; и &ldquo;Лучший
                    выбор&rdquo; для быстрого сравнения рейсов по различным
                    критериям.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Тестирование функций:</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Для тестирования DeadlinesModal:
                  </p>
                  <ol className="text-sm space-y-1">
                    <li>1. Перейдите на вкладку &ldquo;Поиск рейсов&rdquo;</li>
                    <li>2. Выберите порты отправления и назначения</li>
                    <li>3. Нажмите &ldquo;Найти рейсы&rdquo;</li>
                    <li>4. Перейдите на вкладку &ldquo;Результаты&rdquo;</li>
                    <li>
                      5. Найдите кнопку с иконкой часов (⏰) в результатах
                    </li>
                    <li>
                      6. Нажмите на неё для открытия модального окна дедлайнов
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
