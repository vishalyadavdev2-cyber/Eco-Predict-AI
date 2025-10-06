import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMaps';
import { MapComponentProps } from '../types/maps';

declare global {
  interface Window {
    google: typeof google;
  }
}

const ROUTE_COLORS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC05', // Yellow
  '#EA4335', // Red
  '#673AB7', // Purple
];

const MapComponent: React.FC<MapComponentProps> = ({
  source,
  destination,
  waypoints = [],
  onRouteSelect,
  selectedRouteId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const directionsRenderers = useRef<google.maps.DirectionsRenderer[]>([]);
  const markers = useRef<google.maps.Marker[]>([]); // Ref to hold markers

  // Effect for initializing the map instance (runs only once)
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: 20.5937, lng: 78.9629 }, // Default center of India
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        setMap(mapInstance);
        setDirectionsService(new google.maps.DirectionsService());
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key and internet connection.');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup on component unmount
    return () => {
      directionsRenderers.current.forEach(renderer => renderer.setMap(null));
      markers.current.forEach(marker => marker.setMap(null)); // Clean up markers
      directionsRenderers.current = [];
      markers.current = [];
    };
  }, []);

  // Effect for calculating and displaying routes when inputs change
  useEffect(() => {
    if (!map || !directionsService || !source || !destination) return;

    const calculateAndRenderRoutes = async () => {
      directionsRenderers.current.forEach(renderer => renderer.setMap(null));
      directionsRenderers.current = [];

      const request: google.maps.DirectionsRequest = {
        origin: source,
        destination: destination,
        waypoints: waypoints.map(wp => ({
          location: wp.location as google.maps.LatLngLiteral,
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
      };

      try {
        const result = await directionsService.route(request);
        if (result.status === google.maps.DirectionsStatus.OK) {
          const bounds = new google.maps.LatLngBounds();
          directionsRenderers.current = result.routes.map((route, index) => {
            const renderer = new google.maps.DirectionsRenderer({
              map,
              directions: result,
              routeIndex: index,
              suppressMarkers: true, // Suppress default markers to use our own
              polylineOptions: {
                strokeColor: ROUTE_COLORS[index % ROUTE_COLORS.length],
                strokeWeight: 4,
                strokeOpacity: 0.5,
                zIndex: 50 - index,
              },
            });

            renderer.addListener('click', () => onRouteSelect?.(index));
            
            route.legs.forEach(leg => {
              leg.steps.forEach(step => {
                step.path.forEach(point => bounds.extend(point));
              });
            });
            return renderer;
          });
          
          map.fitBounds(bounds, 60);

          if (onRouteSelect && (selectedRouteId === undefined || selectedRouteId === null)) {
            onRouteSelect(0);
          }
        } else {
          setError(`Failed to find routes. Status: ${result.status}`);
        }
      } catch (err) {
        console.error('Error calculating routes:', err);
        setError('An error occurred while calculating routes.');
      }
    };

    calculateAndRenderRoutes();
  }, [map, directionsService, source, destination, waypoints, onRouteSelect]);

  // Effect to add/update markers for source and destination
  useEffect(() => {
    // Clear previous markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    if (map && source && destination) {
      const sourceMarker = new google.maps.Marker({
        position: source,
        map,
        label: { text: "A", color: "white", fontWeight: "bold" },
      });

      const destinationMarker = new google.maps.Marker({
        position: destination,
        map,
        label: { text: "B", color: "white", fontWeight: "bold" },
      });

      markers.current.push(sourceMarker, destinationMarker);
    }
  }, [map, source, destination]);

  // Effect to update route styles when a route is selected
  useEffect(() => {
    directionsRenderers.current.forEach((renderer, index) => {
      const isSelected = index === selectedRouteId;
      renderer.setOptions({
        polylineOptions: {
          strokeWeight: isSelected ? 7 : 4,
          strokeOpacity: isSelected ? 0.9 : 0.5,
          zIndex: isSelected ? 100 : 50 - index,
        },
      });
    });
  }, [selectedRouteId]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-600 text-lg font-medium">Loading Map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg text-red-600">
            <p className="text-lg font-medium">Error: {error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;