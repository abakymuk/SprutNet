# Настройка кэширования маршрутов

## Обзор

Система кэширования маршрутов позволяет:
- Быстро возвращать данные для популярных маршрутов
- Уменьшить нагрузку на Maersk API
- Улучшить производительность поиска

## Текущий статус

Кэширование **временно отключено** для стабильности работы API.

## Для включения кэширования

### 1. Настройка Supabase

1. Создайте проект в Supabase
2. Добавьте переменные окружения в `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Создание таблиц

Выполните миграции в Supabase в следующем порядке:

```sql
-- 1. Основная миграция (если еще не выполнена)
-- Файл: supabase/migrations/20250101000003_create_route_cache.sql

-- 2. Исправление popular_routes (если была ошибка 42809)
-- Файл: supabase/migrations/20250101000004_fix_popular_routes.sql
```

**Примечание**: Если вы получаете ошибку `42809: cannot create index on relation "popular_routes"`, выполните сначала миграцию `20250101000004_fix_popular_routes.sql`.

### 3. Включение кэширования

Раскомментируйте код в `apps/web/src/app/api/schedules/route.ts`:

```typescript
// Раскомментируйте эти блоки:
const cachedData = await routeCacheService.getCachedRoute(...)
await routeCacheService.cacheRoute(...)
await routeCacheService.updateRouteUsageStats(...)
```

### 4. Тестирование

1. Запустите dev сервер: `npm run dev`
2. Протестируйте API: `curl http://localhost:3000/api/schedules?...`
3. Проверьте кэш: `curl http://localhost:3000/api/route-cache?action=stats`

## Мониторинг

- **Статистика кэша**: `/api/route-cache?action=stats`
- **Популярные маршруты**: `/api/route-cache?action=popular-routes`
- **Очистка кэша**: `POST /api/route-cache` с `action=cleanup`

## Предзагрузка

Запустите скрипт предзагрузки популярных маршрутов:

```bash
cd apps/web
npx tsx src/scripts/preload-popular-routes.ts
```

## Преимущества

✅ **Быстрый поиск** - популярные маршруты загружаются мгновенно  
✅ **Снижение нагрузки** - меньше запросов к Maersk API  
✅ **Улучшенная производительность** - кэш в памяти и базе данных  
✅ **Мониторинг** - статистика использования и производительности  

## Troubleshooting

### Ошибка 500 при поиске
- Проверьте переменные окружения Supabase
- Убедитесь, что таблицы созданы
- Проверьте логи в консоли

### Кэш не работает
- Проверьте подключение к Supabase
- Убедитесь, что RLS политики настроены
- Проверьте права доступа service role

### Медленная работа
- Проверьте индексы в базе данных
- Убедитесь, что cleanup выполняется регулярно
- Мониторьте размер кэша
