import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Wifi, Server, FileX } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: "network" | "server" | "not-found" | "generic";
}

export function ErrorState({
  title,
  message,
  onRetry,
  type = "generic",
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: Wifi,
          defaultTitle: "Ошибка подключения",
          defaultMessage:
            "Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.",
          color: "text-orange-600",
        };
      case "server":
        return {
          icon: Server,
          defaultTitle: "Ошибка сервера",
          defaultMessage:
            "Произошла ошибка на сервере. Попробуйте позже или обратитесь в поддержку.",
          color: "text-red-600",
        };
      case "not-found":
        return {
          icon: FileX,
          defaultTitle: "Данные не найдены",
          defaultMessage:
            "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.",
          color: "text-blue-600",
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: "Произошла ошибка",
          defaultMessage:
            "Что-то пошло не так. Попробуйте обновить страницу или обратитесь в поддержку.",
          color: "text-red-600",
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full bg-muted ${config.color}`}>
            <IconComponent className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-lg">
          {title || config.defaultTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {message || config.defaultMessage}
        </p>

        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function SearchErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Не удалось найти рейсы. Проверьте параметры поиска и попробуйте снова.
        </span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Повторить
          </Button>
        )}
      </AlertDescription>
    </Alert>
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
