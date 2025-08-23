# 🚢 SprutNet - MVP Shipping Planner

Планировщик морских перевозок с использованием API Maersk и Supabase.

## 🛠 Технологический стек

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI**: shadcn/ui компоненты
- **Backend**: Next.js API Routes (BFF слой)
- **Database**: Supabase
- **External APIs**: Maersk Developer API
- **Package Manager**: pnpm (монорепо)

## 📁 Структура проекта

```
SprutNet/
├── apps/
│   └── web/                 # Next.js приложение
│       ├── src/
│       │   ├── app/         # App Router страницы
│       │   ├── components/  # UI компоненты
│       │   ├── lib/         # Утилиты и конфигурация
│       │   └── types/       # TypeScript типы
│       └── public/          # Статические файлы
├── packages/
│   └── shared/              # Общие типы и утилиты
└── docs/                    # Документация проекта
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- pnpm 8+

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd SprutNet
   ```

2. **Установите зависимости**
   ```bash
   pnpm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cd apps/web
   cp env.local .env.local
   ```
   
   Файл `env.local` уже содержит настроенные Supabase ключи:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - публичный ключ Supabase ✅
   - `SUPABASE_SERVICE_ROLE_KEY` - сервисный ключ для серверных операций ✅
   - `SUPABASE_DB_URL` - прямое подключение к PostgreSQL ✅
   - `MAERSK_API_KEY` - ключ API Maersk (опционально)

4. **Запустите проект**
   ```bash
   pnpm dev
   ```

5. **Откройте браузер**
   ```
   http://localhost:3000
   ```

## 🎯 Основные функции

- **Поиск маршрутов**: POL → POD поиск с автодополнением
- **Расписания рейсов**: Список доступных рейсов с метриками
- **Аналитика**: Инсайты по направлению (средний транзит, частота)
- **Дедлайны**: Cut-off даты для каждого рейса
- **Уведомления**: Напоминания о дедлайнах (опционально)

## 🔧 Разработка

### Доступные команды

```bash
# Запуск в режиме разработки
pnpm dev

# Сборка проекта
pnpm build

# Запуск production сервера
pnpm start

# Проверка типов
pnpm type-check

# Линтинг
pnpm lint
```

### CI/CD Pipeline

Проект настроен с автоматическим CI/CD через GitHub Actions:

- **Автоматическая сборка** при каждом push/PR
- **Деплой на staging** при push в `develop`
- **Деплой на production** при push в `main`
- **Проверка безопасности** еженедельно

#### 🌐 Деплой

- **Staging**: https://sprutnet-staging.vercel.app (develop branch)
- **Production**: https://sprutnet.vercel.app (main branch)

Подробная инструкция: [CI/CD Setup Guide](.github/CICD_SETUP.md)

### Структура тикетов

Проект разделен на тикеты (см. `docs/tickets/`):

- **T0**: Настройка проекта ✅
- **T1**: API контракты и моки
- **T2**: Форма поиска и результаты
- **T3**: Аналитика маршрутов
- **T4**: Модалка дедлайнов
- **T5**: Уведомления
- **T6**: Полировка и демо

## 🗄 База данных (Supabase)

### Основные таблицы

```sql
-- Кэш результатов API
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  params JSONB NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Напоминания пользователей
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  sailing_id TEXT NOT NULL,
  deadline_type TEXT NOT NULL,
  deadline_date TIMESTAMP NOT NULL,
  notify_before_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📚 Документация

- [TECH_STACK.md](./TECH_STACK.md) - Подробное описание технологий
- [docs/tickets/](./docs/tickets/) - Детальные тикеты разработки

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License
# CI/CD Test
# Vercel Deploy Test
# Vercel Link Test
