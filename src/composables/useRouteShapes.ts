import { ref, computed, type Ref } from 'vue'
import { useInfobusApi } from './useInfobusApi'
import type {
  InfobusApiConfig,
  RouteShapesResponse,
  GeoJSONFeatureCollection
} from '../types'

export function useRouteShapes(config: InfobusApiConfig) {
  const { isLoading, error, makeRequest } = useInfobusApi(config)
  const data: Ref<RouteShapesResponse | null> = ref(null)
  const lastFetch = ref<Date | null>(null)

  const shapes = computed(() => data.value?.shapes || null)
  const routeInfo = computed(() => data.value?.route_info || null)
  const features = computed(() => data.value?.shapes?.features || [])

  const fetchRouteShapes = async (
    routeId: string,
    options: {
      directionId?: number
      includeStops?: boolean
      simplify?: boolean
      format?: 'geojson' | 'polyline'
    } = {}
  ): Promise<GeoJSONFeatureCollection> => {
    try {
      const params = new URLSearchParams({
        route_id: routeId,
        ...(options.directionId !== undefined && {
          direction_id: options.directionId.toString()
        }),
        ...(options.includeStops !== undefined && {
          include_stops: options.includeStops.toString()
        }),
        ...(options.simplify !== undefined && {
          simplify: options.simplify.toString()
        }),
        ...(options.format && { format: options.format })
      })

      // const response = await makeRequest<RouteShapesResponse>(
      //   `/geo-shapes?${params.toString()}`
      // )

      // data.value = response
      lastFetch.value = new Date()

      let myRoutes = getUserRouteOptions();
      // console.log("Routes With Stops:", JSON.stringify(myRoutes, null, 2));

      // const mydata: GeoJSONFeatureCollection = JSON.parse(actualGeoJsonBusStops);
      console.log(routeId);
      const mydata: GeoJSONFeatureCollection = myRoutes[routeId];

      // return response.shapes
      return mydata
    } catch (err) {
      console.error('Error fetching route shapes:', err)
      throw err
    }
  }

  const refresh = async (routeId: string, options = {}) => {
    return await fetchRouteShapes(routeId, options)
  }

  // Helper to get shapes by direction
  const getShapesByDirection = (directionId: number) => {
    return features.value.filter(
      (feature) => feature.properties.direction_id === directionId
    )
  }

  // Helper to get all coordinates for bounds calculation
  const getAllCoordinates = () => {
    const coordinates: [number, number][] = []
    features.value.forEach((feature) => {
      if (feature.geometry.type === 'LineString') {
        coordinates.push(...feature.geometry.coordinates)
      }
    })
    return coordinates
  }

  // Helper to calculate bounds
  const getBounds = () => {
    const coordinates = getAllCoordinates()
    if (coordinates.length === 0) return null

    const lats = coordinates.map((coord) => coord[1])
    const lngs = coordinates.map((coord) => coord[0])

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }

  // Helper to check if data is stale
  const isStale = (maxAgeMinutes = 30) => {
    if (!lastFetch.value) return true
    const now = new Date()
    const diffMs = now.getTime() - lastFetch.value.getTime()
    const diffMinutes = diffMs / (1000 * 60)
    return diffMinutes > maxAgeMinutes
  }

  return {
    isLoading,
    error,
    data,
    shapes,
    routeInfo,
    features,
    lastFetch,
    fetchRouteShapes,
    refresh,
    getShapesByDirection,
    getAllCoordinates,
    getBounds,
    isStale
  }
}

function findBusStopById(busStopId: any) {
  // Find the bus stop in the actualGeoJsonBusStops array by its stop_id
  const busStop = JSON.parse(actualGeoJsonBusStops).features.find((stop: any) => stop.properties.stop_id === busStopId);
  if (busStop) {
    // Return the full info of the bus stop
    return busStop;
  }
}

