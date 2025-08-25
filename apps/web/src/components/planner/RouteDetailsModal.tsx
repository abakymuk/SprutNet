"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ship,
  Calendar,
  Clock,
  MapPin,
  Star,
  Zap,
  Target,
  DollarSign,
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
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Award,
  Users,
  Building,
  FileText,
  Download,
  Share2,
  Bookmark,
  Eye,
  BarChart3,
  Activity,
  Timer,
  Route,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { differenceInDays } from "date-fns";
import type { Sailing } from "@sprutnet/shared/types";
import { TimeDisplay } from "@/components/ui/time-display";
import { TimezoneInfo } from "@/components/ui/timezone-info";
import { VesselCard } from "./vessel-card";

interface RouteDetailsModalProps {
  sailing: Sailing;
  allSailings?: Sailing[]; // Для сравнения с другими рейсами
  children: React.ReactNode;
}

interface ComparisonMetrics {
  priceRank: number;
  speedRank: number;
  reliabilityRank: number;
  popularityRank: number;
  overallScore: number;
}

interface RouteRecommendation {
  type: "earliest" | "shortest" | "cheapest" | "balanced" | "reliable";
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  score: number;
}

export function RouteDetailsModal({
  sailing,
  allSailings = [],
  children,
}: RouteDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Вычисляем метрики для сравнения
  const comparisonMetrics = useMemo((): ComparisonMetrics => {
    if (allSailings.length === 0) {
      return {
        priceRank: 1,
        speedRank: 1,
        reliabilityRank: 1,
        popularityRank: 1,
        overallScore: 85,
      };
    }

    const sortedByPrice = [...allSailings].sort(
      (a, b) => (a.rates[0]?.totalCost || 0) - (b.rates[0]?.totalCost || 0)
    );
    const sortedBySpeed = [...allSailings].sort(
      (a, b) => (a.route.duration || 0) - (b.route.duration || 0)
    );
    const sortedByReliability = [...allSailings].sort(
      (a, b) => (a.vessel.capacity || 0) - (b.vessel.capacity || 0)
    );

    const priceRank = sortedByPrice.findIndex((s) => s.id === sailing.id) + 1;
    const speedRank = sortedBySpeed.findIndex((s) => s.id === sailing.id) + 1;
    const reliabilityRank =
      sortedByReliability.findIndex((s) => s.id === sailing.id) + 1;
    const popularityRank = Math.floor(Math.random() * allSailings.length) + 1;

    const overallScore = Math.round(
      (100 - (priceRank - 1) * 10) * 0.3 +
        (100 - (speedRank - 1) * 10) * 0.3 +
        (100 - (reliabilityRank - 1) * 10) * 0.2 +
        (100 - (popularityRank - 1) * 10) * 0.2
    );

    return {
      priceRank,
      speedRank,
      reliabilityRank,
      popularityRank,
      overallScore,
    };
  }, [sailing, allSailings]);

  // Генерируем рекомендации
  const recommendations = useMemo((): RouteRecommendation[] => {
    const recs: RouteRecommendation[] = [];

    // Самый ранний
    if (comparisonMetrics.speedRank === 1) {
      recs.push({
        type: "earliest",
        title: "Самый ранний",
        description: "Этот рейс отправляется раньше всех",
        icon: Calendar,
        color: "bg-blue-500",
        score: 95,
      });
    }

    // Самый быстрый
    if (comparisonMetrics.speedRank === 1) {
      recs.push({
        type: "shortest",
        title: "Самый быстрый",
        description: "Самый короткий транзит",
        icon: Zap,
        color: "bg-green-500",
        score: 90,
      });
    }

    // Самый дешевый
    if (comparisonMetrics.priceRank === 1) {
      recs.push({
        type: "cheapest",
        title: "Самый дешевый",
        description: "Лучшая цена среди всех рейсов",
        icon: DollarSign,
        color: "bg-yellow-500",
        score: 88,
      });
    }

    // Сбалансированный
    if (comparisonMetrics.overallScore > 80) {
      recs.push({
        type: "balanced",
        title: "Сбалансированный",
        description: "Оптимальное соотношение цена/качество",
        icon: Star,
        color: "bg-purple-500",
        score: comparisonMetrics.overallScore,
      });
    }

    // Надежный
    if (comparisonMetrics.reliabilityRank <= 3) {
      recs.push({
        type: "reliable",
        title: "Надежный",
        description: "Высокая надежность доставки",
        icon: CheckCircle,
        color: "bg-emerald-500",
        score: 85,
      });
    }

    return recs;
  }, [comparisonMetrics]);

  const calculateTransitDays = (departureDate: Date, arrivalDate: Date) => {
    return differenceInDays(new Date(arrivalDate), new Date(departureDate));
  };

  const getRankBadge = (rank: number, total: number) => {
    if (rank === 1)
      return <Badge className="bg-yellow-500 text-white">🥇 1-й</Badge>;
    if (rank === 2)
      return <Badge className="bg-gray-400 text-white">🥈 2-й</Badge>;
    if (rank === 3)
      return <Badge className="bg-orange-600 text-white">🥉 3-й</Badge>;
    return (
      <Badge variant="outline">
        {rank}-й из {total}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const transitDays = calculateTransitDays(
    new Date(sailing.departureDate),
    new Date(sailing.arrivalDate)
  );

  const mainRate = sailing.rates[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ship className="h-6 w-6 text-primary" />
            {sailing.carrierName} - {sailing.voyageNumber}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Детальная информация о рейсе для обоснования выбора
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="vessel" className="flex items-center gap-2">
              <Anchor className="h-4 w-4" />
              Судно
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Сравнение
            </TabsTrigger>
            <TabsTrigger
              value="justification"
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Обоснование
            </TabsTrigger>
          </TabsList>

          {/* Обзор */}
          <TabsContent value="overview" className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Маршрут */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Маршрут
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="font-semibold text-lg">
                        {sailing.originPort.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sailing.originPort.cityName},{" "}
                        {sailing.originPort.countryName}
                      </div>
                    </div>
                    <div className="mx-4">
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center flex-1">
                      <div className="font-semibold text-lg">
                        {sailing.destinationPort.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sailing.destinationPort.cityName},{" "}
                        {sailing.destinationPort.countryName}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {transitDays} дней
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Время в пути
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Временные данные */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Временные данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ETD:</span>
                      <TimeDisplay
                        utcDate={new Date(sailing.departureDate)}
                        timezone={sailing.originPort?.timezone || "UTC"}
                        showUTC={false}
                        size="sm"
                        showIcon={false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ETA:</span>
                      <TimeDisplay
                        utcDate={new Date(sailing.arrivalDate)}
                        timezone={sailing.destinationPort?.timezone || "UTC"}
                        showUTC={false}
                        size="sm"
                        showIcon={false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Transit Days:</span>
                      <span className="font-semibold">{transitDays} дней</span>
                    </div>
                  </div>
                  {sailing.originPort?.timezone && (
                    <div className="pt-2 border-t">
                      <TimezoneInfo
                        timezone={sailing.originPort.timezone}
                        size="sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Рейтинг и рекомендации */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Рейтинг
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(comparisonMetrics.overallScore)}`}
                    >
                      {comparisonMetrics.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Общий балл
                    </div>
                  </div>
                  <Progress
                    value={comparisonMetrics.overallScore}
                    className="w-full"
                  />

                  {recommendations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Рекомендации:</div>
                      {recommendations.slice(0, 2).map((rec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="w-full justify-start"
                        >
                          <rec.icon className="h-3 w-3 mr-1" />
                          {rec.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Рекомендации */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Почему этот рейс
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${rec.color} text-white`}
                        >
                          <rec.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{rec.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {rec.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Цены */}
            {mainRate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Тарифы и цены
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                          Основной тариф:
                        </span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${mainRate.totalCost.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mainRate.containerType} • {mainRate.currency}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Позиция по цене:</span>
                        {getRankBadge(
                          comparisonMetrics.priceRank,
                          allSailings.length || 1
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium mb-2">
                          Включено в стоимость:
                        </div>
                        <ul className="space-y-1">
                          <li>
                            • Базовая ставка: $
                            {mainRate.baseRate?.toLocaleString() || "N/A"}
                          </li>
                          <li>
                            • Доплаты: $
                            {(
                              (mainRate.totalCost || 0) -
                              (mainRate.baseRate || 0)
                            ).toLocaleString()}
                          </li>
                          <li>• Топливная надбавка</li>
                          <li>• Портовая обработка</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Расписание */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Детальное расписание */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Детальное расписание
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Timeline */}
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                      {/* Отправление */}
                      <div className="relative flex items-center gap-4 mb-6">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Отправление</div>
                          <div className="text-sm text-muted-foreground">
                            {sailing.originPort.name}
                          </div>
                          <TimeDisplay
                            utcDate={new Date(sailing.departureDate)}
                            timezone={sailing.originPort?.timezone || "UTC"}
                            showUTC={true}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                      </div>

                      {/* В пути */}
                      <div className="relative flex items-center gap-4 mb-6">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          →
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">В пути</div>
                          <div className="text-sm text-muted-foreground">
                            {transitDays} дней транзита
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Расстояние: ~{Math.round(transitDays * 300)} морских
                            миль
                          </div>
                        </div>
                      </div>

                      {/* Прибытие */}
                      <div className="relative flex items-center gap-4">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          B
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Прибытие</div>
                          <div className="text-sm text-muted-foreground">
                            {sailing.destinationPort.name}
                          </div>
                          <TimeDisplay
                            utcDate={new Date(sailing.arrivalDate)}
                            timezone={
                              sailing.destinationPort?.timezone || "UTC"
                            }
                            showUTC={true}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Важные даты */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    Важные даты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Дедлайн документов</div>
                        <div className="text-sm text-muted-foreground">
                          За 3 дня до отправления
                        </div>
                      </div>
                      <Badge variant="outline">Обязательно</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Доставка контейнера</div>
                        <div className="text-sm text-muted-foreground">
                          За 2 дня до отправления
                        </div>
                      </div>
                      <Badge variant="outline">Обязательно</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Таможенное оформление</div>
                        <div className="text-sm text-muted-foreground">
                          За 1 день до отправления
                        </div>
                      </div>
                      <Badge variant="secondary">Рекомендуется</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Судно */}
          <TabsContent value="vessel" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Информация о судне */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-primary" />
                    Информация о судне
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VesselCard imo={sailing.vessel.imoNumber}>
                    <Button variant="outline" className="w-full">
                      <Ship className="h-4 w-4 mr-2" />
                      Подробная информация о судне
                    </Button>
                  </VesselCard>

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Название
                        </div>
                        <div className="font-semibold">
                          {sailing.vessel.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          IMO
                        </div>
                        <div className="font-mono">
                          {sailing.vessel.imoNumber}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Вместимость
                        </div>
                        <div className="font-semibold">
                          {sailing.vessel.capacity.toLocaleString()} TEU
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Год постройки
                        </div>
                        <div className="font-semibold">
                          {sailing.vessel.builtYear || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Флаг
                      </div>
                      <div className="font-semibold">
                        {sailing.vessel.flag || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Оператор */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Оператор
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {sailing.carrierName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Код: {sailing.carrierCode}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Рейтинг надежности:
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">4.2/5</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Позиция по надежности:
                        </span>
                        {getRankBadge(
                          comparisonMetrics.reliabilityRank,
                          allSailings.length || 1
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          www.
                          {sailing.carrierName
                            ?.toLowerCase()
                            .replace(/\s+/g, "")}
                          .com
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          booking@
                          {sailing.carrierName
                            ?.toLowerCase()
                            .replace(/\s+/g, "")}
                          .com
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Сравнение */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Метрики сравнения */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Позиция среди {allSailings.length || 1} рейсов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Цена</span>
                        </div>
                        {getRankBadge(
                          comparisonMetrics.priceRank,
                          allSailings.length || 1
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Скорость</span>
                        </div>
                        {getRankBadge(
                          comparisonMetrics.speedRank,
                          allSailings.length || 1
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">Надежность</span>
                        </div>
                        {getRankBadge(
                          comparisonMetrics.reliabilityRank,
                          allSailings.length || 1
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Популярность</span>
                        </div>
                        {getRankBadge(
                          comparisonMetrics.popularityRank,
                          allSailings.length || 1
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold ${getScoreColor(comparisonMetrics.overallScore)}`}
                      >
                        {comparisonMetrics.overallScore}/100
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Общий балл
                      </div>
                      <Progress
                        value={comparisonMetrics.overallScore}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Альтернативные рейсы */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-primary" />
                    Альтернативные рейсы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allSailings.length > 1 ? (
                    <div className="space-y-3">
                      {allSailings
                        .filter((s) => s.id !== sailing.id)
                        .slice(0, 3)
                        .map((altSailing, index) => {
                          const altTransitDays = calculateTransitDays(
                            new Date(altSailing.departureDate),
                            new Date(altSailing.arrivalDate)
                          );
                          const altRate = altSailing.rates[0];

                          return (
                            <div
                              key={altSailing.id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">
                                  {altSailing.carrierName} -{" "}
                                  {altSailing.voyageNumber}
                                </div>
                                <Badge variant="outline">
                                  {index + 1} альтернатива
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Цена:
                                  </span>
                                  <div className="font-medium">
                                    $
                                    {altRate?.totalCost.toLocaleString() ||
                                      "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Транзит:
                                  </span>
                                  <div className="font-medium">
                                    {altTransitDays} дней
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет альтернативных рейсов для сравнения
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Обоснование */}
          <TabsContent value="justification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ключевые преимущества */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Ключевые преимущества
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${rec.color} text-white`}
                        >
                          <rec.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{rec.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {rec.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Балл: {rec.score}/100
                          </div>
                        </div>
                      </div>
                    ))}

                    {recommendations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <div>Нет особых преимуществ</div>
                        <div className="text-xs">
                          Этот рейс имеет средние показатели
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Обоснование для клиента */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Обоснование для клиента
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="font-medium mb-2">
                        📋 Краткое обоснование:
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {recommendations.length > 0
                          ? `Этот рейс выбран как ${recommendations[0].title.toLowerCase()} с общим баллом ${comparisonMetrics.overallScore}/100. ${recommendations[0].description}`
                          : "Этот рейс предлагает сбалансированное соотношение цены и качества для вашего груза."}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Стоимость доставки:</span>
                        <span className="font-medium">
                          ${mainRate?.totalCost.toLocaleString() || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Время доставки:</span>
                        <span className="font-medium">{transitDays} дней</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Надежность:</span>
                        <span className="font-medium">
                          {comparisonMetrics.reliabilityRank <= 3
                            ? "Высокая"
                            : "Средняя"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Рекомендации для клиента:
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Подготовьте документы за 3 дня до отправления</li>
                        <li>• Убедитесь в наличии всех разрешений</li>
                        <li>• Следите за статусом груза через трекинг</li>
                        <li>• Имейте контакты перевозчика для связи</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Действия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Выбрать рейс
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Отправить запрос
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать детали
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Поделиться
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Вспомогательный компонент для стрелки
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
