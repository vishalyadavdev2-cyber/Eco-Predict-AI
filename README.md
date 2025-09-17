# Smart Route Planner

A comprehensive route planning application that integrates Google Maps with real-time traffic, weather, and air quality data.

## Features

- **Interactive Route Planning**: Enter source and destination with Google Places autocomplete
- **Real-time Google Maps Integration**: Live traffic overlay and optimized routing
- **Weather Monitoring**: Current conditions, precipitation alerts, and severe weather warnings
- **Air Quality Index**: Real-time AQI data with health recommendations
- **Traffic Analysis**: Live congestion alerts and alternative route suggestions
- **Responsive Design**: Works seamlessly across all device sizes

## Setup Instructions

### 1. Google Maps API Key

To use the Google Maps functionality, you need to:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Create credentials (API Key)
5. Replace `'YOUR_GOOGLE_MAPS_API_KEY'` in `src/components/MapComponent.tsx` with your actual API key

### 2. API Key Security

For production use, make sure to:
- Restrict your API key to specific domains
- Enable only the APIs you need
- Set up billing alerts in Google Cloud Console

### 3. Environment Variables (Optional)

You can also store your API key in environment variables:

1. Create a `.env` file in the root directory
2. Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
3. Update the MapComponent to use: `process.env.VITE_GOOGLE_MAPS_API_KEY`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Technologies Used

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Google Maps JavaScript API** for mapping
- **Google Places API** for location autocomplete
- **Lucide React** for icons
- **Vite** for build tooling

## Project Structure

```
src/
├── components/
│   ├── MapComponent.tsx      # Google Maps integration
│   ├── RouteForm.tsx         # Route input with autocomplete
│   ├── WeatherCard.tsx       # Weather information display
│   ├── AirQualityCard.tsx    # Air quality monitoring
│   └── TrafficAlert.tsx      # Traffic condition alerts
├── types/
│   └── google-maps.d.ts      # TypeScript definitions
├── App.tsx                   # Main application component
└── main.tsx                  # Application entry point
```

## API Integration Notes

The application currently uses mock data for weather and air quality. To integrate real APIs:

1. **Weather**: Consider using OpenWeatherMap API or similar
2. **Air Quality**: Use services like AirVisual or EPA APIs
3. **Traffic**: Google Maps provides real-time traffic data automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.