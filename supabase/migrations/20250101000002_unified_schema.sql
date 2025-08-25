-- ========================================
-- UNIFIED DATABASE SCHEMA MIGRATION
-- SprutNet Shipping Planner - Unified Schema
-- Combines Prisma Maersk API model with enhanced user features
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- REFERENCE TABLES
-- ========================================

-- Countries table (ISO 3166-1 standard)
CREATE TABLE IF NOT EXISTS countries (
    country_code VARCHAR(2) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carrier codes table (NMFTA SCAC codes)
CREATE TABLE IF NOT EXISTS carrier_codes (
    carrier_code VARCHAR(4) PRIMARY KEY,
    carrier_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport modes table
CREATE TABLE IF NOT EXISTS transport_modes (
    mode_code VARCHAR(3) PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location types table
CREATE TABLE IF NOT EXISTS location_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MAERSK API TABLES (from Prisma schema)
-- ========================================

-- Vessels table (Maersk Vessels API)
CREATE TABLE IF NOT EXISTS vessels (
    vessel_imo_number INTEGER PRIMARY KEY,
    carrier_vessel_code VARCHAR(3) NOT NULL,
    vessel_short_name VARCHAR(18),
    vessel_long_name VARCHAR(35),
    vessel_flag_code VARCHAR(2) REFERENCES countries(country_code),
    vessel_built_year INTEGER,
    vessel_call_sign VARCHAR(10),
    vessel_capacity_teu INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (Maersk Locations API)
CREATE TABLE IF NOT EXISTS locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY,
    country_code VARCHAR(2) REFERENCES countries(country_code),
    country_name VARCHAR(100),
    un_location_code VARCHAR(5),
    city_name VARCHAR(100),
    un_region_code VARCHAR(3),
    un_region_name VARCHAR(100),
    location_type VARCHAR(50) REFERENCES location_types(type_code),
    location_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carrier locations table
CREATE TABLE IF NOT EXISTS carrier_locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY REFERENCES locations(carrier_geo_id),
    carrier_rkts_code VARCHAR(10),
    carrier_rkst_code VARCHAR(10),
    time_zone_id VARCHAR(50),
    carrier_country_geo_id VARCHAR(13),
    alternate_aliases TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ocean products table (Maersk P2P API)
CREATE TABLE IF NOT EXISTS ocean_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_operator_carrier_code VARCHAR(4) REFERENCES carrier_codes(carrier_code),
    carrier_product_id VARCHAR(50),
    carrier_product_sequence_id VARCHAR(50),
    product_valid_from_date DATE,
    product_valid_to_date DATE,
    numberofproductlinks VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport schedules table
CREATE TABLE IF NOT EXISTS transport_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocean_product_id UUID REFERENCES ocean_products(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    transit_time VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport legs table
CREATE TABLE IF NOT EXISTS transport_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_schedule_id UUID REFERENCES transport_schedules(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transports table
CREATE TABLE IF NOT EXISTS transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_leg_id UUID REFERENCES transport_legs(id) ON DELETE CASCADE,
    vessel_imo_number INTEGER REFERENCES vessels(vessel_imo_number),
    carrier_vessel_code VARCHAR(3),
    vessel_name VARCHAR(35),
    transport_mode VARCHAR(3) REFERENCES transport_modes(mode_code),
    carrier_trade_lane_name VARCHAR(100),
    carrier_departure_voyage_number VARCHAR(4),
    inducement_link_flag VARCHAR(1),
    carrier_service_code VARCHAR(3),
    carrier_service_name VARCHAR(100),
    link_direction VARCHAR(10),
    carrier_code VARCHAR(10),
    routing_type VARCHAR(1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_leg_id UUID REFERENCES transport_legs(id) ON DELETE CASCADE,
    carrier_site_geo_id VARCHAR(13),
    location_type VARCHAR(50),
    location_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UN location codes table
CREATE TABLE IF NOT EXISTS un_location_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    un_location_code VARCHAR(5),
    city_un_location_code VARCHAR(5),
    site_un_location_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment deadlines table (Maersk Deadlines API)
CREATE TABLE IF NOT EXISTS shipment_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_imo_number INTEGER REFERENCES vessels(vessel_imo_number),
    voyage VARCHAR(4),
    port_of_load VARCHAR(100),
    iso_country_code VARCHAR(2) REFERENCES countries(country_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_deadline_id UUID REFERENCES shipment_deadlines(id) ON DELETE CASCADE,
    deadline_name VARCHAR(100),
    deadline_local TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment deadline details table
CREATE TABLE IF NOT EXISTS shipment_deadline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_deadlines_id UUID REFERENCES shipment_deadlines(id) ON DELETE CASCADE,
    terminal_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- USER DATA AND CACHING TABLES
-- ========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    company VARCHAR(100),
    role VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- API cache table
CREATE TABLE IF NOT EXISTS api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    params JSONB NOT NULL DEFAULT '{}',
    data JSONB NOT NULL,
    data_size_bytes INTEGER,
    compressed BOOLEAN DEFAULT FALSE,
    ttl_seconds INTEGER NOT NULL DEFAULT 900,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cache_type VARCHAR(50),
    response_time_ms INTEGER,
    status_code INTEGER
);

-- User searches table
CREATE TABLE IF NOT EXISTS user_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_type VARCHAR(50) NOT NULL,
    origin_port_code VARCHAR(10),
    destination_port_code VARCHAR(10),
    search_query TEXT,
    search_params JSONB NOT NULL DEFAULT '{}',
    results_count INTEGER,
    search_duration_ms INTEGER,
    cache_hit BOOLEAN,
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorite_type VARCHAR(50) NOT NULL,
    favorite_data JSONB NOT NULL,
    name VARCHAR(100),
    notes TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reminders table
CREATE TABLE IF NOT EXISTS user_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sailing_id UUID,
    deadline_id UUID,
    vessel_imo INTEGER REFERENCES vessels(vessel_imo_number),
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notify_before_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MONITORING AND ANALYTICS TABLES
-- ========================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    data_size_bytes INTEGER,
    cache_hit BOOLEAN,
    retries INTEGER DEFAULT 0,
    error_message TEXT,
    error_code VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    api_provider VARCHAR(50),
    endpoint_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    source VARCHAR(50),
    version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CONFIGURATION TABLES
-- ========================================

-- System config table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    flag_value BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    environment VARCHAR(20) DEFAULT 'production',
    category VARCHAR(50),
    owner VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Reference tables indexes
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(country_name);
CREATE INDEX IF NOT EXISTS idx_carrier_codes_name ON carrier_codes(carrier_name);

-- Vessels indexes
CREATE INDEX IF NOT EXISTS idx_vessels_carrier_code ON vessels(carrier_vessel_code);
CREATE INDEX IF NOT EXISTS idx_vessels_flag_code ON vessels(vessel_flag_code);
CREATE INDEX IF NOT EXISTS idx_vessels_capacity ON vessels(vessel_capacity_teu);
CREATE INDEX IF NOT EXISTS idx_vessels_built_year ON vessels(vessel_built_year);

-- Vessels fulltext search
CREATE INDEX IF NOT EXISTS idx_vessels_fulltext ON vessels 
  USING gin(to_tsvector('english', 
    COALESCE(vessel_short_name, '') || ' ' || 
    COALESCE(vessel_long_name, '') || ' ' || 
    COALESCE(vessel_call_sign, '')
  ));

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_country_code ON locations(country_code);
CREATE INDEX IF NOT EXISTS idx_locations_city_name ON locations(city_name);
CREATE INDEX IF NOT EXISTS idx_locations_un_location_code ON locations(un_location_code);
CREATE INDEX IF NOT EXISTS idx_locations_location_type ON locations(location_type);
CREATE INDEX IF NOT EXISTS idx_locations_region_code ON locations(un_region_code);

-- Locations fulltext search
CREATE INDEX IF NOT EXISTS idx_locations_fulltext ON locations 
  USING gin(to_tsvector('english', 
    COALESCE(location_name, '') || ' ' || 
    COALESCE(city_name, '') || ' ' || 
    COALESCE(country_name, '') || ' ' || 
    COALESCE(un_location_code, '')
  ));

-- Carrier locations indexes
CREATE INDEX IF NOT EXISTS idx_carrier_locations_timezone ON carrier_locations(time_zone_id);
CREATE INDEX IF NOT EXISTS idx_carrier_locations_aliases ON carrier_locations USING gin(alternate_aliases);

-- Ocean products indexes
CREATE INDEX IF NOT EXISTS idx_ocean_products_carrier_code ON ocean_products(vessel_operator_carrier_code);
CREATE INDEX IF NOT EXISTS idx_ocean_products_valid_dates ON ocean_products(product_valid_from_date, product_valid_to_date);
CREATE INDEX IF NOT EXISTS idx_ocean_products_product_id ON ocean_products(carrier_product_id);

-- Transport schedules indexes
CREATE INDEX IF NOT EXISTS idx_transport_schedules_ocean_product_id ON transport_schedules(ocean_product_id);
CREATE INDEX IF NOT EXISTS idx_transport_schedules_dates ON transport_schedules(departure_date_time, arrival_date_time);
CREATE INDEX IF NOT EXISTS idx_transport_schedules_transit_time ON transport_schedules(transit_time);

-- Transport legs indexes
CREATE INDEX IF NOT EXISTS idx_transport_legs_schedule_id ON transport_legs(transport_schedule_id);
CREATE INDEX IF NOT EXISTS idx_transport_legs_dates ON transport_legs(departure_date_time, arrival_date_time);

-- Transports indexes
CREATE INDEX IF NOT EXISTS idx_transports_leg_id ON transports(transport_leg_id);
CREATE INDEX IF NOT EXISTS idx_transports_vessel_imo ON transports(vessel_imo_number);
CREATE INDEX IF NOT EXISTS idx_transports_mode ON transports(transport_mode);
CREATE INDEX IF NOT EXISTS idx_transports_voyage ON transports(carrier_departure_voyage_number);
CREATE INDEX IF NOT EXISTS idx_transports_service ON transports(carrier_service_code);

-- Facilities indexes
CREATE INDEX IF NOT EXISTS idx_facilities_leg_id ON facilities(transport_leg_id);
CREATE INDEX IF NOT EXISTS idx_facilities_site_geo_id ON facilities(carrier_site_geo_id);
CREATE INDEX IF NOT EXISTS idx_facilities_location_type ON facilities(location_type);

-- UN location codes indexes
CREATE INDEX IF NOT EXISTS idx_un_location_codes_facility_id ON un_location_codes(facility_id);
CREATE INDEX IF NOT EXISTS idx_un_location_codes_location_code ON un_location_codes(un_location_code);
CREATE INDEX IF NOT EXISTS idx_un_location_codes_city_code ON un_location_codes(city_un_location_code);

-- Deadlines indexes
CREATE INDEX IF NOT EXISTS idx_shipment_deadlines_vessel_imo ON shipment_deadlines(vessel_imo_number);
CREATE INDEX IF NOT EXISTS idx_shipment_deadlines_voyage ON shipment_deadlines(voyage);
CREATE INDEX IF NOT EXISTS idx_shipment_deadlines_country ON shipment_deadlines(iso_country_code);
CREATE INDEX IF NOT EXISTS idx_shipment_deadlines_port ON shipment_deadlines(port_of_load);

CREATE INDEX IF NOT EXISTS idx_deadlines_shipment_id ON deadlines(shipment_deadline_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_local ON deadlines(deadline_local);
CREATE INDEX IF NOT EXISTS idx_deadlines_name ON deadlines(deadline_name);

CREATE INDEX IF NOT EXISTS idx_shipment_deadline_shipment_id ON shipment_deadline(shipment_deadlines_id);
CREATE INDEX IF NOT EXISTS idx_shipment_deadline_terminal ON shipment_deadline(terminal_name);

-- User data indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- API cache indexes
CREATE INDEX IF NOT EXISTS idx_api_cache_key_hash ON api_cache USING hash(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_endpoint ON api_cache(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_last_accessed ON api_cache(last_accessed);
CREATE INDEX IF NOT EXISTS idx_api_cache_type ON api_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_api_cache_params ON api_cache USING gin(params);

-- User searches indexes
CREATE INDEX IF NOT EXISTS idx_user_searches_user ON user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_type ON user_searches(search_type);
CREATE INDEX IF NOT EXISTS idx_user_searches_route ON user_searches(origin_port_code, destination_port_code);
CREATE INDEX IF NOT EXISTS idx_user_searches_date ON user_searches(created_at);
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_user_searches_params ON user_searches USING gin(search_params);
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(favorite_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_data ON user_favorites USING gin(favorite_data);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique ON user_favorites(user_id, favorite_type, (favorite_data->>'id'));

-- User reminders indexes
CREATE INDEX IF NOT EXISTS idx_user_reminders_user ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_date ON user_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_user_reminders_active ON user_reminders(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_reminders_vessel ON user_reminders(vessel_imo);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status ON performance_metrics(status_code);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_time ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_provider ON performance_metrics(api_provider);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON analytics_events USING gin(event_data);

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_active ON system_config(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache access
CREATE OR REPLACE FUNCTION update_cache_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = NOW();
    NEW.access_count = OLD.access_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM api_cache WHERE expires_at < NOW();
    
    INSERT INTO analytics_events (event_type, event_data) 
    VALUES ('cache_cleanup', jsonb_build_object('timestamp', NOW()));
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (with existence checks)
DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON countries FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON carrier_codes FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON transport_modes FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON location_types FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON vessels FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON locations FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON carrier_locations FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON ocean_products FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON transport_schedules FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON transport_legs FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON transports FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON facilities FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON un_location_codes FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON shipment_deadlines FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON deadlines FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON shipment_deadline FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON users FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON user_favorites FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON user_reminders FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON system_config FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trigger_update_updated_at
        BEFORE UPDATE ON feature_flags FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger for cache access
DO $$ BEGIN
    CREATE TRIGGER trigger_update_cache_access
        BEFORE UPDATE ON api_cache
        FOR EACH ROW
        EXECUTE FUNCTION update_cache_access();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- User policies
DO $$ BEGIN
    CREATE POLICY "Users can view own data" ON users
        FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own data" ON users
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Search policies
DO $$ BEGIN
    CREATE POLICY "Users can view own searches" ON user_searches
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own searches" ON user_searches
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Favorites policies
DO $$ BEGIN
    CREATE POLICY "Users can manage own favorites" ON user_favorites
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reminders policies
DO $$ BEGIN
    CREATE POLICY "Users can manage own reminders" ON user_reminders
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Analytics policies
DO $$ BEGIN
    CREATE POLICY "Users can view own analytics" ON analytics_events
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- System tables policies
DO $$ BEGIN
    CREATE POLICY "System tables for service role" ON performance_metrics
        FOR ALL USING (auth.role() = 'service_role');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "System tables for service role" ON system_config
        FOR ALL USING (auth.role() = 'service_role');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Maersk data policies (read access for authenticated users)
DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON countries FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON carrier_codes FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON transport_modes FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON location_types FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON vessels FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON locations FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON carrier_locations FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON ocean_products FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON transport_schedules FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON transport_legs FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON transports FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON facilities FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON un_location_codes FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON shipment_deadlines FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON deadlines FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read access" ON shipment_deadline FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- ANALYTICS VIEWS
-- ========================================

-- Cache statistics view
CREATE OR REPLACE VIEW cache_stats AS
SELECT 
    cache_type,
    COUNT(*) as total_entries,
    AVG(data_size_bytes) as avg_size,
    AVG(access_count) as avg_access_count,
    MAX(created_at) as last_updated,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_entries
FROM api_cache 
GROUP BY cache_type;

-- API statistics view
CREATE OR REPLACE VIEW api_stats AS
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

-- Popular routes view
DO $$ BEGIN
    DROP TABLE IF EXISTS popular_routes CASCADE;
    DROP VIEW IF EXISTS popular_routes;
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
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- User activity view
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    user_id,
    COUNT(*) as total_searches,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    MAX(created_at) as last_activity,
    AVG(search_duration_ms) as avg_search_time
FROM user_searches 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Vessel statistics view
CREATE OR REPLACE VIEW vessel_stats AS
SELECT 
    v.vessel_imo_number,
    v.vessel_long_name,
    v.vessel_capacity_teu,
    COUNT(t.id) as transport_count,
    COUNT(sd.id) as deadline_count,
    MAX(t.created_at) as last_transport
FROM vessels v
LEFT JOIN transports t ON v.vessel_imo_number = t.vessel_imo_number
LEFT JOIN shipment_deadlines sd ON v.vessel_imo_number = sd.vessel_imo_number
GROUP BY v.vessel_imo_number, v.vessel_long_name, v.vessel_capacity_teu
ORDER BY transport_count DESC;

-- Port statistics view
CREATE OR REPLACE VIEW port_stats AS
SELECT 
    l.carrier_geo_id,
    l.location_name,
    l.city_name,
    l.country_name,
    COUNT(DISTINCT t.id) as transport_count,
    COUNT(DISTINCT f.id) as facility_count,
    MAX(t.created_at) as last_activity
FROM locations l
LEFT JOIN facilities f ON l.carrier_geo_id = f.carrier_site_geo_id
LEFT JOIN transport_legs tl ON f.transport_leg_id = tl.id
LEFT JOIN transports t ON tl.id = t.transport_leg_id
WHERE l.location_type = 'PORT'
GROUP BY l.carrier_geo_id, l.location_name, l.city_name, l.country_name
ORDER BY transport_count DESC;

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert sample countries
INSERT INTO countries (country_code, country_name) VALUES
('US', 'United States'),
('CN', 'China'),
('DE', 'Germany'),
('NL', 'Netherlands'),
('SG', 'Singapore'),
('HK', 'Hong Kong'),
('JP', 'Japan'),
('KR', 'South Korea'),
('GB', 'United Kingdom'),
('FR', 'France'),
('IT', 'Italy'),
('ES', 'Spain'),
('AU', 'Australia'),
('CA', 'Canada'),
('MX', 'Mexico'),
('BR', 'Brazil'),
('IN', 'India'),
('RU', 'Russia'),
('DK', 'Denmark'),
('NO', 'Norway')
ON CONFLICT (country_code) DO NOTHING;

-- Insert sample carrier codes
INSERT INTO carrier_codes (carrier_code, carrier_name, description) VALUES
('MAEU', 'Maersk Line', 'Maersk Line container shipping'),
('MSCU', 'MSC', 'Mediterranean Shipping Company'),
('CMDU', 'CMA CGM', 'CMA CGM Group'),
('COSU', 'COSCO', 'COSCO Shipping Lines'),
('EVER', 'Evergreen', 'Evergreen Marine Corporation')
ON CONFLICT (carrier_code) DO NOTHING;

-- Insert sample transport modes
INSERT INTO transport_modes (mode_code, mode_name, description) VALUES
('VSL', 'Vessel', 'Ocean vessel transport'),
('TRK', 'Truck', 'Road transport'),
('TRN', 'Train', 'Rail transport'),
('AIR', 'Air', 'Air transport')
ON CONFLICT (mode_code) DO NOTHING;

-- Insert sample location types
INSERT INTO location_types (type_code, type_name, description) VALUES
('PORT', 'Port', 'Seaport location'),
('CITY', 'City', 'City location'),
('AIRP', 'Airport', 'Airport location'),
('RAIL', 'Rail Station', 'Railway station'),
('WARE', 'Warehouse', 'Warehouse facility')
ON CONFLICT (type_code) DO NOTHING;

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description, category) VALUES
('maersk_api_settings', '{"base_url": "https://api.maersk.com", "timeout": 10000, "retries": 3}', 'Настройки Maersk API', 'api'),
('cache_settings', '{"default_ttl": 900, "max_size": 1000, "cleanup_interval": 300}', 'Настройки кэширования', 'cache'),
('feature_flags', '{"live_api": true, "deadlines": true, "cache_enabled": true}', 'Feature flags', 'feature_flags'),
('rate_limits', '{"requests_per_minute": 60, "burst_limit": 10}', 'Лимиты запросов', 'limits'),
('telemetry_settings', '{"enabled": true, "sample_rate": 0.1, "retention_days": 30}', 'Настройки телеметрии', 'telemetry')
ON CONFLICT (config_key) DO NOTHING;

-- Insert feature flags
INSERT INTO feature_flags (flag_name, flag_value, description, category) VALUES
('FEATURE_MAERSK', true, 'Включить интеграцию с Maersk API', 'api'),
('FEATURE_DEADLINES', true, 'Включить функционал дедлайнов', 'ui'),
('CACHE_ENABLED', true, 'Включить кэширование', 'performance'),
('TELEMETRY_ENABLED', true, 'Включить телеметрию', 'performance'),
('DEMO_MODE', false, 'Режим демонстрации', 'experimental'),
('ADVANCED_SEARCH', false, 'Расширенный поиск', 'ui')
ON CONFLICT (flag_name) DO NOTHING;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verify the migration
SELECT 'Unified schema migration completed successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
