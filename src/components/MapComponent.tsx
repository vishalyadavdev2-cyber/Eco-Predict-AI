import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Zap, AlertTriangle } from 'lucide-react';

interface RouteData {
  source: string;
  destination: string;
  distance: string;
  duration: string;
  trafficLevel: 'low' | 'moderate' | 'heavy';
}

interface MapComponentProps {
  routeData: RouteData | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ routeData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = 'AIzaSyDrQI7tIdY3L8QyMWGmX6FsAj8Rntk1biY'; // Replace with your actual API key
        
        if (apiKey === 'AIzaSyDrQI7tIdY3L8QyMWGmX6FsAj8Rntk1biY') {
          setError('Google Maps API key not configured. Please add your API key to use the mapping functionality.');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
            zoom: 13,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#f5f5f5' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#c9d6e5' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#dadada' }]
              }
            ],
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
          });

          const directionsServiceInstance = new google.maps.DirectionsService();
          const directionsRendererInstance = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#4F46E5',
              strokeWeight: 6,
              strokeOpacity: 0.8
            }
          });

          directionsRendererInstance.setMap(mapInstance);

          setMap(mapInstance);
          setDirectionsService(directionsServiceInstance);
          setDirectionsRenderer(directionsRendererInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Update route when routeData changes
  useEffect(() => {
    if (routeData && directionsService && directionsRenderer && map) {
      const request: google.maps.DirectionsRequest = {
        origin: routeData.source,
        destination: routeData.destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: true
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          
          // Add traffic layer
          const trafficLayer = new google.maps.TrafficLayer();
          trafficLayer.setMap(map);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    }
  }, [routeData, directionsService, directionsRenderer, map]);

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'heavy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (error) {
    return (
      <div className="h-96 bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium">Map Loading Error</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <p className="text-red-400 text-xs mt-2">Please add your Google Maps API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading Map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Traffic level indicator overlay */}
      {routeData && !isLoading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-2">
              <Zap className={`h-4 w-4 ${getTrafficColor(routeData.trafficLevel)}`} />
              <span className="text-sm font-medium capitalize">{routeData.trafficLevel} Traffic</span>
            </div>
          </div>
        </div>
      )}

      {/* Route info overlay */}
      {routeData && !isLoading && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Current Route</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {routeData.distance}
                </span>
                <span className="flex items-center">
                  <Navigation className="h-4 w-4 mr-1" />
                  {routeData.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No route placeholder */}
      {!routeData && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="text-center text-white">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-70" />
            <p className="text-lg font-medium">Enter locations to view route</p>
            <p className="text-sm mt-2 opacity-80">Real-time traffic and weather updates</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;