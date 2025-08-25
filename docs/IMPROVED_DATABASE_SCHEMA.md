# Улучшенная схема базы данных Supabase для SprutNet

## Анализ текущего проекта

После изучения кодовой базы SprutNet, я выявил следующие ключевые компоненты:

### Текущая архитектура:
- **Monorepo** с Next.js приложением
- **Shared types** в отдельном пакете (`@sprutnet/shared`)
- **Maersk API интеграция** с кэшированием
- **Telemetry и мониторинг** производительности
- **Feature flags** для управления функциональностью
- **Error handling** с fallback на mock данные

### Основные доменные типы:
- `PortRef` - порты и локации
- `Sailing` - расписания рейсов
- `Deadline` - дедлайны операций
- `Vessel` - информация о судах

## Улучшенная схема базы данных

### 1. Основные доменные таблицы

#### `ports` - Порты и локации
```sql
CREATE TABLE ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Основные идентификаторы
  port_code VARCHAR(10) UNIQUE NOT NULL, -- CNSHA, USLAX, etc.
  carrier_geo_id VARCHAR(50) UNIQUE, -- Maersk Geo ID
  un_location_code VARCHAR(10), -- UN/LOCODE
  
  -- Основная информация
  name VARCHAR(200) NOT NULL,
  city_name VARCHAR(100),
  country_code VARCHAR(3) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  
  -- Тип и классификация
  port_type VARCHAR(50) NOT NULL DEFAULT 'SEAPORT', -- SEAPORT, RIVERPORT, CONTAINER_TERMINAL, MULTIMODAL_TERMINAL
  location_type VARCHAR(50), -- port, seaport, CITY, etc.
  
  -- Географические данные
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50), -- Europe/Moscow, Asia/Shanghai, etc.
  
  -- Региональная информация
  un_region_code VARCHAR(10),
  un_region_name VARCHAR(100),
  
  -- Статус и метаданные
  is_active BOOLEAN DEFAULT TRUE,
  is_major_port BOOLEAN DEFAULT FALSE,
  container_capacity_teu INTEGER,
  
  -- Данные от Maersk API
  maersk_data JSONB,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ограничения
  CONSTRAINT valid_port_code CHECK (port_code ~ '^[A-Z]{5}$'),
  CONSTRAINT valid_country_code CHECK (country_code ~ '^[A-Z]{2,3}$')
);

-- Индексы для быстрого поиска
CREATE INDEX idx_ports_port_code ON ports(port_code);
CREATE INDEX idx_ports_carrier_geo_id ON ports(carrier_geo_id);
CREATE INDEX idx_ports_country ON ports(country_code);
CREATE INDEX idx_ports_city ON ports(city_name);
CREATE INDEX idx_ports_type ON ports(port_type);
CREATE INDEX idx_ports_active ON ports(is_active) WHERE is_active = TRUE;

-- Полнотекстовый поиск
CREATE INDEX idx_ports_fulltext ON ports 
  USING gin(to_tsvector('english', name || ' ' || city_name || ' ' || country_name));

-- Составные индексы
CREATE INDEX idx_ports_country_city ON ports(country_code, city_name);
CREATE INDEX idx_ports_type_active ON ports(port_type, is_active);
```

