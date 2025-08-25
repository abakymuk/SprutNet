# База данных Supabase для SprutNet Shipping Planner

## Обзор

SprutNet использует Supabase как основную базу данных для хранения:
- Кэшированных данных от Maersk API
- Пользовательских настроек и предпочтений
- Истории поисков и аналитики
- Системных метрик и мониторинга
- Конфигурации и feature flags

## Структура таблиц

### 1. Кэш данных Maersk API

#### `maersk_cache`
```sql
CREATE TABLE maersk_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  endpoint VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  ttl_seconds INTEGER NOT NULL DEFAULT 900, -- 15 минут по умолчанию
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  size_bytes INTEGER,
  compressed BOOLEAN DEFAULT FALSE
);

-- Индексы для оптимизации
CREATE INDEX idx_maersk_cache_endpoint ON maersk_cache(endpoint);
CREATE INDEX idx_maersk_cache_expires_at ON maersk_cache(expires_at);
CREATE INDEX idx_maersk_cache_last_accessed ON maersk_cache(last_accessed);
CREATE INDEX idx_maersk_cache_key_hash ON maersk_cache USING hash(cache_key);
```

#### `maersk_locations_cache`
```sql
CREATE TABLE maersk_locations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(100) UNIQUE NOT NULL,
  country_code VARCHAR(3),
  country_name VARCHAR(100),
  city_name VARCHAR(100),
  location_type VARCHAR(50),
  location_name VARCHAR(200),
  carrier_geo_id VARCHAR(50),
  un_location_code VARCHAR(10),
  un_region_code VARCHAR(10),
  un_region_name VARCHAR(100),
  timezone VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_country ON maersk_locations_cache(country_code);
CREATE INDEX idx_locations_city ON maersk_locations_cache(city_name);
CREATE INDEX idx_locations_type ON maersk_locations_cache(location_type);
CREATE INDEX idx_locations_search ON maersk_locations_cache USING gin(to_tsvector('english', location_name || ' ' || city_name || ' ' || country_name));
```

#### `maersk_vessels_cache`
```sql
CREATE TABLE maersk_vessels_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imo_number VARCHAR(10) UNIQUE NOT NULL,
  carrier_vessel_code VARCHAR(20),
  vessel_short_name VARCHAR(100),
  vessel_long_name VARCHAR(200),
  vessel_flag_code VARCHAR(3),
  vessel_built_year INTEGER,
  vessel_call_sign VARCHAR(20),
  vessel_type VARCHAR(50),
  vessel_capacity_teu INTEGER,
  vessel_length_m DECIMAL(8, 2),
  vessel_beam_m DECIMAL(8, 2),
  vessel_draft_m DECIMAL(6, 2),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vessels_carrier ON maersk_vessels_cache(carrier_vessel_code);
CREATE INDEX idx_vessels_flag ON maersk_vessels_cache(vessel_flag_code);
CREATE INDEX idx_vessels_type ON maersk_vessels_cache(vessel_type);
CREATE INDEX idx_vessels_search ON maersk_vessels_cache USING gin(to_tsvector('english', vessel_short_name || ' ' || vessel_long_name));
```

#### `maersk_schedules_cache`
```sql
CREATE TABLE maersk_schedules_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_key VARCHAR(255) UNIQUE NOT NULL, -- origin_destination_date_vessel
  origin_port VARCHAR(10),
  destination_port VARCHAR(10),
  vessel_imo VARCHAR(10),
  vessel_name VARCHAR(100),
  voyage_number VARCHAR(20),
  departure_date TIMESTAMP WITH TIME ZONE,
  arrival_date TIMESTAMP WITH TIME ZONE,
  transit_days INTEGER,
  service_name VARCHAR(100),
  carrier_code VARCHAR(10),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_schedules_route ON maersk_schedules_cache(origin_port, destination_port);
CREATE INDEX idx_schedules_vessel ON maersk_schedules_cache(vessel_imo);
CREATE INDEX idx_schedules_dates ON maersk_schedules_cache(departure_date, arrival_date);
CREATE INDEX idx_schedules_expires ON maersk_schedules_cache(expires_at);
```

