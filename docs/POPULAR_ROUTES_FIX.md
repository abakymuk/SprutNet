# Исправление ошибки popular_routes

## Проблема

**Ошибка**: `42809: cannot create index on relation "popular_routes"`

**Причина**: В предыдущей миграции `popular_routes` был создан как view, а в новой миграции мы пытаемся создать таблицу с тем же именем и индексы на ней.

## Решение

### Вариант 1: Выполнить исправляющую миграцию

```sql
-- Выполните в Supabase SQL Editor
-- Файл: supabase/migrations/20250101000004_fix_popular_routes.sql
```

Эта миграция:
1. Удаляет существующий view `popular_routes`
2. Создает таблицу `popular_routes` с правильной структурой
3. Создает необходимые индексы
4. Вставляет начальные данные

### Вариант 2: Ручное исправление

Если миграция не работает, выполните вручную:

```sql
-- 1. Удалить view
DROP VIEW IF EXISTS popular_routes;

-- 2. Создать таблицу
CREATE TABLE IF NOT EXISTS popular_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_port_id VARCHAR(10) NOT NULL,
    destination_port_id VARCHAR(10) NOT NULL,
    origin_port_name VARCHAR(100),
    destination_port_name VARCHAR(100),
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT popular_routes_unique UNIQUE (origin_port_id, destination_port_id)
);

-- 3. Создать индексы
CREATE INDEX IF NOT EXISTS idx_popular_routes_search_count ON popular_routes(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_routes_priority ON popular_routes(priority DESC);
CREATE INDEX IF NOT EXISTS idx_popular_routes_active ON popular_routes(is_active);

-- 4. Включить RLS
ALTER TABLE popular_routes ENABLE ROW LEVEL SECURITY;

-- 5. Создать политики
CREATE POLICY "Allow read access to popular routes" ON popular_routes FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access to popular routes" ON popular_routes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update access to popular routes" ON popular_routes FOR UPDATE USING (TRUE);
```

## Проверка

После исправления проверьте:

```sql
-- Проверить, что таблица создана
SELECT * FROM popular_routes LIMIT 5;

-- Проверить индексы
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'popular_routes';
```

## Статус

🟢 **ИСПРАВЛЕНО** - Создана миграция `20250101000004_fix_popular_routes.sql`  
📋 **ДОКУМЕНТАЦИЯ ОБНОВЛЕНА** - Инструкции добавлены в `docs/CACHE_SETUP.md`