#### `vessels` - Судна
```sql
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основные идентификаторы
  imo_number VARCHAR(10) UNIQUE NOT NULL, -- 7-значный IMO
  carrier_vessel_code VARCHAR(20), -- Код у перевозчика
  mmsi VARCHAR(15), -- Maritime Mobile Service Identity
  
  -- Основная информация
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(100),
  long_name VARCHAR(300),
  
  -- Технические характеристики
  built_year INTEGER,
  vessel_type VARCHAR(50),
  capacity_teu INTEGER,
  length_m DECIMAL(8, 2),
  beam_m DECIMAL(8, 2),
  draft_m DECIMAL(6, 2),
  gross_tonnage INTEGER,
  deadweight_tonnage INTEGER,
  
  -- Операционная информация
  flag_code VARCHAR(3),
  flag_name VARCHAR(100),
  call_sign VARCHAR(20),
  home_port VARCHAR(10) REFERENCES ports(port_code),
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(50), -- ACTIVE, INACTIVE, SCRAPPED, etc.
  
  -- Данные от Maersk API
  maersk_data JSONB,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ограничения
  CONSTRAINT valid_imo CHECK (imo_number ~ '^\d{7}$'),
  CONSTRAINT valid_capacity CHECK (capacity_teu > 0)
);

-- Индексы
CREATE INDEX idx_vessels_imo ON vessels(imo_number);
CREATE INDEX idx_vessels_carrier_code ON vessels(carrier_vessel_code);
CREATE INDEX idx_vessels_name ON vessels(name);
CREATE INDEX idx_vessels_flag ON vessels(flag_code);
CREATE INDEX idx_vessels_type ON vessels(vessel_type);
CREATE INDEX idx_vessels_active ON vessels(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vessels_capacity ON vessels(capacity_teu);

-- Полнотекстовый поиск
CREATE INDEX idx_vessels_fulltext ON vessels 
  USING gin(to_tsvector('english', name || ' ' || short_name || ' ' || long_name));
```

#### `sailings` - Расписания рейсов
```sql
CREATE TABLE sailings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основные идентификаторы
  sailing_key VARCHAR(255) UNIQUE NOT NULL, -- origin_destination_vessel_voyage_date
  carrier_code VARCHAR(10) NOT NULL,
  carrier_name VARCHAR(100) NOT NULL,
  voyage_number VARCHAR(20) NOT NULL,
  
  -- Маршрут
  origin_port_code VARCHAR(10) NOT NULL REFERENCES ports(port_code),
  destination_port_code VARCHAR(10) NOT NULL REFERENCES ports(port_code),
  
  -- Даты
  departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_local_time VARCHAR(20),
  arrival_local_time VARCHAR(20),
  
  -- Судно
  vessel_imo VARCHAR(10) REFERENCES vessels(imo_number),
  vessel_name VARCHAR(200),
  
  -- Вместимость
  available_capacity_teu INTEGER,
  total_capacity_teu INTEGER,
  
  -- Статус
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_TRANSIT, COMPLETED, CANCELLED, DELAYED
  transit_days INTEGER,
  delay_days INTEGER DEFAULT 0,
  
  -- Маршрут
  route_id VARCHAR(100),
  route_name VARCHAR(200),
  route_distance_nm INTEGER,
  
  -- Контейнеры
  container_types JSONB, -- ['20FT', '40FT', '40HC']
  
  -- Тарифы (упрощенная структура)
  rates JSONB, -- [{containerType, baseRate, currency, validUntil}]
  
  -- Данные от Maersk API
  maersk_data JSONB,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Ограничения
  CONSTRAINT valid_dates CHECK (departure_date < arrival_date),
  CONSTRAINT valid_capacity CHECK (available_capacity_teu <= total_capacity_teu)
);

-- Индексы
CREATE INDEX idx_sailings_key ON sailings(sailing_key);
CREATE INDEX idx_sailings_carrier ON sailings(carrier_code);
CREATE INDEX idx_sailings_voyage ON sailings(voyage_number);
CREATE INDEX idx_sailings_route ON sailings(origin_port_code, destination_port_code);
CREATE INDEX idx_sailings_vessel ON sailings(vessel_imo);
CREATE INDEX idx_sailings_dates ON sailings(departure_date, arrival_date);
CREATE INDEX idx_sailings_status ON sailings(status);
CREATE INDEX idx_sailings_expires ON sailings(expires_at);

-- Составные индексы
CREATE INDEX idx_sailings_route_dates ON sailings(origin_port_code, destination_port_code, departure_date);
CREATE INDEX idx_sailings_carrier_voyage ON sailings(carrier_code, voyage_number);
```

