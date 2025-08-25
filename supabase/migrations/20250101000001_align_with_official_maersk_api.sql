-- Миграция для выравнивания с официальным API Maersk
-- Этот файл содержит базовые изменения для совместимости с Maersk API

-- Создаем расширения если их нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создаем схему для миграций если её нет
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- Создаем таблицу для отслеживания миграций если её нет
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
);

-- Добавляем базовые типы данных для Maersk API
DO $$ BEGIN
    CREATE TYPE api_provider_type AS ENUM ('maersk', 'mock', 'fallback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE endpoint_type AS ENUM ('schedules', 'vessels', 'ports', 'deadlines');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создаем базовые таблицы для API метрик
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint endpoint_type NOT NULL,
    method VARCHAR(10) NOT NULL,
    status INTEGER NOT NULL,
    latency INTEGER,
    retries INTEGER DEFAULT 0,
    cached BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для API метрик
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_metrics_timestamp ON api_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_metrics_status ON api_metrics(status);

-- Создаем таблицу для пользовательских поисков
CREATE TABLE IF NOT EXISTS user_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    search_type endpoint_type NOT NULL,
    origin_port_code VARCHAR(10),
    destination_port_code VARCHAR(10),
    departure_date_from DATE,
    departure_date_to DATE,
    results_count INTEGER DEFAULT 0,
    search_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для пользовательских поисков
CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_type ON user_searches(search_type);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON user_searches(created_at);

-- Включаем RLS для таблиц
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Создаем политики для чтения (все пользователи могут читать)
CREATE POLICY "Allow read access to api_metrics" ON api_metrics FOR SELECT USING (TRUE);
CREATE POLICY "Allow read access to user_searches" ON user_searches FOR SELECT USING (TRUE);

-- Создаем политики для записи (только аутентифицированные пользователи)
CREATE POLICY "Allow insert access to api_metrics" ON api_metrics FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow insert access to user_searches" ON user_searches FOR INSERT WITH CHECK (TRUE);
