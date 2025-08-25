# Исправление синтаксиса миграции

## Проблема

При применении миграционного скрипта `20250101000002_unified_schema.sql` возникала ошибка:

```
ERROR: 42601: syntax error at or near "("
LINE 270: UNIQUE(user_id, favorite_type, (favorite_data->>'id'))
```

## Причина

В PostgreSQL нельзя использовать JSON операторы (`->>`) непосредственно в определении `UNIQUE` ограничения таблицы. Правильный подход - создавать уникальный индекс отдельно.

## Исправление

### ❌ Неправильный синтаксис:
```sql
CREATE TABLE user_favorites (
    -- ... другие поля ...
    UNIQUE(user_id, favorite_type, (favorite_data->>'id'))
);
```

### ✅ Правильный синтаксис:
```sql
-- 1. Создаем таблицу без UNIQUE ограничения
CREATE TABLE user_favorites (
    -- ... другие поля ...
);

-- 2. Создаем уникальный индекс отдельно
CREATE UNIQUE INDEX idx_user_favorites_unique 
ON user_favorites(user_id, favorite_type, (favorite_data->>'id'));
```

## Внесенные изменения

### 1. Удалено из определения таблицы:
```sql
-- УДАЛЕНО:
UNIQUE(user_id, favorite_type, (favorite_data->>'id'))
```

### 2. Добавлено в секцию индексов:
```sql
-- ДОБАВЛЕНО:
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique 
ON user_favorites(user_id, favorite_type, (favorite_data->>'id'));
```

### 3. Обновлен скрипт очистки:
```sql
-- Добавлено удаление нового индекса:
SELECT safe_drop_index('idx_user_favorites_unique');
```

## Проверка исправления

Для проверки исправления выполните тестовый скрипт:

```sql
-- supabase/test_migration_fix.sql
```

Этот скрипт:
1. Создает тестовую таблицу с правильным синтаксисом
2. Создает уникальный индекс
3. Проверяет, что индекс создался
4. Удаляет тестовую таблицу

## Применение исправления

1. **Очистите базу данных** (если нужно):
   ```sql
   -- supabase/safe_cleanup.sql
   ```

2. **Примените исправленную миграцию**:
   ```sql
   -- supabase/migrations/20250101000002_unified_schema.sql
   ```

3. **Проверьте результат**:
   ```sql
   -- supabase/check_current_state.sql
   ```

## Дополнительные рекомендации

### Для JSON полей в PostgreSQL:

1. **Уникальные ограничения**: Используйте `CREATE UNIQUE INDEX`
2. **Проверочные ограничения**: Используйте `CHECK` с JSON операторами
3. **Индексы для поиска**: Используйте GIN индексы для JSONB полей

### Примеры правильного синтаксиса:

```sql
-- Уникальный индекс с JSON полем
CREATE UNIQUE INDEX idx_example_unique 
ON table_name(column1, column2, (json_column->>'key'));

-- Проверочное ограничение с JSON
ALTER TABLE table_name 
ADD CONSTRAINT check_json_field 
CHECK (json_column->>'required_field' IS NOT NULL);

-- GIN индекс для поиска по JSON
CREATE INDEX idx_json_search 
ON table_name USING gin(json_column);
```

## Связанные файлы

- `supabase/migrations/20250101000002_unified_schema.sql` - Исправленная миграция
- `supabase/safe_cleanup.sql` - Обновленный скрипт очистки
- `supabase/test_migration_fix.sql` - Тестовый скрипт
- `docs/DATABASE_MIGRATION_GUIDE.md` - Обновленное руководство

---

**Статус**: ✅ Исправлено  
**Дата**: 2025-01-01  
**Версия**: 1.0