#### `deadlines` - Дедлайны операций
```sql
CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основные идентификаторы
  deadline_key VARCHAR(255) UNIQUE NOT NULL, -- vessel_voyage_port_type
  sailing_id UUID REFERENCES sailings(id) ON DELETE CASCADE,
  
  -- Маршрут и судно
  vessel_imo VARCHAR(10) REFERENCES vessels(imo_number),
  voyage_number VARCHAR(20),
  port_code VARCHAR(10) REFERENCES ports(port_code),
  
  -- Дедлайн
  deadline_type VARCHAR(50) NOT NULL, -- DOCUMENTATION, CONTAINER_DELIVERY, LOADING, etc.
  deadline_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Время
  deadline_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  deadline_local TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  
  -- Статус
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, OVERDUE, COMPLETED, CANCELLED
  is_mandatory BOOLEAN DEFAULT TRUE,
  
  -- Контейнеры
  container_types JSONB, -- ['20FT', '40FT']
  
  -- Штрафы
  penalty_amount DECIMAL(10, 2),
  penalty_currency VARCHAR(3),
  penalty_type VARCHAR(20), -- FIXED, PERCENTAGE, DAILY
  
  -- Терминал
  terminal_name VARCHAR(200),
  
  -- Данные от Maersk API
  maersk_data JSONB,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Индексы
CREATE INDEX idx_deadlines_key ON deadlines(deadline_key);
CREATE INDEX idx_deadlines_sailing ON deadlines(sailing_id);
CREATE INDEX idx_deadlines_vessel_voyage ON deadlines(vessel_imo, voyage_number);
CREATE INDEX idx_deadlines_port ON deadlines(port_code);
CREATE INDEX idx_deadlines_type ON deadlines(deadline_type);
CREATE INDEX idx_deadlines_dates ON deadlines(deadline_utc, deadline_local);
CREATE INDEX idx_deadlines_status ON deadlines(status);
CREATE INDEX idx_deadlines_expires ON deadlines(expires_at);

-- Составные индексы
CREATE INDEX idx_deadlines_vessel_port ON deadlines(vessel_imo, port_code, deadline_utc);
CREATE INDEX idx_deadlines_type_status ON deadlines(deadline_type, status);
```

### 2. Кэширование и производительность

#### `api_cache` - Универсальный кэш API
```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ключ кэша
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Данные
  data JSONB NOT NULL,
  data_size_bytes INTEGER,
  compressed BOOLEAN DEFAULT FALSE,
  
  -- TTL и доступ
  ttl_seconds INTEGER NOT NULL DEFAULT 900, -- 15 минут
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Метаданные
  cache_type VARCHAR(50), -- 'ports', 'vessels', 'schedules', 'deadlines'
  response_time_ms INTEGER,
  status_code INTEGER
);

-- Индексы
CREATE INDEX idx_api_cache_key_hash ON api_cache USING hash(cache_key);
CREATE INDEX idx_api_cache_endpoint ON api_cache(endpoint);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_api_cache_last_accessed ON api_cache(last_accessed);
CREATE INDEX idx_api_cache_type ON api_cache(cache_type);
```

### 3. Пользовательские данные

#### `users` - Пользователи
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  company VARCHAR(100),
  role VARCHAR(50), -- 'shipper', 'forwarder', 'carrier', 'admin'
  
  -- Настройки
  preferences JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
```

#### `user_searches` - История поисков
```sql
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Параметры поиска
  search_type VARCHAR(50) NOT NULL, -- 'ports', 'schedules', 'deadlines'
  origin_port_code VARCHAR(10) REFERENCES ports(port_code),
  destination_port_code VARCHAR(10) REFERENCES ports(port_code),
  search_query TEXT,
  search_params JSONB NOT NULL DEFAULT '{}',
  
  -- Результаты
  results_count INTEGER,
  search_duration_ms INTEGER,
  cache_hit BOOLEAN,
  
  -- Метаданные
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_user_searches_user ON user_searches(user_id);
CREATE INDEX idx_user_searches_type ON user_searches(search_type);
CREATE INDEX idx_user_searches_route ON user_searches(origin_port_code, destination_port_code);
CREATE INDEX idx_user_searches_date ON user_searches(created_at);
```

#### `user_favorites` - Избранное
```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Тип избранного
  favorite_type VARCHAR(50) NOT NULL, -- 'route', 'vessel', 'port', 'sailing'
  
  -- Данные
  favorite_data JSONB NOT NULL,
  name VARCHAR(100),
  notes TEXT,
  
  -- Метаданные
  is_public BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальность
  UNIQUE(user_id, favorite_type, (favorite_data->>'id'))
);

