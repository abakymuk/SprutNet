-- Миграция для создания таблицы route_cache
-- Создаем таблицу для кэширования данных о маршрутах

-- Таблица для кэширования маршрутов
CREATE TABLE IF NOT EXISTS route_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ключ маршрута (origin-destination)
    route_key VARCHAR(50) NOT NULL,
    
    -- Детали маршрута
    origin_port_id VARCHAR(10) NOT NULL,
    destination_port_id VARCHAR(10) NOT NULL,
    
    -- Параметры поиска
    departure_date_from DATE NOT NULL,
    departure_date_to DATE NOT NULL,
    
    -- Кэшированные данные
    cached_data JSONB NOT NULL,
    
    -- Метаданные кэша
    cache_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cache_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Статистика
    response_time_ms INTEGER,
    data_source VARCHAR(20) DEFAULT 'maersk', -- maersk, mock, fallback
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Индексы для быстрого поиска
    CONSTRAINT route_cache_unique_key UNIQUE (route_key, departure_date_from, departure_date_to)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_route_cache_route_key ON route_cache(route_key);
CREATE INDEX IF NOT EXISTS idx_route_cache_ports ON route_cache(origin_port_id, destination_port_id);
CREATE INDEX IF NOT EXISTS idx_route_cache_expires ON route_cache(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_route_cache_last_accessed ON route_cache(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_route_cache_access_count ON route_cache(access_count DESC);

-- Индекс для поиска по датам
CREATE INDEX IF NOT EXISTS idx_route_cache_dates ON route_cache(departure_date_from, departure_date_to);

-- Индекс для JSONB поиска
CREATE INDEX IF NOT EXISTS idx_route_cache_data_gin ON route_cache USING GIN (cached_data);

-- Удаляем существующую таблицу или view popular_routes (если существует)
DROP VIEW IF EXISTS popular_routes;
DROP TABLE IF EXISTS popular_routes CASCADE;

-- Таблица для популярных маршрутов
CREATE TABLE IF NOT EXISTS popular_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Детали маршрута
    origin_port_id VARCHAR(10) NOT NULL,
    destination_port_id VARCHAR(10) NOT NULL,
    origin_port_name VARCHAR(100),
    destination_port_name VARCHAR(100),
    
    -- Статистика использования
    search_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Приоритет для предзагрузки
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальный ключ
    CONSTRAINT popular_routes_unique UNIQUE (origin_port_id, destination_port_id)
);

-- Индексы для популярных маршрутов
CREATE INDEX IF NOT EXISTS idx_popular_routes_search_count ON popular_routes(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_routes_priority ON popular_routes(priority DESC);
CREATE INDEX IF NOT EXISTS idx_popular_routes_active ON popular_routes(is_active);

-- Таблица для статистики использования маршрутов
CREATE TABLE IF NOT EXISTS route_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Детали запроса
    route_key VARCHAR(50) NOT NULL,
    origin_port_id VARCHAR(10) NOT NULL,
    destination_port_id VARCHAR(10) NOT NULL,
    
    -- Параметры поиска
    departure_date_from DATE,
    departure_date_to DATE,
    
    -- Статистика
    request_count INTEGER DEFAULT 1,
    cache_hit_count INTEGER DEFAULT 0,
    cache_miss_count INTEGER DEFAULT 0,
    average_response_time_ms INTEGER,
    
    -- Временные метки
    first_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальный ключ по маршруту
    CONSTRAINT route_usage_stats_unique UNIQUE (route_key)
);

-- Индексы для статистики
CREATE INDEX IF NOT EXISTS idx_route_usage_stats_request_count ON route_usage_stats(request_count DESC);
CREATE INDEX IF NOT EXISTS idx_route_usage_stats_last_requested ON route_usage_stats(last_requested_at DESC);

-- Функция для обновления времени последнего доступа
CREATE OR REPLACE FUNCTION update_route_cache_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed_at = NOW();
    NEW.access_count = NEW.access_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления времени доступа
DO $$ BEGIN
    CREATE TRIGGER trigger_update_route_cache_access
        BEFORE UPDATE ON route_cache
        FOR EACH ROW
        EXECUTE FUNCTION update_route_cache_access();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Функция для очистки устаревших записей кэша
CREATE OR REPLACE FUNCTION cleanup_expired_route_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM route_cache 
    WHERE cache_expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Логируем очистку
    INSERT INTO system_logs (event_type, message, data)
    VALUES (
        'cache_cleanup',
        'Cleaned up expired route cache entries',
        jsonb_build_object('deleted_count', deleted_count, 'table', 'route_cache')
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики кэша
CREATE OR REPLACE FUNCTION get_route_cache_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_entries', COUNT(*),
        'active_entries', COUNT(*) FILTER (WHERE cache_expires_at > NOW()),
        'expired_entries', COUNT(*) FILTER (WHERE cache_expires_at <= NOW()),
        'total_access_count', COALESCE(SUM(access_count), 0),
        'average_access_count', COALESCE(AVG(access_count), 0),
        'cache_hit_rate', CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE access_count > 0)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
            ELSE 0 
        END,
        'data_sources', jsonb_object_agg(data_source, count) FILTER (WHERE data_source IS NOT NULL),
        'oldest_entry', MIN(cache_created_at),
        'newest_entry', MAX(cache_created_at)
    ) INTO stats
    FROM route_cache;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления статистики использования маршрутов
