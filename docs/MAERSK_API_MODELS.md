# 🚢 Maersk API Models Documentation

## 📋 Overview

This document provides comprehensive documentation for the Maersk API data models based on the analysis of four API contracts:

1. **Locations API** (`locations_api.md`) - Geographic locations and facilities
2. **Vessels API** (`vessels_api.md`) - Vessel information and fleet data
3. **Point-to-Point Schedules API** (`p2p_api.md`) - Shipping schedules and routes
4. **Deadlines API** (`deadlines_api.md`) - Vessel and shipment deadlines

## 🔗 API Endpoints Summary

### Locations API
- **Base URL**: `https://api.maersk.com/reference-data`
- **Endpoints**:
  - `GET /locations` - Search locations with filters
  - `GET /carrier-locations/{carrierGeoID}` - Get location by Maersk Geo ID

### Vessels API
- **Base URL**: `https://api.maersk.com/reference-data`
- **Endpoints**:
  - `GET /vessels` - List active vessels with filters

### Point-to-Point Schedules API
- **Base URL**: `https://api.maersk.com/products`
- **Endpoints**:
  - `GET /ocean-products` - Get ocean product schedules

### Deadlines API
- **Base URL**: `https://api.maersk.com`
- **Endpoints**:
  - `GET /shipment-deadlines` - Get vessel/voyage deadlines

## 📊 Data Models

### 1. Location Model

**API Source**: Locations API

#### Core Fields
```typescript
interface Location {
  // Primary identifiers
  carrierGeoID: string;           // 13-char Maersk Geo ID
  countryCode: string;            // ISO 3166-1 2-letter code
  countryName: string;            // Full country name
  cityName: string;               // City name
  locationName: string;           // Specific location name
  
  // UN/LOCODE identifiers
  unLocationCode: string;         // 5-char UN location code
  unRegionCode: string;           // 2-3 char region code
  unRegionName: string;           // Region name
  
  // Classification
  locationType: LocationType;     // Type of location
  timeZoneId: string;             // Timezone identifier
  
  // Maersk internal codes
  carrierRktsCode: string;        // RKTS system code
  carrierRkstCode: string;        // RKST system code
  carrierCountryGeoId: string;    // Country Geo ID
  
  // Additional data
  alternateAliases: string[];     // Alternative names
}
```

#### Location Types
```typescript
enum LocationType {
  CITY = 'CITY',                           // City location
  COUNTRY = 'COUNTRY',                     // Country location
  TERMINAL = 'TERMINAL',                   // Port terminal
  BARGE_TERMINAL = 'BARGE_TERMINAL',       // Barge terminal
  RAIL_TERMINAL = 'RAIL_TERMINAL',         // Rail terminal
  CONTAINER_FREIGHT_ST = 'CONTAINER_FREIGHT_ST', // CFS facility
  CUSTOMER_LOCATION = 'CUSTOMER_LOCATION', // Customer premises
  DEPOT = 'DEPOT'                          // Depot facility
}
```

#### Search Parameters
```typescript
interface LocationSearchParams {
  locationType?: LocationType;
  countryCode?: string;           // ISO 3166-1 2-letter code
  countryName?: string;           // Partial country name
  cityName?: string;              // Partial city name (min 2 chars)
  unRegionCode?: string;          // UN region code
  unLocationCode?: string;        // UN location code
  vesselOperatorCarrierCode?: CarrierCode;
  sort?: string[];                // Sort order
  limit?: number;                 // 10-100, default 25
  page?: string;                  // Pagination token
}
```

### 2. Vessel Model

**API Source**: Vessels API

#### Core Fields
```typescript
interface Vessel {
  // Primary identifiers
  vesselImoNumber: string;        // 7-digit IMO number
  carrierVesselCode: string;      // 3-char Maersk code
  vesselShortName: string;        // 18-char vessel name
  vesselLongName: string;         // 35-char vessel name
  
  // Registration details
  vesselFlagCode: string;         // 2-letter flag country
  vesselBuiltYear: number;        // Year built
  vesselCallSign: string;         // ITU call sign
  
  // Capacity
  vesselCapacityTeu: number;      // TEU capacity
}
```

