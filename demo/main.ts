import { createApp, ref, computed } from 'vue'
import InfobusVue from '../src/index'
import type { InfobusApiConfig, NextTrip, RouteShape } from '../src/types'

const app = createApp({
  setup() {
    const config = ref({
      baseUrl: 'https://api.infobus.example.com',
      apiKey: '',
      timeout: 10000
    })

    const nextTripsStopId = ref('1001')
    const nextTripsRouteId = ref('')
    const routeMapRouteId = ref('R1')

    const apiConfig = computed((): InfobusApiConfig => ({
      baseUrl: config.value.baseUrl,
      apiKey: config.value.apiKey || undefined,
      timeout: config.value.timeout
    }))

    const updateConfig = () => {
      console.log('Configuration updated:', apiConfig.value)
    }

    const refreshNextTrips = () => {
      console.log('Refreshing next trips for stop:', nextTripsStopId.value)
    }

    const loadRouteMap = () => {
      console.log('Loading route map for route:', routeMapRouteId.value)
    }

    const onTripsLoaded = (trips: NextTrip[]) => {
      console.log('Trips loaded:', trips)
    }

    const onRouteShapesLoaded = (shapes: RouteShape[]) => {
      console.log('Route shapes loaded:', shapes)
    }

    const onError = (error: string) => {
      console.error('Component error:', error)
    }

    return {
      config,
      nextTripsStopId,
      nextTripsRouteId,
      routeMapRouteId,
      apiConfig,
      updateConfig,
      refreshNextTrips,
      loadRouteMap,
      onTripsLoaded,
      onRouteShapesLoaded,
      onError
    }
  }
})

app.use(InfobusVue)
app.mount('#app')
