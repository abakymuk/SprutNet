"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  MapPin,
  Ship,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  action: string;
  duration: number;
  completed: boolean;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Выбор портов",
    description:
      "Выбираем Shanghai (CNSHA) как порт отправления и Los Angeles (USLAX) как порт назначения",
    action: "Нажмите на поля выбора портов",
    duration: 3000,
    completed: false,
  },
  {
    id: 2,
    title: "Установка дат",
    description: "Устанавливаем период отправления с 15 по 30 января 2024 года",
    action: "Выберите даты в календарях",
    duration: 2500,
    completed: false,
  },
  {
    id: 3,
    title: "Настройка фильтров",
    description: "Выбираем контейнеры 40FT и включаем транзитные рейсы",
    action: "Отметьте нужные опции",
    duration: 2000,
    completed: false,
  },
  {
    id: 4,
    title: "Поиск рейсов",
    description: "Запускаем поиск доступных рейсов",
    action: "Нажмите кнопку 'Найти рейсы'",
    duration: 4000,
    completed: false,
  },
  {
    id: 5,
    title: "Анализ результатов",
    description: "Просматриваем найденные рейсы и сравниваем их",
    action: "Изучите таблицу результатов",
    duration: 3000,
    completed: false,
  },
  {
    id: 6,
    title: "Просмотр дедлайнов",
    description:
      "Открываем детальную информацию о дедлайнах для выбранного рейса",
    action: "Нажмите на кнопку дедлайнов (⏰)",
    duration: 3500,
    completed: false,
  },
  {
    id: 7,
    title: "Настройка уведомлений",
    description: "Настраиваем уведомления о важных дедлайнах",
    action: "Перейдите на вкладку 'Уведомления'",
    duration: 3000,
    completed: false,
  },
  {
    id: 8,
    title: "Аналитика маршрута",
    description: "Изучаем аналитические данные по маршруту",
    action: "Перейдите на вкладку 'Аналитика'",
    duration: 2500,
    completed: false,
  },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentStep < demoSteps.length) {
      const step = demoSteps[currentStep];
      const stepProgress = (progress / step.duration) * 100;

      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100;
          if (newProgress >= step.duration) {
            // Step completed
            setCompletedSteps((prev) => [...prev, step.id]);
            setProgress(0);
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep((prev) => prev + 1);
            } else {
              setIsPlaying(false);
            }
          }
          return newProgress;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, progress, completedSteps]);

  const startDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setCompletedSteps([]);
    setIsPlaying(true);
  };

  const pauseDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setCompletedSteps(demoSteps.slice(0, stepIndex).map((s) => s.id));
  };

  const currentStepData = demoSteps[currentStep];
  const progressPercentage = (currentStep / demoSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Главная
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">Демо</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Play className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Демонстрация MVP
              </h1>
              <p className="text-muted-foreground">
                Пошаговый показ возможностей планировщика морских перевозок
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Готов к демо
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~2 минуты
            </Badge>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Demo Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Управление демо
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isPlaying ? pauseDemo : startDemo}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPlaying ? "Пауза" : "Запустить демо"}
              </Button>

              <Button
                variant="outline"
                onClick={resetDemo}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Сбросить
              </Button>

              <Link href="/planner">
                <Button variant="outline" className="flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Открыть планировщик
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Общий прогресс</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        {currentStepData && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <span className="text-primary-foreground font-bold">
                    {currentStepData.id}
                  </span>
                </div>
                {currentStepData.title}
                {completedSteps.includes(currentStepData.id) && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {currentStepData.description}
              </p>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Действие:</strong> {currentStepData.action}
                </AlertDescription>
              </Alert>

              {isPlaying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс шага</span>
                    <span>
                      {Math.round((progress / currentStepData.duration) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(progress / currentStepData.duration) * 100}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Steps */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Все шаги демо</h2>

          <div className="grid gap-4">
            {demoSteps.map((step, index) => (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all ${
                  currentStep === index
                    ? "border-primary shadow-md"
                    : completedSteps.includes(step.id)
                      ? "border-green-200 bg-green-50/50"
                      : "hover:border-muted-foreground/20"
                }`}
                onClick={() => goToStep(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          completedSteps.includes(step.id)
                            ? "bg-green-100 text-green-700"
                            : currentStep === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-bold">{step.id}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {step.duration / 1000}s
                      </Badge>
                      {completedSteps.includes(step.id) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Demo Scenario Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Демо-сценарий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Маршрут</h4>
                <div className="flex items-center gap-2 text-lg">
                  <span className="font-semibold">Shanghai (CNSHA)</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Los Angeles (USLAX)</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Один из самых популярных маршрутов в мире
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Период</h4>
                <div className="text-lg font-semibold">15 - 30 января 2024</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Типичный период для планирования перевозок
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
