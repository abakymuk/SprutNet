-- Скрипт для проверки текущего состояния базы данных
-- Выполните этот скрипт в SQL Editor для диагностики

-- ========================================
-- ПРОВЕРКА ТАБЛИЦ
-- ========================================

-- Список всех таблиц в схеме public
SELECT 
  'Tables in public schema:' as info,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Детальный список таблиц
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- ПРОВЕРКА ИНДЕКСОВ
-- ========================================

-- Количество индексов
SELECT 
  'Indexes in public schema:' as info,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';

-- Список индексов по таблицам
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- ПРОВЕРКА ПОЛИТИК RLS
-- ========================================

-- Количество политик RLS
SELECT 
  'RLS Policies:' as info,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- Список политик
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- ПРОВЕРКА ФУНКЦИЙ
-- ========================================

-- Список функций
SELECT 
  'Functions:' as info,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- Детали функций
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;

-- ========================================
-- ПРОВЕРКА ПРЕДСТАВЛЕНИЙ
-- ========================================

-- Список представлений
SELECT 
  'Views:' as info,
  COUNT(*) as count
FROM pg_views 
WHERE schemaname = 'public';

-- Детали представлений
SELECT 
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- ========================================
-- ПРОВЕРКА ТРИГГЕРОВ
-- ========================================

-- Список триггеров
SELECT 
  'Triggers:' as info,
  COUNT(*) as count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND NOT t.tgisinternal;

-- Детали триггеров
SELECT 
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public' AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ========================================
-- ПРОВЕРКА РАСШИРЕНИЙ
-- ========================================

-- Список расширений
SELECT 
  'Extensions:' as info,
  COUNT(*) as count
FROM pg_extension;

-- Детали расширений
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
ORDER BY extname;

-- ========================================
-- ПРОВЕРКА СХЕМ
-- ========================================

-- Список схем
SELECT 
  'Schemas:' as info,
  COUNT(*) as count
FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';

-- Детали схем
SELECT 
  nspname as schema_name,
  nspowner::regrole as owner
FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
ORDER BY nspname;

-- ========================================
-- СВОДКА
-- ========================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  view_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Подсчет таблиц
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  -- Подсчет индексов
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  -- Подсчет политик
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Подсчет функций
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public';
  
  -- Подсчет представлений
  SELECT COUNT(*) INTO view_count
  FROM pg_views 
  WHERE schemaname = 'public';
  
  -- Подсчет триггеров
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' AND NOT t.tgisinternal;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'СВОДКА ТЕКУЩЕГО СОСТОЯНИЯ БАЗЫ ДАННЫХ';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Таблиц: %', table_count;
  RAISE NOTICE 'Индексов: %', index_count;
  RAISE NOTICE 'Политик RLS: %', policy_count;
  RAISE NOTICE 'Функций: %', function_count;
  RAISE NOTICE 'Представлений: %', view_count;
  RAISE NOTICE 'Триггеров: %', trigger_count;
  RAISE NOTICE '========================================';
  
  IF table_count = 0 THEN
    RAISE NOTICE 'База данных пуста. Можно применять миграцию.';
  ELSIF table_count > 0 AND table_count < 25 THEN
    RAISE NOTICE 'База данных частично заполнена. Проверьте структуру.';
  ELSE
    RAISE NOTICE 'База данных содержит данные. Создайте резервную копию перед миграцией.';
  END IF;
  
END $$;