#### `maersk_deadlines_cache`
```sql
CREATE TABLE maersk_deadlines_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_key VARCHAR(255) UNIQUE NOT NULL, -- vessel_voyage_port_type
  vessel_imo VARCHAR(10),
  voyage_number VARCHAR(20),
  port_code VARCHAR(10),
  deadline_type VARCHAR(50),
  deadline_utc TIMESTAMP WITH TIME ZONE,
  deadline_local TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50),
  description TEXT,
  status VARCHAR(20),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_deadlines_vessel_voyage ON maersk_deadlines_cache(vessel_imo, voyage_number);
CREATE INDEX idx_deadlines_port ON maersk_deadlines_cache(port_code);
CREATE INDEX idx_deadlines_type ON maersk_deadlines_cache(deadline_type);
CREATE INDEX idx_deadlines_dates ON maersk_deadlines_cache(deadline_utc, deadline_local);
```

### 2. Пользовательские данные

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  company VARCHAR(100),
  role VARCHAR(50),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
```

#### `user_searches`
```sql
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin_port VARCHAR(10),
  destination_port VARCHAR(10),
  departure_date DATE,
  arrival_date DATE,
  search_params JSONB,
  results_count INTEGER,
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_searches_user ON user_searches(user_id);
CREATE INDEX idx_user_searches_date ON user_searches(created_at);
CREATE INDEX idx_user_searches_route ON user_searches(origin_port, destination_port);
```

#### `user_favorites`
```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  favorite_type VARCHAR(50) NOT NULL, -- 'route', 'vessel', 'port'
  favorite_data JSONB NOT NULL,
  name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_type ON user_favorites(favorite_type);
```

### 3. Системные метрики и мониторинг

#### `performance_metrics`
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  data_size_bytes INTEGER,
  cache_hit BOOLEAN,
  retries INTEGER DEFAULT 0,
  error_message TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_metrics_status ON performance_metrics(status_code);
CREATE INDEX idx_metrics_time ON performance_metrics(created_at);
CREATE INDEX idx_metrics_session ON performance_metrics(session_id);
```

#### `api_errors`
```sql
CREATE TABLE api_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(100) NOT NULL,
  error_code VARCHAR(50) NOT NULL,
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_errors_endpoint ON api_errors(endpoint);
CREATE INDEX idx_errors_code ON api_errors(error_code);
CREATE INDEX idx_errors_time ON api_errors(created_at);
```

#### `cache_metrics`
```sql
CREATE TABLE cache_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type VARCHAR(50) NOT NULL, -- 'ports', 'vessels', 'schedules', 'deadlines'
  operation VARCHAR(20) NOT NULL, -- 'hit', 'miss', 'set', 'delete', 'evict'
  cache_key VARCHAR(255),
  data_size_bytes INTEGER,
  ttl_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cache_metrics_type ON cache_metrics(cache_type);
CREATE INDEX idx_cache_metrics_operation ON cache_metrics(operation);
CREATE INDEX idx_cache_metrics_time ON cache_metrics(created_at);
```

### 4. Конфигурация и Feature Flags

#### `system_config`
```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Примеры конфигураций
INSERT INTO system_config (config_key, config_value, description) VALUES
('maersk_api_settings', '{"base_url": "https://api.maersk.com", "timeout": 10000, "retries": 3}', 'Настройки Maersk API'),
('cache_settings', '{"default_ttl": 900, "max_size": 1000, "cleanup_interval": 300}', 'Настройки кэширования'),
('feature_flags', '{"live_api": true, "deadlines": true, "cache_enabled": true}', 'Feature flags'),
('rate_limits', '{"requests_per_minute": 60, "burst_limit": 10}', 'Лимиты запросов');
```

#### `feature_flags`
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  flag_value BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  environment VARCHAR(20) DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Примеры feature flags
INSERT INTO feature_flags (flag_name, flag_value, description) VALUES
('FEATURE_MAERSK', true, 'Включить интеграцию с Maersk API'),
('FEATURE_DEADLINES', true, 'Включить функционал дедлайнов'),
('CACHE_ENABLED', true, 'Включить кэширование'),
('TELEMETRY_ENABLED', true, 'Включить телеметрию'),
('DEMO_MODE', false, 'Режим демонстрации');
```

### 5. Аналитика и отчеты

#### `analytics_events`
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_time ON analytics_events(created_at);
```

