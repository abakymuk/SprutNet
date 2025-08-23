# 🗄 Supabase Database Setup

Инструкции по настройке и управлению базой данных Supabase для проекта SprutNet.

## 📋 Содержание

- [Полная очистка базы](#полная-очистка-базы)
- [Создание новой структуры](#создание-новой-структуры)
- [Структура таблиц](#структура-таблиц)
- [Политики безопасности](#политики-безопасности)

## 🗑 Полная очистка базы

Если нужно полностью очистить базу данных:

1. **Откройте Supabase Dashboard**
   ```
   https://kzbtwgpedbojxnfiprsw.supabase.co
   ```

2. **Перейдите в SQL Editor**
   - В левом меню выберите "SQL Editor"
   - Создайте новый запрос

3. **Выполните скрипт очистки**
   ```sql
   -- Скопируйте содержимое файла supabase/cleanup.sql
   -- и выполните в SQL Editor
   ```

4. **Подтвердите очистку**
   - Скрипт удалит все таблицы, индексы, политики
   - Все данные будут потеряны безвозвратно

## 🏗 Создание новой структуры

После очистки создайте новую структуру:

1. **Откройте SQL Editor**

2. **Выполните схему**
   ```sql
   -- Скопируйте содержимое файла supabase/schema.sql
   -- и выполните в SQL Editor
   ```

3. **Проверьте создание таблиц**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## 📊 Структура таблиц

### `api_cache`
Кэш результатов API для снижения нагрузки на внешние сервисы.

```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  params JSONB NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### `reminders`
Напоминания пользователей о дедлайнах.

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  sailing_id TEXT NOT NULL,
  deadline_type TEXT NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notify_before_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `favorite_routes`
Избранные маршруты пользователей.

```sql
CREATE TABLE favorite_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  pol TEXT NOT NULL,
  pod TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pol, pod)
);
```

### `search_history`
История поисков пользователей.

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  pol TEXT NOT NULL,
  pod TEXT NOT NULL,
  search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Политики безопасности

Все таблицы защищены Row Level Security (RLS):

- **api_cache**: Публичный доступ для чтения/записи
- **reminders**: Только для авторизованных пользователей
- **favorite_routes**: Только для авторизованных пользователей  
- **search_history**: Только для авторизованных пользователей

## 🛠 Полезные команды

### Проверка структуры
```sql
-- Список всех таблиц
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Список всех индексов
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Список всех политик RLS
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### Очистка кэша
```sql
-- Удаление устаревшего кэша
DELETE FROM api_cache WHERE expires_at < NOW();

-- Очистка всего кэша
DELETE FROM api_cache;
```

### Статистика
```sql
-- Количество записей в каждой таблице
SELECT 
  'api_cache' as table_name, COUNT(*) as count FROM api_cache
UNION ALL
SELECT 
  'reminders' as table_name, COUNT(*) as count FROM reminders
UNION ALL
SELECT 
  'favorite_routes' as table_name, COUNT(*) as count FROM favorite_routes
UNION ALL
SELECT 
  'search_history' as table_name, COUNT(*) as count FROM search_history;
```

## ⚠️ Важные замечания

1. **Резервное копирование**: Перед очисткой сделайте backup важных данных
2. **Тестирование**: Всегда тестируйте скрипты на dev окружении
3. **Мониторинг**: Следите за размером кэша и производительностью
4. **Безопасность**: Не отключайте RLS в production

## 🔗 Ссылки

- [Supabase Dashboard](https://kzbtwgpedbojxnfiprsw.supabase.co)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
