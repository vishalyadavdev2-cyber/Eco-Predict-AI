import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, AlertTriangle } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  alerts: string[];
}

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) {
      return <Droplets className="h-8 w-8 text-blue-500" />;
    }
    return <Cloud className="h-8 w-8 text-gray-500" />;
  };

  const getPrecipitationColor = (precipitation: number) => {
    if (precipitation > 70) return 'text-red-500';
    if (precipitation > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
          <Cloud className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Weather Conditions</h3>
          <p className="text-sm text-gray-600">{data.location}</p>
        </div>
      </div>

      {/* Current weather */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getWeatherIcon(data.condition)}
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.temperature}°C</p>
            <p className="text-sm text-gray-600">{data.condition}</p>
          </div>
        </div>
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className={`h-4 w-4 ${getPrecipitationColor(data.precipitation)}`} />
              <span className="text-sm text-gray-600">Rain</span>
            </div>
            <span className="text-sm font-medium">{data.precipitation}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Wind</span>
            </div>
            <span className="text-sm font-medium">{data.windSpeed} km/h</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Humidity</span>
            </div>
            <span className="text-sm font-medium">{data.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Weather alerts */}
      {data.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Weather Alert</p>
              {data.alerts.map((alert, index) => (
                <p key={index} className="text-sm text-yellow-700 mt-1">{alert}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;