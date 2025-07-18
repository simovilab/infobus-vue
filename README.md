# @infobus/vue

Vue components and composables for public transportation websites using GTFS data through the Infobús API.

## Features

- 🚌 **InfobusNextTrips** - Display next trips arriving at a bus stop
- 🗺️ **InfobusRouteMap** - Show route shapes on interactive maps
- 🔧 **Composables** - Reusable API logic with TypeScript support
- 📱 **Responsive** - Mobile-friendly components
- 🌐 **i18n Ready** - Internationalization support
- ⚡ **Performance** - Optimized for real-time data

## Installation

```bash
npm install @infobus/vue
# or
yarn add @infobus/vue
# or
pnpm add @infobus/vue
```

## Quick Start

### 1. Install the plugin

```typescript
import { createApp } from 'vue'
import InfobusVue from '@infobus/vue'
import '@infobus/vue/style.css'

const app = createApp(App)
app.use(InfobusVue)
app.mount('#app')
```

### 2. Use the components

```vue
<template>
  <div>
    <!-- Next Trips Component -->
    <InfobusNextTrips
      :stop-id="'1001'"
      :config="apiConfig"
      :auto-refresh="true"
      :refresh-interval="60000"
      @trips-loaded="onTripsLoaded"
    />
    
    <!-- Route Map Component -->
    <InfobusRouteMap
      :route-id="'R1'"
      :config="apiConfig"
      :include-stops="true"
      @route-shapes-loaded="onShapesLoaded"
    />
  </div>
</template>

<script setup lang="ts">
import type { InfobusApiConfig, NextTrip, RouteShape } from '@infobus/vue'

const apiConfig: InfobusApiConfig = {
  baseUrl: 'https://api.infobus.example.com',
  apiKey: 'your-api-key', // optional
  timeout: 10000
}

const onTripsLoaded = (trips: NextTrip[]) => {
  console.log('Trips loaded:', trips)
}

const onShapesLoaded = (shapes: RouteShape[]) => {
  console.log('Route shapes loaded:', shapes)
}
</script>
```

## Components

### InfobusNextTrips

Displays next trips arriving at a specific bus stop with real-time information.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stopId` | `string` | - | **Required.** GTFS stop ID |
| `config` | `InfobusApiConfig` | - | **Required.** API configuration |
| `limit` | `number` | `10` | Maximum number of trips to fetch |
| `routeId` | `string` | - | Filter by specific route ID |
| `directionId` | `number` | - | Filter by direction (0 or 1) |
| `includeRealtime` | `boolean` | `true` | Include real-time updates |
| `autoRefresh` | `boolean` | `false` | Enable automatic refresh |
| `refreshInterval` | `number` | `60000` | Refresh interval in milliseconds |
| `showStopInfo` | `boolean` | `true` | Show stop information |
| `showLastUpdated` | `boolean` | `true` | Show last update time |
| `showRefreshButton` | `boolean` | `true` | Show refresh button |
| `showAccessibility` | `boolean` | `true` | Show accessibility icons |
| `maxTrips` | `number` | `5` | Maximum trips to display |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `trips-loaded` | `NextTrip[]` | Emitted when trips are loaded |
| `error` | `string` | Emitted when an error occurs |
| `refresh` | - | Emitted when refresh is triggered |

#### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `loading` | - | Custom loading state |
| `error` | `{ error: string }` | Custom error state |
| `no-trips` | - | Custom empty state |

### InfobusRouteMap

Displays route shapes on an interactive map using Leaflet.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `routeId` | `string` | - | **Required.** GTFS route ID |
| `config` | `InfobusApiConfig` | - | **Required.** API configuration |
| `directionId` | `number` | - | Filter by direction (0 or 1) |
| `includeStops` | `boolean` | `false` | Include stops on the map |
| `simplify` | `boolean` | `true` | Simplify route shapes |
| `autoRefresh` | `boolean` | `false` | Enable automatic refresh |
| `refreshInterval` | `number` | `60000` | Refresh interval in milliseconds |
| `showRouteInfo` | `boolean` | `true` | Show route information |
| `showRefreshButton` | `boolean` | `true` | Show refresh button |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `route-shapes-loaded` | `RouteShape[]` | Emitted when shapes are loaded |
| `error` | `string` | Emitted when an error occurs |
| `refresh` | - | Emitted when refresh is triggered |

## Composables

### useInfobusApi

Base composable for making API requests.

```typescript
import { useInfobusApi } from '@infobus/vue'

const { isLoading, error, makeRequest } = useInfobusApi({
  baseUrl: 'https://api.infobus.example.com',
  apiKey: 'your-api-key',
  timeout: 10000
})

// Make a request
const data = await makeRequest('/endpoint')
```

### useNextTrips

Composable for fetching next trips data.

```typescript
import { useNextTrips } from '@infobus/vue'

const {
  isLoading,
  error,
  trips,
  stopInfo,
  fetchNextTrips,
  refresh
} = useNextTrips(config)

// Fetch trips
await fetchNextTrips('1001', { limit: 5 })
```

### useRouteShapes

Composable for fetching route shapes data.

```typescript
import { useRouteShapes } from '@infobus/vue'

const {
  isLoading,
  error,
  shapes,
  routeInfo,
  fetchRouteShapes,
  getBounds
} = useRouteShapes(config)

// Fetch shapes
await fetchRouteShapes('R1', { simplify: true })
```

## TypeScript Support

The package includes full TypeScript support with comprehensive type definitions:

```typescript
import type {
  InfobusApiConfig,
  NextTrip,
  RouteShape,
  StopInfo,
  RouteInfo,
  NextTripsResponse,
  RouteShapesResponse
} from '@infobus/vue'
```

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build:lib

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Demo Site

A demo site is available for testing components:

```bash
# Start demo server
pnpm dev

# Build demo
pnpm build
```

## API Requirements

The components expect the following API endpoints:

- `GET /next-trips?stop_id={stopId}` - Returns next trips for a stop
- `GET /geo-shapes?route_id={routeId}` - Returns route shapes in GeoJSON format

### API Response Format

#### Next Trips Response

```json
{
  "stop_info": {
    "stop_id": "1001",
    "stop_name": "Main St & 1st Ave",
    "stop_lat": 40.7128,
    "stop_lon": -74.0060
  },
  "trips": [
    {
      "trip_id": "trip_123",
      "route_id": "R1",
      "route_short_name": "1",
      "route_long_name": "Downtown Express",
      "trip_headsign": "Downtown",
      "arrival_time": "2024-01-01T10:30:00Z",
      "departure_time": "2024-01-01T10:30:00Z",
      "estimated_arrival": "2024-01-01T10:32:00Z",
      "delay": 120
    }
  ],
  "last_updated": "2024-01-01T10:25:00Z"
}
```

#### Route Shapes Response

```json
{
  "route_info": {
    "route_id": "R1",
    "route_short_name": "1",
    "route_long_name": "Downtown Express",
    "route_type": 3,
    "route_color": "FF0000"
  },
  "shapes": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [[-74.0060, 40.7128], [-74.0070, 40.7138]]
        },
        "properties": {
          "shape_id": "shape_1",
          "route_id": "R1",
          "direction_id": 0
        }
      }
    ]
  }
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