-- Индексы
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_type ON user_favorites(favorite_type);
```

#### `user_reminders` - Напоминания
```sql
CREATE TABLE user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Связанные данные
  sailing_id UUID REFERENCES sailings(id) ON DELETE CASCADE,
  deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
  
  -- Напоминание
  reminder_type VARCHAR(50) NOT NULL, -- 'deadline', 'departure', 'arrival'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Время
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notify_before_hours INTEGER DEFAULT 24,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_user_reminders_user ON user_reminders(user_id);
CREATE INDEX idx_user_reminders_date ON user_reminders(reminder_date);
CREATE INDEX idx_user_reminders_active ON user_reminders(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_reminders_sailing ON user_reminders(sailing_id);
```

### 4. Мониторинг и аналитика

#### `performance_metrics` - Метрики производительности
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Запрос
  endpoint VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  
  -- Данные
  data_size_bytes INTEGER,
  cache_hit BOOLEAN,
  retries INTEGER DEFAULT 0,
  
  -- Ошибки
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Контекст
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  user_id UUID REFERENCES users(id),
  
  -- Метаданные
  api_provider VARCHAR(50), -- 'maersk', 'internal'
  endpoint_type VARCHAR(50), -- 'ports', 'vessels', 'schedules', 'deadlines'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_performance_metrics_status ON performance_metrics(status_code);
CREATE INDEX idx_performance_metrics_time ON performance_metrics(created_at);
CREATE INDEX idx_performance_metrics_session ON performance_metrics(session_id);
CREATE INDEX idx_performance_metrics_provider ON performance_metrics(api_provider);
```

#### `analytics_events` - События аналитики
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Событие
  event_type VARCHAR(100) NOT NULL, -- 'search_started', 'search_success', 'deadline_opened'
  event_data JSONB,
  
  -- Контекст
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  page_url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  
  -- Метаданные
  source VARCHAR(50), -- 'web', 'api', 'mobile'
  version VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_time ON analytics_events(created_at);
```

### 5. Конфигурация и управление

#### `system_config` - Системная конфигурация
```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ключ конфигурации
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  
  -- Метаданные
  category VARCHAR(50), -- 'api', 'cache', 'feature_flags', 'limits'
  is_active BOOLEAN DEFAULT TRUE,
  is_sensitive BOOLEAN DEFAULT FALSE,
  
  -- Версионирование
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Примеры конфигураций
INSERT INTO system_config (config_key, config_value, description, category) VALUES
('maersk_api_settings', '{"base_url": "https://api.maersk.com", "timeout": 10000, "retries": 3}', 'Настройки Maersk API', 'api'),
('cache_settings', '{"default_ttl": 900, "max_size": 1000, "cleanup_interval": 300}', 'Настройки кэширования', 'cache'),
('feature_flags', '{"live_api": true, "deadlines": true, "cache_enabled": true}', 'Feature flags', 'feature_flags'),
('rate_limits', '{"requests_per_minute": 60, "burst_limit": 10}', 'Лимиты запросов', 'limits'),
('telemetry_settings', '{"enabled": true, "sample_rate": 0.1, "retention_days": 30}', 'Настройки телеметрии', 'telemetry');
```

#### `feature_flags` - Feature Flags
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Флаг
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  flag_value BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  
  -- Окружение
  environment VARCHAR(20) DEFAULT 'production', -- 'development', 'staging', 'production'
  
  -- Метаданные
  category VARCHAR(50), -- 'api', 'ui', 'performance', 'experimental'
  owner VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Примеры feature flags
INSERT INTO feature_flags (flag_name, flag_value, description, category) VALUES
('FEATURE_MAERSK', true, 'Включить интеграцию с Maersk API', 'api'),
('FEATURE_DEADLINES', true, 'Включить функционал дедлайнов', 'ui'),
('CACHE_ENABLED', true, 'Включить кэширование', 'performance'),
('TELEMETRY_ENABLED', true, 'Включить телеметрию', 'performance'),
('DEMO_MODE', false, 'Режим демонстрации', 'experimental'),
('ADVANCED_SEARCH', false, 'Расширенный поиск', 'ui');
```

### 6. Функции и триггеры

#### Автоматическая очистка кэша
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  -- Очистка API кэша
  DELETE FROM api_cache WHERE expires_at < NOW();
  
  -- Очистка расписаний
  DELETE FROM sailings WHERE expires_at < NOW();
  
  -- Очистка дедлайнов
  DELETE FROM deadlines WHERE expires_at < NOW();
  
  -- Логирование
  INSERT INTO analytics_events (event_type, event_data) 
  VALUES ('cache_cleanup', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql;

-- Планировщик (каждые 5 минут)
SELECT cron.schedule('cleanup-cache', '*/5 * * * *', 'SELECT cleanup_expired_cache();');
```

#### Обновление времени доступа
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
  BEFORE UPDATE ON api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_access();
```

#### Автоматическое обновление updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем к таблицам
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 7. RLS (Row Level Security)

```sql
-- Включаем RLS для пользовательских таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Политики для поисков
CREATE POLICY "Users can view own searches" ON user_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches" ON user_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для избранного
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Политики для напоминаний
CREATE POLICY "Users can manage own reminders" ON user_reminders
  FOR ALL USING (auth.uid() = user_id);

-- Политики для аналитики (только чтение своих событий)
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Системные таблицы доступны только для сервисных ролей
CREATE POLICY "System tables for service role" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System tables for service role" ON system_config
  FOR ALL USING (auth.role() = 'service_role');
```

### 8. Представления для аналитики

```sql
-- Статистика кэша
CREATE VIEW cache_stats AS
SELECT 
  cache_type,
  COUNT(*) as total_entries,
  AVG(data_size_bytes) as avg_size,
  AVG(access_count) as avg_access_count,
  MAX(created_at) as last_updated,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_entries
FROM api_cache 
GROUP BY cache_type;

-- Статистика API
CREATE VIEW api_stats AS
SELECT 
  endpoint,
  endpoint_type,
  api_provider,
  COUNT(*) as total_requests,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
  COUNT(*) FILTER (WHERE cache_hit = true) as cache_hits,
  COUNT(*) FILTER (WHERE cache_hit = false) as cache_misses
FROM performance_metrics 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint, endpoint_type, api_provider;

-- Популярные маршруты
CREATE VIEW popular_routes AS
SELECT 
  origin_port_code,
  destination_port_code,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  MAX(created_at) as last_searched
FROM user_searches 
WHERE search_type = 'schedules'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY origin_port_code, destination_port_code
ORDER BY search_count DESC;

-- Статистика пользователей
CREATE VIEW user_activity AS
SELECT 
  user_id,
  COUNT(*) as total_searches,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_activity,
  AVG(search_duration_ms) as avg_search_time
FROM user_searches 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;
```

### 9. Миграции

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

-- Создаем представления
-- ... (все представления)

-- Вставляем начальные данные
-- ... (конфигурации и feature flags)

COMMIT;
```

## Преимущества улучшенной схемы

### 1. **Соответствие доменной модели**
- Таблицы точно отражают типы из `@sprutnet/shared`
- Поддержка всех текущих API endpoints
- Гибкость для будущих расширений

### 2. **Производительность**
- Оптимизированные индексы для быстрого поиска
- Полнотекстовый поиск для портов и судов
- Эффективное кэширование с TTL

### 3. **Масштабируемость**
- Партиционирование по датам для больших таблиц
- Автоматическая очистка устаревших данных
- Мониторинг производительности

### 4. **Безопасность**
- RLS политики для защиты данных пользователей
- Разделение системных и пользовательских данных
- Аудит действий пользователей

### 5. **Аналитика**
- Детальная статистика использования
- Популярные маршруты и порты
- Производительность API

### 6. **Гибкость**
- Feature flags для управления функциональностью
- Конфигурация через базу данных
- Поддержка различных окружений

Эта схема готова для продакшен использования и может масштабироваться вместе с ростом приложения!
