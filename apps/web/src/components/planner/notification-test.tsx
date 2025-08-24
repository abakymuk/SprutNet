"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface NotificationTestProps {
  sailingId: string;
  deadlineId?: string;
  deadline?: {
    id: string;
    name: string;
    description: string;
    deadlineLocal: string;
  };
}

export function NotificationTest({
  sailingId,
  deadlineId,
  deadline,
}: NotificationTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    sentNotifications?: any[];
  } | null>(null);

  const sendTestNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send_reminder",
          sailingId,
          deadlineId,
          deadline,
          settings: {
            email: true,
            push: true,
            reminders: {
              "24h": true,
              "12h": true,
              "6h": false,
              "1h": false,
            },
          },
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Тестирование уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Отправьте тестовое уведомление для проверки работы системы
        </div>

        {deadline && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">Тестовый дедлайн:</div>
            <div className="text-sm text-muted-foreground">
              {deadline.name} -{" "}
              {new Date(deadline.deadlineLocal).toLocaleString("ru-RU")}
            </div>
          </div>
        )}

        <Button
          onClick={sendTestNotification}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Отправить тестовое уведомление
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="font-medium">{result.message}</div>
              {result.sentNotifications &&
                result.sentNotifications.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium">
                      Отправленные уведомления:
                    </div>
                    {result.sentNotifications.map((notification, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        <Badge
                          variant={
                            notification.success ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {notification.type}
                        </Badge>
                        {notification.success ? (
                          <span className="text-green-600">✓ Успешно</span>
                        ) : (
                          <span className="text-red-600">
                            ✗ Ошибка: {notification.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">
            Что происходит при тестировании:
          </div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Отправляется email уведомление (mock)</li>
            <li>Отправляется push уведомление (mock)</li>
            <li>Логи записываются в консоль</li>
            <li>В реальном проекте будут использоваться SendGrid/OneSignal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