function getUserRouteOptions(): Record<string, GeoJSONFeatureCollection> {
  console.log("Start of getUserRouteOptions()");
  const routesWithStops: Record<string, GeoJSONFeatureCollection> = {};

  const parsedRoutes: any = actualRoutesJSONWithBusStops;

  parsedRoutes.forEach((route: any) => {
    const dynamicAttribute = `${route.route_id}__${route.shape_id}`;
    console.log("Looping thru parsedRoutes, name of discovered route: " + dynamicAttribute);

    if (!routesWithStops[dynamicAttribute]) {
      routesWithStops[dynamicAttribute] = JSON.parse(emptyFeatureCollection);
      // routesWithStops[dynamicAttribute] = [];
    }

    routesWithStops[dynamicAttribute].features.push(findBusStopById(route.stop_id));
  });

  return routesWithStops;
}
const emptyFeatureCollection = `{
  "type": "FeatureCollection",
  "features": []
}`

const actualGeoJsonBusStops = `{
  "type": "FeatureCollection",
  "features": [
    {
      "id": 1,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.048992957286, 9.93561013632322]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_01",
        "stop_code": "",
        "stop_name": "Facultad de Educación",
        "stop_heading": null,
        "stop_desc": "Frente al jardín de la Facultad de Educación (FE)",
        "stop_lat": "9.935610",
        "stop_lon": "-84.048993",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 2,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0521755990149, 9.93550159828788]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_02",
        "stop_code": "",
        "stop_name": "Escuela de Artes Plásticas",
        "stop_heading": null,
        "stop_desc": "Nuevo edificio de la Escuela de Artes Plásticas (EAP)",
        "stop_lat": "9.935502",
        "stop_lon": "-84.052176",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 3,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0517499001992, 9.93860832346218]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_03",
        "stop_code": "",
        "stop_name": "Biblioteca de Ciencias de la Salud",
        "stop_heading": null,
        "stop_desc": "Frente al antiguo edificio de la Facultad de Odontología (FOd), diagonal al parqueo de la Biblioteca de Ciencias de la Salud",
        "stop_lat": "9.938608",
        "stop_lon": "-84.051750",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 4,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0487604984007, 9.93832361909286]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_04",
        "stop_code": "",
        "stop_name": "Facultad de Microbiología",
        "stop_heading": null,
        "stop_desc": "Esquina noreste del parqueo de las Escuelas de Artes Musicales (EAM), Química (EQ) y Biología (EB) y la Facultad de Microbiología (FMic)",
        "stop_lat": "9.938324",
        "stop_lon": "-84.048761",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 5,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0453750474415, 9.93590391543794]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_05",
        "stop_code": "",
        "stop_name": "Laboratorio Nacional de Materiales y Modelos Estructurales (LanammeUCR)",
        "stop_heading": null,
        "stop_desc": "Junto al parqueo del Centro de Transferencia Tecnológica (CTT), diagonal al Laboratorio Nacional de Materiales y Modelos Estructurales (LANAMME)",
        "stop_lat": "9.935904",
        "stop_lon": "-84.045375",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_LA",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 6,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0446764430078, 9.93746731144151]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_06",
        "stop_code": "",
        "stop_name": "Facultad de Ingeniería",
        "stop_heading": null,
        "stop_desc": "Costado norte del nuevo edificio de la Facultad de Ingeniería (FI)",
        "stop_lat": "9.937467",
        "stop_lon": "-84.044676",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_FI",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 7,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0423789247891, 9.93802960767692]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_07",
        "stop_code": "",
        "stop_name": "Facultad de Ciencias Sociales",
        "stop_heading": null,
        "stop_desc": "Entre la Facultad de Ciencias Sociales (FCS) y el edificio de parqueos",
        "stop_lat": "9.938030",
        "stop_lon": "-84.042379",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_CS",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 8,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0430777626604, 9.93945164782314]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_08",
        "stop_code": "",
        "stop_name": "Instituto de Investigación en Educación (INIE)",
        "stop_heading": null,
        "stop_desc": "Costado sur del edificio del Instituto de Investigación en Educación (INIE)",
        "stop_lat": "9.939452",
        "stop_lon": "-84.043078",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 9,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.044506756903, 9.94015516886255]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_09",
        "stop_code": "",
        "stop_name": "Centro de Investigación en Cirugía y Cáncer (CICICA)",
        "stop_heading": null,
        "stop_desc": "Costado sur del edificio del Centro de Investigación en Cirugía y Cáncer (CICICA)",
        "stop_lat": "9.940155",
        "stop_lon": "-84.044507",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 10,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0446834624541, 9.94376122039143]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_10",
        "stop_code": "",
        "stop_name": "Oficina de Bienestar y Salud (OBS)",
        "stop_heading": null,
        "stop_desc": "Entre el nuevo edificio de la Oficina de Bienestar y Salud (OBS) y el Estadio Ecológico",
        "stop_lat": "9.943761",
        "stop_lon": "-84.044684",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 11,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0451915613564, 9.94644105082793]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_0_11",
        "stop_code": "",
        "stop_name": "Facultad de Odontología",
        "stop_heading": null,
        "stop_desc": "En el nuevo edificio de la Facultad de Odontología (FOd) en la Finca 3",
        "stop_lat": "9.946441",
        "stop_lon": "-84.045192",
        "zone_id": "bUCR_0",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 12,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.045354583138, 9.94652950084742]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_01",
        "stop_code": "",
        "stop_name": "Facultad de Odontología",
        "stop_heading": null,
        "stop_desc": "En el nuevo edificio de la Facultad de Odontología (FOd) en la Finca 3",
        "stop_lat": "9.946530",
        "stop_lon": "-84.045355",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 13,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0449518073971, 9.94338144408136]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_02",
        "stop_code": "",
        "stop_name": "Escuela de Educación Física y Deportes (EDUFI)",
        "stop_heading": null,
        "stop_desc": "Costado este de las canchas multiuso y de la Escuela de Educación Física y Deportes (EDUFI)",
        "stop_lat": "9.943381",
        "stop_lon": "-84.044952",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 14,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0446865456529, 9.93913459155986]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_03",
        "stop_code": "",
        "stop_name": "Escuela de Nutrición",
        "stop_heading": null,
        "stop_desc": "Esquina noreste del edificio de la Escuela de Nutrición (ENu)",
        "stop_lat": "9.939135",
        "stop_lon": "-84.044687",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 15,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0436758508172, 9.93898038138971]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_04",
        "stop_code": "",
        "stop_name": "Centro de Investigación en Ciencias del Mar y Limnología (CIMAR)",
        "stop_heading": null,
        "stop_desc": "Entre el edificio de parqueos y el Centro de Investigación en Ciencias del Mar y Limnología (CIMAR)",
        "stop_lat": "9.938980",
        "stop_lon": "-84.043676",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 16,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.042189216776, 9.93947279204209]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_05",
        "stop_code": "",
        "stop_name": "Centro de Investigación en Matemática Pura y Aplicada (CIMPA)",
        "stop_heading": null,
        "stop_desc": "Frente al edificio del Centro de Investigación en Matemática Pura y Aplicada (CIMPA)",
        "stop_lat": "9.939473",
        "stop_lon": "-84.042189",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 17,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0422955151037, 9.93813052902614]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_06",
        "stop_code": "",
        "stop_name": "Facultad de Ciencias Sociales",
        "stop_heading": null,
        "stop_desc": "Entre la Facultad de Ciencias Sociales (FCS) y el edificio de parqueos",
        "stop_lat": "9.938131",
        "stop_lon": "-84.042296",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_CS",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 18,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0450182276884, 9.93746866941996]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_07",
        "stop_code": "",
        "stop_name": "Facultad de Ingeniería",
        "stop_heading": null,
        "stop_desc": "Costado norte del nuevo edificio de la Facultad de Ingeniería (FI), al otro lado de la calle",
        "stop_lat": "9.937469",
        "stop_lon": "-84.045018",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_FI",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 19,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0454695091189, 9.93589305371453]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_1_08",
        "stop_code": "",
        "stop_name": "Laboratorio Nacional de Materiales y Modelos Estructurales (LanammeUCR)",
        "stop_heading": null,
        "stop_desc": "Junto al parqueo del Centro de Transferencia Tecnológica (CTT), diagonal al Laboratorio Nacional de Materiales y Modelos Estructurales (LANAMME), al otro lado de la calle",
        "stop_lat": "9.935893",
        "stop_lon": "-84.045470",
        "zone_id": "bUCR_1",
        "stop_url": "",
        "location_type": 0,
        "parent_station": "bUCR_LA",
        "stop_timezone": "",
        "wheelchair_boarding": 2,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 20,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0446764430078, 9.93746731144151]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_FI",
        "stop_code": "",
        "stop_name": "Facultad de Ingeniería",
        "stop_heading": null,
        "stop_desc": "En las inmediaciones del edificio de la Facultad de Ingeniería",
        "stop_lat": "9.937467",
        "stop_lon": "-84.044676",
        "zone_id": "",
        "stop_url": "",
        "location_type": 1,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 21,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0422955151037, 9.93813052902614]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_CS",
        "stop_code": "",
        "stop_name": "Facultad de Ciencias Sociales",
        "stop_heading": null,
        "stop_desc": "En las inmediaciones del edificio de la Facultad de Ciencias Sociales",
        "stop_lat": "9.938131",
        "stop_lon": "-84.042296",
        "zone_id": "",
        "stop_url": "",
        "location_type": 1,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    },
    {
      "id": 22,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-84.0454406749733, 9.93578514170728]
      },
      "properties": {
        "feed": "1",
        "stop_id": "bUCR_LA",
        "stop_code": "",
        "stop_name": "Laboratorio Nacional de Materiales y Modelos Estructurales (LanammeUCR)",
        "stop_heading": null,
        "stop_desc": "En las inmediaciones del Laboratorio Nacional de Materiales y Modelos Estructurales (LanammeUCR)",
        "stop_lat": "9.935785",
        "stop_lon": "-84.045441",
        "zone_id": "",
        "stop_url": "",
        "location_type": 1,
        "parent_station": "",
        "stop_timezone": "",
        "wheelchair_boarding": 1,
        "platform_code": "",
        "shelter": null,
        "bench": null,
        "lit": null,
        "bay": null,
        "device_charging_station": null
      }
    }
  ]
}`










