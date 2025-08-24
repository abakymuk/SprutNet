// Maersk API Configuration
export const MAERSK_API_CONFIG = {
  // Authentication
  consumerKey: process.env.NEXT_PUBLIC_MAERSK_API_KEY || 'IR6PjVz4jkGu8RaazMat1Tz0l9NevMWd',
  clientSecret: process.env.MAERSK_API_SECRET || 'CnIcg3YgUUtSp8a3',

  // Base URLs
  baseUrl: process.env.NEXT_PUBLIC_MAERSK_API_BASE_URL || 'https://api.maersk.com',

  // API Endpoints
  endpoints: {
    // Locations API - Reference Data (✅ РАБОТАЕТ в продакшне)
    locations: {
      base: 'https://api.maersk.com/reference-data',
      search: '/locations',
      countries: '/countries',
      carriers: '/carriers'
    },

    // Ocean Products API - Products (✅ РАБОТАЕТ в продакшне)
    oceanProducts: {
      base: 'https://api.maersk.com/products',
      search: '/ocean-products'
    },

    // Vessels API - Reference Data (✅ РАБОТАЕТ в продакшне)
    vessels: {
      base: 'https://api.maersk.com/reference-data',
      list: '/vessels'
    },

    // Deadlines API - Shipment Deadlines (✅ РАБОТАЕТ в продакшне)
    deadlines: {
      base: 'https://api.maersk.com',
      search: '/shipment-deadlines',
      details: '/shipment-deadlines/details'
    }
  }
};

// API Request Headers
export const getMaerskHeaders = () => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Consumer-Key': MAERSK_API_CONFIG.consumerKey,
  'User-Agent': 'SprutNet/1.0'
});

// API Request Functions
export class MaerskAPI {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getMaerskHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Maersk API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ✅ Vessels API - РАБОТАЕТ в продакшне
  static async getVessels(params?: {
    vesselIMONumbers?: number[];
    carrierVesselCodes?: string[];
    vesselNames?: string[];
    vesselFlagCodes?: string[];
    limit?: number;
    page?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.vesselIMONumbers) {
      params.vesselIMONumbers.forEach(imo => searchParams.append('vesselIMONumbers', imo.toString()));
    }
    if (params?.carrierVesselCodes) {
      params.carrierVesselCodes.forEach(code => searchParams.append('carrierVesselCodes', code));
    }
    if (params?.vesselNames) {
      params.vesselNames.forEach(name => searchParams.append('vesselNames', name));
    }
    if (params?.vesselFlagCodes) {
      params.vesselFlagCodes.forEach(code => searchParams.append('vesselFlagCodes', code));
    }
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page);

    const url = `${MAERSK_API_CONFIG.endpoints.vessels.base}${MAERSK_API_CONFIG.endpoints.vessels.list}?${searchParams}`;
    return this.makeRequest(url);
  }

  // ✅ Ocean Products API - РАБОТАЕТ в продакшне
  static async searchOceanProducts(params: {
    // Origin parameters (use either GeoID OR countryCode/cityName, not both)
    carrierCollectionOriginGeoID?: string;
    collectionOriginCountryCode?: string;
    collectionOriginCityName?: string;
    collectionOriginUNLocationCode?: string;
    collectionOriginUNRegionCode?: string;
    
    // Destination parameters (use either GeoID OR countryCode/cityName, not both)
    carrierDeliveryDestinationGeoID?: string;
    deliveryDestinationCountryCode?: string;
    deliveryDestinationCityName?: string;
    deliveryDestinationUNLocationCode?: string;
    deliveryDestinationUNRegionCode?: string;
    
    // Required parameters
    vesselOperatorCarrierCode: string; // Required
    cargoType: string;
    ISOEquipmentCode: string;
    stuffingWeight: string;
    weightMeasurementUnit: string;
    stuffingVolume: string;
    volumeMeasurementUnit: string;
    exportServiceMode: string;
    importServiceMode: string;
    startDateType: string;
    dateRange: string;
    
    // Optional parameters
    startDate?: string;
    vesselFlagCode?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    // Add all parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });

    const url = `${MAERSK_API_CONFIG.endpoints.oceanProducts.base}${MAERSK_API_CONFIG.endpoints.oceanProducts.search}?${searchParams}`;
    return this.makeRequest(url);
  }

  // ✅ Locations API - РАБОТАЕТ в продакшне
  static async getLocations(params?: {
    locationType?: string;
    countryCode?: string;
    countryName?: string;
    cityName?: string;
    UNLocationCode?: string;
    UNRegionCode?: string;
    vesselOperatorCarrierCode?: string;
    sort?: string;
    limit?: number;
    page?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.locationType) searchParams.append('locationType', params.locationType);
    if (params?.countryCode) searchParams.append('countryCode', params.countryCode);
    if (params?.countryName) searchParams.append('countryName', params.countryName);
    if (params?.cityName) searchParams.append('cityName', params.cityName);
    if (params?.UNLocationCode) searchParams.append('UNLocationCode', params.UNLocationCode);
    if (params?.UNRegionCode) searchParams.append('UNRegionCode', params.UNRegionCode);
    if (params?.vesselOperatorCarrierCode) searchParams.append('vesselOperatorCarrierCode', params.vesselOperatorCarrierCode);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page);

    const url = `${MAERSK_API_CONFIG.endpoints.locations.base}${MAERSK_API_CONFIG.endpoints.locations.search}?${searchParams}`;
    return this.makeRequest(url);
  }

  // ✅ Deadlines API - РАБОТАЕТ в продакшне
  static async searchDeadlines(params: {
    ISOCountryCode: string; // Required
    portOfLoad: string; // Required
    vesselIMONumber: string; // Required
    voyage: string; // Required
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    // Required parameters
    searchParams.append('ISOCountryCode', params.ISOCountryCode);
    searchParams.append('portOfLoad', params.portOfLoad);
    searchParams.append('vesselIMONumber', params.vesselIMONumber);
    searchParams.append('voyage', params.voyage);
    
    // Optional parameters
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const url = `${MAERSK_API_CONFIG.endpoints.deadlines.base}${MAERSK_API_CONFIG.endpoints.deadlines.search}?${searchParams}`;
    return this.makeRequest(url);
  }

  // Helper methods for common use cases
  static async getVesselByIMO(imoNumber: number) {
    return this.getVessels({ vesselIMONumbers: [imoNumber] });
  }

  static async searchVesselsByName(vesselName: string) {
    return this.getVessels({ vesselNames: [vesselName] });
  }

  static async getLocationsByCountry(countryCode: string, limit = 10) {
    return this.getLocations({ countryCode, limit });
  }

  static async searchLocationsByCity(cityName: string, limit = 10) {
    return this.getLocations({ cityName, limit });
  }

  static async getLocationsByType(locationType: string, limit = 10) {
    return this.getLocations({ locationType, limit });
  }

  static async getHoustonLocations(limit = 10) {
    return this.getLocations({ 
      countryCode: 'US', 
      cityName: 'Houston', 
      limit 
    });
  }

  static async getHoustonTXLocation() {
    const locations = await this.getLocations({ 
      countryCode: 'US', 
      cityName: 'Houston',
      UNRegionCode: 'TX',
      limit: 10 
    });
    // Возвращаем Houston, TX (carrierGeoID: "183AKT65YAHRZ")
    return locations.find((loc: MaerskLocation) => loc.UNLocationCode === 'USHOU');
  }

  // Predefined deadline searches
  static async getHoustonDeadlines() {
    return this.searchDeadlines({
      ISOCountryCode: 'US',
      portOfLoad: 'Houston',
      vesselIMONumber: '9332987', // MAERSK COLUMBUS
      voyage: '535E'
    });
  }

  static async getShanghaiDeadlines() {
    return this.searchDeadlines({
      ISOCountryCode: 'CN',
      portOfLoad: 'Shanghai',
      vesselIMONumber: '9359052', // GERDA MAERSK
      voyage: '533E'
    });
  }

  static async getRotterdamDeadlines() {
    return this.searchDeadlines({
      ISOCountryCode: 'NL',
      portOfLoad: 'Rotterdam',
      vesselIMONumber: '9298686', // MAERSK IOWA
      voyage: '536E'
    });
  }

  // Predefined ocean product searches
  static async searchHoustonToRotterdam() {
    return this.searchOceanProducts({
      collectionOriginCountryCode: 'US',
      collectionOriginCityName: 'Houston',
      collectionOriginUNLocationCode: 'USHOU',
      deliveryDestinationCountryCode: 'NL',
      deliveryDestinationCityName: 'Rotterdam',
      deliveryDestinationUNLocationCode: 'NLRTM',
      vesselOperatorCarrierCode: 'MAEU',
      cargoType: 'DRY',
      ISOEquipmentCode: '42G1',
      stuffingWeight: '18000',
      weightMeasurementUnit: 'KGS',
      stuffingVolume: '10',
      volumeMeasurementUnit: 'MTQ',
      exportServiceMode: 'CY',
      importServiceMode: 'CY',
      startDateType: 'D',
      dateRange: 'P4W'
    });
  }

  static async searchShanghaiToLosAngeles() {
    return this.searchOceanProducts({
      collectionOriginCountryCode: 'CN',
      collectionOriginCityName: 'Shanghai',
      collectionOriginUNLocationCode: 'CNSHA',
      deliveryDestinationCountryCode: 'US',
      deliveryDestinationCityName: 'Los Angeles',
      deliveryDestinationUNLocationCode: 'USLAX',
      vesselOperatorCarrierCode: 'MAEU',
      cargoType: 'DRY',
      ISOEquipmentCode: '42G1',
      stuffingWeight: '18000',
      weightMeasurementUnit: 'KGS',
      stuffingVolume: '10',
      volumeMeasurementUnit: 'MTQ',
      exportServiceMode: 'CY',
      importServiceMode: 'CY',
      startDateType: 'D',
      dateRange: 'P4W'
    });
  }
}

