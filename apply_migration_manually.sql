-- ========================================
-- MANUAL MIGRATION FOR SUPABASE DASHBOARD
-- Apply this SQL in Supabase Dashboard > SQL Editor
-- ========================================

-- First, drop all existing tables to start fresh
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS un_location_codes CASCADE;
DROP TABLE IF EXISTS transport_legs CASCADE;
DROP TABLE IF EXISTS transports CASCADE;
DROP TABLE IF EXISTS shipment_deadline CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS carrier_locations CASCADE;
DROP TABLE IF EXISTS shipment_deadlines CASCADE;
DROP TABLE IF EXISTS ocean_products CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
DROP TABLE IF EXISTS location_types CASCADE;
DROP TABLE IF EXISTS carrier_codes CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS transport_schedules CASCADE;
DROP TABLE IF EXISTS transport_modes CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- ========================================
-- REFERENCE TABLES (from official specs)
-- ========================================

-- Countries table (ISO 3166-1 standard)
CREATE TABLE countries (
    country_code VARCHAR(2) PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carrier codes table (NMFTA SCAC codes from official specs)
CREATE TABLE carrier_codes (
    carrier_code VARCHAR(4) PRIMARY KEY,
    carrier_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport modes table (from P2P API spec)
CREATE TABLE transport_modes (
    mode_code VARCHAR(3) PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location types table (from Locations API spec)
CREATE TABLE location_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VESSELS API (v3.0.2) - Official Structure
-- ========================================

-- Vessels table (exact match with official spec)
CREATE TABLE vessels (
    vessel_imo_number INTEGER PRIMARY KEY,  -- Changed to INTEGER per official spec
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

-- ========================================
-- LOCATIONS API (v4.0.0) - Official Structure
-- ========================================

-- Base Location table (from official Location schema)
CREATE TABLE locations (
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

-- Carrier Location table (from official CarrierLocation schema)
CREATE TABLE carrier_locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY REFERENCES locations(carrier_geo_id),
    carrier_rkts_code VARCHAR(10),
    carrier_rkst_code VARCHAR(10),
    time_zone_id VARCHAR(50),
    carrier_country_geo_id VARCHAR(13),
    alternate_aliases TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- P2P SCHEDULES API (v2.2.0) - Official Structure
-- ========================================

-- Ocean Products table (from official OceanProduct schema)
CREATE TABLE ocean_products (
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

-- Transport Schedules table (from official TransportSchedule schema)
CREATE TABLE transport_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocean_product_id UUID REFERENCES ocean_products(id),
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    transit_time VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport Legs table (from official TransportLeg schema)
CREATE TABLE transport_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_schedule_id UUID REFERENCES transport_schedules(id),
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transports table (from official Transport schema)
CREATE TABLE transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_leg_id UUID REFERENCES transport_legs(id),
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

-- Facilities table (from official Facility schema)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_leg_id UUID REFERENCES transport_legs(id),
    carrier_site_geo_id VARCHAR(13),
    location_type VARCHAR(50),
    location_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UN Location Codes table (from official UNLocationCode schema)
CREATE TABLE un_location_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id),
    un_location_code VARCHAR(5),
    city_un_location_code VARCHAR(5),
    site_un_location_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DEADLINES API (v2.1.0) - Official Structure
-- ========================================

-- Shipment Deadlines table (from official ShipmentDeadline schema)
CREATE TABLE shipment_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_imo_number INTEGER REFERENCES vessels(vessel_imo_number),
    voyage VARCHAR(4),
    port_of_load VARCHAR(100),
    iso_country_code VARCHAR(2) REFERENCES countries(country_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deadlines table (from official Deadline schema)
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_deadline_id UUID REFERENCES shipment_deadlines(id),
    deadline_name VARCHAR(100),
    deadline_local TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Deadline table (from official ShipmentDeadline schema)
CREATE TABLE shipment_deadline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_deadlines_id UUID REFERENCES shipment_deadlines(id),
    terminal_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Vessels indexes
CREATE INDEX idx_vessels_imo_number ON vessels(vessel_imo_number);
CREATE INDEX idx_vessels_carrier_code ON vessels(carrier_vessel_code);

-- Locations indexes
CREATE INDEX idx_locations_carrier_geo_id ON locations(carrier_geo_id);
CREATE INDEX idx_locations_country_code ON locations(country_code);
CREATE INDEX idx_locations_city_name ON locations(city_name);

-- Ocean Products indexes
CREATE INDEX idx_ocean_products_carrier_code ON ocean_products(vessel_operator_carrier_code);
CREATE INDEX idx_ocean_products_valid_dates ON ocean_products(product_valid_from_date, product_valid_to_date);

-- Transport Schedules indexes
CREATE INDEX idx_transport_schedules_ocean_product_id ON transport_schedules(ocean_product_id);
CREATE INDEX idx_transport_schedules_dates ON transport_schedules(departure_date_time, arrival_date_time);

-- Transport Legs indexes
CREATE INDEX idx_transport_legs_schedule_id ON transport_legs(transport_schedule_id);

-- Transports indexes
CREATE INDEX idx_transports_leg_id ON transports(transport_leg_id);
CREATE INDEX idx_transports_vessel_imo ON transports(vessel_imo_number);

-- Facilities indexes
CREATE INDEX idx_facilities_leg_id ON facilities(transport_leg_id);

-- Deadlines indexes
CREATE INDEX idx_deadlines_shipment_id ON deadlines(shipment_deadline_id);
CREATE INDEX idx_shipment_deadlines_vessel_imo ON shipment_deadlines(vessel_imo_number);

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
ALTER TABLE carrier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocean_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_location_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_deadline ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (read-only)
CREATE POLICY "Allow authenticated read access" ON countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON carrier_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON transport_modes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON location_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON vessels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON carrier_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON ocean_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON transport_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON transport_legs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON transports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON un_location_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON shipment_deadlines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON deadlines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON shipment_deadline FOR SELECT TO authenticated USING (true);

-- Create policies for service_role (full access)
CREATE POLICY "Allow service role full access" ON countries FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON carrier_codes FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON transport_modes FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON location_types FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON vessels FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON locations FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON carrier_locations FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON ocean_products FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON transport_schedules FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON transport_legs FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON transports FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON facilities FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON un_location_codes FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON shipment_deadlines FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON deadlines FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON shipment_deadline FOR ALL TO service_role USING (true);

-- ========================================
-- UPDATED_AT TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
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
CREATE TRIGGER update_carrier_locations_updated_at BEFORE UPDATE ON carrier_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ocean_products_updated_at BEFORE UPDATE ON ocean_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_schedules_updated_at BEFORE UPDATE ON transport_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_legs_updated_at BEFORE UPDATE ON transport_legs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transports_updated_at BEFORE UPDATE ON transports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_un_location_codes_updated_at BEFORE UPDATE ON un_location_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipment_deadlines_updated_at BEFORE UPDATE ON shipment_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipment_deadline_updated_at BEFORE UPDATE ON shipment_deadline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE REFERENCE DATA
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
('FR', 'France');

-- Insert sample carrier codes
INSERT INTO carrier_codes (carrier_code, carrier_name, description) VALUES
('MAEU', 'Maersk Line', 'Maersk Line container shipping'),
('MSCU', 'MSC', 'Mediterranean Shipping Company'),
('CMDU', 'CMA CGM', 'CMA CGM Group'),
('COSU', 'COSCO', 'COSCO Shipping Lines'),
('EVER', 'Evergreen', 'Evergreen Marine Corporation');

-- Insert sample transport modes
INSERT INTO transport_modes (mode_code, mode_name, description) VALUES
('VSL', 'Vessel', 'Ocean vessel transport'),
('TRK', 'Truck', 'Road transport'),
('TRN', 'Train', 'Rail transport'),
('AIR', 'Air', 'Air transport');

-- Insert sample location types
INSERT INTO location_types (type_code, type_name, description) VALUES
('PORT', 'Port', 'Seaport location'),
('CITY', 'City', 'City location'),
('AIRP', 'Airport', 'Airport location'),
('RAIL', 'Rail Station', 'Railway station'),
('WARE', 'Warehouse', 'Warehouse facility');

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
