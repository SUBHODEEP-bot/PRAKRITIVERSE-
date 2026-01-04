import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = "w-full h-64"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  const updateLocation = useCallback(async (position: google.maps.LatLng) => {
    const lat = position.lat();
    const lng = position.lng();
    
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        onLocationSelect({
          lat,
          lng,
          address: response.results[0].formatted_address
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
    }
  }, [onLocationSelect]);

  const initializeMap = useCallback(async () => {
    if (initializationAttempted.current || !mapRef.current) {
      return;
    }

    try {
      initializationAttempted.current = true;
      console.log('GoogleMapPicker: Starting map initialization');
      
      setLoading(true);
      setError(null);

      const container = mapRef.current;
      
      // Ensure container has proper dimensions
      container.style.height = '256px';
      container.style.width = '100%';
      container.style.display = 'block';

      console.log('GoogleMapPicker: Loading Google Maps API...');

      // Use your Google Maps API key (ensure HTTP referrers include this sandbox domain)
      const apiKey = 'AIzaSyD6zAtehiPdHQ1DwnOGvpZw3viVtTb0Sn0';

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      console.log('GoogleMapPicker: Creating map...');

      const defaultLocation = initialLocation || { lat: 28.6139, lng: 77.2090 };

      const mapInstance = new google.maps.Map(container, {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
        title: 'Challenge Location'
      });

      // Handle map click
      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && markerInstance) {
          markerInstance.setPosition(event.latLng);
          updateLocation(event.latLng);
        }
      });

      // Handle marker drag
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          updateLocation(position);
        }
      });

      // Store references
      mapInstanceRef.current = mapInstance;
      markerInstanceRef.current = markerInstance;

      // Initialize with default location
      updateLocation(new google.maps.LatLng(defaultLocation.lat, defaultLocation.lng));

      console.log('GoogleMapPicker: Map initialized successfully');
      setLoading(false);

    } catch (err) {
      console.error('GoogleMapPicker: Error loading Google Maps:', err);
      setError(`Failed to load Google Maps: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
      initializationAttempted.current = false; // Allow retry on error
    }
  }, [initialLocation, updateLocation]);

  // Use ResizeObserver to detect when the element becomes visible
  useEffect(() => {
    if (!mapRef.current) return;

    let fallbackTimer: number | undefined;

    const tryInit = () => {
      if (!initializationAttempted.current) {
        setTimeout(initializeMap, 100);
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          console.log('GoogleMapPicker: Container is visible, initializing map');
          observer.disconnect();
          tryInit();
          break;
        }
      }
    });

    observer.observe(mapRef.current);

    // Fallback: initialize even if observer doesn't fire
    fallbackTimer = window.setTimeout(() => {
      if (!initializationAttempted.current) {
        console.log('GoogleMapPicker: Fallback initializing map');
        initializeMap();
      }
    }, 500);

    return () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      observer.disconnect();
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

  // Handle location changes separately
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current && initialLocation) {
      const newPosition = new google.maps.LatLng(initialLocation.lat, initialLocation.lng);
      mapInstanceRef.current.setCenter(newPosition);
      markerInstanceRef.current.setPosition(newPosition);
      updateLocation(newPosition);
    }
  }, [initialLocation, updateLocation]);

  return (
    <div className={className}>
      <div className="relative w-full h-full">
        <div 
          ref={mapRef}
          className="w-full h-full rounded-lg"
          style={{ minHeight: '256px' }}
        />

        {loading && (
          <div className="absolute inset-0 bg-muted/80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-muted/80 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => {
                  initializationAttempted.current = false;
                  setError(null);
                  setLoading(true);
                  setTimeout(initializeMap, 100);
                }}
                className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Click on the map or drag the marker to select a location
      </p>
    </div>
  );
};

export default GoogleMapPicker;