import React, { useState, useCallback, useMemo } from 'react';
import { loadGoogleMaps } from '../utils/googleMaps';
import MapComponent from './MapComponent';
import LocationSearch from './LocationSearch';
import { RouteStep, RouteAlternative, RouteData, LatLngLiteral } from '../types/maps';

const RoutePlanner: React.FC = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourceLocation, setSourceLocation] = useState<LatLngLiteral | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LatLngLiteral | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSourceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    setSource(place.formatted_address || place.name || '');
    if (place.geometry?.location) {
      setSourceLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    } else {
      setSourceLocation(null);
    }
  }, []);

  const handleDestinationSelect = useCallback((place: google.maps.places.PlaceResult) => {
    setDestination(place.formatted_address || place.name || '');
    if (place.geometry?.location) {
      setDestinationLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    } else {
      setDestinationLocation(null);
    }
  }, []);

  const handleRouteSelect = useCallback((route: RouteAlternative) => {
    if (!routeData) return;
    setRouteData({
      ...routeData,
      selectedRouteId: route.id,
    });
  }, [routeData]);

  const handlePlanRoute = async () => {
    if (!source || !destination || !sourceLocation || !destinationLocation) {
      setError('Please enter and select both source and destination locations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { google } = await loadGoogleMaps();
      if (!google) {
        throw new Error('Failed to load Google Maps API');
      }
      
      const directionsService = new google.maps.DirectionsService();
      const response = await directionsService.route({
        origin: sourceLocation,
        destination: destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
        unitSystem: google.maps.UnitSystem.METRIC,
      });

      if (!response.routes || response.routes.length === 0) {
        throw new Error('No routes found');
      }

      const routes: RouteAlternative[] = response.routes.map((route, index) => {
        const leg = route.legs[0];
        if (!leg) {
          throw new Error('No leg information available for the route');
        }

        // Calculate traffic level
        let trafficLevel: 'low' | 'moderate' | 'heavy' = 'low';
        if (leg.duration_in_traffic && leg.duration) {
          const trafficRatio = leg.duration_in_traffic.value / leg.duration.value;
          if (trafficRatio > 1.5) trafficLevel = 'heavy';
          else if (trafficRatio > 1.2) trafficLevel = 'moderate';
        }

        // Generate steps for the route
        const steps: RouteStep[] = leg.steps?.map(step => ({
          instructions: step.instructions || '',
          distance: {
            text: step.distance?.text || '',
            value: step.distance?.value || 0,
          },
          duration: {
            text: step.duration?.text || '',
            value: step.duration?.value || 0,
          },
          path: step.path?.map(p => ({ lat: p.lat(), lng: p.lng() })) || []
        })) || [];

        // Generate a random AQI value and determine the level
        const aqi = Math.floor(Math.random() * 300) + 1;
        let aqiLevel: 'good' | 'moderate' | 'unhealthy' | 'unhealthy-sensitive' | 'very_unhealthy' | 'hazardous' = 'good';
        if (aqi <= 50) aqiLevel = 'good';
        else if (aqi <= 100) aqiLevel = 'moderate';
        else if (aqi <= 150) aqiLevel = 'unhealthy-sensitive';
        else if (aqi <= 200) aqiLevel = 'unhealthy';
        else if (aqi <= 300) aqiLevel = 'very_unhealthy';
        else aqiLevel = 'hazardous';

                // Official government traffic alerts
        const trafficAlerts: TrafficAlert[] = [];
        
        // Official traffic status based on traffic level
        if (trafficLevel === 'heavy') {
          trafficAlerts.push({
            description: 'TRAFFIC ALERT: Major congestion reported by traffic control',
            severity: 'severe',
            type: 'official'
          });
          
          // Official traffic incidents for heavy traffic
          const officialAlerts = [
            'ROAD CLOSURE: Major accident investigation in progress',
            'DIVERSION: Emergency roadworks on main route',
            'TRAFFIC ADVISORY: Major event causing significant delays',
            'OFFICIAL: Heavy congestion due to special event traffic'
          ];
          
          trafficAlerts.push({
            description: officialAlerts[Math.floor(Math.random() * officialAlerts.length)],
            severity: 'severe',
            type: 'official'
          });
          
        } else if (trafficLevel === 'moderate') {
          trafficAlerts.push({
            description: 'TRAFFIC ADVISORY: Moderate traffic conditions',
            severity: 'moderate',
            type: 'official'
          });
          
          // Possible official alerts for moderate traffic
          if (Math.random() > 0.5) {
            const officialModerateAlerts = [
              'NOTICE: Lane restrictions for utility work',
              'ADVISORY: Traffic signals under maintenance',
              'ALERT: Temporary speed restrictions in effect',
              'NOTICE: Roadway maintenance in progress'
            ];
            
            trafficAlerts.push({
              description: officialModerateAlerts[Math.floor(Math.random() * officialModerateAlerts.length)],
              severity: 'moderate',
              type: 'official'
            });
          }
          
        } else {
          trafficAlerts.push({
            description: 'CURRENT: Normal traffic conditions',
            severity: 'low',
            type: 'official'
          });
        }
        
        // Official incident types
        const officialIncidentTypes = [
          { 
            type: 'accident', 
            severity: 'severe',
            details: [
              'EMERGENCY: Multi-vehicle collision - avoid area',
              'HAZMAT: Spill cleanup in progress - expect delays',
              'CRASH: Major accident with injuries - emergency response on scene',
              'INCIDENT: Overturned vehicle blocking multiple lanes'
            ]
          },
          { 
            type: 'construction', 
            severity: 'moderate',
            details: [
              'CONSTRUCTION: DOT road improvement project',
              'INFRASTRUCTURE: Bridge maintenance in progress',
              'ROAD WORK: Paving operations - expect lane shifts',
              'CONSTRUCTION: Highway expansion project - long-term delays'
            ]
          },
          {
            type: 'event',
            severity: 'moderate',
            details: [
              'EVENT: Road closures for official parade',
              'ALERT: Stadium event - increased traffic expected',
              'NOTICE: Road race - temporary road closures',
              'EVENT: Street festival - detours in effect'
            ]
          }
        ];
        
        // Add official traffic incidents (less frequent, more significant)
        const incidentChance = trafficLevel === 'heavy' ? 0.6 : trafficLevel === 'moderate' ? 0.3 : 0.1;
        if (Math.random() < incidentChance) {
          const incident = officialIncidentTypes[Math.floor(Math.random() * officialIncidentTypes.length)];
          const detail = incident.details[Math.floor(Math.random() * incident.details.length)];
          
          trafficAlerts.push({
            description: detail,
            severity: incident.severity,
            type: incident.type
          });
        }

        return {
          id: index,
          summary: leg.distance?.text || `Route ${index + 1}`,
          distance: {
            text: leg.distance?.text || '',
            value: leg.distance?.value || 0,
          },
          duration: {
            text: leg.duration?.text || '',
            value: leg.duration?.value || 0,
          },
          durationInTraffic: leg.duration_in_traffic ? {
            text: leg.duration_in_traffic.text || '',
            value: leg.duration_in_traffic.value || 0,
          } : undefined,
          trafficLevel,
          steps,
          path: leg.steps?.flatMap(step => 
            step.path?.map(p => ({ lat: p.lat(), lng: p.lng() })) || []
          ) || [],
          airQuality: {
            aqi,
            level: aqiLevel,
            mainPollutant: Math.random() > 0.5 ? 'PM2.5' : 'O3'
          },
          trafficAlerts
        };
      });

      setRouteData({
        source,
        sourceLocation,
        destination,
        destinationLocation,
        routes,
        selectedRouteId: 0,
      });
    } catch (err) {
      console.error('Error planning route:', err);
      setError('Failed to plan route. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoute = useMemo(() => {
    if (!routeData || !routeData.routes.length) return null;
    return routeData.routes.find(r => r.id === routeData.selectedRouteId) || routeData.routes[0] || null;
  }, [routeData]);

  // Process traffic alerts with correct severity type
  const processedTrafficAlerts = useMemo(() => {
    if (!selectedRoute?.trafficAlerts) return [];
    return selectedRoute.trafficAlerts.map(alert => ({
      ...alert,
      severity: alert.severity
    }));
  }, [selectedRoute]);

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get traffic level color based on traffic level
  const getTrafficLevelColor = (level: 'low' | 'moderate' | 'heavy') => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'heavy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get traffic level text
  const getTrafficLevelText = (level: 'low' | 'moderate' | 'heavy') => {
    switch (level) {
      case 'low': return 'Light Traffic';
      case 'moderate': return 'Moderate Traffic';
      case 'heavy': return 'Heavy Traffic';
      default: return 'Unknown Traffic';
    }
  };

  // Get AQI level color
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get AQI level text
  const getAqiLevel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Eco Predict AI</h1>
        
        {/* Traffic Updates Card */}
        {selectedRoute && (
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <h2 className="text-lg font-semibold">Traffic Updates</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Traffic Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">TRAFFIC STATUS</h3>
                  <div className="flex items-center">
                    <div className={`text-2xl font-bold ${getTrafficLevelColor(selectedRoute.trafficLevel)}`}>
                      {getTrafficLevelText(selectedRoute.trafficLevel)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedRoute.trafficLevel === 'heavy' ? 'Expect delays' : 'Smooth sailing'}
                  </div>
                </div>

                {/* Travel Time */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">TRAVEL TIME</h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedRoute.durationInTraffic?.text || selectedRoute.duration.text}
                  </div>
                  {selectedRoute.durationInTraffic && selectedRoute.durationInTraffic.value > selectedRoute.duration.value && (
                    <div className="text-sm text-red-500">
                      +{Math.round((selectedRoute.durationInTraffic.value - selectedRoute.duration.value) / 60)} min due to traffic
                    </div>
                  )}
                </div>

                {/* Air Quality */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">AIR QUALITY</h3>
                  <div className="flex items-center">
                    <div className={`text-2xl font-bold ${getAqiColor(selectedRoute.airQuality.aqi)}`}>
                      {selectedRoute.airQuality.aqi} AQI
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {getAqiLevel(selectedRoute.airQuality.aqi)}
                    {selectedRoute.airQuality.mainPollutant && ` • ${selectedRoute.airQuality.mainPollutant}`}
                  </div>
                </div>
              </div>

              {/* Traffic Alerts */}
              {selectedRoute.trafficAlerts && selectedRoute.trafficAlerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">TRAFFIC ALERTS</h3>
                  <div className="space-y-2">
                    {selectedRoute.trafficAlerts.map((alert, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`h-3 w-3 rounded-full ${alert.severity === 'severe' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-700">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocationSearch
              label="From"
              value={source}
              onChange={setSource}
              onPlaceSelect={handleSourceSelect}
              placeholder="Enter starting point"
            />
            <LocationSearch
              label="To"
              value={destination}
              onChange={setDestination}
              onPlaceSelect={handleDestinationSelect}
              placeholder="Enter destination"
            />
          </div>
          
          <div className="mt-6">
            <button
              onClick={handlePlanRoute}
              disabled={isLoading || !source || !destination}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || !source || !destination
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Planning Route...
                </span>
              ) : 'Plan Route'}
            </button>
          </div>
        </div>

        {routeData && selectedRoute && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Traffic</p>
                    <div className="flex items-center mt-1">
                      <div className={`h-2 rounded-full ${
                        selectedRoute.trafficLevel === 'low' ? 'bg-green-500' : 
                        selectedRoute.trafficLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} style={{ 
                        width: selectedRoute.trafficLevel === 'low' ? '33%' : 
                              selectedRoute.trafficLevel === 'moderate' ? '66%' : '100%' 
                      }}></div>
                      <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                        {selectedRoute.trafficLevel} traffic
                      </span>
                    </div>
                  </div>
                  
                  {selectedRoute.durationInTraffic && (
                    <div>
                      <p className="text-sm text-gray-500">Time in Traffic</p>
                      <p className="font-medium">
                        {selectedRoute.durationInTraffic.text} 
                        {selectedRoute.duration && (
                          <span className="text-sm text-gray-500 ml-2">
                            (Normally {selectedRoute.duration.text})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {processedTrafficAlerts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Traffic Alerts</p>
                      <div className="space-y-2">
                        {processedTrafficAlerts.map((alert, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`h-2 w-2 rounded-full ${
                                alert.severity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                            </div>
                            <p className="ml-2 text-sm text-gray-600">{alert.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Air Quality Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Air Quality</h3>
                {selectedRoute.airQuality ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                          selectedRoute.airQuality.level === 'good' ? 'bg-green-500' :
                          selectedRoute.airQuality.level === 'moderate' ? 'bg-yellow-500' :
                          selectedRoute.airQuality.level === 'unhealthy' ? 'bg-orange-500' :
                          selectedRoute.airQuality.level === 'very_unhealthy' ? 'bg-red-500' : 'bg-purple-500'
                        }`}>
                          {selectedRoute.airQuality.aqi}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {selectedRoute.airQuality.level.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            AQI {selectedRoute.airQuality.aqi}
                            {selectedRoute.airQuality.mainPollutant && ` • ${selectedRoute.airQuality.mainPollutant}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Health Recommendations</h4>
                      {selectedRoute.airQuality.level === 'good' && (
                        <p className="text-sm text-gray-600">Air quality is satisfactory, and air pollution poses little or no risk.</p>
                      )}
                      {selectedRoute.airQuality.level === 'moderate' && (
                        <p className="text-sm text-gray-600">Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.</p>
                      )}
                      {selectedRoute.airQuality.level === 'unhealthy' && (
                        <p className="text-sm text-gray-600">Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.</p>
                      )}
                      {selectedRoute.airQuality.level === 'very_unhealthy' && (
                        <p className="text-sm text-gray-600">Health alert: The risk of health effects is increased for everyone.</p>
                      )}
                      {selectedRoute.airQuality.level === 'hazardous' && (
                        <p className="text-sm text-gray-600">Health warning of emergency conditions: everyone is more likely to be affected.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Air quality data not available for this route.</p>
                )}
              </div>
            </div>

            {/* Map Component */}
            {selectedRoute.path && selectedRoute.path.length > 0 && routeData.sourceLocation && routeData.destinationLocation && (
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Route Overview</h3>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapComponent
                    source={routeData.sourceLocation}
                    destination={routeData.destinationLocation}
                    path={selectedRoute.path}
                    routes={routeData.routes}
                    selectedRouteId={routeData.selectedRouteId}
                    onRouteSelect={handleRouteSelect}
                  />
                </div>
              </div>
            )}

            {/* Route Steps */}
            {selectedRoute.steps && selectedRoute.steps.length > 0 && (
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Turn-by-Turn Directions</h3>
                <div className="space-y-4">
                  {selectedRoute.steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: step.instructions }}></p>
                        <p className="text-sm text-gray-500 mt-1">
                          {step.distance.text} • {step.duration.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePlanner;