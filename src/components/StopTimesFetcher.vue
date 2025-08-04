<template>
  <div>
    <h2>Test: Stop Times</h2>
    <div class="config-form">
      <label for="tripId">Trip ID:</label>
      <input id="tripId" v-model="tripId" type="text" placeholder="e.g. JFH367" />

      <button @click="fetchStopTimes">Fetch Stop Times</button>
    </div>
    <div v-if="tableData.length">
      <table>
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Arrival Time</th>
            <th>Departure Time</th>
            <th>Stop ID</th>
            <th>Stop Sequence</th>
            <th>Stop Headsign</th>
            <th>Pickup Type</th>
            <th>Drop Off Type</th>
            <th>Shape Dist Traveled</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in tableData" :key="idx">
            <td>{{ row.trip_id }}</td>
            <td>{{ row.arrival_time }}</td>
            <td>{{ row.departure_time }}</td>
            <td>{{ row.stop_id }}</td>
            <td>{{ row.stop_sequence }}</td>
            <td>{{ row.stop_headsign }}</td>
            <td>{{ row.pickup_type }}</td>
            <td>{{ row.drop_off_type }}</td>
            <td>{{ row.shape_dist_traveled }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <span v-if="output">{{ output }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tripId = ref('')
const output = ref('')
const tableData = ref<any[]>([])

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
    tableData.value = mockStopTimes
    output.value = ''
    return
  }

  try {
    const data = mockStopTimes.filter(entry => entry.trip_id === tripId.value)
    tableData.value = data
    output.value = data.length === 0 ? 'No results found.' : ''
  } catch (e: any) {
    tableData.value = []
    output.value = `Error: ${e.message || e}`
  }
}
</script>

<style scoped>
.config-form {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>
