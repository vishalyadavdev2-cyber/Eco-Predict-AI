// Define LatLngLiteral locally to avoid dependency on leaflet
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instructions: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  path: LatLngLiteral[];
}

export interface TrafficAlert {
  description: string;
  severity: 'low' | 'moderate' | 'severe';
}

export interface AirQuality {
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy' | 'unhealthy-sensitive' | 'very_unhealthy' | 'hazardous';
  mainPollutant: string;
}

export interface RouteAlternative {
  id: number;
  summary: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  durationInTraffic?: { text: string; value: number };
  trafficLevel: 'low' | 'moderate' | 'heavy';
  steps: RouteStep[];
  path: LatLngLiteral[];
  overviewPath?: google.maps.LatLngLiteral[];
  bounds?: google.maps.LatLngBoundsLiteral;
  airQuality: AirQuality;
  trafficAlerts: TrafficAlert[];
}

export interface RouteData {
  source: string;
  sourceLocation?: LatLngLiteral;
  destination: string;
  destinationLocation?: LatLngLiteral;
  routes: RouteAlternative[];
  selectedRouteId: number | null;
}

export interface MapComponentProps {
  source: LatLngLiteral;
  destination: LatLngLiteral;
  path: LatLngLiteral[];
  waypoints?: google.maps.DirectionsWaypoint[];
  onRouteSelect?: (route: RouteAlternative) => void;
  selectedRouteId?: number | null;
  routes?: RouteAlternative[];
}