#### Search Parameters
```typescript
interface VesselSearchParams {
  vesselImoNumbers?: number[];    // Array of IMO numbers (1-50)
  carrierVesselCodes?: string[];  // Array of carrier codes (1-50)
  vesselNames?: string[];         // Array of vessel names (1-50)
  vesselFlagCodes?: string[];     // Array of flag codes (1-50)
}
```

### 3. Point-to-Point Schedule Model

**API Source**: P2P API

#### Core Fields
```typescript
interface PointToPointSchedule {
  // Product identification
  carrierProductId: string;       // Maersk product ID
  carrierProductSequenceId: string; // Product sequence ID
  vesselOperatorCarrierCode: CarrierCode; // Operating carrier
  
  // Origin and destination
  collectionOriginGeoId: string;  // Origin location Geo ID
  deliveryDestinationGeoId: string; // Destination location Geo ID
  
  // Validity period
  productValidFromDate: string;   // YYYY-MM-DD format
  productValidToDate: string;     // YYYY-MM-DD format
  numberOfProductLinks: string;   // Number of transport links
  
  // Cargo specifications
  cargoType: CargoType;           // DRY or REEF
  isoEquipmentCode: string;       // Container type (default: 42G1)
  stuffingWeight: number;         // Gross weight (default: 18000)
  weightMeasurementUnit: WeightUnit; // KGS or LBS
  stuffingVolume: number;         // Volume (default: 10)
  volumeMeasurementUnit: VolumeUnit; // MTQ or FTQ
  
  // Service modes
  exportServiceMode: ServiceMode; // CY, SD, or CFS
  importServiceMode: ServiceMode; // CY, SD, or CFS
  
  // Date parameters
  startDate: string;              // YYYY-MM-DD format
  startDateType: StartDateType;   // D (departure) or A (arrival)
  dateRange: string;              // ISO 8601 duration (default: P4W)
  
  // Additional filters
  vesselFlagCode: string;         // Vessel flag country
}
```

#### Enums
```typescript
enum CargoType {
  DRY = 'DRY',    // Dry cargo
  REEF = 'REEF'   // Refrigerated cargo
}

enum WeightUnit {
  KGS = 'KGS',    // Kilograms
  LBS = 'LBS'     // Pounds
}

enum VolumeUnit {
  MTQ = 'MTQ',    // Cubic meters
  FTQ = 'FTQ'     // Cubic feet
}

enum ServiceMode {
  CY = 'CY',      // Container Yard
  SD = 'SD',      // Store Door
  CFS = 'CFS'     // Container Freight Station
}

enum StartDateType {
  D = 'D',        // Earliest Departure Date
  A = 'A'         // Latest Arrival Date
}
```

#### Transport Leg Model
```typescript
interface TransportLeg {
  // Timing
  departureDateTime: string;      // ISO 8601 format
  arrivalDateTime: string;        // ISO 8601 format
  transitTimeMinutes: string;     // Transit time
  
  // Vessel information
  vessel: VesselInfo;
  transportMode: TransportMode;
  
  // Route details
  carrierTradeLaneName: string;   // Trade lane name
  carrierDepartureVoyageNumber: string; // 4-char voyage code
  carrierServiceCode: string;     // 3-char service code
  carrierServiceName: string;     // Service name
  
  // Routing
  linkDirection: string;          // Cardinal direction
  routingType: RoutingType;       // Route link type
  inducementLinkFlag: string;     // Inducement indicator
  
  // Locations
  startLocation: Location;        // Start location
  endLocation: Location;          // End location
}

interface VesselInfo {
  vesselImoNumber: string;        // IMO number
  carrierVesselCode: string;      // 3-char code
  vesselName: string;             // 35-char name
}

enum TransportMode {
  BAR = 'BAR',    // Barge
  BCO = 'BCO',    // Barge - Combined Transport
  DST = 'DST',    // Doublestack
  FEF = 'FEF',    // Foreign Feeder
  FEO = 'FEO',    // Maersk Owned Feeder
  MVS = 'MVS',    // Mother Vessel
  RCO = 'RCO',    // Railroad - Combined
  RR = 'RR',      // Railroad
  SSH = 'SSH',    // Equalization
  TRK = 'TRK',    // Truck
  VSF = 'VSF',    // VSA Feeder
  VSL = 'VSL',    // USA Feeder
  VSM = 'VSM'     // VSA Mother VSL
}

enum RoutingType {
  P = 'P',        // Export S/D link (Pickup)
  E = 'E',        // Export hub routing
  M = 'M',        // Main routing
  I = 'I',        // Import hub routing
  D = 'D',        // Import S/D link (Delivery)
  T = 'T'         // Inter Terminal Transfer
}
```

