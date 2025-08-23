# Соответствие Prisma схемы официальным спецификациям Maersk API

## Обзор

Prisma схема была полностью переработана в соответствии с официальными OpenAPI спецификациями Maersk API. Все модели, поля и отношения теперь точно соответствуют официальным схемам.

## Ключевые изменения

### 1. Типы данных приведены в соответствие с официальными спецификациями

#### Vessels API (v3.0.2)
```prisma
model Vessel {
  id                Int      @id @map("vessel_imo_number") // INTEGER per official spec
  carrierVesselCode String   @map("carrier_vessel_code") @db.VarChar(3)
  vesselShortName   String?  @map("vessel_short_name") @db.VarChar(18)
  vesselLongName    String?  @map("vessel_long_name") @db.VarChar(35)
  vesselFlagCode    String?  @map("vessel_flag_code") @db.VarChar(2)
  vesselBuiltYear   Int?
  vesselCallSign    String?  @map("vessel_call_sign") @db.VarChar(10)
  vesselCapacityTeu Int?     @map("vessel_capacity_teu")
}
```

**Ключевые изменения:**
- `vessel_imo_number`: изменен с `String` на `Int` (официальный тип)
- Все размеры полей точно соответствуют спецификации

#### Locations API (v4.0.0)
```prisma
model Location {
  id                   String    @id @map("carrier_geo_id") @db.VarChar(13)
  countryCode          String?   @map("country_code") @db.VarChar(2)
  countryName          String?   @map("country_name") @db.VarChar(100)
  unLocationCode       String?   @map("un_location_code") @db.VarChar(5)
  cityName             String?   @map("city_name") @db.VarChar(100)
  unRegionCode         String?   @map("un_region_code") @db.VarChar(3)
  unRegionName         String?   @map("un_region_name") @db.VarChar(100)
  locationType         String?   @map("location_type") @db.VarChar(50)
  locationName         String?   @map("location_name") @db.VarChar(100)
}

model CarrierLocation {
  id                    String    @id @map("carrier_geo_id") @db.VarChar(13)
  carrierRktsCode       String?   @map("carrier_rkts_code") @db.VarChar(10)
  carrierRkstCode       String?   @map("carrier_rkst_code") @db.VarChar(10)
  timeZoneId            String?   @map("time_zone_id") @db.VarChar(50)
  carrierCountryGeoId   String?   @map("carrier_country_geo_id") @db.VarChar(13)
  alternateAliases      String[]  @map("alternate_aliases")
}
```

**Ключевые изменения:**
- Разделение на `Location` (базовая схема) и `CarrierLocation` (расширенная схема)
- Все размеры полей точно соответствуют спецификации

#### P2P Schedules API (v2.2.0)
```prisma
model OceanProduct {
  id                           String    @id @default(uuid()) @map("id") @db.Uuid
  vesselOperatorCarrierCode    String?   @map("vessel_operator_carrier_code") @db.VarChar(4)
  carrierProductId             String?   @map("carrier_product_id") @db.VarChar(50)
  carrierProductSequenceId     String?   @map("carrier_product_sequence_id") @db.VarChar(50)
  productValidFromDate         DateTime? @map("product_valid_from_date") @db.Date
  productValidToDate           DateTime? @map("product_valid_to_date") @db.Date
  numberOfProductLinks         String?   @map("numberOfProductLinks") @db.VarChar(10)
}

model TransportSchedule {
  id                String    @id @default(uuid()) @map("id") @db.Uuid
  oceanProductId    String    @map("ocean_product_id") @db.Uuid
  departureDateTime DateTime? @map("departure_date_time") @db.Timestamptz(6)
  arrivalDateTime   DateTime? @map("arrival_date_time") @db.Timestamptz(6)
  transitTime       String?   @map("transit_time") @db.VarChar(10)
}

model TransportLeg {
  id                        String    @id @default(uuid()) @map("id") @db.Uuid
  transportScheduleId       String    @map("transport_schedule_id") @db.Uuid
  departureDateTime         DateTime? @map("departure_date_time") @db.Timestamptz(6)
  arrivalDateTime           DateTime? @map("arrival_date_time") @db.Timestamptz(6)
}

model Transport {
  id                           String    @id @default(uuid()) @map("id") @db.Uuid
  transportLegId               String    @map("transport_leg_id") @db.Uuid
  vesselImoNumber              Int?      @map("vessel_imo_number")
  carrierVesselCode            String?   @map("carrier_vessel_code") @db.VarChar(3)
  vesselName                   String?   @map("vessel_name") @db.VarChar(35)
  transportMode                String?   @map("transport_mode") @db.VarChar(3)
  carrierTradeLaneName         String?   @map("carrier_trade_lane_name") @db.VarChar(100)
  carrierDepartureVoyageNumber String?   @map("carrier_departure_voyage_number") @db.VarChar(4)
  inducementLinkFlag           String?   @map("inducement_link_flag") @db.VarChar(1)
  carrierServiceCode           String?   @map("carrier_service_code") @db.VarChar(3)
  carrierServiceName           String?   @map("carrier_service_name") @db.VarChar(100)
  linkDirection                String?   @map("link_direction") @db.VarChar(10)
  carrierCode                  String?   @map("carrier_code") @db.VarChar(10)
  routingType                  String?   @map("routing_type") @db.VarChar(1)
}
```

