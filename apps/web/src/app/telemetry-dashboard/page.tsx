"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Trash2,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Database,
  Wifi,
  Server,
  FileText,
} from "lucide-react";

interface TelemetryEvent {
  event: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data?: Record<string, any>;
  context?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
  };
}

interface TelemetryStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentEvents: TelemetryEvent[];
  sessionCount: number;
  timeRange: {
    first?: number;
    last?: number;
  };
}

export default function TelemetryDashboardPage() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/telemetry?action=stats");
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/telemetry?action=events");
      const result = await response.json();
      if (result.success) {
        setEvents(result.data.events);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const clearEvents = async () => {
    try {
      const response = await fetch("/api/telemetry?action=clear");
      const result = await response.json();
      if (result.success) {
        setStats(null);
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to clear events:", error);
    }
  };

  const exportEvents = () => {
    const link = document.createElement("a");
    link.href = "/api/telemetry?action=export";
    link.download = `telemetry-events-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
      fetchEvents();
    }, 5000); // Обновление каждые 5 секунд

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "search_started":
      case "search_success":
      case "search_error":
        return <FileText className="h-4 w-4" />;
      case "deadline_opened":
      case "deadline_error":
      case "deadline_success":
        return <Clock className="h-4 w-4" />;
      case "cache_hit":
      case "cache_miss":
        return <Database className="h-4 w-4" />;
      case "api_retry":
      case "api_error":
      case "api_success":
        return <Server className="h-4 w-4" />;
      case "port_search":
      case "port_search_success":
      case "port_search_error":
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes("error")) return "text-red-600";
    if (eventType.includes("success")) return "text-green-600";
    if (eventType.includes("cache_hit")) return "text-blue-600";
    return "text-gray-600";
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ru-RU");
  };

  const getEventSummary = (event: TelemetryEvent) => {
    const { event: eventType, data } = event;

    switch (eventType) {
      case "search_success":
        return `Найдено ${data?.resultCount || 0} рейсов`;
      case "search_error":
        return `Ошибка: ${data?.error || "Неизвестная ошибка"}`;
      case "deadline_opened":
        return `Открыты дедлайны для рейса ${data?.sailingId || "N/A"}`;
      case "cache_hit":
        return `Кэш: ${data?.endpoint || "N/A"}`;
      case "api_retry":
        return `Повтор ${data?.attempt || 0} для ${data?.endpoint || "N/A"}`;
      case "api_error":
        return `API ошибка: ${data?.error || "N/A"} (${data?.status || "N/A"})`;
      default:
        return data ? JSON.stringify(data) : "Нет данных";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Дашборд телеметрии</h1>
          <p className="text-muted-foreground">
            Мониторинг событий и метрик в реальном времени
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Автообновление" : "Включить авто"}
          </Button>

          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>

          <Button variant="outline" onClick={exportEvents}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>

          <Button variant="outline" onClick={clearEvents}>
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего событий
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">За все время</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активные сессии
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessionCount}</div>
              <p className="text-xs text-muted-foreground">
                Уникальных пользователей
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Последнее событие
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.timeRange.last
                  ? formatTimestamp(stats.timeRange.last).split(" ")[1]
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                Время последнего события
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Типы событий
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.eventsByType).length}
              </div>
              <p className="text-xs text-muted-foreground">Различных типов</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="recent">Последние</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все события ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Событий пока нет
                  </p>
                ) : (
                  events.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className={`mt-1 ${getEventColor(event.event)}`}>
                        {getEventIcon(event.event)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.event}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatTimestamp(event.timestamp).split(" ")[1]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getEventSummary(event)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Сессия: {event.sessionId.slice(-8)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по типам событий</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.eventsByType ? (
                <div className="space-y-3">
                  {Object.entries(stats.eventsByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([eventType, count]) => (
                      <div
                        key={eventType}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={getEventColor(eventType)}>
                            {getEventIcon(eventType)}
                          </div>
                          <span className="font-medium">{eventType}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Нет данных для отображения
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Последние 10 событий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!stats?.recentEvents || stats.recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Нет недавних событий
                  </p>
                ) : (
                  stats.recentEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className={`mt-1 ${getEventColor(event.event)}`}>
                        {getEventIcon(event.event)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.event}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatTimestamp(event.timestamp)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getEventSummary(event)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