### 4. Deadline Model

**API Source**: Deadlines API

#### Core Fields
```typescript
interface Deadline {
  // Vessel identification
  vesselImoNumber: string;        // 7-digit IMO number
  voyage: string;                 // 4-char voyage number
  
  // Port information
  portOfLoad: string;             // Port name (3-50 chars)
  isoCountryCode: string;         // ISO 3166-1 2-letter code
  terminalName: string;           // Terminal name
  
  // Deadline details
  deadlineName: string;           // Deadline name
  deadlineLocal: string;          // ISO 8601 datetime
}
```

#### Search Parameters
```typescript
interface DeadlineSearchParams {
  isoCountryCode: string;         // Required: 2-letter country code
  portOfLoad: string;             // Required: Port name
  vesselImoNumber: string;        // Required: 7-digit IMO number
  voyage: string;                 // Required: 4-char voyage number
}
```

## 🔧 API Integration Patterns

### 1. Authentication
All APIs require a `Consumer-Key` header:
```typescript
const headers = {
  'Consumer-Key': 'IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd'
};
```

### 2. Error Handling
All APIs return standardized error responses:
```typescript
interface ApiError {
  method: string;
  requestUri: string;
  status: string;
  timestamp: string;
  message: string;
  debugMessage: string;
  subErrors?: ApiValidationError[];
}

interface ApiValidationError {
  field: string;
  rejectedValue: string;
  message: string;
}
```

### 3. Pagination
- **Locations API**: Uses `page` parameter for pagination
- **Vessels API**: No pagination (returns all matching vessels)
- **P2P API**: No pagination (returns all matching schedules)
- **Deadlines API**: No pagination (returns all deadlines for vessel/voyage)

### 4. Rate Limiting
- Respect API rate limits
- Implement exponential backoff for retries
- Use appropriate caching strategies

## 📊 Data Flow Examples

### 1. Location Search Flow
```typescript
// 1. Search for locations
const locations = await searchLocations({
  countryCode: 'US',
  locationType: LocationType.TERMINAL,
  limit: 25
});

// 2. Get detailed location info
const location = await getLocationByGeoId(locations[0].carrierGeoID);

// 3. Use location for schedule search
const schedules = await searchSchedules({
  collectionOriginGeoId: location.carrierGeoID,
  deliveryDestinationGeoId: 'GEO1234567890'
});
```

### 2. Vessel Schedule Flow
```typescript
// 1. Get vessel information
const vessels = await searchVessels({
  vesselImoNumbers: ['9456783']
});

// 2. Get vessel deadlines
const deadlines = await getDeadlines({
  vesselImoNumber: '9456783',
  voyage: '216E',
  isoCountryCode: 'HK',
  portOfLoad: 'Hong Kong'
});

// 3. Get vessel schedules
const schedules = await searchSchedules({
  vesselFlagCode: vessels[0].vesselFlagCode
});
```

