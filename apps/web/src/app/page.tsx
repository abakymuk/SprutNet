import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Ship,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Globe,
  Clock,
  DollarSign,
  Users,
  Zap,
  Shield,
  Play,
  TestTube,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Ship className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SprutNet</h1>
                <p className="text-sm text-muted-foreground">
                  Shipping Planner
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button asChild>
                <Link href="/planner">
                  Начать планирование
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="mr-2 h-3 w-3" />
              MVP Релиз
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Планировщик морских перевозок
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Интеллектуальная система планирования морских перевозок с
              интеграцией API Maersk. Оптимизируйте маршруты, сокращайте затраты
              и время доставки.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/planner">
                  Начать планирование
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">Демо</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/e2e-test">E2E Тесты</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ключевые возможности
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Наша платформа предоставляет все необходимые инструменты для
              эффективного планирования морских перевозок
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Поиск портов</CardTitle>
                <CardDescription>
                  Интеллектуальный поиск портов отправления и назначения с
                  автодополнением
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Планирование дат</CardTitle>
                <CardDescription>
                  Гибкий выбор дат отправления с учетом доступности рейсов
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Анализ маршрутов</CardTitle>
                <CardDescription>
                  Сравнение рейсов по времени, стоимости и оптимальности
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Глобальное покрытие</CardTitle>
                <CardDescription>
                  Доступ к рейсам по всему миру через интеграцию с Maersk API
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Реальное время</CardTitle>
                <CardDescription>
                  Актуальная информация о расписаниях и доступности рейсов
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Оптимизация затрат</CardTitle>
                <CardDescription>
                  Поиск наиболее выгодных тарифов и маршрутов
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Портов</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Маршрутов</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Доступность</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Точность</div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Готовы начать?</CardTitle>
              <CardDescription>
                Присоединяйтесь к тысячам компаний, которые уже используют
                SprutNet для оптимизации своих морских перевозок
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/planner">
                  Начать планирование
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-primary rounded-lg">
                <Ship className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">SprutNet</h3>
                <p className="text-sm text-muted-foreground">
                  Shipping Planner MVP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 SprutNet. Все права защищены.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
