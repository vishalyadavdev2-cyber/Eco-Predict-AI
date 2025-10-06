import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/googleMaps';

interface LocationSearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}

interface Suggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onPlaceSelect,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      try {
        const { createAutocompleteService, createPlacesService, createAutocompleteSessionToken } = await loadGoogleMaps();
        autocompleteService.current = createAutocompleteService();
        placesService.current = createPlacesService(document.createElement('div'));
        sessionToken.current = createAutocompleteSessionToken();
      } catch (error) {
        console.error('Error initializing Google Maps services:', error);
      }
    };

    initServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange(input);

    if (input.length > 2 && autocompleteService.current && sessionToken.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input,
          sessionToken: sessionToken.current,
          types: ['geocode'],
          componentRestrictions: { country: 'in' }, // Changed from 'us' to 'in' for India
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(
              predictions.map(prediction => ({
                placeId: prediction.place_id,
                mainText: prediction.structured_formatting.main_text,
                secondaryText: prediction.structured_formatting.secondary_text || '',
                description: prediction.description,
              }))
            );
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ['formatted_address', 'geometry', 'name', 'address_components'],
        sessionToken: sessionToken.current || undefined,
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          onChange(place.formatted_address || suggestion.description);
          onPlaceSelect(place);
          setShowSuggestions(false);
          
          // Create a new session token for the next request
          loadGoogleMaps().then(({ createAutocompleteSessionToken }) => {
            sessionToken.current = createAutocompleteSessionToken();
          });
        }
      }
    );
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <ul className="py-1 overflow-auto text-base max-h-60">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.placeId}-${index}`}
                  className="px-4 py-2 text-gray-900 cursor-pointer hover:bg-gray-100"
                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion.mainText}</div>
                  {suggestion.secondaryText && (
                    <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;