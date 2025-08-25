# Выполнение миграций в Supabase

## Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Войдите в свой аккаунт
3. Выберите проект: `kzbtwgpedbojxnfiprsw`

## Шаг 2: Откройте SQL Editor

1. В левом меню нажмите "SQL Editor"
2. Нажмите "New query"

## Шаг 3: Выполните миграции

### Миграция 1: Основная миграция кэширования

Скопируйте и выполните содержимое файла:
```
supabase/migrations/20250101000003_create_route_cache.sql
```

### Миграция 2: Исправление popular_routes

Скопируйте и выполните содержимое файла:
```
supabase/migrations/20250101000005_fix_popular_routes_table.sql
```

**Примечание**: Эта миграция удаляет существующую таблицу и создает заново.

## Шаг 4: Проверка

После выполнения миграций проверьте:

```sql
-- Проверить таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('route_cache', 'popular_routes', 'route_usage_stats');

-- Проверить данные в popular_routes
SELECT * FROM popular_routes LIMIT 5;

-- Проверить функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%route%';
```

## Шаг 5: Тестирование API

После выполнения миграций протестируйте API:

```bash
# Тест поиска расписаний
curl -X GET "http://localhost:3000/api/schedules?originPortId=USNYC&destinationPortId=NLRTM&departureDateFrom=2024-12-01&departureDateTo=2024-12-31&resultCount=10"

# Тест статистики кэша
curl -X GET "http://localhost:3000/api/route-cache?action=stats"

# Тест популярных маршрутов
curl -X GET "http://localhost:3000/api/route-cache?action=popular-routes"
```

## Ожидаемые результаты

После успешного выполнения:

1. **API расписаний** должен работать и кэшировать данные
2. **Статистика кэша** должна показывать информацию о таблицах
3. **Популярные маршруты** должны возвращать список маршрутов

## Troubleshooting

### Ошибка 42809
Если получаете ошибку `42809: cannot create index on relation "popular_routes"`:
- Убедитесь, что выполнили миграцию `20250101000005_fix_popular_routes_table.sql`
- Эта миграция удаляет существующую таблицу и создает заново

### Ошибка "popular_routes" is not a view
Если получаете ошибку `"popular_routes" is not a view`:
- Выполните миграцию `20250101000005_fix_popular_routes_table.sql`
- Эта миграция использует `DROP TABLE` вместо `DROP VIEW`

### Ошибка подключения
Если API возвращает ошибки подключения:
- Проверьте переменные окружения в `.env.local`
- Убедитесь, что проект Supabase активен
- Проверьте права доступа service role
