import { ref, computed, type Ref } from 'vue'
import { useInfobusApi } from './useInfobusApi'
import type { InfobusApiConfig, NextTripsResponse, NextTrip } from '../types'

export function useNextTrips(config: InfobusApiConfig) {
  const { isLoading, error, makeRequest } = useInfobusApi(config)
  const data: Ref<NextTripsResponse | null> = ref(null)
  const lastFetch = ref<Date | null>(null)

  const trips = computed(() => data.value?.trips || [])
  const stopInfo = computed(() => data.value?.stop_info || null)
  const lastUpdated = computed(() => data.value?.last_updated || null)

  const fetchNextTrips = async (
    stopId: string,
    options: {
      limit?: number
      routeId?: string
      directionId?: number
      includeRealtime?: boolean
    } = {}
  ): Promise<NextTrip[]> => {
    try {
      const params = new URLSearchParams({
        stop_id: stopId,
        ...(options.limit && { limit: options.limit.toString() }),
        ...(options.routeId && { route_id: options.routeId }),
        ...(options.directionId !== undefined && {
          direction_id: options.directionId.toString()
        }),
        ...(options.includeRealtime !== undefined && {
          realtime: options.includeRealtime.toString()
        })
      })

      const response = await makeRequest<NextTripsResponse>(
        `/next-trips?${params.toString()}`
      )

      data.value = response
      lastFetch.value = new Date()

      return response.trips
    } catch (err) {
      console.error('Error fetching next trips:', err)
      throw err
    }
  }

  const refresh = async (stopId: string, options = {}) => {
    return await fetchNextTrips(stopId, options)
  }

  // Helper to get trips by route
  const getTripsByRoute = (routeId: string) => {
    return trips.value.filter((trip) => trip.route_id === routeId)
  }

  // Helper to get next N trips
  const getNextTrips = (count: number) => {
    return trips.value.slice(0, count)
  }

  // Helper to check if data is stale
  const isStale = (maxAgeMinutes = 5) => {
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
    trips,
    stopInfo,
    lastUpdated,
    lastFetch,
    fetchNextTrips,
    refresh,
    getTripsByRoute,
    getNextTrips,
    isStale
  }
}
