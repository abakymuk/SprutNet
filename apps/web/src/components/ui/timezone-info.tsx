"use client";

import { Globe, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTimezoneOffset,
  isDST,
  getTimezoneAbbreviation,
  getPopularTimezones,
  isValidTimezone,
} from "@/lib/utils/timezone";

interface TimezoneInfoProps {
  /** Таймзона (например, 'Europe/Moscow') */
  timezone: string;
  /** Дата для расчета (по умолчанию текущая) */
  date?: Date;
  /** Показывать ли детальную информацию */
  showDetails?: boolean;
  /** Размер компонента */
  size?: "sm" | "md" | "lg";
}

export function TimezoneInfo({
  timezone,
  date = new Date(),
  showDetails = false,
  size = "md",
}: TimezoneInfoProps) {
  const isValid = isValidTimezone(timezone);
  const offset = getTimezoneOffset(timezone, date);
  const dst = isDST(timezone, date);
  const abbreviation = getTimezoneAbbreviation(timezone);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (!isValid) {
    return (
      <div
        className={`flex items-center gap-2 text-red-500 ${sizeClasses[size]}`}
      >
        <AlertTriangle className={iconSizes[size]} />
        <span>Неизвестная таймзона: {timezone}</span>
      </div>
    );
  }

  const formatOffset = (offsetMinutes: number) => {
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? "+" : "-";
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
        <Globe className={`${iconSizes[size]} text-muted-foreground`} />
        <span className="font-medium">{abbreviation}</span>
        <Badge variant={dst ? "default" : "secondary"} className="text-xs">
          {formatOffset(offset)}
          {dst && " (DST)"}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          {timezone}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Сокращение:</span>
          <Badge variant="outline">{abbreviation}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Смещение от UTC:
          </span>
          <Badge variant={dst ? "default" : "secondary"}>
            {formatOffset(offset)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Летнее время:</span>
          <Badge variant={dst ? "default" : "secondary"}>
            {dst ? "Да" : "Нет"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Текущее время:</span>
          <span className="font-mono text-sm">
            {date.toLocaleTimeString("ru-RU", { timeZone: timezone })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimezoneSelectorProps {
  /** Выбранная таймзона */
  value: string;
  /** Обработчик изменения */
  onChange: (timezone: string) => void;
  /** Показывать ли популярные таймзоны */
  showPopular?: boolean;
  /** Показывать ли все таймзоны */
  showAll?: boolean;
}

export function TimezoneSelector({
  value,
  onChange,
  showPopular = true,
  showAll = false,
}: TimezoneSelectorProps) {
  const popularTimezones = getPopularTimezones();

  return (
    <div className="space-y-4">
      {showPopular && (
        <div>
          <h4 className="text-sm font-medium mb-2">Популярные таймзоны</h4>
          <div className="grid grid-cols-1 gap-2">
            {popularTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => onChange(tz.value)}
                className={`flex items-center justify-between p-2 rounded-md border text-left transition-colors ${
                  value === tz.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-sm">{tz.label}</span>
                <Badge variant="outline" className="text-xs">
                  {tz.abbr}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {showAll && (
        <div>
          <h4 className="text-sm font-medium mb-2">Все таймзоны</h4>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {getPopularTimezones().map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.abbr})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
