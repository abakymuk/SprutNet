"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ArrowLeft,
  Ship,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Database,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
} from "lucide-react";

interface Port {
  id: string;
  name: string;
  country: string;
  code: string;
}

interface Vessel {
  id: string;
  name: string;
  type: string;
  capacity: string;
  status: string;
}

interface Schedule {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  vessel: string;
  status: string;
}

export default function DataPage() {
  const [activeTab, setActiveTab] = useState("ports");
  const [loading, setLoading] = useState(true);
  const [ports, setPorts] = useState<Port[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPorts([
        {
          id: "1",
          name: "Port of Rotterdam",
          country: "Netherlands",
          code: "ROT",
        },
        { id: "2", name: "Port of Shanghai", country: "China", code: "SHA" },
        {
          id: "3",
          name: "Port of Singapore",
          country: "Singapore",
          code: "SIN",
        },
        { id: "4", name: "Port of Los Angeles", country: "USA", code: "LAX" },
        { id: "5", name: "Port of Hamburg", country: "Germany", code: "HAM" },
      ]);
      setVessels([
        {
          id: "1",
          name: "Maersk Seville",
          type: "Container",
          capacity: "15,000 TEU",
          status: "Active",
        },
        {
          id: "2",
          name: "MSC Oscar",
          type: "Container",
          capacity: "19,224 TEU",
          status: "Active",
        },
        {
          id: "3",
          name: "CMA CGM Marco Polo",
          type: "Container",
          capacity: "16,020 TEU",
          status: "Maintenance",
        },
        {
          id: "4",
          name: "Ever Given",
          type: "Container",
          capacity: "20,124 TEU",
          status: "Active",
        },
        {
          id: "5",
          name: "HMM Algeciras",
          type: "Container",
          capacity: "23,964 TEU",
          status: "Active",
        },
      ]);
      setSchedules([
        {
          id: "1",
          origin: "Rotterdam",
          destination: "Shanghai",
          departure: "2024-01-15",
          arrival: "2024-02-20",
          vessel: "Maersk Seville",
          status: "Scheduled",
        },
        {
          id: "2",
          origin: "Shanghai",
          destination: "Los Angeles",
          departure: "2024-01-20",
          arrival: "2024-02-25",
          vessel: "MSC Oscar",
          status: "In Transit",
        },
        {
          id: "3",
          origin: "Singapore",
          destination: "Hamburg",
          departure: "2024-01-25",
          arrival: "2024-03-05",
          vessel: "CMA CGM Marco Polo",
          status: "Delayed",
        },
        {
          id: "4",
          origin: "Los Angeles",
          destination: "Rotterdam",
          departure: "2024-02-01",
          arrival: "2024-03-10",
          vessel: "Ever Given",
          status: "Scheduled",
        },
        {
          id: "5",
          origin: "Hamburg",
          destination: "Singapore",
          departure: "2024-02-05",
          arrival: "2024-03-15",
          vessel: "HMM Algeciras",
          status: "Scheduled",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "scheduled":
        return <Badge variant="default">Активный</Badge>;
      case "in transit":
        return <Badge variant="secondary">В пути</Badge>;
      case "maintenance":
        return <Badge variant="destructive">Обслуживание</Badge>;
      case "delayed":
        return <Badge variant="outline">Задержка</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Database className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    База данных
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Просмотр и управление данными
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего портов
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ports.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 с прошлой недели
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активных судов
              </CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vessels.filter((v) => v.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                из {vessels.length} всего
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активных рейсов
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.filter((s) => s.status === "In Transit").length}
              </div>
              <p className="text-xs text-muted-foreground">в данный момент</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Задержек</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.filter((s) => s.status === "Delayed").length}
              </div>
              <p className="text-xs text-muted-foreground">требуют внимания</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Data Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ports" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Порты
            </TabsTrigger>
            <TabsTrigger value="vessels" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Судна
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Расписания
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ports" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Порты</CardTitle>
                    <CardDescription>
                      Список всех доступных портов
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Фильтр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Страна</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ports.map((port) => (
                        <TableRow key={port.id}>
                          <TableCell className="font-medium">
                            {port.name}
                          </TableCell>
                          <TableCell>{port.country}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{port.code}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vessels" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Судна</CardTitle>
                    <CardDescription>Информация о судах флота</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Фильтр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Вместимость</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vessels.map((vessel) => (
                        <TableRow key={vessel.id}>
                          <TableCell className="font-medium">
                            {vessel.name}
                          </TableCell>
                          <TableCell>{vessel.type}</TableCell>
                          <TableCell>{vessel.capacity}</TableCell>
                          <TableCell>{getStatusBadge(vessel.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Расписания рейсов</CardTitle>
                    <CardDescription>
                      Текущие и планируемые рейсы
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Фильтр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Откуда</TableHead>
                        <TableHead>Куда</TableHead>
                        <TableHead>Отправление</TableHead>
                        <TableHead>Прибытие</TableHead>
                        <TableHead>Судно</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">
                            {schedule.origin}
                          </TableCell>
                          <TableCell>{schedule.destination}</TableCell>
                          <TableCell>{schedule.departure}</TableCell>
                          <TableCell>{schedule.arrival}</TableCell>
                          <TableCell>{schedule.vessel}</TableCell>
                          <TableCell>
                            {getStatusBadge(schedule.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
