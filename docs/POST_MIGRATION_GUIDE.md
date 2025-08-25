# Руководство после миграции

## 🎉 Миграция выполнена успешно!

Теперь у вас есть полностью настроенная база данных для SprutNet Shipping Planner. Вот что нужно сделать дальше:

## 📋 Следующие шаги

### 1. **Проверьте миграцию**
```sql
-- Выполните в Supabase SQL Editor:
-- supabase/verify_migration.sql
```

Этот скрипт проверит:
- ✅ Все 25 таблиц созданы
- ✅ Расширения установлены
- ✅ Индексы созданы
- ✅ RLS политики настроены
- ✅ Представления созданы
- ✅ Функции и триггеры работают
- ✅ Начальные данные загружены

### 2. **Настройте планировщик очистки кэша**
```sql
-- В Supabase Dashboard -> Database -> Functions
-- Создайте cron job для автоматической очистки кэша:

SELECT cron.schedule(
  'cleanup-expired-cache',
  '*/5 * * * *', -- каждые 5 минут
  'SELECT cleanup_expired_cache();'
);
```

### 3. **Проверьте подключение приложения**
```bash
# Запустите приложение
cd apps/web
npm run dev
```

### 4. **Протестируйте API endpoints**
- Откройте `http://localhost:3000/planner`
- Попробуйте поиск портов
- Проверьте получение расписаний
- Протестируйте дедлайны

## 🗄️ Структура базы данных

### **Maersk API таблицы (16 таблиц)**
- `countries`, `carrier_codes`, `transport_modes`, `location_types`
- `vessels`, `locations`, `carrier_locations`
- `ocean_products`, `transport_schedules`, `transport_legs`, `transports`
- `facilities`, `un_location_codes`
- `shipment_deadlines`, `deadlines`, `shipment_deadline`

### **Пользовательские таблицы (4 таблицы)**
- `users` - Пользователи и профили
- `api_cache` - Кэш API запросов
- `user_searches` - История поисков
- `user_favorites` - Избранное
- `user_reminders` - Напоминания

### **Системные таблицы (5 таблиц)**
- `performance_metrics` - Метрики производительности
- `analytics_events` - События аналитики
- `system_config` - Системная конфигурация
- `feature_flags` - Feature flags

## 🔧 Настройка мониторинга

### **Проверьте метрики производительности**
```sql
-- Посмотрите на метрики API
SELECT * FROM performance_metrics ORDER BY created_at DESC LIMIT 10;

-- Проверьте статистику кэша
SELECT * FROM cache_stats;

-- Посмотрите популярные маршруты
SELECT * FROM popular_routes LIMIT 10;
```

### **Настройте алерты (опционально)**
```sql
-- Создайте функцию для алертов
CREATE OR REPLACE FUNCTION check_api_health()
RETURNS TABLE(alert_type TEXT, message TEXT) AS $$
BEGIN
  -- Проверка ошибок API
  IF EXISTS (
    SELECT 1 FROM performance_metrics 
    WHERE status_code >= 500 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RETURN QUERY SELECT 'ERROR'::TEXT, 'High API error rate detected'::TEXT;
  END IF;
  
  -- Проверка медленных запросов
  IF EXISTS (
    SELECT 1 FROM performance_metrics 
    WHERE response_time_ms > 5000 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RETURN QUERY SELECT 'WARNING'::TEXT, 'Slow API responses detected'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Оптимизация производительности

### **Проверьте индексы**
```sql
-- Посмотрите использование индексов
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### **Мониторинг кэша**
```sql
-- Проверьте эффективность кэша
SELECT 
  cache_hit_ratio,
  total_requests,
  cache_hits,
  cache_misses
FROM cache_stats;
```

## 🔒 Безопасность

### **Проверьте RLS политики**
```sql
-- Убедитесь, что политики активны
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### **Проверьте права доступа**
```sql
-- Проверьте права пользователей
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY grantee, table_name;
```

## 📊 Аналитика

### **Проверьте представления аналитики**
```sql
-- Статистика пользователей
SELECT * FROM user_activity LIMIT 10;

-- Статистика судов
SELECT * FROM vessel_stats LIMIT 10;

-- Статистика портов
SELECT * FROM port_stats LIMIT 10;

-- Статистика API
SELECT * FROM api_stats;
```

## 🛠️ Устранение неполадок

### **Частые проблемы**

1. **Ошибка подключения к API**
   ```sql
   -- Проверьте конфигурацию
   SELECT * FROM system_config WHERE config_key LIKE '%maersk%';
   ```

2. **Медленные запросы**
   ```sql
   -- Проверьте метрики производительности
   SELECT endpoint, AVG(response_time_ms) as avg_time
   FROM performance_metrics 
   GROUP BY endpoint 
   ORDER BY avg_time DESC;
   ```

3. **Проблемы с кэшем**
   ```sql
   -- Проверьте состояние кэша
   SELECT COUNT(*) as total_entries,
          COUNT(*) FILTER (WHERE expires < NOW()) as expired_entries
   FROM api_cache;
   ```

### **Логи и отладка**
```sql
-- Посмотрите последние события
SELECT * FROM analytics_events 
ORDER BY created_at DESC 
LIMIT 20;

-- Проверьте ошибки
SELECT * FROM performance_metrics 
WHERE status_code >= 400 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📈 Следующие улучшения

### **Рекомендуемые улучшения**

1. **Настройка резервного копирования**
   - Автоматические бэкапы в Supabase
   - Экспорт данных для локального хранения

2. **Мониторинг и алерты**
   - Настройка уведомлений о проблемах
   - Дашборд мониторинга

3. **Оптимизация запросов**
   - Анализ медленных запросов
   - Дополнительные индексы при необходимости

4. **Масштабирование**
   - Настройка реплик для чтения
   - Оптимизация для высоких нагрузок

## 🎯 Готово к продакшену!

Ваша база данных теперь готова для:
- ✅ Обработки запросов к Maersk API
- ✅ Кэширования данных для производительности
- ✅ Аналитики использования
- ✅ Мониторинга производительности
- ✅ Управления пользователями
- ✅ Feature flags и конфигурации

**Следующий шаг**: Запустите приложение и протестируйте все функции! 🚀

---

**Статус**: ✅ Миграция завершена  
**Дата**: 2025-01-01  
**Версия**: 1.0
