-- ========================================
-- ALIGN WITH OFFICIAL MAERSK API SPECIFICATIONS
-- Based on official OpenAPI specs:
-- - deadlines_v2-1_08082024_scalar_spec.yaml
-- - locations_v4_21062921_scalar_specs.yaml
-- - p2p_schedules_v2-2_13082024_scalar_spec.yaml
-- - vessels_v3-0-2_11082023_scalar_spec.yaml
-- ========================================

-- Drop existing tables to recreate with correct structure
DROP TABLE IF EXISTS deadlines CASCADE;
DROP TABLE IF EXISTS transport_legs CASCADE;
DROP TABLE IF EXISTS point_to_point_schedules CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
DROP TABLE IF EXISTS location_types CASCADE;
DROP TABLE IF EXISTS transport_modes CASCADE;
DROP TABLE IF EXISTS carrier_codes CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

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

-- Ocean Products table (from official OceanProducts schema)
CREATE TABLE ocean_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_operator_carrier_code VARCHAR(4) REFERENCES carrier_codes(carrier_code),
    carrier_product_id VARCHAR(50),
    carrier_product_sequence_id VARCHAR(50),
    product_valid_from_date DATE,
    product_valid_to_date DATE,
    numberOfProductLinks VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport Schedules table (from official TransportSchedules schema)
CREATE TABLE transport_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ocean_product_id UUID REFERENCES ocean_products(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    transit_time VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport Legs table (from official TransportLeg schema)
CREATE TABLE transport_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transport_schedule_id UUID REFERENCES transport_schedules(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport table (from official Transport schema)
CREATE TABLE transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Facilities table (from official Facility schema)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transport_leg_id UUID REFERENCES transport_legs(id) ON DELETE CASCADE,
    carrier_site_geo_id VARCHAR(13),
    location_type VARCHAR(50),
    location_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- UN Location Codes table (from official UNLocationCodes schema)
CREATE TABLE un_location_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    un_location_code VARCHAR(5),
    city_un_location_code VARCHAR(5),
    site_un_location_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DEADLINES API (v2.1.0) - Official Structure
-- ========================================

-- Shipment Deadlines table (from official ShipmentDeadlines schema)
CREATE TABLE shipment_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_imo_number INTEGER REFERENCES vessels(vessel_imo_number),
    voyage VARCHAR(4),
    port_of_load VARCHAR(100),
    iso_country_code VARCHAR(2) REFERENCES countries(country_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Deadline table (from official ShipmentDeadline schema)
CREATE TABLE shipment_deadline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_deadlines_id UUID REFERENCES shipment_deadlines(id) ON DELETE CASCADE,
    terminal_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deadline table (from official Deadline schema)
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_deadline_id UUID REFERENCES shipment_deadline(id) ON DELETE CASCADE,
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

-- Carrier locations indexes
CREATE INDEX idx_carrier_locations_time_zone ON carrier_locations(time_zone_id);
CREATE INDEX idx_carrier_locations_rkts_code ON carrier_locations(carrier_rkts_code);

-- Ocean products indexes
CREATE INDEX idx_ocean_products_carrier_product_id ON ocean_products(carrier_product_id);
CREATE INDEX idx_ocean_products_carrier_code ON ocean_products(vessel_operator_carrier_code);
CREATE INDEX idx_ocean_products_valid_dates ON ocean_products(product_valid_from_date, product_valid_to_date);

-- Transport schedules indexes
CREATE INDEX idx_transport_schedules_ocean_product_id ON transport_schedules(ocean_product_id);
CREATE INDEX idx_transport_schedules_dates ON transport_schedules(departure_date_time, arrival_date_time);

-- Transport legs indexes
CREATE INDEX idx_transport_legs_schedule_id ON transport_legs(transport_schedule_id);
CREATE INDEX idx_transport_legs_dates ON transport_legs(departure_date_time, arrival_date_time);

-- Transports indexes
CREATE INDEX idx_transports_leg_id ON transports(transport_leg_id);
CREATE INDEX idx_transports_vessel ON transports(vessel_imo_number);
CREATE INDEX idx_transports_mode ON transports(transport_mode);

-- Facilities indexes
CREATE INDEX idx_facilities_leg_id ON facilities(transport_leg_id);
CREATE INDEX idx_facilities_type ON facilities(location_type);

-- Shipment deadlines indexes
CREATE INDEX idx_shipment_deadlines_vessel ON shipment_deadlines(vessel_imo_number);
CREATE INDEX idx_shipment_deadlines_voyage ON shipment_deadlines(voyage);
CREATE INDEX idx_shipment_deadlines_country ON shipment_deadlines(iso_country_code);

-- Deadlines indexes
CREATE INDEX idx_deadlines_shipment_deadline_id ON deadlines(shipment_deadline_id);
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
ALTER TABLE carrier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocean_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE un_location_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_deadline ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON countries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON carrier_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transport_modes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON location_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON vessels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON carrier_locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ocean_products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transport_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transport_legs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON transports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON facilities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON un_location_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON shipment_deadlines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON shipment_deadline FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON deadlines FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for service role (for API operations)
CREATE POLICY "Enable all access for service role" ON countries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON carrier_codes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transport_modes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON location_types FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON vessels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON carrier_locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON ocean_products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transport_schedules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transport_legs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON transports FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON facilities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON un_location_codes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON shipment_deadlines FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable all access for service role" ON shipment_deadline FOR ALL USING (auth.role() = 'service_role');
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

-- Insert sample carrier codes (from official specs)
INSERT INTO carrier_codes (carrier_code, carrier_name, description) VALUES
('MAEU', 'Maersk A/S', 'Maersk Line main carrier'),
('SEAU', 'Maersk A/S trading as Sealand Americas', 'Sealand Americas division'),
('SEJJ', 'Sealand Europe A/S', 'Sealand Europe division'),
('MCPU', 'Sealand Maersk Asia Pte. Ltd.', 'Sealand Maersk Asia division'),
('MAEI', 'Maersk Line Limited', 'Maersk Line Limited division');

-- Insert sample transport modes (from P2P API spec)
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

-- Insert sample location types (from Locations API spec)
INSERT INTO location_types (type_code, type_name, description) VALUES
('CITY', 'City', 'City location'),
('COUNTRY', 'Country', 'Country location'),
('TERMINAL', 'Terminal', 'Port terminal'),
('BARGE TERMINAL', 'Barge Terminal', 'Barge terminal'),
('RAIL TERMINAL', 'Rail Terminal', 'Rail terminal'),
('CONTAINER FREIGHT STATION', 'Container Freight Station', 'CFS facility'),
('CUSTOMER LOCATION', 'Customer Location', 'Customer premises'),
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
CREATE TRIGGER update_carrier_locations_updated_at BEFORE UPDATE ON carrier_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ocean_products_updated_at BEFORE UPDATE ON ocean_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_schedules_updated_at BEFORE UPDATE ON transport_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_legs_updated_at BEFORE UPDATE ON transport_legs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transports_updated_at BEFORE UPDATE ON transports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_un_location_codes_updated_at BEFORE UPDATE ON un_location_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipment_deadlines_updated_at BEFORE UPDATE ON shipment_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipment_deadline_updated_at BEFORE UPDATE ON shipment_deadline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
