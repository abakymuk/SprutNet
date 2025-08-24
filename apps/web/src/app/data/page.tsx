"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Ship, MapPin, Clock, Calendar } from "lucide-react";

interface Vessel {
  vessel_imo_number: number;
  carrier_vessel_code: string;
  vessel_short_name: string;
  vessel_long_name: string;
  vessel_flag_code: string;
  vessel_built_year: number;
  vessel_capacity_teu: number;
}

interface Location {
  carrier_geo_id: string;
  country_code: string;
  country_name: string;
  city_name: string;
  location_type: string;
  location_name: string;
}

interface OceanProduct {
  id: string;
  vessel_operator_carrier_code: string;
  carrier_product_id: string;
  product_valid_from_date: string;
  product_valid_to_date: string;
}

interface Deadline {
  id: string;
  deadline_name: string;
  deadline_local: string;
  shipment_deadline: {
    vessel_imo_number: number;
    voyage: string;
    port_of_load: string;
  };
}

export default function DataPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [oceanProducts, setOceanProducts] = useState<OceanProduct[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем данные из API endpoints
      const [vesselsRes, locationsRes, productsRes, deadlinesRes] =
        await Promise.all([
          fetch("/api/vessels"),
          fetch("/api/locations"),
          fetch("/api/ocean-products"),
          fetch("/api/deadlines"),
        ]);

      if (vesselsRes.ok) {
        const vesselsData = await vesselsRes.json();
        setVessels(vesselsData.slice(0, 10)); // Показываем только первые 10
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.slice(0, 10));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setOceanProducts(productsData.slice(0, 10));
      }

      if (deadlinesRes.ok) {
        const deadlinesData = await deadlinesRes.json();
        setDeadlines(deadlinesData.slice(0, 10));
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataFromAPI = async (type: string) => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/load-data?type=${type}`, {
        method: "POST",
      });

      if (response.ok) {
        await loadData(); // Перезагружаем данные
        alert(`Данные ${type} успешно загружены!`);
      } else {
        alert(`Ошибка при загрузке данных ${type}`);
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка данных...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Данные Maersk API</h1>
        <p className="text-muted-foreground mb-6">
          Просмотр и управление данными из Maersk API в базе данных
        </p>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => loadDataFromAPI("vessels")}
            disabled={loadingData}
            className="flex items-center gap-2"
          >
            {loadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ship className="h-4 w-4" />
            )}
            Загрузить суда
          </Button>
          <Button
            onClick={() => loadDataFromAPI("locations")}
            disabled={loadingData}
            className="flex items-center gap-2"
          >
            {loadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Загрузить локации
          </Button>
          <Button
            onClick={() => loadDataFromAPI("ocean-products")}
            disabled={loadingData}
            className="flex items-center gap-2"
          >
            {loadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            Загрузить расписания
          </Button>
          <Button
            onClick={() => loadDataFromAPI("deadlines")}
            disabled={loadingData}
            className="flex items-center gap-2"
          >
            {loadingData ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Загрузить сроки
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vessels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Суда ({vessels.length})
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Локации ({locations.length})
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Расписания ({oceanProducts.length})
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Сроки ({deadlines.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vessels.map((vessel) => (
              <Card key={vessel.vessel_imo_number}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {vessel.vessel_short_name || vessel.vessel_long_name}
                  </CardTitle>
                  <CardDescription>
                    IMO: {vessel.vessel_imo_number}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Код перевозчика:
                      </span>
                      <Badge variant="secondary">
                        {vessel.carrier_vessel_code}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Флаг:
                      </span>
                      <Badge variant="outline">{vessel.vessel_flag_code}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Год постройки:
                      </span>
                      <span>{vessel.vessel_built_year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Вместимость:
                      </span>
                      <span>{vessel.vessel_capacity_teu} TEU</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Card key={location.carrier_geo_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {location.city_name}
                  </CardTitle>
                  <CardDescription>{location.country_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Geo ID:
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {location.carrier_geo_id}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Страна:
                      </span>
                      <Badge variant="outline">{location.country_code}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Тип:
                      </span>
                      <span>{location.location_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Название:
                      </span>
                      <span className="text-right">
                        {location.location_name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {oceanProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {product.carrier_product_id}
                  </CardTitle>
                  <CardDescription>
                    Перевозчик: {product.vessel_operator_carrier_code}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        ID продукта:
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {product.carrier_product_id}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Действителен с:
                      </span>
                      <span>
                        {new Date(
                          product.product_valid_from_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Действителен до:
                      </span>
                      <span>
                        {new Date(
                          product.product_valid_to_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deadlines" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deadlines.map((deadline) => (
              <Card key={deadline.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {deadline.deadline_name}
                  </CardTitle>
                  <CardDescription>
                    Судно: {deadline.shipment_deadline.vessel_imo_number}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Рейс:
                      </span>
                      <Badge variant="secondary">
                        {deadline.shipment_deadline.voyage}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Порт погрузки:
                      </span>
                      <span>{deadline.shipment_deadline.port_of_load}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Срок:
                      </span>
                      <span>
                        {new Date(deadline.deadline_local).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
