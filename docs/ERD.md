# Entity Relationship Diagram (ERD) - Maersk Data Model

## Overview
This document describes the normalized database schema for the Maersk API integration, based on the analysis of four API contracts:
- Deadlines API
- Locations API  
- Point-to-Point Schedules API
- Vessels API

## Database Schema

```mermaid
erDiagram
    %% Reference Tables
    countries {
        varchar(2) country_code PK
        varchar(100) country_name
        timestamptz created_at
        timestamptz updated_at
    }

    carrier_codes {
        varchar(4) carrier_code PK
        varchar(100) carrier_name
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    transport_modes {
        varchar(3) mode_code PK
        varchar(50) mode_name
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    location_types {
        varchar(20) type_code PK
        varchar(50) type_name
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    %% Main Tables
    vessels {
        varchar(7) vessel_imo_number PK
        varchar(3) carrier_vessel_code
        varchar(18) vessel_short_name
        varchar(35) vessel_long_name
        varchar(2) vessel_flag_code
        integer vessel_built_year
        varchar(10) vessel_call_sign
        integer vessel_capacity_teu
        timestamptz created_at
        timestamptz updated_at
    }

    locations {
        varchar(13) carrier_geo_id PK
        varchar(2) country_code FK
        varchar(100) city_name
        varchar(5) un_location_code
        varchar(3) un_region_code
        varchar(100) un_region_name
        varchar(20) location_type FK
        varchar(100) location_name
        varchar(50) time_zone_id
        varchar(13) carrier_country_geo_id
        timestamptz created_at
        timestamptz updated_at
    }

    facilities {
        uuid id PK
        varchar(13) location_geo_id FK
        varchar(20) facility_type
        varchar(100) facility_name
        varchar(13) carrier_site_geo_id
        varchar(5) site_un_location_code
        timestamptz created_at
        timestamptz updated_at
    }

    point_to_point_schedules {
        uuid id PK
        varchar(50) carrier_product_id
        varchar(50) carrier_product_sequence_id
        varchar(4) vessel_operator_carrier_code FK
        varchar(13) collection_origin_geo_id FK
        varchar(13) delivery_destination_geo_id FK
        date product_valid_from_date
        date product_valid_to_date
        integer number_of_product_links
        timestamptz created_at
        timestamptz updated_at
    }

    transport_legs {
        uuid id PK
        uuid schedule_id FK
        timestamptz departure_date_time
        timestamptz arrival_date_time
        varchar(7) vessel_imo_number FK
        varchar(3) transport_mode FK
        varchar(100) carrier_trade_lane_name
        varchar(4) carrier_departure_voyage_number
        varchar(1) inducement_link_flag
        varchar(3) carrier_service_code
        varchar(100) carrier_service_name
        varchar(10) link_direction
        varchar(3) carrier_code
        varchar(1) routing_type
        varchar(13) start_location_geo_id FK
        varchar(13) end_location_geo_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    deadlines {
        uuid id PK
        varchar(7) vessel_imo_number FK
        varchar(4) voyage
        varchar(100) port_of_load
        varchar(2) iso_country_code FK
        varchar(100) terminal_name
        varchar(100) deadline_name
        timestamptz deadline_local
        timestamptz created_at
        timestamptz updated_at
    }

    %% Relationships
    countries ||--o{ locations : "has"
    countries ||--o{ deadlines : "has"
    
    carrier_codes ||--o{ point_to_point_schedules : "operates"
    
    transport_modes ||--o{ transport_legs : "used_in"
    
    location_types ||--o{ locations : "categorizes"
    
    vessels ||--o{ transport_legs : "assigned_to"
    vessels ||--o{ deadlines : "has"
    
    locations ||--o{ facilities : "contains"
    locations ||--o{ point_to_point_schedules : "origin"
    locations ||--o{ point_to_point_schedules : "destination"
    locations ||--o{ transport_legs : "start"
    locations ||--o{ transport_legs : "end"
    
    point_to_point_schedules ||--o{ transport_legs : "contains"
```

## Table Descriptions

### Reference Tables

#### `countries`
- **Purpose**: Stores ISO 3166-1 country codes and names
- **Key Fields**: `country_code` (PK), `country_name`
- **Relations**: Referenced by `locations` and `deadlines`

