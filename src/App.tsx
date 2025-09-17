import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Cloud, Wind, AlertTriangle, Clock, Route } from 'lucide-react';
import MapComponent from './components/MapComponent';
import WeatherCard from './components/WeatherCard';
import AirQualityCard from './components/AirQualityCard';
import TrafficAlert from './components/TrafficAlert';
import RouteForm from './components/RouteForm';

interface RouteData {
  source: string;
  destination: string;
  distance: string;
  duration: string;
  trafficLevel: 'low' | 'moderate' | 'heavy';
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

interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  recommendation: string;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
}

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate initial data load
    setWeatherData({
      location: 'Current Location',
      temperature: 22,
      condition: 'Partly Cloudy',
      precipitation: 15,
      windSpeed: 8,
      humidity: 65,
      alerts: []
    });

    setAirQualityData({
      aqi: 85,
      pm25: 35,
      pm10: 55,
      o3: 45,
      recommendation: 'Air quality is acceptable for most people',
      level: 'moderate'
    });
  }, []);

  const handleRouteSearch = async (source: string, destination: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setRouteData({
        source,
        destination,
        distance: '24.8 km',
        duration: '38 min',
        trafficLevel: 'moderate'
      });

      // Update weather for destination
      setWeatherData({
        location: destination,
        temperature: 24,
        condition: 'Light Rain',
        precipitation: 75,
        windSpeed: 12,
        humidity: 80,
        alerts: ['Heavy rainfall expected in 2 hours']
      });

      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Smart Route Planner</h1>
            </div>
            <div className="text-sm text-gray-600">
              Real-time Traffic • Weather • Air Quality
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Route Form */}
            <RouteForm onSearch={handleRouteSearch} isLoading={isLoading} />

            {/* Weather Card */}
            {weatherData && <WeatherCard data={weatherData} />}

            {/* Air Quality Card */}
            {airQualityData && <AirQualityCard data={airQualityData} />}

            {/* Traffic Alert */}
            {routeData && (
              <TrafficAlert 
                trafficLevel={routeData.trafficLevel}
                duration={routeData.duration}
              />
            )}

          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
              <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center px-6">
                <Route className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-semibold text-gray-900">Route Overview</span>
                {routeData && (
                  <div className="ml-auto flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {routeData.distance}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {routeData.duration}
                    </span>
                  </div>
                )}
              </div>
              
              <MapComponent routeData={routeData} />
            </div>

            {/* Route Details */}
            {routeData && (
              <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">From:</span>
                      <span className="ml-2 font-medium text-gray-900">{routeData.source}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">To:</span>
                      <span className="ml-2 font-medium text-gray-900">{routeData.destination}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Distance:</span>
                      <span className="font-medium text-gray-900">{routeData.distance}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-medium text-gray-900">{routeData.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;