-- Полная очистка базы данных Supabase для SprutNet
-- ⚠️ ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные и таблицы!
-- Выполняйте только если вы уверены, что хотите очистить базу

-- Отключение RLS для всех таблиц
ALTER TABLE IF EXISTS api_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favorite_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_history DISABLE ROW LEVEL SECURITY;

-- Удаление всех политик RLS
DROP POLICY IF EXISTS "api_cache_select_policy" ON api_cache;
DROP POLICY IF EXISTS "api_cache_insert_policy" ON api_cache;
DROP POLICY IF EXISTS "reminders_select_policy" ON reminders;
DROP POLICY IF EXISTS "reminders_insert_policy" ON reminders;
DROP POLICY IF EXISTS "reminders_update_policy" ON reminders;
DROP POLICY IF EXISTS "reminders_delete_policy" ON reminders;
DROP POLICY IF EXISTS "favorite_routes_select_policy" ON favorite_routes;
DROP POLICY IF EXISTS "favorite_routes_insert_policy" ON favorite_routes;
DROP POLICY IF EXISTS "favorite_routes_delete_policy" ON favorite_routes;
DROP POLICY IF EXISTS "search_history_select_policy" ON search_history;
DROP POLICY IF EXISTS "search_history_insert_policy" ON search_history;

-- Удаление индексов
DROP INDEX IF EXISTS idx_api_cache_endpoint_params;
DROP INDEX IF EXISTS idx_api_cache_expires_at;
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_reminders_deadline_date;
DROP INDEX IF EXISTS idx_reminders_is_active;
DROP INDEX IF EXISTS idx_favorite_routes_user_id;
DROP INDEX IF EXISTS idx_search_history_user_id;
DROP INDEX IF EXISTS idx_search_history_date;

-- Удаление функций
DROP FUNCTION IF EXISTS cleanup_expired_cache();

-- Удаление таблиц (в правильном порядке из-за зависимостей)
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS favorite_routes CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS api_cache CASCADE;

-- Очистка всех данных из системных таблиц (если есть)
-- Удаление всех пользователей (кроме анонимного и service_role)
DELETE FROM auth.users WHERE email != 'anon@supabase.co' AND email != 'service_role@supabase.co';

-- Очистка storage (если используется)
-- DROP TABLE IF EXISTS storage.objects CASCADE;
-- DROP TABLE IF EXISTS storage.buckets CASCADE;

-- Сброс последовательностей (если есть)
-- ALTER SEQUENCE IF EXISTS api_cache_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS reminders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS favorite_routes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS search_history_id_seq RESTART WITH 1;

-- Проверка, что все таблицы удалены
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('api_cache', 'reminders', 'favorite_routes', 'search_history');

-- Сообщение об успешной очистке
DO $$
BEGIN
  RAISE NOTICE 'База данных полностью очищена!';
  RAISE NOTICE 'Все таблицы, индексы, политики и функции удалены.';
  RAISE NOTICE 'Теперь можно выполнить schema.sql для создания новой структуры.';
END $$;
