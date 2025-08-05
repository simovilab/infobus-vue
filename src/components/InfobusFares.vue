<template>
  <section class="fare-table">
    <h2>Fare Table</h2>

    <form class="config-form" @submit.prevent="fetchFares">
      <label for="filterId">Fare ID (optional filter):</label>
      <input
        id="filterId"
        v-model="filterId"
        type="text"
        placeholder="e.g. F001"
      />
      <button type="submit">Fetch Fares</button>
    </form>

    <div class="table-div" v-if="tableData.length > 0">
      <table >
        <thead>
          <tr>
            <th>Fare ID</th>
            <th>Agency ID</th>
            <th>Route ID</th>
            <th>Payment Method</th>
            <th>Allows Transfers</th>
            <th>Transfers</th>
            <th>Transfer Duration (s)</th>
            <th>Price</th>
            <th>Currency</th>
            <th>Origin ID</th>
            <th>Destination ID</th>
            <th>Contains ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fare, idx) in tableData" :key="idx">
            <td>{{ fare.fare_id }}</td>
            <td>{{ fare.agency_id }}</td>
            <td>{{ fare.route_id }}</td>
            <td>{{ fare.payment_method }}</td>
            <td>{{ fare.allows_transfers ? 'Yes' : 'No' }}</td>
            <td>{{ fare.transfers }}</td>
            <td>{{ fare.transfer_duration }}</td>
            <td>{{ fare.price.toFixed(2) }}</td>
            <td>{{ fare.currency_type }}</td>
            <td>{{ fare.origin_id }}</td>
            <td>{{ fare.destination_id }}</td>
            <td>{{ fare.contains_id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="output" class="output-message">{{ output }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFares } from '../composables/useFares'

const filterId = ref('')
const output = ref('')
const tableData = ref<any[]>([])

const { getFares } = useFares()

async function fetchFares() {
  try {
    const data = await getFares()
    const searchTerm = filterId.value.trim().toLowerCase()

    if (searchTerm) {
      const filtered = data.filter((fare: any) =>
        fare.fare_id?.toLowerCase().includes(searchTerm)
      )
      tableData.value = filtered
      output.value = filtered.length ? '' : 'No results found.'
    } else {
      tableData.value = data
      output.value = ''
    }
  } catch (e: any) {
    tableData.value = []
    output.value = `Error: ${e.message || e}`
  }
}
</script>

<style scoped>
.table-div {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* for smooth scrolling on iOS */
}

.fare-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin: 2rem auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  gap: 1.5rem;
}

.config-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

label {
  font-weight: 500;
}

input[type='text'] {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-width: 180px;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0056b3;
}

.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
}

table {
  flex-shrink: 0;
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid #dee2e6;
}

th {
  background-color: #e9ecef;
  font-weight: bold;
  color: #333;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

.output-message {
  color: #888;
  font-style: italic;
  margin-top: 1rem;
  text-align: center;
}
</style>
