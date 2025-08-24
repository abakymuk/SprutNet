"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Bell,
} from "lucide-react";
import { NotificationSettings } from "./notification-settings";
import { NotificationTest } from "./notification-test";
import type { Sailing } from "@sprutnet/shared/types";

interface Deadline {
  id: string;
  name: string;
  type: DeadlineType;
  deadlineLocal: string;
  description?: string;
  status: DeadlineStatus;
}

enum DeadlineType {
  DOC = "DOC", // Documents
  CY = "CY", // Container Yard
  VGM = "VGM", // Verified Gross Mass
  CUSTOMS = "CUSTOMS", // Customs Clearance
  BOOKING = "BOOKING", // Booking Cut-off
  GATE_IN = "GATE_IN", // Gate In
  GATE_OUT = "GATE_OUT", // Gate Out
  LOADING = "LOADING", // Loading
  OTHER = "OTHER",
}

enum DeadlineStatus {
  UPCOMING = "UPCOMING",
  DUE_SOON = "DUE_SOON",
  OVERDUE = "OVERDUE",
  COMPLETED = "COMPLETED",
}

interface DeadlinesModalProps {
  sailing: Sailing;
  children: React.ReactNode;
}

const deadlineTypeConfig = {
  [DeadlineType.DOC]: {
    label: "Документы",
    description: "Подготовка и подача документов",
    icon: Info,
    color: "bg-blue-500",
  },
  [DeadlineType.CY]: {
    label: "Контейнерный двор",
    description: "Доставка контейнера на терминал",
    icon: Calendar,
    color: "bg-green-500",
  },
  [DeadlineType.VGM]: {
    label: "Вес груза",
    description: "Подтверждение веса груза",
    icon: CheckCircle,
    color: "bg-purple-500",
  },
  [DeadlineType.CUSTOMS]: {
    label: "Таможня",
    description: "Таможенное оформление",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
  [DeadlineType.BOOKING]: {
    label: "Бронирование",
    description: "Подтверждение бронирования",
    icon: Clock,
    color: "bg-orange-500",
  },
  [DeadlineType.GATE_IN]: {
    label: "Въезд",
    description: "Въезд на терминал",
    icon: ExternalLink,
    color: "bg-indigo-500",
  },
  [DeadlineType.GATE_OUT]: {
    label: "Выезд",
    description: "Выезд с терминала",
    icon: ExternalLink,
    color: "bg-indigo-500",
  },
  [DeadlineType.LOADING]: {
    label: "Погрузка",
    description: "Погрузка на судно",
    icon: CheckCircle,
    color: "bg-teal-500",
  },
  [DeadlineType.OTHER]: {
    label: "Другое",
    description: "Прочие дедлайны",
    icon: Info,
    color: "bg-gray-500",
  },
};

export function DeadlinesModal({ sailing, children }: DeadlinesModalProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDeadlines = useCallback(async () => {
    console.log("🔍 fetchDeadlines called with sailing:", sailing);

    if (!sailing.id) {
      console.log("❌ No sailing.id provided");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching deadlines for sailing:", sailing.id);
      const url = `/api/deadlines?sailingId=${sailing.id}`;
      console.log("🌐 Fetching URL:", url);

      const response = await fetch(url);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error text:", errorText);
        throw new Error(
          `Failed to fetch deadlines: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📅 Deadlines data:", data);
      setDeadlines(data.deadlines || []);
    } catch (err) {
      console.error("❌ Error fetching deadlines:", err);
      setError("Ошибка при загрузке дедлайнов");
    } finally {
      setIsLoading(false);
    }
  }, [sailing]);

  useEffect(() => {
    console.log("🔍 DeadlinesModal useEffect triggered:", {
      isOpen,
      sailingId: sailing.id,
    });
    if (isOpen) {
      fetchDeadlines();
    }
  }, [isOpen, sailing.id, fetchDeadlines]);

  const getDeadlineStatus = (deadline: Deadline): DeadlineStatus => {
    const now = new Date();
    const deadlineDate = new Date(deadline.deadlineLocal);
    const diffHours =
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return DeadlineStatus.OVERDUE;
    if (diffHours < 24) return DeadlineStatus.DUE_SOON;
    if (diffHours < 72) return DeadlineStatus.UPCOMING;
    return DeadlineStatus.COMPLETED;
  };

  const getStatusBadge = (status: DeadlineStatus) => {
    switch (status) {
      case DeadlineStatus.OVERDUE:
        return <Badge variant="destructive">Просрочен</Badge>;
      case DeadlineStatus.DUE_SOON:
        return <Badge variant="secondary">Скоро</Badge>;
      case DeadlineStatus.UPCOMING:
        return <Badge variant="outline">Предстоит</Badge>;
      case DeadlineStatus.COMPLETED:
        return <Badge variant="default">Завершен</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const formatLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getTimeRemaining = (deadline: Deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline.deadlineLocal);
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs < 0) {
      const hours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      return `${hours}ч назад`;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (days > 0) {
      return `${days}д ${hours}ч`;
    }
    return `${hours}ч`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Дедлайны рейса
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {sailing.vessel?.name} • {sailing.voyageNumber}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : deadlines.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Дедлайны для данного рейса не найдены
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="deadlines" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="deadlines"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Дедлайны
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Уведомления
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deadlines" className="space-y-6">
              {/* Route Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {sailing.originPort?.name}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">
                    {sailing.destinationPort?.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Отправление:{" "}
                  {new Date(sailing.departureDate).toLocaleDateString("ru-RU")}
                </div>
              </div>

              {/* Deadlines Table */}
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Дедлайн</TableHead>
                      <TableHead>Осталось</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadlines.map((deadline) => {
                      const status = getDeadlineStatus(deadline);
                      const config =
                        deadlineTypeConfig[deadline.type] ||
                        deadlineTypeConfig[DeadlineType.OTHER];
                      const IconComponent = config.icon;

                      return (
                        <TableRow key={deadline.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${config.color}`}
                              />
                              <span className="text-sm font-medium">
                                {config.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{deadline.name}</div>
                              {deadline.description && (
                                <div className="text-sm text-muted-foreground">
                                  {deadline.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatLocalTime(deadline.deadlineLocal)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">
                              {getTimeRemaining(deadline)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        deadlines.filter(
                          (d) => getDeadlineStatus(d) === DeadlineStatus.OVERDUE
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Просроченные
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        deadlines.filter(
                          (d) =>
                            getDeadlineStatus(d) === DeadlineStatus.DUE_SOON
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Скоро наступят
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        deadlines.filter(
                          (d) =>
                            getDeadlineStatus(d) === DeadlineStatus.COMPLETED
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Завершенные
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Общие настройки для рейса */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Настройки для рейса
                  </h3>
                  <NotificationSettings sailingId={sailing.id} />
                </div>

                {/* Тестирование уведомлений */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Тестирование</h3>
                  <NotificationTest
                    sailingId={sailing.id}
                    deadline={
                      deadlines[0]
                        ? {
                            id: deadlines[0].id,
                            name: deadlines[0].name,
                            description: deadlines[0].description || "",
                            deadlineLocal: deadlines[0].deadlineLocal,
                          }
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* Настройки для конкретных дедлайнов */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Настройки для дедлайнов
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deadlines.slice(0, 3).map((deadline) => (
                    <div key={deadline.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{deadline.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatLocalTime(deadline.deadlineLocal)}
                          </p>
                        </div>
                        <Badge variant="outline">{deadline.type}</Badge>
                      </div>
                      <NotificationSettings
                        sailingId={sailing.id}
                        deadlineId={deadline.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
