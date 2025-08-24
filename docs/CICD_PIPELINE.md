# 🚀 CI/CD Pipeline Documentation

## 📋 Обзор

Наш CI/CD pipeline настроен для автоматической проверки качества кода, тестирования и деплоя в различные окружения.

## 🔄 Workflow Files

### 1. **ci.yml** - Основной CI Pipeline
**Триггеры:**
- Push в `main` и `develop` ветки
- Pull Request в `main` и `develop` ветки

**Jobs:**
- **Setup** - Настройка кэша и зависимостей
- **Quality** - Линтинг, проверка типов, тесты, сборка
- **Security** - Аудит безопасности
- **Database** - Проверка схемы Prisma (если есть изменения)

### 2. **deploy-staging.yml** - Деплой в Staging
**Триггеры:**
- Push в `develop` ветку

**Jobs:**
- **Deploy to Staging** - Сборка и деплой в Vercel (staging)

### 3. **deploy-production.yml** - Деплой в Production
**Триггеры:**
- Push тегов `v*` (например: `v1.0.0`)

**Jobs:**
- **Deploy to Production** - Сборка и деплой в Vercel (production)
- Создание GitHub Release

### 4. **database.yml** - Управление базой данных
**Триггеры:**
- Push в `main` и `develop` ветки (если есть изменения в миграциях)
- Manual trigger (workflow_dispatch)

**Jobs:**
- **Database Migration** - Применение миграций
- **Database Reset** - Сброс базы данных
- **Database Seed** - Заполнение тестовыми данными

### 5. **api-test.yml** - Тестирование API
**Триггеры:**
- Push в `main` и `develop` ветки
- Pull Request в `main` и `develop` ветки
- Ежедневно в 6:00 UTC
- Manual trigger

**Jobs:**
- **API Health Check** - Тестирование всех API Maersk

## 🛠 Технологический стек

- **Node.js 20** - Runtime
- **pnpm 8** - Package manager
- **GitHub Actions** - CI/CD platform
- **Vercel** - Deployment platform
- **Supabase** - Database
- **Prisma** - ORM

## 🔐 Environment Variables

### Required Secrets:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Maersk API
MAERSK_API_KEY
MAERSK_API_SECRET
MAERSK_API_BASE_URL

# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 📊 Маршрут разработки

### 1. **Feature Development**
```bash
# Создание feature ветки
git checkout -b feature/new-feature
git push origin feature/new-feature

# Создание Pull Request в develop
# Автоматически запускается CI pipeline
```

### 2. **Staging Deployment**
```bash
# Merge в develop
git checkout develop
git merge feature/new-feature
git push origin develop

# Автоматически деплоится в staging
```

### 3. **Production Deployment**
```bash
# Создание релиза
git tag v1.0.0
git push origin v1.0.0

# Автоматически деплоится в production
```

## 🧪 Тестирование

### Автоматические тесты:
- **Lint** - ESLint проверка
- **Type Check** - TypeScript проверка типов
- **Unit Tests** - Vitest тесты
- **Build** - Проверка сборки
- **Security Audit** - Проверка уязвимостей
- **API Health Check** - Тестирование API Maersk

### API Status:
- ✅ Vessels API (17,753 судов)
- ✅ Ocean Products API (расписания маршрутов)
- ✅ Locations API (локации и carrierGeoID)
- ✅ Deadlines API (сроки поставок и дедлайны)

## 🗄 База данных

### Миграции:
- Автоматически применяются при push в main/develop
- Ручное управление через workflow_dispatch

### Команды:
```bash
# Применить миграции
npx prisma db push

# Сбросить базу данных
npx prisma db push --force-reset

# Заполнить тестовыми данными
npx prisma db seed
```

## 🚀 Деплой

### Staging:
- **URL**: https://sprutnet-staging.vercel.app
- **Branch**: `develop`
- **Environment**: Staging

### Production:
- **URL**: https://sprutnet.vercel.app
- **Branch**: `main` (через теги)
- **Environment**: Production

## 📈 Мониторинг

### GitHub Actions:
- Статус всех workflow в реальном времени
- Логи выполнения
- Артефакты (API status reports)

### Vercel:
- Статус деплоя
- Preview URLs для PR
- Analytics и performance

## 🔧 Troubleshooting

### Частые проблемы:

1. **Build fails**
   - Проверить TypeScript ошибки
   - Проверить ESLint ошибки
   - Проверить зависимости

2. **API tests fail**
   - Проверить API ключи
   - Проверить доступность API Maersk
   - Проверить параметры запросов

3. **Database migration fails**
   - Проверить схему Prisma
   - Проверить подключение к Supabase
   - Проверить права доступа

### Логи:
- GitHub Actions: `.github/workflows/`
- Vercel: Dashboard проекта
- Supabase: Dashboard проекта

## 📝 Best Practices

1. **Всегда создавайте PR** для новых фич
2. **Тестируйте локально** перед push
3. **Используйте семантические теги** для релизов
4. **Мониторьте API статус** ежедневно
5. **Проверяйте security audit** регулярно

## 🎯 Следующие шаги

1. Настроить мониторинг производительности
2. Добавить E2E тесты
3. Настроить автоматическое резервное копирование БД
4. Добавить уведомления в Slack/Discord
5. Настроить автоматическое масштабирование
