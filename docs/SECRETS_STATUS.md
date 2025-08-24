# 📊 Статус GitHub Secrets

## ✅ Уже настроенные секреты

| Секрет | Значение | Статус |
|--------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kzbtwgpedbojxnfiprsw.supabase.co` | ✅ Готов |
| `MAERSK_API_KEY` | `IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd` | ✅ Готов |
| `MAERSK_API_SECRET` | `CnIcg3YgUUtSp8a3` | ✅ Готов |
| `MAERSK_API_BASE_URL` | `https://api.maersk.com` | ✅ Готов |
| `DATABASE_URL` | `postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:6543/postgres` | ✅ Готов |
| `VERCEL_PROJECT_ID` | `prj_yzm2HRq1oDf7za6clRiIrGKkGs9U` | ✅ Готов |
| `VERCEL_ORG_ID` | `team_vlad-ovelians-projects` | ✅ Готов |

## ⚠️ Требуют замены

| Секрет | Текущее значение | Что нужно сделать |
|--------|------------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `REPLACE_WITH_REAL_ANON_KEY` | Получить из Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `REPLACE_WITH_REAL_SERVICE_ROLE_KEY` | Получить из Supabase Dashboard |
| `VERCEL_TOKEN` | `REPLACE_WITH_REAL_VERCEL_TOKEN` | Создать в Vercel Dashboard |

## 🚀 Следующие шаги

### 1. Получить Supabase ключи

1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект `kzbtwgpedbojxnfiprsw`
3. Settings → API → Project API keys
4. Скопируйте:
   - **anon public** ключ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** ключ → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Создать Vercel токен

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Tokens
3. Create Token → Name: "GitHub Actions"
4. Скопируйте токен → `VERCEL_TOKEN`

### 3. Обновить секреты

```bash
# Supabase ключи
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Vercel токен
gh secret set VERCEL_TOKEN --body "your_vercel_token_here"
```

### 4. Протестировать CI/CD

```bash
# Сделать push в develop
git push origin develop

# Проверить статус в GitHub Actions
gh run list --limit 5
```

## 🔍 Проверка

После обновления всех секретов:

1. **CI/CD должен пройти успешно**
2. **Деплой в staging должен работать**
3. **Приложение должно быть доступно по адресу**: https://sprutnet-vlad-ovelians-projects.vercel.app

## 📋 Чек-лист

- [ ] Получить Supabase anon key
- [ ] Получить Supabase service role key  
- [ ] Создать Vercel token
- [ ] Обновить все секреты через CLI
- [ ] Сделать push в develop
- [ ] Проверить CI/CD pipeline
- [ ] Проверить деплой в staging
