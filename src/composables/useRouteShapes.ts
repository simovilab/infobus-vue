import { ref, computed, type Ref } from 'vue'
import { useInfobusApi } from './useInfobusApi'
import type {
  InfobusApiConfig,
  RouteShapesResponse,
  GeoJSONFeatureCollection
} from '../types'

export function useRouteShapes(config: InfobusApiConfig) {
  const { isLoading, error, makeRequest } = useInfobusApi(config)
  const data: Ref<RouteShapesResponse | null> = ref(null)
  const lastFetch = ref<Date | null>(null)

  const shapes = computed(() => data.value?.shapes || null)
  const routeInfo = computed(() => data.value?.route_info || null)
  const features = computed(() => data.value?.shapes?.features || [])

  const fetchRouteShapes = async (
    routeId: string,
    options: {
      directionId?: number
      includeStops?: boolean
      simplify?: boolean
      format?: 'geojson' | 'polyline'
    } = {}
  ): Promise<GeoJSONFeatureCollection> => {
    try {
      const params = new URLSearchParams({
        route_id: routeId,
        ...(options.directionId !== undefined && {
          direction_id: options.directionId.toString()
        }),
        ...(options.includeStops !== undefined && {
          include_stops: options.includeStops.toString()
        }),
        ...(options.simplify !== undefined && {
          simplify: options.simplify.toString()
        }),
        ...(options.format && { format: options.format })
      })

      const response = await makeRequest<RouteShapesResponse>(
        `/geo-shapes?${params.toString()}`
      )

      data.value = response
      lastFetch.value = new Date()

      return response.shapes
    } catch (err) {
      console.error('Error fetching route shapes:', err)
      throw err
    }
  }

  const refresh = async (routeId: string, options = {}) => {
    return await fetchRouteShapes(routeId, options)
  }

  // Helper to get shapes by direction
  const getShapesByDirection = (directionId: number) => {
    return features.value.filter(
      (feature) => feature.properties.direction_id === directionId
    )
  }

  // Helper to get all coordinates for bounds calculation
  const getAllCoordinates = () => {
    const coordinates: [number, number][] = []
    features.value.forEach((feature) => {
      if (feature.geometry.type === 'LineString') {
        coordinates.push(...feature.geometry.coordinates)
      }
    })
    return coordinates
  }

  // Helper to calculate bounds
  const getBounds = () => {
    const coordinates = getAllCoordinates()
    if (coordinates.length === 0) return null

    const lats = coordinates.map((coord) => coord[1])
    const lngs = coordinates.map((coord) => coord[0])

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }

  // Helper to check if data is stale
  const isStale = (maxAgeMinutes = 30) => {
    if (!lastFetch.value) return true
    const now = new Date()
    const diffMs = now.getTime() - lastFetch.value.getTime()
    const diffMinutes = diffMs / (1000 * 60)
    return diffMinutes > maxAgeMinutes
  }

  return {
    isLoading,
    error,
    data,
    shapes,
    routeInfo,
    features,
    lastFetch,
    fetchRouteShapes,
    refresh,
    getShapesByDirection,
    getAllCoordinates,
    getBounds,
    isStale
  }
}
