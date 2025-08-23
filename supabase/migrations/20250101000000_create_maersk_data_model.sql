-- ========================================
-- MAERSK API DATA MODEL MIGRATION
-- Based on: locations_api.md, deadlines_api.md, p2p_api.md, vessels_api.md
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- REFERENCE TABLES
-- ========================================

-- Countries table (ISO 3166-1 standard)
CREATE TABLE countries (
    country_code VARCHAR(2) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carrier codes table (NMFTA SCAC codes)
CREATE TABLE carrier_codes (
    carrier_code VARCHAR(4) PRIMARY KEY,
    carrier_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport modes table
CREATE TABLE transport_modes (
    mode_code VARCHAR(3) PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location types table
CREATE TABLE location_types (
    type_code VARCHAR(20) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MAIN TABLES
-- ========================================

-- Vessels table
CREATE TABLE vessels (
    vessel_imo_number VARCHAR(7) PRIMARY KEY,
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

-- Locations table
CREATE TABLE locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY,
    country_code VARCHAR(2) REFERENCES countries(country_code),
    city_name VARCHAR(100),
    un_location_code VARCHAR(5),
    un_region_code VARCHAR(3),
    un_region_name VARCHAR(100),
    location_type VARCHAR(20) REFERENCES location_types(type_code),
    location_name VARCHAR(100),
    time_zone_id VARCHAR(50),
    carrier_country_geo_id VARCHAR(13),
    carrier_rkts_code VARCHAR(10),
    carrier_rkst_code VARCHAR(10),
    alternate_aliases TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities table (terminals, depots, etc.)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_geo_id VARCHAR(13) REFERENCES locations(carrier_geo_id),
    facility_type VARCHAR(20),
    facility_name VARCHAR(100),
    carrier_site_geo_id VARCHAR(13),
    site_un_location_code VARCHAR(5),
    city_un_location_code VARCHAR(5),
    site_un_location_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point-to-point schedules table
CREATE TABLE point_to_point_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_product_id VARCHAR(50),
    carrier_product_sequence_id VARCHAR(50),
    vessel_operator_carrier_code VARCHAR(4) REFERENCES carrier_codes(carrier_code),
    collection_origin_geo_id VARCHAR(13) REFERENCES locations(carrier_geo_id),
    delivery_destination_geo_id VARCHAR(13) REFERENCES locations(carrier_geo_id),
    product_valid_from_date DATE,
    product_valid_to_date DATE,
    number_of_product_links INTEGER,
    cargo_type VARCHAR(10) DEFAULT 'DRY',
    iso_equipment_code VARCHAR(4) DEFAULT '42G1',
    stuffing_weight INTEGER DEFAULT 18000,
    weight_measurement_unit VARCHAR(3) DEFAULT 'KGS',
    stuffing_volume INTEGER DEFAULT 10,
    volume_measurement_unit VARCHAR(3) DEFAULT 'MTQ',
    export_service_mode VARCHAR(3) DEFAULT 'CY',
    import_service_mode VARCHAR(3) DEFAULT 'CY',
    start_date DATE,
    start_date_type VARCHAR(1) DEFAULT 'D',
    date_range VARCHAR(10) DEFAULT 'P4W',
    vessel_flag_code VARCHAR(2) REFERENCES countries(country_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport legs table
CREATE TABLE transport_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES point_to_point_schedules(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    vessel_imo_number VARCHAR(7) REFERENCES vessels(vessel_imo_number),
    transport_mode VARCHAR(3) REFERENCES transport_modes(mode_code),
    carrier_trade_lane_name VARCHAR(100),
    carrier_departure_voyage_number VARCHAR(4),
    inducement_link_flag VARCHAR(1),
    carrier_service_code VARCHAR(3),
    carrier_service_name VARCHAR(100),
    link_direction VARCHAR(10),
    carrier_code VARCHAR(3),
    routing_type VARCHAR(1),
    start_location_geo_id VARCHAR(13) REFERENCES locations(carrier_geo_id),
    end_location_geo_id VARCHAR(13) REFERENCES locations(carrier_geo_id),
    transit_time_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deadlines table
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_imo_number VARCHAR(7) REFERENCES vessels(vessel_imo_number),
    voyage VARCHAR(4),
    port_of_load VARCHAR(100),
    iso_country_code VARCHAR(2) REFERENCES countries(country_code),
    terminal_name VARCHAR(100),
    deadline_name VARCHAR(100),
    deadline_local TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Vessels indexes
CREATE INDEX idx_vessels_carrier_code ON vessels(carrier_vessel_code);
CREATE INDEX idx_vessels_flag_code ON vessels(vessel_flag_code);
CREATE INDEX idx_vessels_capacity ON vessels(vessel_capacity_teu);

-- Locations indexes
CREATE INDEX idx_locations_country_code ON locations(country_code);
CREATE INDEX idx_locations_city_name ON locations(city_name);
CREATE INDEX idx_locations_un_location_code ON locations(un_location_code);
CREATE INDEX idx_locations_location_type ON locations(location_type);
CREATE INDEX idx_locations_time_zone ON locations(time_zone_id);

-- Facilities indexes
CREATE INDEX idx_facilities_location_geo_id ON facilities(location_geo_id);
CREATE INDEX idx_facilities_facility_type ON facilities(facility_type);

-- Point-to-point schedules indexes
CREATE INDEX idx_p2p_carrier_product_id ON point_to_point_schedules(carrier_product_id);
CREATE INDEX idx_p2p_carrier_code ON point_to_point_schedules(vessel_operator_carrier_code);
CREATE INDEX idx_p2p_origin ON point_to_point_schedules(collection_origin_geo_id);
CREATE INDEX idx_p2p_destination ON point_to_point_schedules(delivery_destination_geo_id);
CREATE INDEX idx_p2p_valid_dates ON point_to_point_schedules(product_valid_from_date, product_valid_to_date);

-- Transport legs indexes
CREATE INDEX idx_transport_legs_schedule_id ON transport_legs(schedule_id);
CREATE INDEX idx_transport_legs_vessel ON transport_legs(vessel_imo_number);
CREATE INDEX idx_transport_legs_dates ON transport_legs(departure_date_time, arrival_date_time);
CREATE INDEX idx_transport_legs_mode ON transport_legs(transport_mode);

-- Deadlines indexes
CREATE INDEX idx_deadlines_vessel ON deadlines(vessel_imo_number);
CREATE INDEX idx_deadlines_voyage ON deadlines(voyage);
CREATE INDEX idx_deadlines_country ON deadlines(iso_country_code);
CREATE INDEX idx_deadlines_local ON deadlines(deadline_local);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_to_point_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON countries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON carrier_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transport_modes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON location_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON vessels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON facilities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON point_to_point_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transport_legs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON deadlines FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for service role (for API operations)
CREATE POLICY "Enable all access for service role" ON countries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON carrier_codes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transport_modes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON location_types FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON vessels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON facilities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON point_to_point_schedules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transport_legs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON deadlines FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- SAMPLE DATA FOR REFERENCE TABLES
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
('NO', 'Norway');

-- Insert sample carrier codes
INSERT INTO carrier_codes (carrier_code, carrier_name, description) VALUES
('MAEU', 'Maersk A/S', 'Maersk Line main carrier'),
('SEAU', 'Maersk A/S trading as Sealand Americas', 'Sealand Americas division'),
('SEJJ', 'Sealand Europe A/S', 'Sealand Europe division'),
('MCPU', 'Sealand Maersk Asia Pte. Ltd.', 'Sealand Maersk Asia division'),
('MAEI', 'Maersk Line Limited', 'Maersk Line Limited division');

-- Insert sample transport modes
INSERT INTO transport_modes (mode_code, mode_name, description) VALUES
('BAR', 'Barge', 'Barge transportation'),
('BCO', 'Barge - Combined Transport', 'Barge combined transport'),
('DST', 'Doublestack', 'Doublestack rail transport'),
('FEF', 'Foreign Feeder', 'Foreign feeder vessel'),
('FEO', 'Maersk Owned Feeder', 'Maersk owned feeder vessel'),
('MVS', 'Mother Vessel', 'Mother vessel transport'),
('RCO', 'Railroad - Combined', 'Railroad combined transport'),
('RR', 'Railroad', 'Railroad transport'),
('SSH', 'Equalization', 'Equalization transport'),
('TRK', 'Truck', 'Truck transport'),
('VSF', 'VSA Feeder', 'VSA feeder vessel'),
('VSL', 'USA Feeder', 'USA feeder vessel'),
('VSM', 'VSA Mother VSL', 'VSA mother vessel');

-- Insert sample location types
INSERT INTO location_types (type_code, type_name, description) VALUES
('CITY', 'City', 'City location'),
('COUNTRY', 'Country', 'Country location'),
('TERMINAL', 'Terminal', 'Port terminal'),
('BARGE_TERMINAL', 'Barge Terminal', 'Barge terminal'),
('RAIL_TERMINAL', 'Rail Terminal', 'Rail terminal'),
('CONTAINER_FREIGHT_ST', 'Container Freight Station', 'CFS facility'),
('CUSTOMER_LOCATION', 'Customer Location', 'Customer premises'),
('DEPOT', 'Depot', 'Depot facility');

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carrier_codes_updated_at BEFORE UPDATE ON carrier_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_modes_updated_at BEFORE UPDATE ON transport_modes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_types_updated_at BEFORE UPDATE ON location_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_point_to_point_schedules_updated_at BEFORE UPDATE ON point_to_point_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_legs_updated_at BEFORE UPDATE ON transport_legs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
