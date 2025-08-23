# Соответствие базы данных официальным спецификациям Maersk API

## Обзор

Данная миграция полностью перестраивает схему базы данных в соответствии с официальными OpenAPI спецификациями Maersk API:

- **Deadlines API v2.1.0** - `deadlines_v2-1_08082024_scalar_spec.yaml`
- **Locations API v4.0.0** - `locations_v4_21062921_scalar_specs.yaml`
- **P2P Schedules API v2.2.0** - `p2p_schedules_v2-2_13082024_scalar_spec.yaml`
- **Vessels API v3.0.2** - `vessels_v3-0-2_11082023_scalar_spec.yaml`

## Ключевые изменения

### 1. Типы данных приведены в соответствие с официальными спецификациями

#### Vessels API
- `vessel_imo_number`: изменен с `VARCHAR` на `INTEGER` (официальный тип)
- `carrier_vessel_code`: `VARCHAR(3)` (точно по спецификации)
- `vessel_short_name`: `VARCHAR(18)` (точно по спецификации)
- `vessel_long_name`: `VARCHAR(35)` (точно по спецификации)

#### Locations API
- `carrier_geo_id`: `VARCHAR(13)` (точно по спецификации)
- `un_location_code`: `VARCHAR(5)` (точно по спецификации)
- `un_region_code`: `VARCHAR(3)` (точно по спецификации)

#### P2P Schedules API
- `carrier_product_id`: `VARCHAR(50)` (точно по спецификации)
- `carrier_departure_voyage_number`: `VARCHAR(4)` (точно по спецификации)
- `carrier_service_code`: `VARCHAR(3)` (точно по спецификации)

### 2. Структура таблиц полностью соответствует официальным схемам

#### Vessels API (v3.0.2)
```sql
CREATE TABLE vessels (
    vessel_imo_number INTEGER PRIMARY KEY,  -- Официальный тип
    carrier_vessel_code VARCHAR(3) NOT NULL,
    vessel_short_name VARCHAR(18),
    vessel_long_name VARCHAR(35),
    vessel_flag_code VARCHAR(2) REFERENCES countries(country_code),
    vessel_built_year INTEGER,
    vessel_call_sign VARCHAR(10),
    vessel_capacity_teu INTEGER
);
```

#### Locations API (v4.0.0)
```sql
-- Base Location (официальная схема Location)
CREATE TABLE locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY,
    country_code VARCHAR(2) REFERENCES countries(country_code),
    country_name VARCHAR(100),
    un_location_code VARCHAR(5),
    city_name VARCHAR(100),
    un_region_code VARCHAR(3),
    un_region_name VARCHAR(100),
    location_type VARCHAR(50) REFERENCES location_types(type_code),
    location_name VARCHAR(100)
);

-- Carrier Location (официальная схема CarrierLocation)
CREATE TABLE carrier_locations (
    carrier_geo_id VARCHAR(13) PRIMARY KEY REFERENCES locations(carrier_geo_id),
    carrier_rkts_code VARCHAR(10),
    carrier_rkst_code VARCHAR(10),
    time_zone_id VARCHAR(50),
    carrier_country_geo_id VARCHAR(13),
    alternate_aliases TEXT[]
);
```

#### P2P Schedules API (v2.2.0)
```sql
-- Ocean Products (официальная схема OceanProducts)
CREATE TABLE ocean_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_operator_carrier_code VARCHAR(4) REFERENCES carrier_codes(carrier_code),
    carrier_product_id VARCHAR(50),
    carrier_product_sequence_id VARCHAR(50),
    product_valid_from_date DATE,
    product_valid_to_date DATE,
    numberOfProductLinks VARCHAR(10)
);

-- Transport Schedules (официальная схема TransportSchedules)
CREATE TABLE transport_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ocean_product_id UUID REFERENCES ocean_products(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE,
    transit_time VARCHAR(10)
);

-- Transport Legs (официальная схема TransportLeg)
CREATE TABLE transport_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transport_schedule_id UUID REFERENCES transport_schedules(id) ON DELETE CASCADE,
    departure_date_time TIMESTAMP WITH TIME ZONE,
    arrival_date_time TIMESTAMP WITH TIME ZONE
);

-- Transport (официальная схема Transport)
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
    routing_type VARCHAR(1)
);
```

