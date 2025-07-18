export interface InfobusApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
}

export interface NextTrip {
  trip_id: string
  route_id: string
  route_short_name: string
  route_long_name: string
  trip_headsign: string
  arrival_time: string
  departure_time: string
  stop_sequence: number
  pickup_type: number
  drop_off_type: number
  shape_dist_traveled?: number
  timepoint?: number
  estimated_arrival?: string
  estimated_departure?: string
  delay?: number
  vehicle_id?: string
  block_id?: string
  wheelchair_accessible?: number
  bikes_allowed?: number
  route_color?: string
  route_text_color?: string
}

export interface StopInfo {
  stop_id: string
  stop_name: string
  stop_desc?: string
  stop_lat: number
  stop_lon: number
  zone_id?: string
  stop_url?: string
  location_type?: number
  parent_station?: string
  stop_timezone?: string
  wheelchair_boarding?: number
  platform_code?: string
}

export interface RouteInfo {
  route_id: string
  agency_id?: string
  route_short_name: string
  route_long_name: string
  route_desc?: string
  route_type: number
  route_url?: string
  route_color?: string
  route_text_color?: string
  route_sort_order?: number
  continuous_pickup?: number
  continuous_drop_off?: number
}

export interface RouteShape {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  properties: {
    shape_id: string
    route_id: string
    route_short_name?: string
    route_long_name?: string
    route_color?: string
    direction_id?: number
  }
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: RouteShape[]
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface NextTripsResponse {
  stop_info: StopInfo
  trips: NextTrip[]
  last_updated: string
}

export interface RouteShapesResponse {
  route_info: RouteInfo
  shapes: GeoJSONFeatureCollection
}