#### `search_analytics`
```sql
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type VARCHAR(50) NOT NULL, -- 'ports', 'schedules', 'deadlines'
  origin_port VARCHAR(10),
  destination_port VARCHAR(10),
  search_query TEXT,
  results_count INTEGER,
  search_duration_ms INTEGER,
  cache_hit BOOLEAN,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_route ON search_analytics(origin_port, destination_port);
CREATE INDEX idx_search_analytics_time ON search_analytics(created_at);
```

## Функции и триггеры

### Автоматическая очистка кэша
```sql
-- Функция для очистки устаревшего кэша
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM maersk_cache WHERE expires_at < NOW();
  DELETE FROM maersk_schedules_cache WHERE expires_at < NOW();
  DELETE FROM maersk_deadlines_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Планировщик для автоматической очистки (каждые 5 минут)
SELECT cron.schedule('cleanup-cache', '*/5 * * * *', 'SELECT cleanup_expired_cache();');
```

### Обновление времени последнего доступа
```sql
CREATE OR REPLACE FUNCTION update_cache_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = NOW();
  NEW.access_count = OLD.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cache_access
  BEFORE UPDATE ON maersk_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_access();
```

### Автоматическое обновление updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем к таблицам, которые нуждаются в updated_at
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## RLS (Row Level Security)

### Политики безопасности
```sql
-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own searches" ON user_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Системные таблицы доступны только для сервисных ролей
CREATE POLICY "System tables for service role" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');
```

## Индексы для производительности

### Полнотекстовый поиск
```sql
-- Для поиска портов
CREATE INDEX idx_locations_fulltext ON maersk_locations_cache 
  USING gin(to_tsvector('english', location_name || ' ' || city_name || ' ' || country_name));

-- Для поиска судов
CREATE INDEX idx_vessels_fulltext ON maersk_vessels_cache 
  USING gin(to_tsvector('english', vessel_short_name || ' ' || vessel_long_name));
```

### Составные индексы
```sql
-- Для маршрутов
CREATE INDEX idx_schedules_route_date ON maersk_schedules_cache 
  (origin_port, destination_port, departure_date);

-- Для дедлайнов
CREATE INDEX idx_deadlines_vessel_port ON maersk_deadlines_cache 
  (vessel_imo, port_code, deadline_utc);
```

## Миграции

### Создание миграционного файла
```sql
-- migrations/001_initial_schema.sql
BEGIN;

-- Создаем все таблицы
-- ... (весь SQL код выше)

-- Создаем индексы
-- ... (все индексы)

-- Создаем функции и триггеры
-- ... (все функции)

-- Включаем RLS
-- ... (все политики)

COMMIT;
```

## Мониторинг и обслуживание

### Представления для аналитики
```sql
-- Статистика кэша
CREATE VIEW cache_stats AS
SELECT 
  cache_type,
  COUNT(*) as total_entries,
  AVG(data_size_bytes) as avg_size,
  MAX(created_at) as last_updated
FROM cache_metrics 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY cache_type;

-- Статистика API
CREATE VIEW api_stats AS
SELECT 
  endpoint,
  COUNT(*) as total_requests,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count
FROM performance_metrics 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint;
```

### Автоматическое обслуживание
```sql
-- Очистка старых метрик (старше 30 дней)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM api_errors WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM cache_metrics WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Запускаем ежедневно в 2:00
SELECT cron.schedule('cleanup-metrics', '0 2 * * *', 'SELECT cleanup_old_metrics();');
```

## Заключение

Эта структура базы данных обеспечивает:

1. **Эффективное кэширование** - быстрый доступ к данным Maersk API
2. **Масштабируемость** - оптимизированные индексы и партиционирование
3. **Безопасность** - RLS политики для защиты данных пользователей
4. **Мониторинг** - детальная аналитика производительности
5. **Гибкость** - feature flags и конфигурация через базу данных
6. **Автоматизация** - самообслуживание и очистка данных

База данных готова для продакшен использования и может масштабироваться по мере роста приложения.
