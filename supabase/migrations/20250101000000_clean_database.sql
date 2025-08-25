-- Полная очистка базы данных
-- Удаляем все таблицы, view, функции и триггеры

-- Отключаем все триггеры
SET session_replication_role = replica;

-- Удаляем все view
DROP VIEW IF EXISTS route_cache_monitoring CASCADE;
DROP VIEW IF EXISTS popular_routes CASCADE;
DROP VIEW IF EXISTS cache_stats CASCADE;
DROP VIEW IF EXISTS api_stats CASCADE;
DROP VIEW IF EXISTS user_activity CASCADE;
DROP VIEW IF EXISTS vessel_stats CASCADE;
DROP VIEW IF EXISTS port_stats CASCADE;

-- Удаляем все таблицы
DROP TABLE IF EXISTS route_usage_stats CASCADE;
DROP TABLE IF EXISTS popular_routes CASCADE;
DROP TABLE IF EXISTS route_cache CASCADE;
DROP TABLE IF EXISTS api_metrics CASCADE;
DROP TABLE IF EXISTS user_searches CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_reminders CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS api_cache CASCADE;
DROP TABLE IF EXISTS users CASCADE;
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

-- Удаляем все функции
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_cache_access() CASCADE;
DROP FUNCTION IF EXISTS update_route_cache_access() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_route_cache() CASCADE;
DROP FUNCTION IF EXISTS get_route_cache_stats() CASCADE;
DROP FUNCTION IF EXISTS update_route_usage_stats(VARCHAR, VARCHAR, VARCHAR, DATE, DATE, BOOLEAN, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_popular_routes(INTEGER) CASCADE;

-- Удаляем все типы
DROP TYPE IF EXISTS api_provider_type CASCADE;
DROP TYPE IF EXISTS endpoint_type CASCADE;

-- Удаляем схему миграций
DROP SCHEMA IF EXISTS supabase_migrations CASCADE;

-- Включаем триггеры обратно
SET session_replication_role = DEFAULT;

-- Создаем схему миграций заново
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- Создаем таблицу для отслеживания миграций
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);
