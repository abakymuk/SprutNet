# 🔐 Настройка GitHub Secrets

Для корректной работы CI/CD необходимо настроить следующие секреты в GitHub.

## 📍 Где добавить секреты

1. Перейдите в ваш GitHub репозиторий
2. Нажмите на вкладку **Settings**
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

## 🔑 Необходимые секреты

### Supabase секреты

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Описание**: URL вашего Supabase проекта
- **Значение**: `https://kzbtwgpedbojxnfiprsw.supabase.co`
- **Где найти**: Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Описание**: Публичный ключ Supabase
- **Значение**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (длинная строка)
- **Где найти**: Supabase Dashboard → Settings → API → Project API keys → anon public

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Описание**: Сервисный ключ Supabase (для админских операций)
- **Значение**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (длинная строка)
- **Где найти**: Supabase Dashboard → Settings → API → Project API keys → service_role secret

### Maersk API секреты

#### `MAERSK_API_KEY`
- **Описание**: Consumer Key для Maersk API
- **Значение**: `IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd`

#### `MAERSK_API_SECRET`
- **Описание**: Client Secret для Maersk API
- **Значение**: `CnIcg3YgUUtSp8a3`

#### `MAERSK_API_BASE_URL`
- **Описание**: Базовый URL для Maersk API
- **Значение**: `https://api.maersk.com`

### Database секреты

#### `DATABASE_URL`
- **Описание**: URL подключения к базе данных
- **Значение**: `postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:6543/postgres`
- **Примечание**: Используется transaction pooler на порту 6543

### Vercel секреты

#### `VERCEL_TOKEN`
- **Описание**: Токен для деплоя в Vercel
- **Где найти**: 
  1. Vercel Dashboard → Settings → Tokens
  2. Создайте новый токен с именем "GitHub Actions"
  3. Скопируйте токен

#### `VERCEL_ORG_ID`
- **Описание**: ID организации в Vercel
- **Где найти**: Vercel Dashboard → Settings → General → Organization ID

#### `VERCEL_PROJECT_ID`
- **Описание**: ID проекта в Vercel
- **Где найти**: Vercel Dashboard → Project Settings → General → Project ID

## 🚀 Проверка настройки

После добавления всех секретов:

1. Сделайте push в ветку `develop`
2. Проверьте, что CI/CD workflow запустился
3. Убедитесь, что все шаги прошли успешно

## 🔍 Отладка

Если CI/CD падает с ошибкой "secret does not exist":

1. Проверьте правильность названия секрета
2. Убедитесь, что секрет добавлен в репозиторий (не в организацию)
3. Проверьте, что секрет не содержит лишних пробелов

## 📝 Примеры значений

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kzbtwgpedbojxnfiprsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Maersk API
MAERSK_API_KEY=IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd
MAERSK_API_SECRET=CnIcg3YgUUtSp8a3
MAERSK_API_BASE_URL=https://api.maersk.com

# Database
DATABASE_URL=postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:6543/postgres

# Vercel (заполните своими значениями)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```
