import { ref } from 'vue'

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

export function useStopTimes() {
  function getStopTimes(tripId?: string) {
    if (!tripId) return mockStopTimes
    return mockStopTimes.filter(entry => entry.trip_id === tripId)
  }
  return { getStopTimes }
}
