import React, { useState, useCallback } from 'react';
import AirQualityCard from '../components/AirQualityCard';
import TrafficAlert from '../components/TrafficAlert';
import WeatherCard from '../components/WeatherCard';
import { loadGoogleMaps } from '../utils/googleMaps';
import { AlertTriangle } from 'lucide-react';

interface TrafficData {
  trafficLevel: 'low' | 'moderate' | 'heavy';
  duration: string;
  distance: string;
}

interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  recommendation: string;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  alerts: string[];
}

const Dashboard = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const getAirQualityLevel = useCallback((aqi: number): AirQualityData['level'] => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy';
    return 'hazardous';
  }, []);

  const getAirQualityRecommendation = useCallback((aqi: number): string => {
    if (aqi <= 50) return 'Air quality is satisfactory. Enjoy your outdoor activities!';
    if (aqi <= 100) return 'Air quality is acceptable. Consider reducing prolonged outdoor exertion.';
    if (aqi <= 150) return 'Sensitive groups should reduce outdoor activities.';
    return 'Avoid outdoor activities. Keep windows and doors closed.';
  }, []);

  // Function to get weather data
  const getWeatherData = useCallback(async (location: string) => {
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      setWeatherData({
        location: data.name || 'Unknown',
        temperature: Math.round(data.main?.temp - 273.15) || 0, // Convert from Kelvin to Celsius
        condition: data.weather?.[0]?.main || 'Unknown',
        precipitation: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        windSpeed: data.wind?.speed || 0,
        humidity: data.main?.humidity || 0,
        alerts: [],
      });
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data');
    }
  }, []);

  // Function to get air quality data
  const getAirQualityData = useCallback(async (location: string) => {
    try {
      const response = await fetch(`/api/air-quality?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      const aqi = data.aqi || 0;
      setAirQualityData({
        aqi,
        pm25: data.components?.pm2_5 || 0,
        pm10: data.components?.pm10 || 0,
        o3: data.components?.o3 || 0,
        recommendation: getAirQualityRecommendation(aqi),
        level: getAirQualityLevel(aqi),
      });
      
      await getWeatherData(location);
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Failed to load air quality data');
    }
  }, [getAirQualityLevel, getAirQualityRecommendation, getWeatherData]);

  // Function to get traffic data
  const getTrafficData = useCallback(async (origin: string, destination: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Input validation
      if (!origin.trim() || !destination.trim()) {
        throw new Error('Please provide both origin and destination');
      }
      
      const { google } = await loadGoogleMaps();
      const directionsService = new google.maps.DirectionsService();
      
      // First, try to geocode the locations to validate them
      const geocoder = new google.maps.Geocoder();
      
      // Geocode origin
      const [originResults, destinationResults] = await Promise.all([
        new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: origin }, (results, status) => {
            if (status === 'OK') resolve(results || []);
            else reject(new Error(`Could not find location: ${origin}`));
          });
        }),
        new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK') resolve(results || []);
            else reject(new Error(`Could not find location: ${destination}`));
          });
        })
      ]);
      
      if (!originResults.length || !destinationResults.length) {
        throw new Error('Could not find one or both of the specified locations');
      }
      
      // Get directions with traffic model
      const response = await directionsService.route({
        origin: originResults[0].geometry.location,
        destination: destinationResults[0].geometry.location,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
        provideRouteAlternatives: false,
      });

      const route = response.routes[0];
      const leg = route.legs[0];
      
      if (!leg) {
        throw new Error('No route could be found between the specified locations');
      }
      
      // Determine traffic level based on duration in traffic vs free flow
      const durationInTraffic = leg.duration_in_traffic?.value || 0;
      const duration = leg.duration?.value || 1; // Avoid division by zero
      const trafficRatio = durationInTraffic / duration;
      
      let trafficLevel: 'low' | 'moderate' | 'heavy' = 'low';
      if (trafficRatio > 1.5) trafficLevel = 'heavy';
      else if (trafficRatio > 1.2) trafficLevel = 'moderate';
      
      setTrafficData({
        trafficLevel,
        duration: leg.duration_in_traffic?.text || leg.duration?.text || 'Unknown',
        distance: leg.distance?.text || 'Unknown',
      });
      
      // Get air quality data for the destination
      getAirQualityData(destination);
      
    } catch (err) {
      console.error('Error fetching traffic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load traffic data. Please check the locations and try again.');
    } finally {
      setLoading(false);
    }
  }, [getAirQualityData]);

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    
    try {
      await getTrafficData(origin, destination);
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('Failed to process your request');
    }
  }, [origin, destination, getTrafficData]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Traffic & Weather Dashboard</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Point
                </label>
                <input
                  type="text"
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter starting location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Traffic & Weather'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Air Quality Card */}
            <div className="md:col-span-1">
              {airQualityData ? (
                <AirQualityCard data={airQualityData} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center text-gray-500">
                  Enter locations to see air quality data
                </div>
              )}
            </div>
            
            {/* Traffic Alert */}
            <div className="md:col-span-1">
              {trafficData ? (
                <TrafficAlert 
                  trafficLevel={trafficData.trafficLevel} 
                  duration={trafficData.duration} 
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center text-gray-500">
                  Enter locations to see traffic information
                </div>
              )}
            </div>
            
            {/* Weather Card */}
            <div className="md:col-span-1">
              {weatherData ? (
                <WeatherCard data={weatherData} />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center text-gray-500">
                  Enter locations to see weather information
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
