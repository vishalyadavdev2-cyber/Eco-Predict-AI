import React from 'react';
import { Wind, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  recommendation: string;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
}

interface AirQualityCardProps {
  data: AirQualityData;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({ data }) => {
  const getAQIColor = (level: string) => {
    switch (level) {
      case 'good': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'unhealthy': return 'text-orange-500';
      case 'hazardous': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getAQIBgColor = (level: string) => {
    switch (level) {
      case 'good': return 'bg-green-100 border-green-200';
      case 'moderate': return 'bg-yellow-100 border-yellow-200';
      case 'unhealthy': return 'bg-orange-100 border-orange-200';
      case 'hazardous': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getAQIIcon = (level: string) => {
    switch (level) {
      case 'good': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'moderate': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'hazardous': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Wind className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAQIProgressWidth = (aqi: number) => {
    return Math.min((aqi / 300) * 100, 100);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg mr-3">
          <Wind className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Air Quality Index</h3>
          <p className="text-sm text-gray-600">Real-time monitoring</p>
        </div>
      </div>

      {/* AQI Score */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
          <span className={`text-2xl font-bold ${getAQIColor(data.level)}`}>{data.aqi}</span>
        </div>
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getAQIBgColor(data.level)}`}>
          {getAQIIcon(data.level)}
          <span className="text-sm font-medium capitalize">{data.level}</span>
        </div>
      </div>

      {/* AQI Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>0</span>
          <span>Good</span>
          <span>Moderate</span>
          <span>Unhealthy</span>
          <span>300+</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              data.level === 'good' ? 'bg-green-500' :
              data.level === 'moderate' ? 'bg-yellow-500' :
              data.level === 'unhealthy' ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${getAQIProgressWidth(data.aqi)}%` }}
          ></div>
        </div>
      </div>

      {/* Pollutant Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">PM2.5</span>
          <span className="font-medium">{data.pm25} μg/m³</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">PM10</span>
          <span className="font-medium">{data.pm10} μg/m³</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Ozone (O₃)</span>
          <span className="font-medium">{data.o3} μg/m³</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`p-3 rounded-lg border ${getAQIBgColor(data.level)}`}>
        <p className="text-sm text-gray-700">{data.recommendation}</p>
      </div>
    </div>
  );
};

export default AirQualityCard;