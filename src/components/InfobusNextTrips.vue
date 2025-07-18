<template>
  <div class="infobus-next-trips">
    <div v-if="showStopInfo && stopInfo" class="stop-info">
      <h3 class="stop-name">{{ stopInfo.stop_name }}</h3>
      <p v-if="stopInfo.stop_desc" class="stop-description">
        {{ stopInfo.stop_desc }}
      </p>
    </div>

    <div v-if="isLoading" class="loading">
      <slot name="loading">
        <div class="spinner"></div>
        <p>Cargando próximos viajes...</p>
      </slot>
    </div>

    <div v-else-if="error" class="error">
      <slot name="error" :error="error">
        <p class="error-message">{{ error }}</p>
        <button @click="handleRefresh" class="retry-button">Reintentar</button>
      </slot>
    </div>

    <div v-else-if="trips.length === 0" class="no-trips">
      <slot name="no-trips">
        <p>No hay viajes disponibles para esta parada.</p>
      </slot>
    </div>

    <div v-else class="trips-container">
      <div v-if="showLastUpdated && lastUpdated" class="last-updated">
        <small>Última actualización: {{ formatDateTime(lastUpdated) }}</small>
      </div>

      <div class="trips-list">
        <div
          v-for="trip in displayTrips"
          :key="trip.trip_id"
          class="trip-item"
          :class="{ 'has-delay': trip.delay && trip.delay > 0 }"
        >
          <div class="route-info">
            <span class="route-short-name" :style="getRouteStyle(trip)">
              {{ trip.route_short_name }}
            </span>
            <span class="route-long-name">{{ trip.route_long_name }}</span>
          </div>

          <div class="trip-details">
            <div class="headsign">{{ trip.trip_headsign }}</div>
            <div class="times">
              <span class="scheduled-time">
                {{ formatTime(trip.arrival_time) }}
              </span>
              <span
                v-if="
                  trip.estimated_arrival &&
                  trip.estimated_arrival !== trip.arrival_time
                "
                class="estimated-time"
              >
                ({{ formatTime(trip.estimated_arrival) }})
              </span>
              <span v-if="trip.delay && trip.delay > 0" class="delay">
                +{{ Math.round(trip.delay / 60) }}min
              </span>
            </div>
          </div>

          <div v-if="showAccessibility" class="accessibility">
            <span
              v-if="trip.wheelchair_accessible === 1"
              class="wheelchair-accessible"
              title="Accesible para sillas de ruedas"
            >
              ♿
            </span>
            <span
              v-if="trip.bikes_allowed === 1"
              class="bikes-allowed"
              title="Permite bicicletas"
            >
              🚲
            </span>
          </div>
        </div>
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useNextTrips } from '../composables/useNextTrips'
import type { InfobusApiConfig, NextTrip } from '../types'

interface Props {
  stopId: string
  config: InfobusApiConfig
  limit?: number
  routeId?: string
  directionId?: number
  includeRealtime?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  showStopInfo?: boolean
  showLastUpdated?: boolean
  showRefreshButton?: boolean
  showAccessibility?: boolean
  maxTrips?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  includeRealtime: true,
  autoRefresh: false,
  refreshInterval: 60000, // 1 minute
  showStopInfo: true,
  showLastUpdated: true,
  showRefreshButton: true,
  showAccessibility: true,
  maxTrips: 5
})

const emit = defineEmits<{
  tripsLoaded: [trips: NextTrip[]]
  error: [error: string]
  refresh: []
}>()

const { isLoading, error, trips, stopInfo, lastUpdated, refresh } =
  useNextTrips(props.config)

const refreshTimer = ref<NodeJS.Timeout | null>(null)

const displayTrips = computed(() => {
  return trips.value.slice(0, props.maxTrips)
})

const fetchOptions = computed(() => ({
  limit: props.limit,
  routeId: props.routeId,
  directionId: props.directionId,
  includeRealtime: props.includeRealtime
}))

const handleRefresh = async () => {
  try {
    emit('refresh')
    const newTrips = await refresh(props.stopId, fetchOptions.value)
    emit('tripsLoaded', newTrips)
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

const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return timeString
  }
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch {
    return dateString
  }
}

const getRouteStyle = (trip: NextTrip) => {
  const routeColor = trip.route_color || '#007bff'
  const textColor = trip.route_text_color || '#ffffff'

  return {
    backgroundColor: `#${routeColor}`,
    color: `#${textColor}`
  }
}

// Watch for prop changes and refetch
watch(
  () => props.stopId,
  async (newStopId) => {
    if (newStopId) {
      await handleRefresh()
    }
  }
)

watch(
  () => [props.routeId, props.directionId, props.limit],
  async () => {
    await handleRefresh()
  }
)

onMounted(async () => {
  await handleRefresh()
  setupAutoRefresh()
})

onUnmounted(() => {
  clearAutoRefresh()
})
</script>

<style scoped>
.infobus-next-trips {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.stop-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stop-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.stop-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}

.error-message {
  margin-bottom: 1rem;
}

.retry-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-button:hover {
  background-color: #c82333;
}

.no-trips {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.trips-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.last-updated {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
  color: #666;
}

.trips-list {
  display: flex;
  flex-direction: column;
}

.trip-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.trip-item:hover {
  background-color: #f8f9fa;
}

.trip-item:last-child {
  border-bottom: none;
}

.trip-item.has-delay {
  border-left: 4px solid #ffc107;
}

.route-info {
  flex: 0 0 auto;
  margin-right: 1rem;
}

.route-short-name {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: center;
}

.route-long-name {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.trip-details {
  flex: 1;
  min-width: 0;
}

.headsign {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.times {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.scheduled-time {
  font-weight: bold;
  color: #007bff;
}

.estimated-time {
  color: #28a745;
  font-style: italic;
}

.delay {
  color: #ffc107;
  font-weight: bold;
}

.accessibility {
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;
  font-size: 1.2rem;
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
  .infobus-next-trips {
    padding: 0.5rem;
  }

  .trip-item {
    padding: 0.75rem;
  }

  .route-info {
    margin-right: 0.75rem;
  }
}
</style>
