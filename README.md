# 🚢 SprutNet - Shipping Planner v1.0.0

**Интеллектуальная система планирования морских перевозок с интеграцией API Maersk**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 О проекте

SprutNet - это MVP планировщик морских перевозок, который помогает логистическим компаниям оптимизировать маршруты, сокращать затраты и время доставки. Система интегрирована с API Maersk для получения актуальных данных о рейсах, судах и портах.

## ✨ Ключевые возможности

- 🔍 **Интеллектуальный поиск портов** с автодополнением
- 📅 **Планирование дат** с учетом доступности рейсов
- 📊 **Анализ маршрутов** по времени, стоимости и оптимальности
- 🌍 **Глобальное покрытие** через интеграцию с Maersk API
- ⏰ **Данные в реальном времени** о расписаниях и доступности
- 💰 **Оптимизация затрат** с поиском выгодных тарифов
- 🎨 **Современный UI/UX** на базе shadcn/ui
- 🌙 **Поддержка тем** (светлая/темная)

## 🛠 Технологический стек

### Frontend
- **Next.js 15.5.0** - React фреймворк
- **React 19.1.1** - UI библиотека
- **TypeScript 5.9.2** - типизация
- **Tailwind CSS 3.4.17** - стилизация
- **shadcn/ui** - компонентная библиотека
- **Lucide React** - иконки
- **React Hook Form** - формы
- **Zod** - валидация

### Backend & Database
- **Next.js API Routes** - серверная часть
- **Prisma 5.22.0** - ORM
- **PostgreSQL** - база данных
- **Supabase** - хостинг БД

### Интеграции
- **Maersk API** - данные о рейсах и судах
- **date-fns** - работа с датами

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL база данных

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/your-username/sprutnet.git
   cd sprutnet
   ```

2. **Установите зависимости**
   ```bash
   pnpm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp apps/web/env.example apps/web/.env.local
   ```
   
   Отредактируйте `apps/web/.env.local`:
   ```env
   # Maersk API Configuration
   MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
   MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
   MAERSK_API_BASE_URL=https://api.maersk.com
   
   # Maersk API Endpoints
   MAERSK_LOCATIONS_API_URL=https://api.maersk.com/reference-data
   MAERSK_P2P_API_URL=https://api.maersk.com/products
   MAERSK_VESSELS_API_URL=https://api.maersk.com/reference-data
   MAERSK_DEADLINES_API_URL=https://api.maersk.com
   
   # Feature Flags
   FEATURE_MAERSK=true
   FEATURE_DEADLINES=true
   
   # Cache Configuration
   CACHE_TTL_MINUTES=10
   ```

4. **Настройте базу данных**
   ```bash
   pnpm prisma:generate
   pnpm prisma:push
   ```

5. **Запустите проект**
   ```bash
   pnpm dev
   ```

6. **Проверьте статус Maersk API**
   Откройте [http://localhost:3000/maersk-status](http://localhost:3000/maersk-status) для проверки доступа к API

7. **Откройте браузер**
   ```
   http://localhost:3000
   ```

## 📁 Структура проекта

```
sprutnet/
├── apps/
│   └── web/                    # Next.js приложение
│       ├── src/
│       │   ├── app/           # App Router страницы
│       │   ├── components/    # React компоненты
│       │   │   ├── ui/        # shadcn/ui компоненты
│       │   │   └── planner/   # Компоненты планировщика
│       │   └── lib/           # Утилиты
│       └── public/            # Статические файлы
├── packages/
│   └── shared/                # Общие типы и утилиты
├── prisma/                    # Схема базы данных
├── docs/                      # Документация
└── .github/                   # GitHub Actions
```

## 🎨 Компоненты UI

Проект использует полный набор shadcn/ui компонентов:

- **Button** - кнопки всех типов
- **Card** - карточки для контента
- **Badge** - бейджи для статусов
- **Tabs** - вкладки
- **Table** - таблицы
- **Form** - формы с валидацией
- **Dialog** - модальные окна
- **Dropdown Menu** - выпадающие меню
- **Progress** - индикаторы прогресса
- **Alert** - уведомления
- **Theme Toggle** - переключатель тем

## 🔧 Скрипты

```bash
# Разработка
pnpm dev              # Запуск dev сервера
pnpm build            # Сборка проекта
pnpm start            # Запуск production сервера