### 3. Route Planning Flow
```typescript
// 1. Find origin location
const origin = await searchLocations({
  cityName: 'Shanghai',
  countryCode: 'CN'
});

// 2. Find destination location
const destination = await searchLocations({
  cityName: 'Los Angeles',
  countryCode: 'US'
});

// 3. Get available schedules
const schedules = await searchSchedules({
  collectionOriginGeoId: origin[0].carrierGeoID,
  deliveryDestinationGeoId: destination[0].carrierGeoID,
  startDate: '2024-01-15',
  dateRange: 'P4W'
});

// 4. Analyze transport legs
const legs = schedules[0].transportLegs;
const totalTransitTime = legs.reduce((sum, leg) => 
  sum + parseInt(leg.transitTimeMinutes), 0
);
```

## 🔍 Common Query Patterns

### 1. Location Queries
```typescript
// Find all terminals in a country
const terminals = await searchLocations({
  countryCode: 'US',
  locationType: LocationType.TERMINAL
});

// Find cities by partial name
const cities = await searchLocations({
  cityName: 'New York',
  locationType: LocationType.CITY
});

// Find locations by UN code
const location = await searchLocations({
  unLocationCode: 'USNYC'
});
```

### 2. Vessel Queries
```typescript
// Find vessels by capacity range
const largeVessels = await searchVessels({
  vesselNames: ['MAERSK'] // Will find vessels with "MAERSK" in name
});

// Find vessels by flag
const usVessels = await searchVessels({
  vesselFlagCodes: ['US']
});
```

### 3. Schedule Queries
```typescript
// Find schedules for specific cargo type
const reefSchedules = await searchSchedules({
  cargoType: CargoType.REEF,
  exportServiceMode: ServiceMode.CY,
  importServiceMode: ServiceMode.CY
});

// Find schedules with specific equipment
const schedules = await searchSchedules({
  isoEquipmentCode: '42G1', // 40ft High Cube
  stuffingWeight: 20000,
  weightMeasurementUnit: WeightUnit.KGS
});
```

## 🚀 Best Practices

### 1. Data Caching
- Cache reference data (countries, carrier codes, location types)
- Cache vessel information (changes infrequently)
- Cache location data (changes rarely)
- Don't cache schedules (real-time data)

### 2. Error Handling
```typescript
try {
  const result = await apiCall(params);
  return result;
} catch (error) {
  if (error.status === 400) {
    // Handle validation errors
    console.error('Validation error:', error.subErrors);
  } else if (error.status === 401) {
    // Handle authentication errors
    console.error('Authentication failed');
  } else if (error.status === 404) {
    // Handle not found
    console.error('Resource not found');
  } else {
    // Handle other errors
    console.error('API error:', error.message);
  }
  throw error;
}
```

### 3. Performance Optimization
- Use appropriate filters to reduce result sets
- Implement request batching for multiple queries
- Use connection pooling for database operations
- Monitor API response times and implement caching

### 4. Data Validation
```typescript
// Validate IMO number format
function validateImoNumber(imo: string): boolean {
  return /^\d{7}$/.test(imo);
}

// Validate country code format
function validateCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

// Validate UN location code format
function validateUnLocationCode(code: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{3}$/.test(code);
}
```

## 📈 Monitoring and Analytics

### 1. API Health Monitoring
- Monitor response times
- Track error rates
- Monitor rate limit usage
- Alert on API failures

### 2. Data Quality Metrics
- Track data completeness
- Monitor data freshness
- Validate data consistency
- Alert on data anomalies

### 3. Usage Analytics
- Track API usage patterns
- Monitor query performance
- Analyze user behavior
- Optimize based on usage data

## 🔮 Future Enhancements

### 1. Real-time Updates
- WebSocket connections for live updates
- Event-driven architecture
- Real-time notifications

### 2. Advanced Analytics
- Predictive analytics for route optimization
- Machine learning for demand forecasting
- Automated route recommendations

### 3. Integration Features
- Webhook support for data changes
- GraphQL API for flexible queries
- Bulk data export capabilities
- API versioning strategy