#### `carrier_codes`
- **Purpose**: Stores SCAC (Standard Carrier Alpha Codes) for shipping companies
- **Key Fields**: `carrier_code` (PK), `carrier_name`
- **Relations**: Referenced by `point_to_point_schedules`

#### `transport_modes`
- **Purpose**: Defines different transportation modes (vessel, truck, rail, etc.)
- **Key Fields**: `mode_code` (PK), `mode_name`
- **Relations**: Referenced by `transport_legs`

#### `location_types`
- **Purpose**: Categorizes locations (city, terminal, depot, etc.)
- **Key Fields**: `type_code` (PK), `type_name`
- **Relations**: Referenced by `locations`

### Main Tables

#### `vessels`
- **Purpose**: Stores vessel information from Maersk fleet
- **Key Fields**: `vessel_imo_number` (PK), vessel details
- **Relations**: Referenced by `transport_legs` and `deadlines`

#### `locations`
- **Purpose**: Stores ports, cities, and other geographical locations
- **Key Fields**: `carrier_geo_id` (PK), location details
- **Relations**: Referenced by multiple tables for origin/destination

#### `facilities`
- **Purpose**: Stores terminals, depots, and other facilities
- **Key Fields**: `id` (PK), facility details
- **Relations**: Belongs to `locations`

#### `point_to_point_schedules`
- **Purpose**: Stores complete shipping schedules between origin and destination
- **Key Fields**: `id` (PK), schedule details
- **Relations**: Contains `transport_legs`, references `locations` and `carrier_codes`

#### `transport_legs`
- **Purpose**: Stores individual transport segments within a schedule
- **Key Fields**: `id` (PK), leg details
- **Relations**: Belongs to `point_to_point_schedules`, references `vessels` and `locations`

#### `deadlines`
- **Purpose**: Stores shipment deadlines for specific vessels and ports
- **Key Fields**: `id` (PK), deadline details
- **Relations**: References `vessels` and `countries`

## Key Design Decisions

### 1. Normalization
- **3NF Compliance**: All tables are normalized to eliminate redundancy
- **Foreign Keys**: Proper relationships established between tables
- **Reference Tables**: Separate tables for codes and types to maintain data integrity

### 2. Performance Optimization
- **Indexes**: Created on frequently queried fields
- **Composite Indexes**: For date ranges and common query patterns
- **UUID Primary Keys**: For tables that don't have natural business keys

### 3. Data Integrity
- **Constraints**: Foreign key constraints ensure referential integrity
- **Triggers**: Automatic `updated_at` timestamp updates
- **RLS**: Row Level Security enabled on all tables

### 4. API Alignment
- **Field Mapping**: Direct mapping from API response fields
- **Data Types**: Appropriate PostgreSQL types for each field
- **Nullable Fields**: Handles optional API fields properly

## Sample Queries

### Get Schedule with All Legs
```sql
SELECT 
    s.carrier_product_id,
    s.collection_origin_geo_id,
    s.delivery_destination_geo_id,
    tl.departure_date_time,
    tl.arrival_date_time,
    v.vessel_long_name,
    tm.mode_name
FROM point_to_point_schedules s
JOIN transport_legs tl ON s.id = tl.schedule_id
LEFT JOIN vessels v ON tl.vessel_imo_number = v.vessel_imo_number
LEFT JOIN transport_modes tm ON tl.transport_mode = tm.mode_code
WHERE s.collection_origin_geo_id = 'GEO1234567890'
ORDER BY tl.departure_date_time;
```

### Get Deadlines for Vessel
```sql
SELECT 
    d.deadline_name,
    d.deadline_local,
    d.terminal_name,
    c.country_name
FROM deadlines d
JOIN countries c ON d.iso_country_code = c.country_code
WHERE d.vessel_imo_number = '1234567'
ORDER BY d.deadline_local;
```

### Get Locations by Type
```sql
SELECT 
    l.city_name,
    l.location_name,
    lt.type_name,
    c.country_name
FROM locations l
JOIN location_types lt ON l.location_type = lt.type_code
JOIN countries c ON l.country_code = c.country_code
WHERE lt.type_code = 'TERMINAL'
ORDER BY l.city_name;
```

## Migration Notes

- **UUID Extension**: Required for UUID primary keys
- **RLS Policies**: Basic read/write access for authenticated users
- **Sample Data**: Reference tables populated with common values
- **Triggers**: Automatic timestamp updates on all tables
