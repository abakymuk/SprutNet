# 🚀 Vercel Setup Guide

## 📋 Обзор

Проект настроен для деплоя на Vercel с автоматическим CI/CD через GitHub Actions.

## 🔧 Конфигурация

### vercel.json
Основная конфигурация находится в `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

### Environment Variables
Все переменные окружения настроены в `vercel.json`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MAERSK_API_KEY`
- `MAERSK_API_SECRET`
- `MAERSK_API_BASE_URL`

## 🚀 Деплой

### Автоматический деплой
- **Staging**: При push в `develop` ветку
- **Production**: При создании тега `v*`

### Ручной деплой
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

## 🔑 Настройка секретов

### GitHub Secrets
Добавьте в GitHub Secrets:

- `VERCEL_TOKEN` - токен из Vercel Dashboard
- `VERCEL_ORG_ID` - ID организации
- `VERCEL_PROJECT_ID` - ID проекта

### Получение токена
1. Перейдите в [Vercel Dashboard](https://vercel.com/account/tokens)
2. Создайте новый токен
3. Добавьте в GitHub Secrets

### Получение ID проекта и организации
1. Перейдите в настройки проекта в Vercel
2. Скопируйте Project ID и Organization ID
3. Добавьте в GitHub Secrets

## 📊 Мониторинг

### URLs
- **Staging**: https://sprutnet-staging.vercel.app
- **Production**: https://sprutnet.vercel.app

### Логи
- Vercel Dashboard → Project → Functions
- GitHub Actions → Workflow runs

## 🔧 Troubleshooting

### Проблемы с деплоем
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все секреты настроены
3. Проверьте GitHub Actions workflow

### Проблемы с переменными окружения
1. Проверьте `vercel.json`
2. Убедитесь, что переменные добавлены в Vercel Dashboard
3. Проверьте GitHub Secrets

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Actions Integration](https://vercel.com/docs/git/github)
