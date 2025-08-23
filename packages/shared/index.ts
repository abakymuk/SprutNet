// Domain Models для Shipping Planner

export interface PortRef {
  id: string
  name: string
  code: string
  country: string
  timezone: string
}

export interface VesselBrief {
  id: string
  name: string
  capacity: number
  type: string
}

export interface Sailing {
  id: string
  vessel: VesselBrief
  service: string
  pol: PortRef
  pod: PortRef
  etd: string // ISO date string
  eta: string // ISO date string
  transitDays: number
  isEarliest?: boolean
  isShortest?: boolean
  isBest?: boolean
}

export interface Deadline {
  id: string
  sailingId: string
  type: 'DOC' | 'CY' | 'VGM' | 'CUSTOMS' | 'OTHER'
  date: string // ISO date string
  description: string
  localTime: string
}

export interface LaneInsights {
  avgTransitDays: number
  sailingsPerWeek: number
  nextSailings: Sailing[]
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  cached?: boolean
}

export interface SearchParams {
  pol: string
  pod: string
  dateFrom?: string
  dateTo?: string
}