CREATE OR REPLACE FUNCTION update_route_usage_stats(
    p_route_key VARCHAR(50),
    p_origin_port_id VARCHAR(10),
    p_destination_port_id VARCHAR(10),
    p_departure_date_from DATE DEFAULT NULL,
    p_departure_date_to DATE DEFAULT NULL,
    p_is_cache_hit BOOLEAN DEFAULT FALSE,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO route_usage_stats (
        route_key, origin_port_id, destination_port_id,
        departure_date_from, departure_date_to,
        request_count, cache_hit_count, cache_miss_count,
        average_response_time_ms, first_requested_at, last_requested_at
    )
    VALUES (
        p_route_key, p_origin_port_id, p_destination_port_id,
        p_departure_date_from, p_departure_date_to,
        1, 
        CASE WHEN p_is_cache_hit THEN 1 ELSE 0 END,
        CASE WHEN p_is_cache_hit THEN 0 ELSE 1 END,
        p_response_time_ms,
        NOW(), NOW()
    )
    ON CONFLICT (route_key) DO UPDATE SET
        request_count = route_usage_stats.request_count + 1,
        cache_hit_count = route_usage_stats.cache_hit_count + CASE WHEN p_is_cache_hit THEN 1 ELSE 0 END,
        cache_miss_count = route_usage_stats.cache_miss_count + CASE WHEN p_is_cache_hit THEN 0 ELSE 1 END,
        average_response_time_ms = CASE 
            WHEN p_response_time_ms IS NOT NULL THEN 
                (route_usage_stats.average_response_time_ms + p_response_time_ms) / 2
            ELSE route_usage_stats.average_response_time_ms
        END,
        last_requested_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Функция для получения популярных маршрутов
CREATE OR REPLACE FUNCTION get_popular_routes(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    origin_port_id VARCHAR(10),
    destination_port_id VARCHAR(10),
    origin_port_name VARCHAR(100),
    destination_port_name VARCHAR(100),
    search_count INTEGER,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.origin_port_id,
        pr.destination_port_id,
        pr.origin_port_name,
        pr.destination_port_name,
        pr.search_count,
        pr.priority
    FROM popular_routes pr
    WHERE pr.is_active = TRUE
    ORDER BY pr.priority DESC, pr.search_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- RLS политики для route_cache
ALTER TABLE route_cache ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все пользователи могут читать кэш)
DO $$ BEGIN
    CREATE POLICY "Allow read access to route cache" ON route_cache
        FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Политика для записи (только аутентифицированные пользователи)
DO $$ BEGIN
    CREATE POLICY "Allow insert access to route cache" ON route_cache
        FOR INSERT WITH CHECK (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Политика для обновления (только аутентифицированные пользователи)
DO $$ BEGIN
    CREATE POLICY "Allow update access to route cache" ON route_cache
        FOR UPDATE USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS политики для popular_routes
ALTER TABLE popular_routes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow read access to popular routes" ON popular_routes
        FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow insert access to popular routes" ON popular_routes
        FOR INSERT WITH CHECK (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow update access to popular routes" ON popular_routes
        FOR UPDATE USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS политики для route_usage_stats
ALTER TABLE route_usage_stats ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow read access to route usage stats" ON route_usage_stats
        FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow insert access to route usage stats" ON route_usage_stats
        FOR INSERT WITH CHECK (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow update access to route usage stats" ON route_usage_stats
        FOR UPDATE USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Вставка начальных популярных маршрутов
INSERT INTO popular_routes (origin_port_id, destination_port_id, origin_port_name, destination_port_name, priority, search_count) VALUES
('CNSHA', 'USLAX', 'Shanghai', 'Los Angeles', 100, 0),
('CNSHA', 'USNYC', 'Shanghai', 'New York', 95, 0),
('SGSIN', 'USLAX', 'Singapore', 'Los Angeles', 90, 0),
('SGSIN', 'USNYC', 'Singapore', 'New York', 85, 0),
('NLRTM', 'USLAX', 'Rotterdam', 'Los Angeles', 80, 0),
('NLRTM', 'USNYC', 'Rotterdam', 'New York', 75, 0),
('DEHAM', 'USLAX', 'Hamburg', 'Los Angeles', 70, 0),
('DEHAM', 'USNYC', 'Hamburg', 'New York', 65, 0),
('USLAX', 'CNSHA', 'Los Angeles', 'Shanghai', 60, 0),
('USNYC', 'CNSHA', 'New York', 'Shanghai', 55, 0),
('USLAX', 'SGSIN', 'Los Angeles', 'Singapore', 50, 0),
('USNYC', 'SGSIN', 'New York', 'Singapore', 45, 0),
('USLAX', 'NLRTM', 'Los Angeles', 'Rotterdam', 40, 0),
('USNYC', 'NLRTM', 'New York', 'Rotterdam', 35, 0),
('USLAX', 'DEHAM', 'Los Angeles', 'Hamburg', 30, 0),
('USNYC', 'DEHAM', 'New York', 'Hamburg', 25, 0)
ON CONFLICT (origin_port_id, destination_port_id) DO NOTHING;

-- Создание представления для мониторинга кэша
CREATE OR REPLACE VIEW route_cache_monitoring AS
SELECT 
    'route_cache' as table_name,
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE cache_expires_at > NOW()) as active_entries,
    COUNT(*) FILTER (WHERE cache_expires_at <= NOW()) as expired_entries,
    COALESCE(SUM(access_count), 0) as total_access_count,
    COALESCE(AVG(access_count), 0) as average_access_count,
    MIN(cache_created_at) as oldest_entry,
    MAX(cache_created_at) as newest_entry,
    NOW() as last_updated
FROM route_cache
UNION ALL
SELECT 
    'popular_routes' as table_name,
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE is_active = TRUE) as active_entries,
    COUNT(*) FILTER (WHERE is_active = FALSE) as expired_entries,
    COALESCE(SUM(search_count), 0) as total_access_count,
    COALESCE(AVG(search_count), 0) as average_access_count,
    MIN(created_at) as oldest_entry,
    MAX(updated_at) as newest_entry,
    NOW() as last_updated
FROM popular_routes;

-- Комментарии к таблицам
COMMENT ON TABLE route_cache IS 'Кэш для хранения данных о маршрутах от Maersk API';
COMMENT ON TABLE popular_routes IS 'Популярные маршруты для предзагрузки';
COMMENT ON TABLE route_usage_stats IS 'Статистика использования маршрутов';
COMMENT ON VIEW route_cache_monitoring IS 'Мониторинг состояния кэша маршрутов';
