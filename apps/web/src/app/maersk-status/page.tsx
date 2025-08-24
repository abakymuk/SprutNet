"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Database,
  Globe,
  Shield,
  Clock,
  Info,
} from "lucide-react";

interface MaerskProduct {
  name: string;
  endpoint: string;
  description: string;
  status: "active" | "inactive" | "error" | "not_configured" | "disabled";
}

interface MaerskStatusResponse {
  success: boolean;
  message: string;
  environment: {
    success: boolean;
    message: string;
    details?: {
      errors?: string[];
    };
  };
  featureFlags: Record<string, boolean>;
  products: MaerskProduct[];
  details?: {
    products?: string[];
    endpoints?: string[];
    errors?: string[];
  };
  recommendations: string[];
}

export default function MaerskStatusPage() {
  const [status, setStatus] = useState<MaerskStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/maersk-status");
      const data = await response.json();

      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "not_configured":
      case "disabled":
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Активен
          </Badge>
        );
      case "inactive":
        return <Badge variant="destructive">Неактивен</Badge>;
      case "error":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Ошибка
          </Badge>
        );
      case "not_configured":
        return <Badge variant="outline">Не настроен</Badge>;
      case "disabled":
        return <Badge variant="outline">Отключен</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Проверка статуса Maersk API...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Статус Maersk API
              </h1>
              <p className="text-muted-foreground">
                Проверка доступа к Maersk Ocean API и настройка переменных
                окружения
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              T7. Live API Access
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              ENV Configuration
            </Badge>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <Button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Обновить статус
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overall Status */}
        {status && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Общий статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-2">{status.message}</p>
              {status.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Рекомендации:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {status.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        {status && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Переменные окружения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">MAERSK_API_KEY</span>
                  <Badge
                    variant={
                      status.environment.success ? "default" : "destructive"
                    }
                  >
                    {status.environment.success
                      ? "Установлен"
                      : "Не установлен"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">MAERSK_API_BASE_URL</span>
                  <Badge variant="outline">https://api.maersk.com</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">FEATURE_MAERSK</span>
                  <Badge
                    variant={
                      status.featureFlags.MAERSK_API ? "default" : "secondary"
                    }
                  >
                    {status.featureFlags.MAERSK_API ? "Включен" : "Отключен"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">FEATURE_DEADLINES</span>
                  <Badge
                    variant={
                      status.featureFlags.DEADLINES ? "default" : "secondary"
                    }
                  >
                    {status.featureFlags.DEADLINES ? "Включен" : "Отключен"}
                  </Badge>
                </div>
              </div>

              {status.environment.details?.errors &&
                status.environment.details.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {status.environment.details.errors.map(
                          (error, index) => (
                            <li key={index}>{error}</li>
                          )
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>
        )}

        {/* Products Status */}
        {status && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Продукты Maersk API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {status.products.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(product.status)}
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {product.endpoint}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                ))}
              </div>

              {status.details?.errors && status.details.errors.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <h4 className="font-medium mb-2">Ошибки доступа:</h4>
                    <ul className="list-disc list-inside">
                      {status.details.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Документация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Статус API продуктов:</h4>
                <div className="text-sm text-muted-foreground mb-2">
                  ✅ Активен - API доступен и работает
                  <br />
                  ⚠️ Недоступен - API недоступен или требует дополнительной
                  настройки
                  <br />❌ Ошибка - Проблемы с аутентификацией или конфигурацией
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Источник правды по API:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Base URL:</strong> https://api.maersk.com
                  </li>
                  <li>
                    <strong>Auth Header:</strong> x-api-key
                  </li>
                  <li>
                    <strong>Developer Portal:</strong>{" "}
                    https://developer.maersk.com
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Настройка переменных окружения:
                </h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div>MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd</div>
                  <div>MAERSK_API_SECRET=CnIcg3YgUUtSp8a3</div>
                  <div>MAERSK_API_BASE_URL=https://api.maersk.com</div>
                  <div>
                    MAERSK_LOCATIONS_API_URL=https://api.maersk.com/reference-data
                  </div>
                  <div>MAERSK_P2P_API_URL=https://api.maersk.com/products</div>
                  <div>
                    MAERSK_VESSELS_API_URL=https://api.maersk.com/reference-data
                  </div>
                  <div>MAERSK_DEADLINES_API_URL=https://api.maersk.com</div>
                  <div>FEATURE_MAERSK=true</div>
                  <div>FEATURE_DEADLINES=true</div>
                  <div>CACHE_TTL_MINUTES=10</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