#### Deadlines API (v2.1.0)
```sql
-- Shipment Deadlines (официальная схема ShipmentDeadlines)
CREATE TABLE shipment_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_imo_number INTEGER REFERENCES vessels(vessel_imo_number),
    voyage VARCHAR(4),
    port_of_load VARCHAR(100),
    iso_country_code VARCHAR(2) REFERENCES countries(country_code)
);

-- Shipment Deadline (официальная схема ShipmentDeadline)
CREATE TABLE shipment_deadline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_deadlines_id UUID REFERENCES shipment_deadlines(id) ON DELETE CASCADE,
    terminal_name VARCHAR(100)
);

-- Deadline (официальная схема Deadline)
CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_deadline_id UUID REFERENCES shipment_deadline(id) ON DELETE CASCADE,
    deadline_name VARCHAR(100),
    deadline_local TIMESTAMP WITH TIME ZONE
);
```

### 3. Справочные таблицы основаны на официальных спецификациях

#### Carrier Codes (NMFTA SCAC codes)
```sql
CREATE TABLE carrier_codes (
    carrier_code VARCHAR(4) PRIMARY KEY,  -- NMFTA SCAC code
    carrier_name VARCHAR(100) NOT NULL,
    description TEXT
);
```

**Официальные коды перевозчиков Maersk:**
- `MAEU` - Maersk A/S
- `SEAU` - Maersk A/S trading as Sealand Americas
- `SEJJ` - Sealand Europe A/S
- `MCPU` - Sealand Maersk Asia Pte. Ltd.
- `MAEI` - Maersk Line Limited

#### Transport Modes (из P2P API spec)
```sql
CREATE TABLE transport_modes (
    mode_code VARCHAR(3) PRIMARY KEY,
    mode_name VARCHAR(50) NOT NULL,
    description TEXT
);
```

**Официальные режимы транспортировки:**
- `BAR` - Barge
- `BCO` - Barge - Combined Transport
- `DST` - Doublestack
- `FEF` - Foreign Feeder
- `FEO` - Maersk Owned Feeder
- `MVS` - Mother Vessel
- `RCO` - Railroad - Combined
- `RR` - Railroad
- `SSH` - Equalization
- `TRK` - Truck
- `VSF` - VSA Feeder
- `VSL` - USA Feeder
- `VSM` - VSA Mother VSL

#### Location Types (из Locations API spec)
```sql
CREATE TABLE location_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT
);
```

**Официальные типы локаций:**
- `CITY` - City
- `COUNTRY` - Country
- `TERMINAL` - Terminal
- `BARGE TERMINAL` - Barge Terminal
- `RAIL TERMINAL` - Rail Terminal
- `CONTAINER FREIGHT STATION` - Container Freight Station
- `CUSTOMER LOCATION` - Customer Location
- `DEPOT` - Depot

### 4. Связи между таблицами соответствуют официальным спецификациям

#### Иерархия P2P Schedules API:
```
ocean_products
    ↓ (1:N)
transport_schedules
    ↓ (1:N)
transport_legs
    ↓ (1:N)
transports
    ↓ (1:N)
facilities
    ↓ (1:N)
un_location_codes
```

#### Иерархия Deadlines API:
```
shipment_deadlines
    ↓ (1:N)
shipment_deadline
    ↓ (1:N)
deadlines
```

### 5. Индексы оптимизированы для производительности

Созданы индексы для всех ключевых полей поиска:
- `vessel_imo_number` для поиска по судам
- `carrier_geo_id` для поиска по локациям
- `carrier_product_id` для поиска по продуктам
- `departure_date_time` и `arrival_date_time` для поиска по датам
- `transport_mode` для фильтрации по режиму транспортировки

### 6. Row Level Security (RLS)

Включена RLS для всех таблиц с политиками:
- **authenticated** - только чтение
- **service_role** - полный доступ (для API операций)

### 7. Автоматическое обновление временных меток

Все таблицы имеют триггеры для автоматического обновления `updated_at` при изменении записей.

## Преимущества новой структуры

1. **100% соответствие официальным спецификациям** - все типы данных и структуры точно соответствуют OpenAPI схемам
2. **Улучшенная производительность** - оптимизированные индексы и связи
3. **Масштабируемость** - правильная нормализация данных
4. **Безопасность** - RLS политики для контроля доступа
5. **Поддержка** - четкая документация и соответствие стандартам

## Миграция данных

При применении этой миграции:
1. Все существующие таблицы удаляются
2. Создаются новые таблицы с правильной структурой
3. Добавляются справочные данные
4. Настраиваются индексы и RLS

**Внимание:** Эта миграция удаляет все существующие данные. Убедитесь, что у вас есть резервная копия перед применением.
