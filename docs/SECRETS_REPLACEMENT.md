# 🔄 Замена заглушек секретов на реальные значения

Все необходимые секреты добавлены в GitHub, но некоторые содержат заглушки. Замените их на реальные значения:

## 🔑 Секреты, требующие замены

### Supabase секреты

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Текущее значение**: `REPLACE_WITH_REAL_ANON_KEY`

**Как получить**:
1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Settings → API → Project API keys
4. Скопируйте **anon public** ключ

**Команда для обновления**:
```bash
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### `SUPABASE_SERVICE_ROLE_KEY`
**Текущее значение**: `REPLACE_WITH_REAL_SERVICE_ROLE_KEY`

**Как получить**:
1. Supabase Dashboard → Settings → API → Project API keys
2. Скопируйте **service_role secret** ключ

**Команда для обновления**:
```bash
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Vercel секреты

#### `VERCEL_TOKEN`
**Текущее значение**: `REPLACE_WITH_REAL_VERCEL_TOKEN`

**Как получить**:
1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens
3. Create Token → Name: "GitHub Actions"
4. Скопируйте токен

**Команда для обновления**:
```bash
gh secret set VERCEL_TOKEN --body "your_vercel_token_here"
```

#### `VERCEL_ORG_ID`
**Текущее значение**: `REPLACE_WITH_REAL_ORG_ID`

**Как получить**:
1. Vercel Dashboard → Settings → General
2. Скопируйте **Organization ID**
3. **Или используйте**: `team_vlad-ovelians-projects` (получено из CLI)

**Команда для обновления**:
```bash
gh secret set VERCEL_ORG_ID --body "team_vlad-ovelians-projects"
```

#### `VERCEL_PROJECT_ID`
**✅ УЖЕ ОБНОВЛЕНО**: `prj_yzm2HRq1oDf7za6clRiIrGKkGs9U`

**Получено из Vercel CLI**: `vercel project inspect sprutnet`

## ✅ Уже настроенные секреты

Эти секреты уже содержат правильные значения:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://kzbtwgpedbojxnfiprsw.supabase.co`
- `MAERSK_API_KEY` = `IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd`
- `MAERSK_API_SECRET` = `CnIcg3YgUUtSp8a3`
- `MAERSK_API_BASE_URL` = `https://api.maersk.com`
- `DATABASE_URL` = `postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:6543/postgres`
- `VERCEL_PROJECT_ID` = `prj_yzm2HRq1oDf7za6clRiIrGKkGs9U`

## 🚀 После замены секретов

1. Замените все заглушки на реальные значения
2. Сделайте push в ветку `develop`
3. Проверьте, что CI/CD workflow запустился успешно
4. Убедитесь, что деплой в staging прошел без ошибок

## 🔍 Проверка секретов

Чтобы посмотреть список всех секретов:
```bash
gh secret list
```

Чтобы удалить секрет (если нужно):
```bash
gh secret delete SECRET_NAME
```

## 📊 Информация о проекте Vercel

- **Project Name**: sprutnet
- **Project ID**: prj_yzm2HRq1oDf7za6clRiIrGKkGs9U
- **Organization**: Vlad Ovelian's projects
- **Production URL**: https://sprutnet-vlad-ovelians-projects.vercel.app
- **Framework**: Next.js
- **Build Command**: pnpm build
- **Output Directory**: apps/web/.next