# Качество кода
pnpm lint             # Проверка ESLint
pnpm type-check       # Проверка TypeScript

# Тестирование
pnpm test             # Запуск тестов
pnpm test:e2e         # E2E тесты

# База данных
pnpm prisma:generate  # Генерация Prisma Client
pnpm prisma:push      # Применение миграций
pnpm prisma:studio    # Prisma Studio

# Утилиты
pnpm clean            # Очистка node_modules
```

## 🌐 API Endpoints

### Расписания
- `GET /api/schedules` - поиск рейсов
- `GET /api/ports/search` - поиск портов

### Данные Maersk
- `GET /api/vessels` - список судов
- `GET /api/locations` - список локаций
- `GET /api/ocean-products` - расписания
- `GET /api/deadlines` - дедлайны

### Управление данными
- `POST /api/load-data` - загрузка данных
- `POST /api/seed-data` - заполнение тестовыми данными

## 🎯 Основные страницы

### Главная страница (`/`)
- Обзор возможностей системы
- Статистика и метрики
- Призывы к действию

### Планировщик (`/planner`)
- Поиск оптимальных маршрутов
- Выбор портов отправления и назначения
- Анализ результатов поиска
- Интерактивная помощь

### База данных (`/data`)
- Просмотр портов, судов и расписаний
- Фильтрация и сортировка данных
- Экспорт данных
- Статистика системы

## 🔒 Безопасность

- Валидация всех входных данных через Zod
- Защищенные API endpoints
- Переменные окружения для конфиденциальных данных
- TypeScript для предотвращения ошибок типов

## 🔄 Переключение между Live API и Demo данными

### Feature Flags

Система поддерживает гибкое переключение между реальными данными Maersk API и демо-данными:

#### **Environment Variables:**
```bash
# Использовать демо-данные (по умолчанию для MVP)
FEATURE_MAERSK=false

# Использовать live Maersk API
FEATURE_MAERSK=true
MAERSK_CONSUMER_KEY=your_consumer_key
MAERSK_CLIENT_SECRET=your_client_secret
```

#### **Через UI:**
1. Откройте `/planner`
2. Найдите индикатор источника данных в правом верхнем углу
3. Кликните на кнопку переключения:
   - **"Switch to Demo Data"** - для демо-данных
   - **"Switch to Live API"** - для реальных данных

### Автоматический Fallback

Система автоматически переключается на демо-данные при:
- Ошибках Maersk API (5xx, 429)
- Отсутствии доступа к API
- Таймаутах запросов

### Проверка статуса API

Откройте `/maersk-status` для проверки:
- Доступности Maersk API
- Статуса продуктов (Locations, Schedules, Deadlines, Vessels)
- Конфигурации feature flags

### Демо-сценарий

Для демонстрации используйте:
1. **Поиск портов:** Введите "sha" → CNSHA (Shanghai)
2. **Поиск рейсов:** CNSHA → USLAX, даты 2025-09-01 до 2025-09-30
3. **Дедлайны:** Кликните на рейс → "View Deadlines"
4. **Информация о судне:** Кликните на название судна
5. **Телеметрия:** `/telemetry-dashboard` для мониторинга

## 🚀 Развертывание

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматический при push в main

### Docker
```bash
docker build -t sprutnet .
docker run -p 3000:3000 sprutnet
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Email**: support@sprutnet.com
- **Issues**: [GitHub Issues](https://github.com/your-username/sprutnet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/sprutnet/discussions)

## 🏆 Благодарности

- [Maersk](https://www.maersk.com/) за предоставление API
- [shadcn/ui](https://ui.shadcn.com/) за отличные компоненты
- [Vercel](https://vercel.com/) за платформу развертывания
- [Supabase](https://supabase.com/) за хостинг базы данных

---

**SprutNet v1.0.0** - Интеллектуальное планирование морских перевозок 🚢
