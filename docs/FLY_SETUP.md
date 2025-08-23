# 🚀 Fly.io Setup Guide

Инструкция по настройке деплоя на Fly.io для проекта SprutNet.

## 📋 Предварительные требования

1. **Установите Fly CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Войдите в аккаунт:**
   ```bash
   flyctl auth login
   ```

## 🔧 Настройка приложений

### 1. Создание Production приложения

```bash
# Создайте production приложение
flyctl apps create sprutnet

# Установите переменные окружения
flyctl secrets set \
  NEXT_PUBLIC_SUPABASE_URL="https://kzbtwgpedbojxnfiprsw.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwMTYsImV4cCI6MjA3MTU0MzAxNn0.l3Oic3OTo0_Fus6NBYIUuuzL5vhCWGI5dol8AerrMzo" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2NzAxNiwiZXhwIjoyMDcxNTQzMDE2fQ.OP238r6fmI8NHNc4IujFu3BhWgiUGXw_12VTW1pMMO4" \
  MAERSK_API_KEY="IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd" \
  MAERSK_API_SECRET="CnIcg3YgUUtSp8a3" \
  MAERSK_API_BASE_URL="https://api.maersk.com"
```

### 2. Создание Staging приложения

```bash
# Создайте staging приложение
flyctl apps create sprutnet-staging

# Установите переменные окружения
flyctl secrets set \
  NEXT_PUBLIC_SUPABASE_URL="https://kzbtwgpedbojxnfiprsw.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwMTYsImV4cCI6MjA3MTU0MzAxNn0.l3Oic3OTo0_Fus6NBYIUuuzL5vhCWGI5dol8AerrMzo" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2NzAxNiwiZXhwIjoyMDcxNTQzMDE2fQ.OP238r6fmI8NHNc4IujFu3BhWgiUGXw_12VTW1pMMO4" \
  MAERSK_API_KEY="IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd" \
  MAERSK_API_SECRET="CnIcg3YgUUtSp8a3" \
  MAERSK_API_BASE_URL="https://api.maersk.com"
```

## 🔑 Настройка GitHub Secrets

Добавьте следующие секреты в GitHub repository:

1. **FLY_API_TOKEN** - токен для доступа к Fly.io API
   ```bash
   # Получите токен
   flyctl auth token
   
   # Добавьте в GitHub Secrets
   gh secret set FLY_API_TOKEN --body "your-fly-api-token"
   ```

## 🚀 Локальный деплой

### Тестовый деплой

```bash
# Деплой на staging
flyctl deploy --app sprutnet-staging

# Деплой на production
flyctl deploy --app sprutnet
```

### Проверка статуса

```bash
# Проверьте статус приложения
flyctl status --app sprutnet

# Посмотрите логи
flyctl logs --app sprutnet
```

## 📊 Мониторинг

### Fly.io Dashboard

- **Production**: https://fly.io/apps/sprutnet
- **Staging**: https://fly.io/apps/sprutnet-staging

### Полезные команды

```bash
# Масштабирование Production (2-4 машины)
flyctl scale count 2 --app sprutnet
flyctl scale count 4 --app sprutnet

# Масштабирование Staging (0-1 машина)
flyctl scale count 1 --app sprutnet-staging
flyctl scale count 0 --app sprutnet-staging

# Перезапуск
flyctl restart --app sprutnet
flyctl restart --app sprutnet-staging

# Просмотр переменных окружения
flyctl secrets list --app sprutnet

# Обновление переменных
flyctl secrets set NEW_VAR="value" --app sprutnet
```

## 🔧 Конфигурация

### fly.toml

Основная конфигурация находится в `fly.toml`:

- **Регион**: Frankfurt (fra)
- **Память**: 1GB
- **CPU**: 1 shared core
- **Порт**: 8080
- **Масштабирование**: 2-4 машины (production)
- **Автоостановка**: отключена для высокой доступности

### fly.staging.toml

Конфигурация для staging окружения:

- **Регион**: Frankfurt (fra)
- **Память**: 1GB
- **CPU**: 1 shared core
- **Порт**: 8080
- **Масштабирование**: 0-1 машина (экономия)
- **Автоостановка**: включена для экономии

### Dockerfile

Dockerfile оптимизирован для:
- Многоэтапной сборки
- Минимального размера образа
- Безопасности (пользователь nextjs)
- Standalone режима Next.js

## 🎯 Преимущества Fly.io

- ✅ **Глобальное развертывание** - приложения рядом с пользователями
- ✅ **Автоостановка** - экономия ресурсов
- ✅ **Простота** - один файл конфигурации
- ✅ **Масштабируемость** - легко масштабировать
- ✅ **SSL/TLS** - автоматические сертификаты
- ✅ **Мониторинг** - встроенные метрики

## 🚨 Устранение неполадок

### Проблемы с деплоем

```bash
# Проверьте логи
flyctl logs --app sprutnet

# Перезапустите приложение
flyctl restart --app sprutnet

# Проверьте статус
flyctl status --app sprutnet
```

### Проблемы с переменными окружения

```bash
# Проверьте переменные
flyctl secrets list --app sprutnet

# Обновите переменную
flyctl secrets set VAR_NAME="new_value" --app sprutnet

# Удалите переменную
flyctl secrets unset VAR_NAME --app sprutnet
```

## 📚 Дополнительные ресурсы

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js on Fly.io](https://fly.io/docs/languages-and-frameworks/nextjs/)
- [Fly CLI Reference](https://fly.io/docs/flyctl/)
