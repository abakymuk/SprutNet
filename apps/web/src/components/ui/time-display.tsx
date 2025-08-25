"use client";

import { Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTimeForDisplay } from "@/lib/utils/timezone";

interface TimeDisplayProps {
  /** UTC дата/время */
  utcDate: Date;
  /** Таймзона (например, 'Europe/Moscow') */
  timezone: string;
  /** Показывать ли UTC время */
  showUTC?: boolean;
  /** Размер компонента */
  size?: "sm" | "md" | "lg";
  /** Показывать ли иконку */
  showIcon?: boolean;
  /** Дополнительный CSS класс */
  className?: string;
}

export function TimeDisplay({
  utcDate,
  timezone,
  showUTC = true,
  size = "md",
  showIcon = true,
  className = "",
}: TimeDisplayProps) {
  const timeInfo = formatTimeForDisplay(utcDate, timezone, showUTC);

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

  return (
    <div
      className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <Clock className={`${iconSizes[size]} text-muted-foreground`} />
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{timeInfo.localTime}</span>
          <Badge
            variant={timeInfo.isDST ? "default" : "secondary"}
            className="text-xs"
          >
            {timeInfo.timezoneAbbr}
            {timeInfo.isDST && " (DST)"}
          </Badge>
        </div>

        {showUTC && timeInfo.utcTime && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Globe className="h-3 w-3" />
                <span>{timeInfo.utcTime}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>UTC время</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

interface TimeDisplayCompactProps {
  /** UTC дата/время */
  utcDate: Date;
  /** Таймзона */
  timezone: string;
  /** Показывать ли таймзону */
  showTimezone?: boolean;
  /** Формат времени */
  format?: "time" | "datetime" | "date";
}

export function TimeDisplayCompact({
  utcDate,
  timezone,
  showTimezone = true,
  format = "datetime",
}: TimeDisplayCompactProps) {
  const formatString = {
    time: "HH:mm",
    datetime: "dd.MM.yyyy HH:mm",
    date: "dd.MM.yyyy",
  }[format];

  const timeInfo = formatTimeForDisplay(utcDate, timezone, false);

  return (
    <span className="inline-flex items-center gap-1">
      <span>{timeInfo.localTime}</span>
      {showTimezone && (
        <Badge variant="outline" className="text-xs">
          {timeInfo.timezoneAbbr}
        </Badge>
      )}
    </span>
  );
}
