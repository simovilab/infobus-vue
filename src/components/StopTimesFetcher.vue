<template>
  <div class="infobus-next-trips">
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
import { useStopTimes } from '../composables/useStopTimes'

const tripId = ref('')
const output = ref('')
const tableData = ref<any[]>([])

const { getStopTimes } = useStopTimes()

async function fetchStopTimes() {
  if (!tripId.value) {
    tableData.value = getStopTimes()
    output.value = ''
    return
  }

  try {
    const data = getStopTimes(tripId.value)
    tableData.value = data
    output.value = data.length === 0 ? 'No results found.' : ''
  } catch (e: any) {
    tableData.value = []
    output.value = `Error: ${e.message || e}`
  }
}
</script>

<style scoped>
.infobus-next-trips {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.config-form {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

th, td {
  border: 1px solid #dee2e6;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #e9ecef;
  font-weight: bold;
  color: #333;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

input[type="text"] {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 7px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}
</style>
