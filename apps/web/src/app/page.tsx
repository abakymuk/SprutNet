import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ship, MapPin, Calendar, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Ship className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            SprutNet
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Планировщик морских перевозок нового поколения. Найдите оптимальные
            маршруты для ваших грузов с помощью AI-технологий.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/planner">
              <Button size="lg" className="px-8 py-3">
                <Ship className="mr-2 h-5 w-5" />
                Начать планирование
              </Button>
            </Link>
            <Link href="/data">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <MapPin className="mr-2 h-5 w-5" />
                Просмотр данных
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Умный поиск маршрутов</CardTitle>
              <CardDescription>
                Автоматический поиск оптимальных морских маршрутов между портами
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Планирование расписаний</CardTitle>
              <CardDescription>
                Детальное планирование с учетом дедлайнов и расписаний рейсов
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>Реальное время</CardTitle>
              <CardDescription>
                Актуальные данные о рейсах, судах и портах в реальном времени
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Готовы оптимизировать ваши перевозки?
              </h2>
              <p className="text-gray-600 mb-6">
                Присоединяйтесь к тысячам компаний, которые уже используют
                SprutNet для планирования морских перевозок.
              </p>
              <Link href="/planner">
                <Button size="lg" className="px-8 py-3">
                  Попробовать бесплатно
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
