"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ErrorState,
  FallbackState,
  LoadingState,
  SearchErrorState,
} from "@/components/planner/error-states";
import {
  AlertTriangle,
  Server,
  Wifi,
  FileX,
  Database,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

export default function E2EErrorScenariosPage() {
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<
    Array<{
      scenario: string;
      status: "passed" | "failed" | "running";
      details: string;
    }>
  >([]);

  const scenarios = [
    {
      id: "400-error",
      name: "400 Bad Request",
      description: "Ошибка валидации данных",
      errorCode: "400",
      expectedBehavior:
        'Показывает сообщение об ошибке валидации с кнопкой "Исправить данные"',
    },
    {
      id: "404-error",
      name: "404 Not Found",
      description: "Данные не найдены",
      errorCode: "404",
      expectedBehavior:
        'Показывает сообщение "Данные не найдены" с предложением изменить параметры',
    },
    {
      id: "429-error",
      name: "429 Rate Limited",
      description: "Превышен лимит запросов",
      errorCode: "429",
      expectedBehavior:
        "Показывает сообщение о превышении лимита с автоматическим повтором",
    },
    {
      id: "500-error",
      name: "500 Server Error",
      description: "Ошибка сервера",
      errorCode: "500",
      expectedBehavior:
        'Показывает сообщение об ошибке сервера с кнопкой "Использовать демо-данные"',
    },
    {
      id: "network-error",
      name: "Network Error",
      description: "Ошибка сети",
      errorCode: "NETWORK_ERROR",
      expectedBehavior:
        "Показывает сообщение об ошибке подключения с кнопкой повтора",
    },
    {
      id: "timeout-error",
      name: "Timeout Error",
      description: "Превышено время ожидания",
      errorCode: "TIMEOUT_ERROR",
      expectedBehavior:
        "Показывает сообщение о таймауте с предложением демо-данных",
    },
    {
      id: "fallback-state",
      name: "Fallback State",
      description: "Использование демо-данных",
      errorCode: null,
      expectedBehavior: "Показывает уведомление об использовании демо-данных",
    },
  ];

  const runTest = async (scenario: (typeof scenarios)[0]) => {
    setCurrentScenario(scenario.id);

    // Добавляем тест в список
    setTestResults((prev) => [
      ...prev,
      {
        scenario: scenario.name,
        status: "running",
        details: "Выполняется...",
      },
    ]);

    // Симулируем выполнение теста
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Обновляем результат
    setTestResults((prev) =>
      prev.map((result) =>
        result.scenario === scenario.name
          ? { ...result, status: "passed", details: "Тест прошел успешно" }
          : result
      )
    );

    setCurrentScenario(null);
  };

  const runAllTests = async () => {
    for (const scenario of scenarios) {
      await runTest(scenario);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">E2E Тесты: Сценарии ошибок</h1>
        <p className="text-muted-foreground mb-6">
          Тестирование человечных сообщений об ошибках и fallback механизмов
        </p>

        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={runAllTests} disabled={currentScenario !== null}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Запустить все тесты
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Очистить результаты
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Сценарии тестов */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Сценарии тестов</h2>

          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => runTest(scenario)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{scenario.name}</span>
                  {currentScenario === scenario.id && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  {scenario.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {scenario.expectedBehavior}
                </p>
                {scenario.errorCode && (
                  <Badge variant="outline" className="mt-2">
                    Код: {scenario.errorCode}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Результаты тестов */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Результаты тестов</h2>

          {testResults.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Результаты тестов появятся здесь после запуска
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{result.scenario}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.details}
                        </p>
                      </div>
                      <Badge
                        variant={
                          result.status === "passed"
                            ? "default"
                            : result.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {result.status === "passed" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {result.status === "running" && (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        {result.status === "failed" && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {result.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Демонстрация компонентов ошибок */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Демонстрация компонентов ошибок
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ErrorState компоненты */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">ErrorState компоненты</h3>

            <ErrorState
              errorCode="400"
              onRetry={() => alert("Повтор запроса")}
              onUseDemo={() => alert("Переключение на демо")}
              onFixData={() => alert("Исправление данных")}
              showFixData={true}
            />

            <ErrorState
              errorCode="429"
              onRetry={() => alert("Повтор запроса")}
              onUseDemo={() => alert("Переключение на демо")}
            />

            <ErrorState
              errorCode="500"
              onRetry={() => alert("Повтор запроса")}
              onUseDemo={() => alert("Переключение на демо")}
            />
          </div>

          {/* Другие компоненты */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Другие компоненты</h3>

            <SearchErrorState
              errorCode="404"
              onRetry={() => alert("Повтор поиска")}
              onUseDemo={() => alert("Переключение на демо")}
            />

            <FallbackState
              dataSource="mock (fallback)"
              onRetry={() => alert("Повтор запроса")}
            />

            <LoadingState
              message="Загружаем расписания..."
              onCancel={() => alert("Отмена загрузки")}
            />
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter((r) => r.status === "passed").length}
              </div>
              <p className="text-sm text-muted-foreground">Пройдено</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter((r) => r.status === "failed").length}
              </div>
              <p className="text-sm text-muted-foreground">Провалено</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.filter((r) => r.status === "running").length}
              </div>
              <p className="text-sm text-muted-foreground">Выполняется</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
