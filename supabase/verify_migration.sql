-- Быстрая проверка успешности миграции
-- Выполните этот скрипт в Supabase SQL Editor

-- ========================================
-- ПРОВЕРКА ОСНОВНЫХ КОМПОНЕНТОВ
-- ========================================

DO $$
DECLARE
  table_count INTEGER;
  expected_tables TEXT[] := ARRAY[
    'countries', 'carrier_codes', 'transport_modes', 'location_types',
    'vessels', 'locations', 'carrier_locations', 'ocean_products',
    'transport_schedules', 'transport_legs', 'transports', 'facilities',
    'un_location_codes', 'shipment_deadlines', 'deadlines', 'shipment_deadline',
    'users', 'api_cache', 'user_searches', 'user_favorites', 'user_reminders',
    'performance_metrics', 'analytics_events', 'system_config', 'feature_flags'
  ];
  missing_tables TEXT[] := '{}';
  found_table TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ПРОВЕРКА УСПЕШНОСТИ МИГРАЦИИ';
  RAISE NOTICE '========================================';
  
  -- Подсчет таблиц
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  RAISE NOTICE 'Найдено таблиц: %', table_count;
  
  -- Проверка ожидаемых таблиц
  FOREACH found_table IN ARRAY expected_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = found_table
    ) THEN
      missing_tables := array_append(missing_tables, found_table);
    END IF;
  END LOOP;
  
  -- Результат проверки
  IF array_length(missing_tables, 1) IS NULL THEN
    RAISE NOTICE '✅ Все ожидаемые таблицы созданы!';
  ELSE
    RAISE NOTICE '❌ Отсутствуют таблицы: %', array_to_string(missing_tables, ', ');
  END IF;
  
  -- Проверка расширений
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE NOTICE '✅ Расширение uuid-ossp установлено';
  ELSE
    RAISE NOTICE '❌ Расширение uuid-ossp НЕ установлено';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    RAISE NOTICE '✅ Расширение pg_trgm установлено';
  ELSE
    RAISE NOTICE '❌ Расширение pg_trgm НЕ установлено';
  END IF;
  
  -- Проверка индексов
  DECLARE
    index_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Создано индексов: %', index_count;
  END;
  
  -- Проверка политик RLS
  DECLARE
    policy_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Создано политик RLS: %', policy_count;
  END;
  
  -- Проверка представлений
  DECLARE
    view_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO view_count
    FROM pg_views 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Создано представлений: %', view_count;
  END;
  
  -- Проверка функций
  DECLARE
    function_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    RAISE NOTICE 'Создано функций: %', function_count;
  END;
  
  -- Проверка триггеров
  DECLARE
    trigger_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND NOT t.tgisinternal;
    
    RAISE NOTICE 'Создано триггеров: %', trigger_count;
  END;
  
  -- Проверка начальных данных
  DECLARE
    countries_count INTEGER;
    carrier_codes_count INTEGER;
    feature_flags_count INTEGER;
    system_config_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO countries_count FROM countries;
    SELECT COUNT(*) INTO carrier_codes_count FROM carrier_codes;
    SELECT COUNT(*) INTO feature_flags_count FROM feature_flags;
    SELECT COUNT(*) INTO system_config_count FROM system_config;
    
    RAISE NOTICE 'Начальные данные:';
    RAISE NOTICE '  - Страны: %', countries_count;
    RAISE NOTICE '  - Коды перевозчиков: %', carrier_codes_count;
    RAISE NOTICE '  - Feature flags: %', feature_flags_count;
    RAISE NOTICE '  - Системная конфигурация: %', system_config_count;
  END;
  
  RAISE NOTICE '========================================';
  
  -- Финальная оценка
  IF table_count >= 25 AND array_length(missing_tables, 1) IS NULL THEN
    RAISE NOTICE '🎉 МИГРАЦИЯ ВЫПОЛНЕНА УСПЕШНО!';
    RAISE NOTICE 'База данных готова к использованию.';
  ELSE
    RAISE NOTICE '⚠️ МИГРАЦИЯ ВЫПОЛНЕНА ЧАСТИЧНО';
    RAISE NOTICE 'Проверьте отсутствующие компоненты.';
  END IF;
  
  RAISE NOTICE '========================================';
  
END $$;