const actualRoutesJSONWithBusStops = [
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_01",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_05",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_06",
    "stop_sequence": "2",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_07",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_08",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_09",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_10",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_educacion_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_11",
    "stop_sequence": "8",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_01",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_03",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_04",
    "stop_sequence": "2",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_05",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_06",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_07",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_08",
    "stop_sequence": "6",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_09",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_10",
    "stop_sequence": "9",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_educacion_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_11",
    "stop_sequence": "10",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_02",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_05",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_06",
    "stop_sequence": "2",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_07",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_08",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_09",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_10",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "desde_artes_sin_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_11",
    "stop_sequence": "8",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_02",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_03",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_04",
    "stop_sequence": "2",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_05",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_06",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_07",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_08",
    "stop_sequence": "6",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_09",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_10",
    "stop_sequence": "9",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L2",
    "shape_id": "desde_artes_con_milla",
    "direction_id": "0",
    "stop_id": "bUCR_0_11",
    "stop_sequence": "10",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_01",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_02",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_03",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_04",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_05",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_06",
    "stop_sequence": "6",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_07",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_1_08",
    "stop_sequence": "8",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_educacion",
    "direction_id": "1",
    "stop_id": "bUCR_0_01",
    "stop_sequence": "9",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_01",
    "stop_sequence": "0",
    "timepoint": "1",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_02",
    "stop_sequence": "1",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_03",
    "stop_sequence": "3",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_04",
    "stop_sequence": "4",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_05",
    "stop_sequence": "5",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_06",
    "stop_sequence": "6",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_07",
    "stop_sequence": "7",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_1_08",
    "stop_sequence": "8",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  },
  {
    "route_id": "bUCR_L1",
    "shape_id": "hacia_artes",
    "direction_id": "1",
    "stop_id": "bUCR_0_02",
    "stop_sequence": "10",
    "timepoint": "0",
    "shape_dist_traveled": "",
    "stop_headsign": ""
  }
]