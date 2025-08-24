# 🔐 Настройка GitHub Secrets для CI/CD

## 📋 Требуемые Secrets

Для корректной работы CI/CD pipeline необходимо добавить следующие secrets в GitHub:

### 1. DATABASE_URL (НОВЫЙ)
**Значение:**
```
postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:5432/postgres
```

**Как добавить:**
1. Перейдите в GitHub репозиторий: https://github.com/abakymuk/SprutNet
2. Нажмите **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. **Name:** `DATABASE_URL`
5. **Value:** `postgresql://postgres:Gariba1ddi@db.kzbtwgpedbojxnfiprsw.supabase.co:5432/postgres`
6. Нажмите **Add secret**

### 2. Существующие Secrets (проверить наличие)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MAERSK_API_KEY`
- `MAERSK_API_SECRET`
- `MAERSK_API_BASE_URL`

## 🚀 После добавления DATABASE_URL

1. **CI/CD Pipeline автоматически перезапустится**
2. **Prisma команды будут работать корректно**
3. **Database migrations будут выполняться**
4. **API тестирование пройдет успешно**

## 📊 Ожидаемый результат

После добавления `DATABASE_URL`:
- ✅ Prisma schema validation пройдет успешно
- ✅ Prisma client будет сгенерирован
- ✅ Database migrations будут выполнены
- ✅ Все API тесты пройдут
- ✅ Деплой в staging будет успешным

## 🔍 Проверка

Можете проверить статус в:
- **GitHub Actions**: https://github.com/abakymuk/SprutNet/actions
- **Staging URL**: https://sprutnet-staging.vercel.app (после деплоя)
