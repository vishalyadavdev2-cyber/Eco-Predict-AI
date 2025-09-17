// Google Maps TypeScript declarations
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: MapTypeStyle[];
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: MapTypeStyler[];
    }

    interface MapTypeStyler {
      color?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class DirectionsService {
      route(
        request: DirectionsRequest,
        callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
      ): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
    }

    interface DirectionsRendererOptions {
      suppressMarkers?: boolean;
      polylineOptions?: PolylineOptions;
    }

    interface PolylineOptions {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral;
      destination: string | LatLng | LatLngLiteral;
      travelMode: TravelMode;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      optimizeWaypoints?: boolean;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      distance: Distance;
      duration: Duration;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    type DirectionsStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';

    class TrafficLayer {
      setMap(map: Map | null): void;
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: QueryAutocompletePrediction[] | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        componentRestrictions?: ComponentRestrictions;
      }

      interface ComponentRestrictions {
        country?: string | string[];
      }

      interface QueryAutocompletePrediction {
        place_id: string;
        description: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        ZERO_RESULTS = 'ZERO_RESULTS',
        NOT_FOUND = 'NOT_FOUND'
      }
    }
  }
}

export {};