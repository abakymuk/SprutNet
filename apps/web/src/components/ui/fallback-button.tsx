"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  Database,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";

interface FallbackButtonProps {
  /** Текущий источник данных */
  dataSource: "maersk" | "mock" | "mock (fallback)";
  /** Функция для переключения на мок-данные */
  onSwitchToMock: () => void;
  /** Сообщение об ошибке */
  error?: string;
  /** Заголовок кнопки */
  title?: string;
  /** Размер кнопки */
  size?: "sm" | "default" | "lg";
  /** Вариант кнопки */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Показывать ли детальную информацию */
  showDetails?: boolean;
}

export function FallbackButton({
  dataSource,
  onSwitchToMock,
  error,
  title = "Показать демо-данные",
  size = "sm",
  variant = "outline",
  showDetails = false,
}: FallbackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchToMock = async () => {
    setIsLoading(true);
    try {
      await onSwitchToMock();
    } finally {
      setIsLoading(false);
    }
  };

  const getDataSourceInfo = () => {
    switch (dataSource) {
      case "maersk":
        return {
          icon: <Database className="h-4 w-4" />,
          label: "Maersk API",
          color: "bg-green-100 text-green-800",
          description: "Реальные данные от Maersk API",
        };
      case "mock":
        return {
          icon: <Info className="h-4 w-4" />,
          label: "Демо-данные",
          color: "bg-blue-100 text-blue-800",
          description: "Тестовые данные для демонстрации",
        };
      case "mock (fallback)":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Fallback",
          color: "bg-orange-100 text-orange-800",
          description: "Демо-данные (API недоступен)",
        };
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          label: "Неизвестно",
          color: "bg-gray-100 text-gray-800",
          description: "Источник данных неизвестен",
        };
    }
  };

  const dataSourceInfo = getDataSourceInfo();

  return (
    <div className="space-y-2">
      {/* Индикатор источника данных */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={dataSourceInfo.color}>
          {dataSourceInfo.icon}
          <span className="ml-1">{dataSourceInfo.label}</span>
        </Badge>

        {showDetails && (
          <span className="text-sm text-muted-foreground">
            {dataSourceInfo.description}
          </span>
        )}
      </div>

      {/* Fallback кнопка */}
      {(dataSource === "maersk" || error) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSwitchToMock}
                disabled={isLoading}
                size={size}
                variant={variant}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {isLoading ? "Переключение..." : title}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Переключиться на демо-данные для тестирования</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Ошибка API:</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs text-muted-foreground">
                Нажмите кнопку выше для переключения на демо-данные
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Успешное переключение */}
      {dataSource === "mock (fallback)" && !error && (
        <Alert className="mt-2 border-orange-200 bg-orange-50">
          <CheckCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Переключено на демо-данные из-за недоступности API
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
