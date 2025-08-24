# 🚢 SprutNet - MVP Shipping Planner

Планировщик морских перевозок с интеграцией Maersk API.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm 8+
- Supabase проект
- Maersk API ключи
- Vercel аккаунт (для деплоя)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/abakymuk/SprutNet.git
cd SprutNet

# Установка зависимостей
pnpm install

# Настройка переменных окружения
cp .env.example .env
# Заполните .env файл вашими значениями

# Генерация Prisma Client
pnpm prisma:generate

# Запуск в режиме разработки
pnpm dev
```

## 🔐 Настройка CI/CD

Для работы CI/CD необходимо настроить GitHub Secrets. Подробная инструкция: [docs/GITHUB_SECRETS_SETUP.md](docs/GITHUB_SECRETS_SETUP.md)

### Быстрая настройка секретов

Добавьте следующие секреты в GitHub (Settings → Secrets and variables → Actions):

**Обязательные:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Публичный ключ Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Сервисный ключ Supabase
- `DATABASE_URL` - URL подключения к базе данных
- `MAERSK_API_KEY` - Consumer Key для Maersk API
- `MAERSK_API_SECRET` - Client Secret для Maersk API
- `MAERSK_API_BASE_URL` - Базовый URL для Maersk API

**Для деплоя в Vercel:**
- `VERCEL_TOKEN` - Токен для деплоя в Vercel
- `VERCEL_ORG_ID` - ID организации в Vercel
- `VERCEL_PROJECT_ID` - ID проекта в Vercel

## 📚 Документация

- [Настройка GitHub Secrets](docs/GITHUB_SECRETS_SETUP.md)
- [Интеграция с Maersk API](docs/API_INTEGRATION_COMPLETE.md)

## 🛠️ Разработка

### Доступные команды

```bash
# Разработка
pnpm dev          # Запуск в режиме разработки
pnpm build        # Сборка проекта
pnpm start        # Запуск продакшн сервера

# Качество кода
pnpm lint         # Проверка линтером
pnpm type-check   # Проверка типов TypeScript
pnpm test         # Запуск тестов

# База данных
pnpm prisma:generate  # Генерация Prisma Client
pnpm prisma:push      # Отправка схемы в базу данных
pnpm prisma:studio    # Запуск Prisma Studio
```

### Структура проекта

```
SprutNet/
├── apps/
│   └── web/                 # Next.js приложение
│       ├── src/
│       │   ├── app/         # App Router
│       │   ├── components/  # UI компоненты
│       │   └── lib/         # Утилиты и конфигурация
│       └── public/          # Статические файлы
├── prisma/                  # Схема базы данных
├── docs/                    # Документация
└── .github/workflows/       # CI/CD workflows
```

## 🌐 API Endpoints

- `GET /api/vessels` - Получение данных о судах
- `GET /api/locations` - Получение данных о локациях
- `GET /api/ocean-products` - Получение данных о морских продуктах
- `GET /api/deadlines` - Получение данных о дедлайнах
- `POST /api/load-data` - Загрузка данных из Maersk API
- `POST /api/seed-data` - Заполнение тестовыми данными

## 🚀 Деплой

### Staging
Автоматический деплой в staging при push в ветку `develop`.

### Production
Автоматический деплой в production при создании тега `v*`.

## 📄 Лицензия

MIT
