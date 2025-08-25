import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  Server,
  FileX,
  AlertCircle,
  RotateCcw,
  Database,
  ExternalLink,
} from "lucide-react";
import {
  getErrorMessage,
  getErrorType,
  getErrorIcon,
  getErrorColor,
  type ErrorMessage,
} from "@/lib/errors/messages";

interface ErrorStateProps {
  errorCode?: string | number;
  title?: string;
  message?: string;
  suggestion?: string;
  onRetry?: () => void;
  onUseDemo?: () => void;
  onFixData?: () => void;
  showFallback?: boolean;
  showRetry?: boolean;
  showFixData?: boolean;
  type?: "network" | "server" | "not-found" | "generic";
  className?: string;
}

export function ErrorState({
  errorCode,
  title,
  message,
  suggestion,
  onRetry,
  onUseDemo,
  onFixData,
  showFallback = true,
  showRetry = true,
  showFixData = false,
  type,
  className = "",
}: ErrorStateProps) {
  // Получаем сообщение об ошибке из словаря
  const errorMessage: ErrorMessage = errorCode
    ? getErrorMessage(errorCode)
    : { title: "", message: "", suggestion: "", action: "" };

  // Определяем тип ошибки
  const errorType = type || (errorCode ? getErrorType(errorCode) : "unknown");

  // Получаем иконку и цвет
  const iconName = getErrorIcon(errorType);
  const color = getErrorColor(errorType);

  // Маппинг иконок
  const iconMap: { [key: string]: any } = {
    AlertTriangle,
    Server,
    Wifi,
    AlertCircle,
    FileX,
  };

  const IconComponent = iconMap[iconName] || AlertCircle;

  // Определяем, какие кнопки показывать
  const shouldShowRetry =
    showRetry && onRetry && (errorType === "network" || errorCode === "429");
  const shouldShowDemo =
    showFallback &&
    onUseDemo &&
    (errorType === "server" || errorCode?.toString().startsWith("5"));
  const shouldShowFixData =
    showFixData &&
    onFixData &&
    (errorType === "validation" || errorCode?.toString().startsWith("4"));

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <IconComponent className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-lg">{title || errorMessage.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {message || errorMessage.message}
        </p>

        {(suggestion || errorMessage.suggestion) && (
          <p className="text-sm text-muted-foreground">
            {suggestion || errorMessage.suggestion}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {shouldShowRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {errorCode === "429" ? "Повторить сейчас" : "Попробовать снова"}
            </Button>
          )}

          {shouldShowDemo && (
            <Button
              variant="outline"
              onClick={onUseDemo}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Использовать демо-данные
            </Button>
          )}

          {shouldShowFixData && (
            <Button
              variant="outline"
              onClick={onFixData}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {errorMessage.action || "Исправить данные"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchErrorState({
  errorCode,
  onRetry,
  onUseDemo,
}: {
  errorCode?: string | number;
  onRetry?: () => void;
  onUseDemo?: () => void;
}) {
  const errorMessage = errorCode ? getErrorMessage(errorCode) : null;
  const errorType = errorCode ? getErrorType(errorCode) : "unknown";
  const color = getErrorColor(errorType);

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-2">
        <span>
          {errorMessage?.message ||
            "Не удалось найти рейсы. Проверьте параметры поиска и попробуйте снова."}
        </span>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Повторить
            </Button>
          )}
          {onUseDemo && (
            <Button variant="outline" size="sm" onClick={onUseDemo}>
              <Database className="h-4 w-4 mr-2" />
              Демо-данные
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Компонент для отображения fallback состояния
export function FallbackState({
  onRetry,
  dataSource,
}: {
  onRetry?: () => void;
  dataSource?: string;
}) {
  return (
    <Alert>
      <Database className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">Используются демо-данные</p>
          <p className="text-sm text-muted-foreground">
            {dataSource === "mock (fallback)"
              ? "В связи с техническими проблемами используются демонстрационные данные."
              : "Демо-данные показывают примеры рейсов для ознакомления."}
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Компонент для отображения состояния загрузки с возможностью отмены
export function LoadingState({
  message = "Загружаем данные...",
  onCancel,
}: {
  message?: string;
  onCancel?: () => void;
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted text-muted-foreground mb-4">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="mt-4"
          >
            Отменить
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title = "Нет результатов",
  message = "По вашему запросу ничего не найдено",
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted text-muted-foreground mb-4">
          <FileX className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {action}
      </CardContent>
    </Card>
  );
}
