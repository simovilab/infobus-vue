<template>
  <div>
    <h2>Test: Stop Times</h2>
    <div class="config-form">
      <label for="tripId">Trip ID:</label>
      <input id="tripId" v-model="tripId" type="text" placeholder="e.g. JFH367" />

      <button @click="fetchStopTimes">Fetch Stop Times</button>
    </div>
    <pre>{{ output }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInfobusApi } from '../composables/useInfobusApi'
import type { InfobusApiConfig } from '../types'

const props = defineProps<{
  config: InfobusApiConfig
}>()

const tripId = ref('')
const output = ref('')

const { makeRequest } = useInfobusApi(props.config)

async function fetchStopTimes() {
  if (!tripId.value) {
    output.value = 'Please enter a trip ID.'
    return
  }

  try {
    const data = await makeRequest(`/stop-times?trip_id=${tripId.value}`)
    output.value = JSON.stringify(data, null, 2)
  } catch (e: any) {
    output.value = `Error: ${e.message || e}`
  }
}


</script>