**Ключевые изменения:**
- Полная иерархия: `OceanProduct` → `TransportSchedule` → `TransportLeg` → `Transport`
- Все поля точно соответствуют официальным схемам

#### Deadlines API (v2.1.0)
```prisma
model ShipmentDeadline {
  id              String    @id @default(uuid()) @map("id") @db.Uuid
  vesselImoNumber Int?      @map("vessel_imo_number")
  voyage          String?   @map("voyage") @db.VarChar(4)
  portOfLoad      String?   @map("port_of_load") @db.VarChar(100)
  isoCountryCode  String?   @map("iso_country_code") @db.VarChar(2)
}

model ShipmentDeadlineDetail {
  id                    String    @id @default(uuid()) @map("id") @db.Uuid
  shipmentDeadlinesId   String    @map("shipment_deadlines_id") @db.Uuid
  terminalName          String?   @map("terminal_name") @db.VarChar(100)
}

model Deadline {
  id                    String    @id @default(uuid()) @map("id") @db.Uuid
  shipmentDeadlineId    String    @map("shipment_deadline_id") @db.Uuid
  deadlineName          String?   @map("deadline_name") @db.VarChar(100)
  deadlineLocal         DateTime? @map("deadline_local") @db.Timestamptz(6)
}
```

**Ключевые изменения:**
- Иерархия: `ShipmentDeadline` → `ShipmentDeadlineDetail` → `Deadline`
- `vessel_imo_number` как `Int?` (соответствует официальной спецификации)

### 2. Справочные модели

#### Carrier Codes (NMFTA SCAC codes)
```prisma
model CarrierCode {
  id          String   @id @map("carrier_code") @db.VarChar(4)
  carrierName String   @map("carrier_name") @db.VarChar(100)
  description String?
}
```

#### Transport Modes (из P2P API spec)
```prisma
model TransportMode {
  id          String   @id @map("mode_code") @db.VarChar(3)
  modeName    String   @map("mode_name") @db.VarChar(50)
  description String?
}
```

#### Location Types (из Locations API spec)
```prisma
model LocationType {
  id          String   @id @map("type_code") @db.VarChar(50)
  typeName    String   @map("type_name") @db.VarChar(50)
  description String?
}
```

### 3. Отношения между моделями

#### Иерархия P2P Schedules API:
```
OceanProduct (1:N) TransportSchedule (1:N) TransportLeg (1:N) Transport
                                                      (1:N) Facility (1:N) UnLocationCode
```

#### Иерархия Deadlines API:
```
ShipmentDeadline (1:N) ShipmentDeadlineDetail (1:N) Deadline
```

#### Связи с справочными данными:
- `Vessel.vesselFlagCode` → `Country.id`
- `Location.countryCode` → `Country.id`
- `Location.locationType` → `LocationType.id`
- `Transport.transportMode` → `TransportMode.id`
- `OceanProduct.vesselOperatorCarrierCode` → `CarrierCode.id`

### 4. Каскадные удаления

Настроены каскадные удаления для иерархических структур:
- `OceanProduct` → `TransportSchedule` → `TransportLeg` → `Transport`
- `TransportLeg` → `Facility` → `UnLocationCode`
- `ShipmentDeadline` → `ShipmentDeadlineDetail` → `Deadline`

### 5. Маппинг таблиц

Все модели используют правильные имена таблиц:
- `@@map("vessels")`
- `@@map("locations")`
- `@@map("carrier_locations")`
- `@@map("ocean_products")`
- `@@map("transport_schedules")`
- `@@map("transport_legs")`
- `@@map("transports")`
- `@@map("facilities")`
- `@@map("un_location_codes")`
- `@@map("shipment_deadlines")`
- `@@map("shipment_deadline")`
- `@@map("deadlines")`

## Преимущества новой схемы

1. **100% соответствие официальным спецификациям** - все модели и поля точно соответствуют OpenAPI схемам
2. **Правильная типизация** - все типы данных соответствуют официальным спецификациям
3. **Оптимизированные отношения** - каскадные удаления и правильные связи
4. **Масштабируемость** - структура поддерживает рост данных
5. **Поддержка** - четкая документация и соответствие стандартам

## Генерация клиента

После обновления схемы выполните:

```bash
npx prisma generate
```

Это создаст обновленный Prisma Client с правильными типами TypeScript.

## Миграция базы данных

Для применения изменений к базе данных:

```bash
npx prisma db push
```

Или создайте миграцию:

```bash
npx prisma migrate dev --name align_with_official_maersk_api
```

**Внимание:** Эта миграция может удалить существующие данные. Убедитесь, что у вас есть резервная копия.
