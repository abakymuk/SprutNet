-- Полная очистка базы данных Supabase для SprutNet
-- ⚠️ ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные и таблицы!
-- Выполняйте только если вы уверены, что хотите очистить базу

-- ========================================
-- ОТКЛЮЧЕНИЕ RLS ДЛЯ ВСЕХ ТАБЛИЦ
-- ========================================

-- Пользовательские таблицы
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_events DISABLE ROW LEVEL SECURITY;

-- Системные таблицы
ALTER TABLE IF EXISTS performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feature_flags DISABLE ROW LEVEL SECURITY;

-- Кэш
ALTER TABLE IF EXISTS api_cache DISABLE ROW LEVEL SECURITY;

-- Maersk API таблицы
ALTER TABLE IF EXISTS countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carrier_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_modes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS location_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vessels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carrier_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ocean_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_legs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS un_location_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipment_deadlines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deadlines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipment_deadline DISABLE ROW LEVEL SECURITY;

-- ========================================
-- УДАЛЕНИЕ ВСЕХ ПОЛИТИК RLS
-- ========================================

-- Удаляем все политики для пользовательских таблиц
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own searches" ON user_searches;
DROP POLICY IF EXISTS "Users can insert own searches" ON user_searches;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own reminders" ON user_reminders;
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;

-- Удаляем политики для системных таблиц
DROP POLICY IF EXISTS "System tables for service role" ON performance_metrics;
DROP POLICY IF EXISTS "System tables for service role" ON system_config;

-- Удаляем политики для Maersk данных
DROP POLICY IF EXISTS "Allow authenticated read access" ON countries;
DROP POLICY IF EXISTS "Allow authenticated read access" ON carrier_codes;
DROP POLICY IF EXISTS "Allow authenticated read access" ON transport_modes;
DROP POLICY IF EXISTS "Allow authenticated read access" ON location_types;
DROP POLICY IF EXISTS "Allow authenticated read access" ON vessels;
DROP POLICY IF EXISTS "Allow authenticated read access" ON locations;
DROP POLICY IF EXISTS "Allow authenticated read access" ON carrier_locations;
DROP POLICY IF EXISTS "Allow authenticated read access" ON ocean_products;
DROP POLICY IF EXISTS "Allow authenticated read access" ON transport_schedules;
DROP POLICY IF EXISTS "Allow authenticated read access" ON transport_legs;
DROP POLICY IF EXISTS "Allow authenticated read access" ON transports;
DROP POLICY IF EXISTS "Allow authenticated read access" ON facilities;
DROP POLICY IF EXISTS "Allow authenticated read access" ON un_location_codes;
DROP POLICY IF EXISTS "Allow authenticated read access" ON shipment_deadlines;
DROP POLICY IF EXISTS "Allow authenticated read access" ON deadlines;
DROP POLICY IF EXISTS "Allow authenticated read access" ON shipment_deadline;

-- ========================================
-- УДАЛЕНИЕ ПРЕДСТАВЛЕНИЙ
-- ========================================

DROP VIEW IF EXISTS cache_stats CASCADE;
DROP VIEW IF EXISTS api_stats CASCADE;
DROP VIEW IF EXISTS popular_routes CASCADE;
DROP VIEW IF EXISTS user_activity CASCADE;
DROP VIEW IF EXISTS vessel_stats CASCADE;
DROP VIEW IF EXISTS port_stats CASCADE;

-- ========================================
-- УДАЛЕНИЕ ТРИГГЕРОВ
-- ========================================

-- Удаляем триггеры для updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON countries;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON carrier_codes;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON transport_modes;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON location_types;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON vessels;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON locations;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON carrier_locations;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON ocean_products;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON transport_schedules;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON transport_legs;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON transports;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON facilities;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON un_location_codes;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON shipment_deadlines;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON deadlines;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON shipment_deadline;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON user_favorites;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON user_reminders;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON system_config;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON feature_flags;

-- Удаляем триггер для кэша
DROP TRIGGER IF EXISTS trigger_update_cache_access ON api_cache;

-- ========================================
-- УДАЛЕНИЕ ФУНКЦИЙ
-- ========================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_cache_access() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_cache() CASCADE;

-- ========================================
-- УДАЛЕНИЕ ИНДЕКСОВ
-- ========================================

