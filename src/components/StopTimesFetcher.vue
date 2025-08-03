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

const tripId = ref('')
const output = ref('')

// Mocked API response
const mockStopTimes = [
  {
    trip_id: "JFH367",
    arrival_time: "07:15:00",
    departure_time: "07:15:00",
    stop_id: "bUCR-0-03",
    stop_sequence: 15,
    stop_headsign: "Facultad de Ingeniería",
    pickup_type: 0,
    drop_off_type: 0,
    shape_dist_traveled: 0.5
  },
  {
    trip_id: "JFH367",
    arrival_time: "07:20:00",
    departure_time: "07:20:00",
    stop_id: "bUCR-0-04",
    stop_sequence: 16,
    stop_headsign: "Facultad de Ingeniería",
    pickup_type: 0,
    drop_off_type: 0,
    shape_dist_traveled: 1.0
  },
  {
    trip_id: "JFH367",
    arrival_time: "07:25:00",
    departure_time: "07:25:00",
    stop_id: "bUCR-0-05",
    stop_sequence: 17,
    stop_headsign: "Facultad de Ingeniería",
    pickup_type: 0,
    drop_off_type: 0,
    shape_dist_traveled: 1.5
  },
  {
    trip_id: "APV3225",
    arrival_time: "07:25:00",
    departure_time: "07:25:00",
    stop_id: "bUCR-0-05",
    stop_sequence: 17,
    stop_headsign: "Facultad de Ingeniería",
    pickup_type: 0,
    drop_off_type: 0,
    shape_dist_traveled: 1.5
  }
]

async function fetchStopTimes() {
  if (!tripId.value) {
    // Return all entries if no Trip ID is entered
    output.value = JSON.stringify(mockStopTimes, null, 2)
    return
  }

  try {
    const data = mockStopTimes.filter(entry => entry.trip_id === tripId.value)
    output.value = JSON.stringify(data, null, 2)
  } catch (e: any) {
    output.value = `Error: ${e.message || e}`
  }
}
</script>
