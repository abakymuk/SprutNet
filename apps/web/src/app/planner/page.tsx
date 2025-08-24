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

export default function PlannerPage() {
  const [searchResults, setSearchResults] = useState<Sailing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOriginPort, setSelectedOriginPort] = useState<PortRef | null>(
    null
  );
  const [selectedDestinationPort, setSelectedDestinationPort] =
    useState<PortRef | null>(null);

  const handleSearch = async (
    originPort: PortRef | null,
    destinationPort: PortRef | null,
    departureDateFrom: Date | null,
    departureDateTo: Date | null,
    options?: any
  ) => {
    if (!originPort || !destinationPort) {
      setError("Пожалуйста, выберите порты отправления и назначения");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedOriginPort(originPort);
    setSelectedDestinationPort(destinationPort);

    try {
      const params = new URLSearchParams({
        originPortId: originPort.id,
        destinationPortId: destinationPort.id,
        limit: "10",
      });

      if (departureDateFrom) {
        params.append("departureDateFrom", departureDateFrom.toISOString());
      }
      if (departureDateTo) {
        params.append("departureDateTo", departureDateTo.toISOString());
      }

      const response = await fetch(`/api/schedules?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      setSearchResults(data.sailings || []);
    } catch (error) {
      console.error("Error searching schedules:", error);
      setError("Произошла ошибка при поиске рейсов. Попробуйте еще раз.");
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
              originPort={selectedOriginPort?.name}
              destinationPort={selectedDestinationPort?.name}
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
                  sailings={searchResults}
                  isLoading={isLoading}
                  hasSearched={hasSearched}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
