# Настройка синхронизации с Supabase

## Обзор

Проект настроен для полной синхронизации с Supabase через CLI. Все изменения в базе данных управляются через миграции и автоматически синхронизируются.

## Требования

- Supabase CLI установлен: `npm install -g supabase`
- Доступ к проекту Supabase: `kzbtwgpedbojxnfiprsw`
- Пароль от базы данных Supabase

## Структура миграций

```
supabase/migrations/
├── 20250101000000_clean_database.sql          # Очистка БД
├── 20250101000001_align_with_official_maersk_api.sql  # Базовые типы и таблицы
├── 20250101000002_unified_schema.sql          # Основная схема
├── 20250101000003_create_route_cache.sql      # Кэширование маршрутов
├── 20250101000004_fix_popular_routes.sql      # Исправление popular_routes
├── 20250101000005_fix_popular_routes_table.sql # Создание таблицы popular_routes
└── 20250101000006_add_test_results_table.sql  # Таблицы для тестирования
```

## Команды для работы с Supabase

### Основные команды

```bash
# Проверить статус подключения
supabase status

# Применить все миграции
supabase db push

# Показать различия между локальной и удаленной БД
supabase db diff

# Синхронизировать схему с удаленной БД
supabase db pull

# Список миграций
supabase migration list

# Создать новую миграцию
supabase migration new migration_name
```

### Автоматизированные скрипты

```bash
# Полная синхронизация
./scripts/supabase-sync.sh

# Очистка и применение миграций
./scripts/clean-and-migrate.sh
```

## Процесс разработки

### 1. Создание новой миграции

```bash
supabase migration new add_new_feature
```

### 2. Редактирование миграции

Отредактируйте созданный файл в `supabase/migrations/`

### 3. Применение миграции

```bash
supabase db push
```

### 4. Проверка статуса

```bash
supabase migration list
```

## Структура базы данных

### Основные таблицы

- **route_cache** - Кэш маршрутов от Maersk API
- **popular_routes** - Популярные маршруты для предзагрузки
- **route_usage_stats** - Статистика использования маршрутов
- **api_metrics** - Метрики API
- **user_searches** - Поиски пользователей
- **test_results** - Результаты тестирования

### Представления

- **route_cache_monitoring** - Мониторинг кэша
- **test_stats** - Статистика тестов
- **recent_test_results** - Последние результаты тестов

## Мониторинг и отладка

### Проверка состояния кэша

```sql
SELECT * FROM route_cache_monitoring;
```

### Проверка статистики тестов

```sql
SELECT * FROM test_stats ORDER BY test_date DESC LIMIT 10;
```

### Очистка старых данных

```sql
-- Очистка старых результатов тестов (старше 30 дней)
SELECT cleanup_old_test_results(30);

-- Очистка устаревшего кэша
SELECT cleanup_expired_route_cache();
```

## Устранение неполадок

### Ошибка подключения

```bash
# Переподключение к проекту
supabase link --project-ref kzbtwgpedbojxnfiprsw
```

### Конфликты миграций

```bash
# Исправление истории миграций
supabase migration repair --status reverted MIGRATION_ID
```

### Очистка базы данных

```bash
# Полная очистка (осторожно!)
./scripts/clean-and-migrate.sh
```

## Переменные окружения

Убедитесь, что в `.env.local` настроены:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kzbtwgpedbojxnfiprsw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Доступ к Dashboard

🌐 **Supabase Dashboard**: https://supabase.com/dashboard/project/kzbtwgpedbojxnfiprsw

## Автоматизация

### GitHub Actions

Можно настроить автоматическое применение миграций при push в main ветку:

```yaml
name: Deploy to Supabase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Supabase
        run: |
          npm install -g supabase
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Безопасность

- Все политики RLS настроены для безопасного доступа
- Service role используется только для внутренних операций
- Пользовательские данные изолированы через RLS политики

## Резервное копирование

Рекомендуется настроить автоматическое резервное копирование в Supabase Dashboard:

1. Перейдите в Settings > Database
2. Настройте Backup Schedule
3. Укажите Retention Period

## Поддержка

При возникновении проблем:

1. Проверьте логи: `supabase logs`
2. Проверьте статус: `supabase status`
3. Создайте issue в репозитории проекта
