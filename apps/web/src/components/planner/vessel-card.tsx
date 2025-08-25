"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Ship,
  Anchor,
  Calendar,
  MapPin,
  Users,
  Info,
  ExternalLink,
} from "lucide-react";

interface VesselBrief {
  imo: string;
  name: string;
  operator: string;
  size: number;
  flag?: string;
  builtYear?: number;
}

interface VesselCardProps {
  imo: string;
  children: React.ReactNode;
}

export function VesselCard({ imo, children }: VesselCardProps) {
  const [vessel, setVessel] = useState<VesselBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchVesselInfo = useCallback(async () => {
    if (!imo) return;

    // Валидация IMO номера
    if (!/^\d{7}$/.test(imo)) {
      console.warn("⚠️ Invalid IMO number format:", imo);
      setError("Некорректный формат IMO номера");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🚢 Fetching vessel info for IMO:", imo);
      const response = await fetch(`/api/vessels/${imo}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch vessel info: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("📊 Vessel data:", data);
      setVessel(data.vessel);
    } catch (err) {
      console.error("❌ Error fetching vessel info:", err);
      setError("Ошибка при загрузке информации о судне");
    } finally {
      setIsLoading(false);
    }
  }, [imo]);

  useEffect(() => {
    if (isOpen) {
      fetchVesselInfo();
    }
  }, [isOpen, imo, fetchVesselInfo]);

  const getFlagCountry = (flagCode: string) => {
    const countries: Record<string, string> = {
      DK: "Denmark",
      US: "United States",
      DE: "Germany",
      NL: "Netherlands",
      GB: "United Kingdom",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      NO: "Norway",
      SE: "Sweden",
      FI: "Finland",
      PL: "Poland",
      BE: "Belgium",
      CH: "Switzerland",
      AT: "Austria",
      PT: "Portugal",
      IE: "Ireland",
      GR: "Greece",
      HR: "Croatia",
      SI: "Slovenia",
      HU: "Hungary",
      SK: "Slovakia",
      CZ: "Czech Republic",
      LT: "Lithuania",
      LV: "Latvia",
      EE: "Estonia",
      BY: "Belarus",
    };
    return countries[flagCode] || flagCode;
  };

  const formatTEU = (teu: number) => {
    if (teu >= 1000) {
      return `${(teu / 1000).toFixed(1)}k TEU`;
    }
    return `${teu.toLocaleString()} TEU`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Информация о судне
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : vessel ? (
          <div className="space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {vessel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      IMO номер
                    </div>
                    <div className="font-mono text-lg">{vessel.imo}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Оператор
                    </div>
                    <Badge variant="outline">{vessel.operator}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Anchor className="h-4 w-4" />
                      Вместимость
                    </div>
                    <div className="text-lg font-semibold">
                      {formatTEU(vessel.size)}
                    </div>
                  </div>
                  {vessel.flag && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Флаг
                      </div>
                      <div className="text-sm">
                        {getFlagCountry(vessel.flag)}
                        <Badge variant="secondary" className="ml-2">
                          {vessel.flag}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {vessel.builtYear && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Год постройки
                    </div>
                    <div className="text-lg">{vessel.builtYear}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Дополнительные действия */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Подробнее
              </Button>
              <Button variant="outline" className="flex-1">
                <MapPin className="h-4 w-4 mr-2" />
                Отследить
              </Button>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>Информация о судне не найдена</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
