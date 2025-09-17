import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation2, Loader, X } from 'lucide-react';

interface RouteFormProps {
  onSearch: (source: string, destination: string) => void;
  isLoading: boolean;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const RouteForm: React.FC<RouteFormProps> = ({ onSearch, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourcePredictions, setSourcePredictions] = useState<PlacePrediction[]>([]);
  const [destinationPredictions, setDestinationPredictions] = useState<PlacePrediction[]>([]);
  const [showSourcePredictions, setShowSourcePredictions] = useState(false);
  const [showDestinationPredictions, setShowDestinationPredictions] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Places Autocomplete Service
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setAutocompleteService(new google.maps.places.AutocompleteService());
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source.trim() && destination.trim()) {
      onSearch(source.trim(), destination.trim());
      setShowSourcePredictions(false);
      setShowDestinationPredictions(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSource(`${latitude}, ${longitude}`);
          setShowSourcePredictions(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setSource('Current Location');
        }
      );
    } else {
      setSource('Current Location');
    }
  };

  const getPlacePredictions = (input: string, callback: (predictions: PlacePrediction[]) => void) => {
    if (!autocompleteService || input.length < 2) {
      callback([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      {
        input,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' } // You can modify this or remove for worldwide
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          callback(predictions);
        } else {
          callback([]);
        }
      }
    );
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    if (value.length >= 2) {
      getPlacePredictions(value, (predictions) => {
        setSourcePredictions(predictions);
        setShowSourcePredictions(true);
      });
    } else {
      setSourcePredictions([]);
      setShowSourcePredictions(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (value.length >= 2) {
      getPlacePredictions(value, (predictions) => {
        setDestinationPredictions(predictions);
        setShowDestinationPredictions(true);
      });
    } else {
      setDestinationPredictions([]);
      setShowDestinationPredictions(false);
    }
  };

  const selectSourcePrediction = (prediction: PlacePrediction) => {
    setSource(prediction.description);
    setShowSourcePredictions(false);
    setSourcePredictions([]);
  };

  const selectDestinationPrediction = (prediction: PlacePrediction) => {
    setDestination(prediction.description);
    setShowDestinationPredictions(false);
    setDestinationPredictions([]);
  };

  const clearSource = () => {
    setSource('');
    setSourcePredictions([]);
    setShowSourcePredictions(false);
    sourceInputRef.current?.focus();
  };

  const clearDestination = () => {
    setDestination('');
    setDestinationPredictions([]);
    setShowDestinationPredictions(false);
    destinationInputRef.current?.focus();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg mr-3">
          <Search className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Plan Your Route</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Point
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={sourceInputRef}
              type="text"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              onFocus={() => source.length >= 2 && setShowSourcePredictions(true)}
              placeholder="Enter starting location"
              className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {source && (
                <button
                  type="button"
                  onClick={clearSource}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Use current location"
              >
                <Navigation2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Source Predictions Dropdown */}
          {showSourcePredictions && sourcePredictions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {sourcePredictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => selectSourcePrediction(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={destinationInputRef}
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => destination.length >= 2 && setShowDestinationPredictions(true)}
              placeholder="Enter destination"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
            />
            {destination && (
              <button
                type="button"
                onClick={clearDestination}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Destination Predictions Dropdown */}
          {showDestinationPredictions && destinationPredictions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {destinationPredictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  onClick={() => selectDestinationPrediction(prediction)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!source.trim() || !destination.trim() || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Finding Route...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Find Best Route</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RouteForm;