// Type definitions for API responses
export interface MaerskVessel {
  vesselIMONumber: number;
  carrierVesselCode: string;
  vesselName: string;
  vesselFlagCode?: string;
  vesselBuiltYear?: number;
  vesselCallSign?: string;
  vesselCapacityTeu?: number;
}

export interface MaerskLocation {
  countryCode: string;
  countryName: string;
  cityName: string;
  locationType: string;
  locationName: string;
  carrierGeoID: string;
  UNLocationCode?: string;
  UNRegionCode?: string;
  UNRegionName?: string;
}

export interface MaerskOceanProduct {
  carrierProductId: string;
  carrierProductSequenceId: string;
  numberOfProductLinks: string;
  transportSchedules: MaerskTransportSchedule[];
  vesselOperatorCarrierCode: string;
}

export interface MaerskTransportSchedule {
  departureDateTime: string;
  arrivalDateTime: string;
  facilities: {
    collectionOrigin: MaerskFacility;
    deliveryDestination: MaerskFacility;
  };
  firstDepartureVessel: {
    vesselIMONumber: number;
    carrierVesselCode: string;
    vesselName: string;
  };
  transitTime: string;
  transportLegs: MaerskTransportLeg[];
}

export interface MaerskFacility {
  carrierCityGeoID: string;
  cityName: string;
  carrierSiteGeoID?: string;
  locationName?: string;
  countryCode: string;
  locationType: string;
  UNLocationCode: string;
  siteUNLocationCode?: string;
  cityUNLocationCode?: string;
  UNRegionCode: string;
}

export interface MaerskTransportLeg {
  departureDateTime: string;
  arrivalDateTime: string;
  facilities: {
    startLocation: MaerskFacility;
    endLocation: MaerskFacility;
  };
  transport: {
    transportMode: string;
    vessel: {
      vesselIMONumber: number;
      carrierVesselCode: string;
      vesselName: string;
    };
    carrierTradeLaneName: string;
    carrierDepartureVoyageNumber: string;
    carrierServiceCode: string;
    carrierServiceName: string;
    linkDirection: string;
    carrierCode: string;
    routingType: string;
  };
}

export interface MaerskDeadline {
  shipmentDeadlines: {
    terminalName: string;
    deadlines: Array<{
      deadlineName: string;
      deadlineLocal: string;
    }>;
  };
}