-- Индексы для справочных таблиц
DROP INDEX IF EXISTS idx_countries_name;
DROP INDEX IF EXISTS idx_carrier_codes_name;

-- Индексы для судов
DROP INDEX IF EXISTS idx_vessels_carrier_code;
DROP INDEX IF EXISTS idx_vessels_flag_code;
DROP INDEX IF EXISTS idx_vessels_capacity;
DROP INDEX IF EXISTS idx_vessels_built_year;
DROP INDEX IF EXISTS idx_vessels_fulltext;

-- Индексы для локаций
DROP INDEX IF EXISTS idx_locations_country_code;
DROP INDEX IF EXISTS idx_locations_city_name;
DROP INDEX IF EXISTS idx_locations_un_location_code;
DROP INDEX IF EXISTS idx_locations_location_type;
DROP INDEX IF EXISTS idx_locations_region_code;
DROP INDEX IF EXISTS idx_locations_fulltext;

-- Индексы для carrier_locations
DROP INDEX IF EXISTS idx_carrier_locations_timezone;
DROP INDEX IF EXISTS idx_carrier_locations_aliases;

-- Индексы для ocean_products
DROP INDEX IF EXISTS idx_ocean_products_carrier_code;
DROP INDEX IF EXISTS idx_ocean_products_valid_dates;
DROP INDEX IF EXISTS idx_ocean_products_product_id;

-- Индексы для transport_schedules
DROP INDEX IF EXISTS idx_transport_schedules_ocean_product_id;
DROP INDEX IF EXISTS idx_transport_schedules_dates;
DROP INDEX IF EXISTS idx_transport_schedules_transit_time;

-- Индексы для transport_legs
DROP INDEX IF EXISTS idx_transport_legs_schedule_id;
DROP INDEX IF EXISTS idx_transport_legs_dates;

-- Индексы для transports
DROP INDEX IF EXISTS idx_transports_leg_id;
DROP INDEX IF EXISTS idx_transports_vessel_imo;
DROP INDEX IF EXISTS idx_transports_mode;
DROP INDEX IF EXISTS idx_transports_voyage;
DROP INDEX IF EXISTS idx_transports_service;

-- Индексы для facilities
DROP INDEX IF EXISTS idx_facilities_leg_id;
DROP INDEX IF EXISTS idx_facilities_site_geo_id;
DROP INDEX IF EXISTS idx_facilities_location_type;

-- Индексы для un_location_codes
DROP INDEX IF EXISTS idx_un_location_codes_facility_id;
DROP INDEX IF EXISTS idx_un_location_codes_location_code;
DROP INDEX IF EXISTS idx_un_location_codes_city_code;

-- Индексы для deadlines
DROP INDEX IF EXISTS idx_shipment_deadlines_vessel_imo;
DROP INDEX IF EXISTS idx_shipment_deadlines_voyage;
DROP INDEX IF EXISTS idx_shipment_deadlines_country;
DROP INDEX IF EXISTS idx_shipment_deadlines_port;
DROP INDEX IF EXISTS idx_deadlines_shipment_id;
DROP INDEX IF EXISTS idx_deadlines_local;
DROP INDEX IF EXISTS idx_deadlines_name;
DROP INDEX IF EXISTS idx_shipment_deadline_shipment_id;
DROP INDEX IF EXISTS idx_shipment_deadline_terminal;

-- Индексы для пользовательских данных
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_company;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_active;

-- Индексы для кэша
DROP INDEX IF EXISTS idx_api_cache_key_hash;
DROP INDEX IF EXISTS idx_api_cache_endpoint;
DROP INDEX IF EXISTS idx_api_cache_expires;
DROP INDEX IF EXISTS idx_api_cache_last_accessed;
DROP INDEX IF EXISTS idx_api_cache_type;
DROP INDEX IF EXISTS idx_api_cache_params;

-- Индексы для поисков
DROP INDEX IF EXISTS idx_user_searches_user;
DROP INDEX IF EXISTS idx_user_searches_type;
DROP INDEX IF EXISTS idx_user_searches_route;
DROP INDEX IF EXISTS idx_user_searches_date;
DROP INDEX IF EXISTS idx_user_searches_params;

