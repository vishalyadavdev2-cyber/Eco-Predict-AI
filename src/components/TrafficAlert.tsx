import React from 'react';
import { AlertTriangle, Clock, Zap, CheckCircle } from 'lucide-react';

interface TrafficAlertProps {
  trafficLevel: 'low' | 'moderate' | 'heavy';
  duration: string;
}

const TrafficAlert: React.FC<TrafficAlertProps> = ({ trafficLevel, duration }) => {
  const getTrafficConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          title: 'Clear Roads Ahead',
          message: 'Traffic is flowing smoothly on your route.',
          suggestion: 'Perfect time to travel!'
        };
      case 'moderate':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          title: 'Moderate Traffic',
          message: 'Some congestion expected on your route.',
          suggestion: 'Consider alternative routes or adjust departure time.'
        };
      case 'heavy':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          title: 'Heavy Traffic Alert',
          message: 'Significant delays expected on your route.',
          suggestion: 'Allow extra time or explore alternate routes.'
        };
      default:
        return {
          icon: <Zap className="h-5 w-5 text-gray-500" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          title: 'Traffic Update',
          message: 'Checking current traffic conditions.',
          suggestion: 'Please wait for updates.'
        };
    }
  };

  const config = getTrafficConfig(trafficLevel);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg mr-3">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Traffic Conditions</h3>
          <p className="text-sm text-gray-600">Live updates</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${config.bgColor}`}>
        <div className="flex items-start space-x-3">
          {config.icon}
          <div className="flex-1">
            <h4 className={`font-medium ${config.textColor} mb-1`}>
              {config.title}
            </h4>
            <p className={`text-sm ${config.textColor} mb-2`}>
              {config.message}
            </p>
            <p className={`text-sm ${config.textColor} font-medium`}>
              Estimated time: {duration}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Smart Suggestion</p>
            <p className="text-sm text-blue-700">{config.suggestion}</p>
          </div>
        </div>
      </div>

      {/* Alternative routes suggestion */}
      {trafficLevel === 'heavy' && (
        <div className="mt-4">
          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium">
            Show Alternative Routes
          </button>
        </div>
      )}
    </div>
  );
};

export default TrafficAlert;