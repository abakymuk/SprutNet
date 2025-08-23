# 🚀 CI/CD Setup Guide

Подробная инструкция по настройке Continuous Integration/Continuous Deployment для проекта SprutNet.

## 📋 Содержание

- [GitHub Secrets](#github-secrets)
- [Vercel Setup](#vercel-setup)
- [Workflow Overview](#workflow-overview)
- [Troubleshooting](#troubleshooting)

## 🔐 GitHub Secrets

Добавьте следующие секреты в настройках репозитория:

### Supabase Secrets
```
NEXT_PUBLIC_SUPABASE_URL=https://kzbtwgpedbojxnfiprsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwMTYsImV4cCI6MjA3MTU0MzAxNn0.l3Oic3OTo0_Fus6NBYIUuuzL5vhCWGI5dol8AerrMzo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YnR3Z3BlZGJvanhuZmlwcnN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2NzAxNiwiZXhwIjoyMDcxNTQzMDE2fQ.OP238r6fmI8NHNc4IujFu3BhWgiUGXw_12VTW1pMMO4
```

### Maersk API Secrets
```
MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
MAERSK_API_BASE_URL=https://api.maersk.com
```

### Vercel Secrets (получить из Vercel Dashboard)
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

## 🎯 Как добавить GitHub Secrets

1. **Откройте репозиторий на GitHub**
   ```
   https://github.com/abakymuk/SprutNet
   ```

2. **Перейдите в Settings**
   - Нажмите на вкладку "Settings"
   - В левом меню выберите "Secrets and variables" → "Actions"

3. **Добавьте каждый секрет**
   - Нажмите "New repository secret"
   - Введите имя (например, `NEXT_PUBLIC_SUPABASE_URL`)
   - Введите значение
   - Нажмите "Add secret"

## 🚀 Vercel Setup

### 1. Создайте проект в Vercel

1. **Подключите GitHub репозиторий**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите репозиторий `abakymuk/SprutNet`

2. **Настройте проект**
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

### 2. Получите Vercel токены

1. **Vercel Token**
   - Перейдите в [Vercel Account Settings](https://vercel.com/account/tokens)
   - Нажмите "Create Token"
   - Назовите токен (например, "SprutNet CI/CD")
   - Скопируйте токен

2. **Project ID и Org ID**
   - В настройках проекта Vercel
   - Перейдите в "Settings" → "General"
   - Скопируйте "Project ID"
   - В "Settings" → "General" найдите "Team ID" (это Org ID)

## 🔄 Workflow Overview

### CI/CD Pipeline (`ci.yml`)

1. **Lint & Type Check**
   - Проверка качества кода
   - Проверка типов TypeScript
   - Запускается на каждом PR и push

2. **Build & Test**
   - Сборка проекта
   - Запуск тестов (если есть)
   - Зависит от успешного прохождения lint

3. **Deploy Staging** (develop branch)
   - Деплой на staging окружение
   - Использует Vercel preview deployments

4. **Deploy Production** (main branch)
   - Деплой на production
   - Требует approval в GitHub

### Security Scan (`security.yml`)

1. **Security Audit**
   - Проверка уязвимостей в зависимостях
   - Запускается еженедельно и на PR

2. **Dependency Review**
   - Анализ изменений в зависимостях
   - Только для Pull Requests

## 🌿 Branch Strategy

```
main (production)
├── develop (staging)
├── feature/T1-api-contracts
├── feature/T2-search-form
└── hotfix/critical-bug
```

- **main**: Production код, автоматический деплой
- **develop**: Staging код, автоматический деплой
- **feature/***: Разработка новых функций
- **hotfix/***: Критические исправления

## 🛠 Environment Variables

### Development
```bash
# Локально используйте env.local
cp apps/web/env.local apps/web/.env.local
```

### Staging/Production
- Все переменные передаются через GitHub Secrets
- Автоматически подставляются в Vercel

## 🔍 Troubleshooting

### Частые проблемы

1. **Build fails**
   ```bash
   # Проверьте локально
   cd apps/web
   pnpm build
   ```

2. **Missing secrets**
   - Убедитесь, что все секреты добавлены в GitHub
   - Проверьте правильность имен секретов

3. **Vercel deployment fails**
   - Проверьте Vercel токены
   - Убедитесь, что проект создан в Vercel

4. **TypeScript errors**
   ```bash
   # Проверьте типы локально
   pnpm type-check
   ```

### Логи и мониторинг

- **GitHub Actions**: Проверьте вкладку "Actions"
- **Vercel**: Проверьте в Vercel Dashboard
- **Supabase**: Проверьте логи в Supabase Dashboard

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в GitHub Actions
2. Убедитесь, что все секреты настроены
3. Проверьте локальную сборку
4. Создайте Issue в репозитории

## 🔗 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Maersk API Documentation](https://developer.maersk.com/)
