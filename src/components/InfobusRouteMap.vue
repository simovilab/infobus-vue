<template>
  <div class="infobus-route-map">
    <div v-if="showRouteInfo && routeInfo" class="route-info">
      <h3 class="route-name">{{ routeInfo.route_long_name }}</h3>
      <p v-if="routeInfo.route_desc" class="route-description">
        {{ routeInfo.route_desc }}
      </p>
    </div>

    <div id="map" class="map"></div>

    <div v-if="showRefreshButton" class="refresh-section">
      <button
        @click="handleRefresh"
        class="refresh-button"
        :disabled="isLoading"
      >
        🔄 Actualizar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouteShapes } from '../composables/useRouteShapes'
import L from 'leaflet'
import type { InfobusApiConfig, RouteShape } from '../types'

interface Props {
  routeId: string
  config: InfobusApiConfig
  directionId?: number
  includeStops?: boolean
  simplify?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  showRouteInfo?: boolean
  showRefreshButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  directionId: undefined,
  includeStops: false,
  simplify: true,
  autoRefresh: false,
  refreshInterval: 60000, // 1 minute
  showRouteInfo: true,
  showRefreshButton: true
})

const emit = defineEmits<{
  routeShapesLoaded: [shapes: RouteShape[]]
  error: [error: string]
  refresh: []
}>()

const { isLoading, routeInfo, refresh } = useRouteShapes(props.config)

const map = ref<L.Map | null>(null)
const geoJsonLayer = ref<L.GeoJSON | null>(null)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

const fetchOptions = computed(() => ({
  directionId: props.directionId,
  includeStops: props.includeStops,
  simplify: props.simplify,
  format: 'geojson'
}))

const handleRefresh = async () => {
  try {
    emit('refresh')
    const newShapes = await refresh(props.routeId, fetchOptions.value)
    emit('routeShapesLoaded', newShapes.features)
    updateMap(newShapes.features)
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Error al actualizar'
    emit('error', errorMessage)
  }
}

const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer.value = setInterval(handleRefresh, props.refreshInterval)
  }
}

const clearAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

// Map setup and updates
const initializeMap = () => {
  if (map.value) {
    map.value.remove()
  }

  map.value = L.map('map').setView([0, 0], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map.value as L.Map)
  geoJsonLayer.value = L.geoJSON().addTo(map.value as L.Map)
}

const updateMap = (features: RouteShape[]) => {
  if (!geoJsonLayer.value) return

  geoJsonLayer.value.clearLayers()

  // Create a proper GeoJSON FeatureCollection
  const featureCollection = {
    type: 'FeatureCollection' as const,
    features: features
  }

  geoJsonLayer.value.addData(featureCollection)

  const bounds = geoJsonLayer.value.getBounds()
  if (bounds.isValid()) {
    map.value?.fitBounds(bounds)
  }
}

onMounted(async () => {
  initializeMap()
  await handleRefresh()
  setupAutoRefresh()
})

onUnmounted(() => {
  clearAutoRefresh()
  map.value?.remove()
})

// Watch for prop changes and refetch
watch(
  () => props.routeId,
  async (newRouteId) => {
    if (newRouteId) {
      await handleRefresh()
    }
  }
)

watch(
  () => [props.directionId, props.includeStops, props.simplify],
  async () => {
    await handleRefresh()
  }
)
</script>

<style scoped>
.infobus-route-map {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.route-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.route-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.route-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.map {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-section {
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.refresh-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: #218838;
}

.refresh-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .infobus-route-map {
    padding: 0.5rem;
  }
}
</style>