-- Индексы для избранного
DROP INDEX IF EXISTS idx_user_favorites_user;
DROP INDEX IF EXISTS idx_user_favorites_type;
DROP INDEX IF EXISTS idx_user_favorites_data;

-- Индексы для напоминаний
DROP INDEX IF EXISTS idx_user_reminders_user;
DROP INDEX IF EXISTS idx_user_reminders_date;
DROP INDEX IF EXISTS idx_user_reminders_active;
DROP INDEX IF EXISTS idx_user_reminders_vessel;

-- Индексы для метрик
DROP INDEX IF EXISTS idx_performance_metrics_endpoint;
DROP INDEX IF EXISTS idx_performance_metrics_status;
DROP INDEX IF EXISTS idx_performance_metrics_time;
DROP INDEX IF EXISTS idx_performance_metrics_session;
DROP INDEX IF EXISTS idx_performance_metrics_provider;
DROP INDEX IF EXISTS idx_performance_metrics_user;

-- Индексы для аналитики
DROP INDEX IF EXISTS idx_analytics_events_type;
DROP INDEX IF EXISTS idx_analytics_events_user;
DROP INDEX IF EXISTS idx_analytics_events_session;
DROP INDEX IF EXISTS idx_analytics_events_time;
DROP INDEX IF EXISTS idx_analytics_events_data;

-- Индексы для конфигурации
DROP INDEX IF EXISTS idx_system_config_key;
DROP INDEX IF EXISTS idx_system_config_category;
DROP INDEX IF EXISTS idx_system_config_active;
DROP INDEX IF EXISTS idx_feature_flags_name;
DROP INDEX IF EXISTS idx_feature_flags_environment;
DROP INDEX IF EXISTS idx_feature_flags_category;

-- ========================================
-- УДАЛЕНИЕ ТАБЛИЦ (В ПРАВИЛЬНОМ ПОРЯДКЕ)
-- ========================================

-- Сначала удаляем таблицы с зависимостями (в обратном порядке)

-- Пользовательские таблицы
DROP TABLE IF EXISTS user_reminders CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_searches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Системные таблицы
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;

-- Кэш
DROP TABLE IF EXISTS api_cache CASCADE;

-- Maersk API таблицы (в обратном порядке зависимостей)
DROP TABLE IF EXISTS shipment_deadline CASCADE;
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS shipment_deadlines CASCADE;
DROP TABLE IF EXISTS un_location_codes CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS transports CASCADE;
DROP TABLE IF EXISTS transport_legs CASCADE;
DROP TABLE IF EXISTS transport_schedules CASCADE;
DROP TABLE IF EXISTS ocean_products CASCADE;
DROP TABLE IF EXISTS carrier_locations CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
DROP TABLE IF EXISTS location_types CASCADE;
DROP TABLE IF EXISTS transport_modes CASCADE;
DROP TABLE IF EXISTS carrier_codes CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

-- ========================================
-- ОЧИСТКА ДОПОЛНИТЕЛЬНЫХ ДАННЫХ
-- ========================================

-- Удаление всех пользователей (кроме системных)
DELETE FROM auth.users WHERE email != 'anon@supabase.co' AND email != 'service_role@supabase.co';

-- Очистка storage (если используется)
-- DROP TABLE IF EXISTS storage.objects CASCADE;
-- DROP TABLE IF EXISTS storage.buckets CASCADE;

-- ========================================
-- ПРОВЕРКА ОЧИСТКИ
-- ========================================

-- Проверяем, что все таблицы удалены
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'countries', 'carrier_codes', 'transport_modes', 'location_types',
    'vessels', 'locations', 'carrier_locations', 'ocean_products',
    'transport_schedules', 'transport_legs', 'transports', 'facilities',
    'un_location_codes', 'shipment_deadlines', 'deadlines', 'shipment_deadline',
    'users', 'api_cache', 'user_searches', 'user_favorites', 'user_reminders',
    'performance_metrics', 'analytics_events', 'system_config', 'feature_flags'
  );

-- ========================================
-- СООБЩЕНИЕ О ЗАВЕРШЕНИИ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'База данных полностью очищена!';
  RAISE NOTICE 'Все таблицы, индексы, политики и функции удалены.';
  RAISE NOTICE 'Теперь можно выполнить unified_schema.sql для создания новой структуры.';
  RAISE NOTICE '========================================';
END $$;
