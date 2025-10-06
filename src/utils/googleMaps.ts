import { Loader } from '@googlemaps/js-api-loader';

// Keep track of the loader instance and its configuration
let loader: Loader | null = null;
let isInitialized = false;

interface LoadGoogleMapsOptions {
  libraries?: string[];
  mapId?: string;
}

export const loadGoogleMaps = async (options: LoadGoogleMapsOptions = {}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not set in environment variables');
  }

  // Default libraries to include
  const defaultLibraries = ['places', 'routes'] as ('places' | 'routes')[];
  const libraries = [...new Set([...defaultLibraries, ...(options.libraries || [])])];

  // If loader is already initialized with different options, throw an error
  if (loader && !isSameLibraries(loader['libraries'], libraries)) {
    throw new Error('Google Maps Loader was already initialized with different options');
  }

  // Initialize the loader if it doesn't exist
  if (!loader) {
    loader = new Loader({
      apiKey,
      version: 'beta',
      libraries,
      solutionChannel: 'GMP_CCS_mapsv3_placesapiv3_2025',
    });
  }

  // Load Google Maps if not already loaded
  if (!isInitialized) {
    try {
      await loader.load();
      isInitialized = true;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  // Import the places library
  await google.maps.importLibrary('places');
  
  return {
    google: window.google,
    // Use the new Places API
    createAutocompleteService: () => new google.maps.places.AutocompleteService(),
    createPlacesService: (container: HTMLDivElement = document.createElement('div')) => 
      new google.maps.places.PlacesService(container),
    createAutocompleteSessionToken: () => new google.maps.places.AutocompleteSessionToken(),
    createMap: (container: HTMLElement, options: google.maps.MapOptions) => 
      new google.maps.Map(container, options),
    createDirectionsService: () => new google.maps.DirectionsService(),
    createDirectionsRenderer: (options?: google.maps.DirectionsRendererOptions) => 
      new google.maps.DirectionsRenderer(options),
  };
};

// Helper function to compare libraries arrays
const isSameLibraries = (a: readonly string[] = [], b: readonly string[] = []): boolean => {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
};

// Export types for convenience
export type { Loader } from '@googlemaps/js-api-loader';
