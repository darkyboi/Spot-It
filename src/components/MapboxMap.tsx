import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Spot } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Default Los Angeles coordinates
const DEFAULT_CENTER = {
  latitude: 34.0522,
  longitude: -118.2437
};

// Temporary Mapbox token - in production, use Supabase Secrets
// This is a public token that should be replaced with your own
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1haS10ZW1wIiwiYSI6ImNsbGFmYXl3YzB5Z3QzbHF3d2Z6dWFocGgifQ.GSWnwZmgf_JH9hTOyOm9uw';

interface MapboxMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  isCreatingSpot?: boolean;
  tempMarkerPosition?: { latitude: number; longitude: number } | null;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  spots,
  onSpotClick,
  onMapClick,
  isCreatingSpot = false,
  tempMarkerPosition = null
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [mapClickEvent, setMapClickEvent] = useState<mapboxgl.MapMouseEvent | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      pitch: 0
    });

    // Add navigation controls (zoom in/out, etc.)
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    
    map.current.addControl(geolocateControl, 'top-right');

    // Handle map click for spot creation
    if (isCreatingSpot) {
      map.current.on('click', (e) => {
        setMapClickEvent(e);
      });
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          if (map.current) {
            map.current.flyTo({
              center: [newLocation.longitude, newLocation.latitude],
              zoom: 14,
              essential: true
            });
          }
          
          console.log('Got user location:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Couldn't get your location",
            description: "Using default location instead. Please enable location services for a better experience.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isCreatingSpot]);

  // Handle map click event for spot creation
  useEffect(() => {
    if (!mapClickEvent || !onMapClick || !map.current) return;

    const { lngLat } = mapClickEvent;
    onMapClick({
      latitude: lngLat.lat,
      longitude: lngLat.lng
    });

    setMapClickEvent(null);
  }, [mapClickEvent, onMapClick]);

  // Add user marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Remove previous user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user marker element
    const userMarkerElement = document.createElement('div');
    userMarkerElement.className = 'user-marker';
    userMarkerElement.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-gradient-to-r from-spot-blue to-spot-indigo shadow-lg flex items-center justify-center spot-pulse">
        <div class="w-3 h-3 rounded-full bg-white"></div>
      </div>
    `;

    // Add user marker to map
    userMarkerRef.current = new mapboxgl.Marker(userMarkerElement)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map.current);

  }, [userLocation, map.current]);

  // Add spot markers
  useEffect(() => {
    if (!map.current) return;

    // Keep track of current spot IDs
    const currentSpotIds = new Set(spots.map(spot => spot.id));
    
    // Remove markers that are no longer present in the spots array
    Object.keys(markersRef.current).forEach(id => {
      if (!currentSpotIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers for each spot
    spots.forEach(spot => {
      if (markersRef.current[spot.id]) {
        // Update existing marker position if needed
        markersRef.current[spot.id].setLngLat([
          spot.location.longitude,
          spot.location.latitude
        ]);
      } else {
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'spot-marker';
        markerElement.innerHTML = `
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-spot" 
               style="background: linear-gradient(to right, var(--spot-purple), #7c3aed)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        // Add click event to marker
        markerElement.addEventListener('click', () => {
          onSpotClick(spot);
        });

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([spot.location.longitude, spot.location.latitude])
          .addTo(map.current!);

        // Add popup with spot info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<p class="font-medium">${spot.message.substring(0, 30)}${spot.message.length > 30 ? '...' : ''}</p>
                    <p class="text-xs text-gray-500">${spot.radius}m radius</p>`);

        marker.setPopup(popup);

        // Store marker reference
        markersRef.current[spot.id] = marker;
      }
    });
  }, [spots, map.current, onSpotClick]);

  // Add temporary marker for spot creation
  useEffect(() => {
    if (!map.current) return;

    // Remove previous temp marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    // Add new temp marker if position exists
    if (tempMarkerPosition) {
      // Create temp marker element
      const tempMarkerElement = document.createElement('div');
      tempMarkerElement.className = 'temp-marker';
      tempMarkerElement.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-spot-blue to-spot-purple text-white shadow-md pulse-animation">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      // Add temp marker to map
      tempMarkerRef.current = new mapboxgl.Marker(tempMarkerElement)
        .setLngLat([tempMarkerPosition.longitude, tempMarkerPosition.latitude])
        .addTo(map.current);

      // Center map on temp marker
      map.current.flyTo({
        center: [tempMarkerPosition.longitude, tempMarkerPosition.latitude],
        essential: true
      });
    }
  }, [tempMarkerPosition, map.current]);

  return (
    <div ref={mapContainer} className="h-full w-full" />
  );
};

export default MapboxMap;
