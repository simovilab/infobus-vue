import type { App } from 'vue'
import InfobusNextTrips from './components/InfobusNextTrips.vue'
import InfobusRouteMap from './components/InfobusRouteMap.vue'
import { useInfobusApi } from './composables/useInfobusApi'
import { useNextTrips } from './composables/useNextTrips'
import { useRouteShapes } from './composables/useRouteShapes'

export type {
  NextTrip,
  RouteShape,
  InfobusApiConfig,
  StopInfo,
  RouteInfo
} from './types'

export {
  InfobusNextTrips,
  InfobusRouteMap,
  useInfobusApi,
  useNextTrips,
  useRouteShapes
}

export default {
  install(app: App) {
    app.component('InfobusNextTrips', InfobusNextTrips)
    app.component('InfobusRouteMap', InfobusRouteMap)
  }
}
