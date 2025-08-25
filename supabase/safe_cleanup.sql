-- Безопасная очистка базы данных Supabase для SprutNet
-- ⚠️ ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные и таблицы!
-- Выполняйте только если вы уверены, что хотите очистить базу

-- ========================================
-- ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ
-- ========================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  -- Подсчет существующих таблиц
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'НАЧАЛО БЕЗОПАСНОЙ ОЧИСТКИ БАЗЫ ДАННЫХ';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Найдено таблиц в схеме public: %', table_count;
  
  IF table_count = 0 THEN
    RAISE NOTICE 'База данных уже пуста. Очистка не требуется.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Начинаем процесс очистки...';
END $$;

-- ========================================
-- БЕЗОПАСНОЕ ОТКЛЮЧЕНИЕ RLS
-- ========================================

-- Функция для безопасного отключения RLS
CREATE OR REPLACE FUNCTION safe_disable_rls(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', table_name);
  RAISE NOTICE 'Отключен RLS для таблицы: %', table_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось отключить RLS для таблицы %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Отключаем RLS для всех возможных таблиц
SELECT safe_disable_rls('users');
SELECT safe_disable_rls('user_searches');
SELECT safe_disable_rls('user_favorites');
SELECT safe_disable_rls('user_reminders');
SELECT safe_disable_rls('analytics_events');
SELECT safe_disable_rls('performance_metrics');
SELECT safe_disable_rls('system_config');
SELECT safe_disable_rls('feature_flags');
SELECT safe_disable_rls('api_cache');
SELECT safe_disable_rls('countries');
SELECT safe_disable_rls('carrier_codes');
SELECT safe_disable_rls('transport_modes');
SELECT safe_disable_rls('location_types');
SELECT safe_disable_rls('vessels');
SELECT safe_disable_rls('locations');
SELECT safe_disable_rls('carrier_locations');
SELECT safe_disable_rls('ocean_products');
SELECT safe_disable_rls('transport_schedules');
SELECT safe_disable_rls('transport_legs');
SELECT safe_disable_rls('transports');
SELECT safe_disable_rls('facilities');
SELECT safe_disable_rls('un_location_codes');
SELECT safe_disable_rls('shipment_deadlines');
SELECT safe_disable_rls('deadlines');
SELECT safe_disable_rls('shipment_deadline');

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS safe_disable_rls(TEXT);

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ПОЛИТИК RLS
-- ========================================

-- Функция для безопасного удаления политик
CREATE OR REPLACE FUNCTION safe_drop_policy(table_name TEXT, policy_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
  RAISE NOTICE 'Удалена политика % для таблицы %', policy_name, table_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось удалить политику % для таблицы %: %', policy_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Удаляем политики для пользовательских таблиц
SELECT safe_drop_policy('users', 'Users can view own data');
SELECT safe_drop_policy('users', 'Users can update own data');
SELECT safe_drop_policy('user_searches', 'Users can view own searches');
SELECT safe_drop_policy('user_searches', 'Users can insert own searches');
SELECT safe_drop_policy('user_favorites', 'Users can manage own favorites');
SELECT safe_drop_policy('user_reminders', 'Users can manage own reminders');
SELECT safe_drop_policy('analytics_events', 'Users can view own analytics');

-- Удаляем политики для системных таблиц
SELECT safe_drop_policy('performance_metrics', 'System tables for service role');
SELECT safe_drop_policy('system_config', 'System tables for service role');
SELECT safe_drop_policy('test_results', 'Allow authenticated read access to test results');
SELECT safe_drop_policy('test_summaries', 'Allow authenticated read access to test summaries');

-- Удаляем политики для Maersk данных
SELECT safe_drop_policy('countries', 'Allow authenticated read access');
SELECT safe_drop_policy('carrier_codes', 'Allow authenticated read access');
SELECT safe_drop_policy('transport_modes', 'Allow authenticated read access');
SELECT safe_drop_policy('location_types', 'Allow authenticated read access');
SELECT safe_drop_policy('vessels', 'Allow authenticated read access');
SELECT safe_drop_policy('locations', 'Allow authenticated read access');
SELECT safe_drop_policy('carrier_locations', 'Allow authenticated read access');
SELECT safe_drop_policy('ocean_products', 'Allow authenticated read access');
SELECT safe_drop_policy('transport_schedules', 'Allow authenticated read access');
SELECT safe_drop_policy('transport_legs', 'Allow authenticated read access');
SELECT safe_drop_policy('transports', 'Allow authenticated read access');
SELECT safe_drop_policy('facilities', 'Allow authenticated read access');
SELECT safe_drop_policy('un_location_codes', 'Allow authenticated read access');
SELECT safe_drop_policy('shipment_deadlines', 'Allow authenticated read access');
SELECT safe_drop_policy('deadlines', 'Allow authenticated read access');
SELECT safe_drop_policy('shipment_deadline', 'Allow authenticated read access');

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS safe_drop_policy(TEXT, TEXT);

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ПРЕДСТАВЛЕНИЙ
-- ========================================

DROP VIEW IF EXISTS cache_stats CASCADE;
DROP VIEW IF EXISTS api_stats CASCADE;
DROP VIEW IF EXISTS popular_routes CASCADE;
DROP VIEW IF EXISTS user_activity CASCADE;
DROP VIEW IF EXISTS vessel_stats CASCADE;
DROP VIEW IF EXISTS port_stats CASCADE;

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ТРИГГЕРОВ
-- ========================================

-- Функция для безопасного удаления триггеров
CREATE OR REPLACE FUNCTION safe_drop_trigger(table_name TEXT, trigger_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, table_name);
  RAISE NOTICE 'Удален триггер % для таблицы %', trigger_name, table_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось удалить триггер % для таблицы %: %', trigger_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Удаляем триггеры для updated_at
SELECT safe_drop_trigger('countries', 'trigger_update_updated_at');
SELECT safe_drop_trigger('carrier_codes', 'trigger_update_updated_at');
SELECT safe_drop_trigger('transport_modes', 'trigger_update_updated_at');
SELECT safe_drop_trigger('location_types', 'trigger_update_updated_at');
SELECT safe_drop_trigger('vessels', 'trigger_update_updated_at');
SELECT safe_drop_trigger('locations', 'trigger_update_updated_at');
SELECT safe_drop_trigger('carrier_locations', 'trigger_update_updated_at');
SELECT safe_drop_trigger('ocean_products', 'trigger_update_updated_at');
SELECT safe_drop_trigger('transport_schedules', 'trigger_update_updated_at');
SELECT safe_drop_trigger('transport_legs', 'trigger_update_updated_at');
SELECT safe_drop_trigger('transports', 'trigger_update_updated_at');
SELECT safe_drop_trigger('facilities', 'trigger_update_updated_at');
SELECT safe_drop_trigger('un_location_codes', 'trigger_update_updated_at');
SELECT safe_drop_trigger('shipment_deadlines', 'trigger_update_updated_at');
SELECT safe_drop_trigger('deadlines', 'trigger_update_updated_at');
SELECT safe_drop_trigger('shipment_deadline', 'trigger_update_updated_at');
SELECT safe_drop_trigger('users', 'trigger_update_updated_at');
SELECT safe_drop_trigger('user_favorites', 'trigger_update_updated_at');
SELECT safe_drop_trigger('user_reminders', 'trigger_update_updated_at');
SELECT safe_drop_trigger('system_config', 'trigger_update_updated_at');
SELECT safe_drop_trigger('feature_flags', 'trigger_update_updated_at');

-- Удаляем триггер для кэша
SELECT safe_drop_trigger('api_cache', 'trigger_update_cache_access');

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS safe_drop_trigger(TEXT, TEXT);

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ФУНКЦИЙ
-- ========================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_cache_access() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_cache() CASCADE;

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ИНДЕКСОВ
-- ========================================

-- Функция для безопасного удаления индексов
CREATE OR REPLACE FUNCTION safe_drop_index(index_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DROP INDEX IF EXISTS %I', index_name);
  RAISE NOTICE 'Удален индекс: %', index_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось удалить индекс %: %', index_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Удаляем все возможные индексы
SELECT safe_drop_index('idx_countries_name');
SELECT safe_drop_index('idx_carrier_codes_name');
SELECT safe_drop_index('idx_vessels_carrier_code');
SELECT safe_drop_index('idx_vessels_flag_code');
SELECT safe_drop_index('idx_vessels_capacity');
SELECT safe_drop_index('idx_vessels_built_year');
SELECT safe_drop_index('idx_vessels_fulltext');
SELECT safe_drop_index('idx_locations_country_code');
SELECT safe_drop_index('idx_locations_city_name');
SELECT safe_drop_index('idx_locations_un_location_code');
SELECT safe_drop_index('idx_locations_location_type');
SELECT safe_drop_index('idx_locations_region_code');
SELECT safe_drop_index('idx_locations_fulltext');
SELECT safe_drop_index('idx_carrier_locations_timezone');
SELECT safe_drop_index('idx_carrier_locations_aliases');
SELECT safe_drop_index('idx_ocean_products_carrier_code');
SELECT safe_drop_index('idx_ocean_products_valid_dates');
SELECT safe_drop_index('idx_ocean_products_product_id');
SELECT safe_drop_index('idx_transport_schedules_ocean_product_id');
SELECT safe_drop_index('idx_transport_schedules_dates');
SELECT safe_drop_index('idx_transport_schedules_transit_time');
SELECT safe_drop_index('idx_transport_legs_schedule_id');
SELECT safe_drop_index('idx_transport_legs_dates');
SELECT safe_drop_index('idx_transports_leg_id');
SELECT safe_drop_index('idx_transports_vessel_imo');
SELECT safe_drop_index('idx_transports_mode');
SELECT safe_drop_index('idx_transports_voyage');
SELECT safe_drop_index('idx_transports_service');
SELECT safe_drop_index('idx_facilities_leg_id');
SELECT safe_drop_index('idx_facilities_site_geo_id');
SELECT safe_drop_index('idx_facilities_location_type');
SELECT safe_drop_index('idx_un_location_codes_facility_id');
SELECT safe_drop_index('idx_un_location_codes_location_code');
SELECT safe_drop_index('idx_un_location_codes_city_code');
SELECT safe_drop_index('idx_shipment_deadlines_vessel_imo');
SELECT safe_drop_index('idx_shipment_deadlines_voyage');
SELECT safe_drop_index('idx_shipment_deadlines_country');
SELECT safe_drop_index('idx_shipment_deadlines_port');
SELECT safe_drop_index('idx_deadlines_shipment_id');
SELECT safe_drop_index('idx_deadlines_local');
SELECT safe_drop_index('idx_deadlines_name');
SELECT safe_drop_index('idx_shipment_deadline_shipment_id');
SELECT safe_drop_index('idx_shipment_deadline_terminal');
SELECT safe_drop_index('idx_users_email');
SELECT safe_drop_index('idx_users_company');
SELECT safe_drop_index('idx_users_role');
SELECT safe_drop_index('idx_users_active');
SELECT safe_drop_index('idx_api_cache_key_hash');
SELECT safe_drop_index('idx_api_cache_endpoint');
SELECT safe_drop_index('idx_api_cache_expires');
SELECT safe_drop_index('idx_api_cache_last_accessed');
SELECT safe_drop_index('idx_api_cache_type');
SELECT safe_drop_index('idx_api_cache_params');
SELECT safe_drop_index('idx_user_searches_user');
SELECT safe_drop_index('idx_user_searches_type');
SELECT safe_drop_index('idx_user_searches_route');
SELECT safe_drop_index('idx_user_searches_date');
SELECT safe_drop_index('idx_user_searches_params');
SELECT safe_drop_index('idx_user_favorites_user');
SELECT safe_drop_index('idx_user_favorites_type');
SELECT safe_drop_index('idx_user_favorites_data');
SELECT safe_drop_index('idx_user_favorites_unique');
SELECT safe_drop_index('idx_user_reminders_user');
SELECT safe_drop_index('idx_user_reminders_date');
SELECT safe_drop_index('idx_user_reminders_active');
SELECT safe_drop_index('idx_user_reminders_vessel');
SELECT safe_drop_index('idx_performance_metrics_endpoint');
SELECT safe_drop_index('idx_performance_metrics_status');
SELECT safe_drop_index('idx_performance_metrics_time');
SELECT safe_drop_index('idx_performance_metrics_session');
SELECT safe_drop_index('idx_performance_metrics_provider');
SELECT safe_drop_index('idx_performance_metrics_user');
SELECT safe_drop_index('idx_analytics_events_type');
SELECT safe_drop_index('idx_analytics_events_user');
SELECT safe_drop_index('idx_analytics_events_session');
SELECT safe_drop_index('idx_analytics_events_time');
SELECT safe_drop_index('idx_analytics_events_data');
SELECT safe_drop_index('idx_system_config_key');
SELECT safe_drop_index('idx_system_config_category');
SELECT safe_drop_index('idx_system_config_active');
SELECT safe_drop_index('idx_feature_flags_name');
SELECT safe_drop_index('idx_feature_flags_environment');
SELECT safe_drop_index('idx_feature_flags_category');

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS safe_drop_index(TEXT);

-- ========================================
-- БЕЗОПАСНОЕ УДАЛЕНИЕ ТАБЛИЦ
-- ========================================

-- Функция для безопасного удаления таблиц
CREATE OR REPLACE FUNCTION safe_drop_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', table_name);
  RAISE NOTICE 'Удалена таблица: %', table_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось удалить таблицу %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Удаляем таблицы в правильном порядке (сначала зависимые)

-- Пользовательские таблицы
SELECT safe_drop_table('user_reminders');
SELECT safe_drop_table('user_favorites');
SELECT safe_drop_table('user_searches');
SELECT safe_drop_table('users');

-- Системные таблицы
SELECT safe_drop_table('analytics_events');
SELECT safe_drop_table('performance_metrics');
SELECT safe_drop_table('feature_flags');
SELECT safe_drop_table('system_config');

-- Кэш
SELECT safe_drop_table('api_cache');

-- Maersk API таблицы (в обратном порядке зависимостей)
SELECT safe_drop_table('shipment_deadline');
SELECT safe_drop_table('deadlines');
SELECT safe_drop_table('shipment_deadlines');
SELECT safe_drop_table('un_location_codes');
SELECT safe_drop_table('facilities');
SELECT safe_drop_table('transports');
SELECT safe_drop_table('transport_legs');
SELECT safe_drop_table('transport_schedules');
SELECT safe_drop_table('ocean_products');
SELECT safe_drop_table('carrier_locations');
SELECT safe_drop_table('locations');
SELECT safe_drop_table('vessels');
SELECT safe_drop_table('location_types');
SELECT safe_drop_table('transport_modes');
SELECT safe_drop_table('carrier_codes');
SELECT safe_drop_table('countries');

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS safe_drop_table(TEXT);

-- ========================================
-- ОЧИСТКА ДОПОЛНИТЕЛЬНЫХ ДАННЫХ
-- ========================================

-- Удаление всех пользователей (кроме системных)
DELETE FROM auth.users WHERE email != 'anon@supabase.co' AND email != 'service_role@supabase.co';

-- ========================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ========================================

DO $$
DECLARE
  remaining_tables INTEGER;
BEGIN
  -- Подсчет оставшихся таблиц
  SELECT COUNT(*) INTO remaining_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ОЧИСТКА ЗАВЕРШЕНА';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Осталось таблиц в схеме public: %', remaining_tables;
  
  IF remaining_tables = 0 THEN
    RAISE NOTICE '✅ База данных полностью очищена!';
    RAISE NOTICE 'Теперь можно выполнить unified_schema.sql для создания новой структуры.';
  ELSE
    RAISE NOTICE '⚠️ В базе данных остались таблицы. Проверьте список:';
    RAISE NOTICE 'SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'';';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;
