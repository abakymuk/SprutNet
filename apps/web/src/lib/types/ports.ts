import { PortRef, PortType } from "@sprutnet/shared/types";

// Интерфейс для данных порта в нашем приложении (используем shared types)

// Интерфейс для данных локации от Maersk API
export interface MaerskLocation {
  carrierGeoID: string;
  locationName: string;
  cityName?: string;
  countryName?: string;
  unLocationCode?: string;
  locationType?: string;
  countryCode?: string;
  unRegionCode?: string;
  unRegionName?: string;
}

// Интерфейс для параметров поиска портов
export interface PortSearchParams {
  q: string;
  limit?: number;
  locationType?: string;
}

// Интерфейс для ответа API поиска портов
export interface PortSearchResponse {
  success: boolean;
  data: PortRef[];
  total: number;
  error?: string;
}

// Функция маппинга данных Maersk Location в PortRef
export function mapLocationToPortRef(location: MaerskLocation): PortRef {
  return {
    id: location.carrierGeoID ?? location.unLocationCode ?? '',
    name: location.locationName ?? location.cityName ?? '',
    countryCode: location.countryCode ?? '',
    countryName: location.countryName ?? '',
    cityName: location.cityName,
    type: PortType.SEAPORT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Функция фильтрации портов
export function filterPorts(locations: MaerskLocation[]): MaerskLocation[] {
  return locations.filter(location => 
    location.locationType === 'port' || 
    location.locationType === 'seaport' ||
    (location.unLocationCode && location.unLocationCode.length === 5)
  );
}

// Функция поиска портов по запросу
export function searchPorts(ports: PortRef[], query: string): PortRef[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  
  return ports.filter(port => 
    (port.name?.toLowerCase() || '').includes(lowerQuery) ||
    (port.id?.toLowerCase() || '').includes(lowerQuery) ||
    (port.countryName?.toLowerCase() || '').includes(lowerQuery)
  ).slice(0, 10); // Ограничиваем до 10 результатов
}
