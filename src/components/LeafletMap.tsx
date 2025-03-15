
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Spot } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix for the default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Karachi coordinates as default
const KARACHI_COORDS = { lat: 24.8607, lng: 67.0011 };

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="background: linear-gradient(to right, ${color}, ${color}); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Component to handle map centering
const MapCenterControl = ({ position }: { position: { lat: number, lng: number } }) => {
  const map = useMap();
  
  const handleCenterMap = () => {
    map.flyTo(position, map.getZoom());
    toast({
      title: "Map Centered",
      description: `Centered on latitude: ${position.lat.toFixed(4)}, longitude: ${position.lng.toFixed(4)}`,
    });
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '60px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          onClick={handleCenterMap}
          title="Center map on your location"
        >
          <Navigation size={20} className="text-primary" />
        </button>
      </div>
    </div>
  );
};

// Component to handle map recenter on spot clicks
const MapRecenterOnSpot = ({ spot }: { spot: Spot | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (spot) {
      map.flyTo(
        [spot.location.latitude, spot.location.longitude], 
        Math.max(map.getZoom(), 15),
        { animate: true, duration: 1.5 }
      );
    }
  }, [spot, map]);
  
  return null;
};

interface LeafletMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
  activeSpot: Spot | null;
  isCreatingSpot: boolean;
  onCancelCreation: () => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  spots, 
  onSpotClick, 
  onCreateSpotClick,
  activeSpot,
  isCreatingSpot,
  onCancelCreation
}) => {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number }>(KARACHI_COORDS);
  const [isMapReady, setIsMapReady] = useState(false);
  
  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Location obtained:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Couldn't get your location",
            description: "Using Karachi as default location.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services. Using Karachi as default.",
        variant: "destructive"
      });
    }
  }, []);

  // Function to handle map clicks for creating spots
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isCreatingSpot) return;
    
    const { lat, lng } = e.latlng;
    
    // Show spot creation confirmation
    if (confirm("Place a spot at this location?")) {
      onCreateSpotClick({
        latitude: lat,
        longitude: lng
      });
    }
  };

  // Get spot colors based on creator
  const getSpotColor = (spot: Spot) => {
    const colors = ['#3B82F6', '#0D9488', '#4F46E5', '#7C3AED', '#EC4899', '#F97316', '#16A34A', '#E11D48'];
    const creatorNumber = parseInt(spot.creatorId.split('-')[1], 10) || 0;
    return colors[creatorNumber % colors.length];
  };

  // Get creator name from creator ID (fallback to ID format if no name available)
  const getCreatorName = (spot: Spot) => {
    return spot.creatorId.split('-')[0] || 'User';
  };

  return (
    <div className="h-full relative">
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-spot-blue to-spot-purple mb-4"></div>
            <p className="text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: `<div class="w-6 h-6 rounded-full bg-gradient-to-r from-spot-blue to-spot-indigo shadow-lg flex items-center justify-center spot-pulse">
                    <div class="w-3 h-3 rounded-full bg-white"></div>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })}
        >
          <Popup>
            Your current location
          </Popup>
        </Marker>
        
        {/* Event handler for map clicks */}
        {isCreatingSpot && (
          <div onClick={(e: React.MouseEvent) => {
            const map = document.querySelector('.leaflet-container') as HTMLElement;
            if (map && map.contains(e.target as Node)) {
              // Use the map's internal event handling
            }
          }} />
        )}
        
        {/* Spot markers */}
        {spots.map(spot => (
          <React.Fragment key={spot.id}>
            <Marker 
              position={[spot.location.latitude, spot.location.longitude]}
              icon={createCustomIcon(getSpotColor(spot))}
              eventHandlers={{
                click: () => onSpotClick(spot)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{spot.message.substring(0, 30)}{spot.message.length > 30 ? '...' : ''}</div>
                  <div className="text-xs text-gray-500">Created by: {getCreatorName(spot)}</div>
                </div>
              </Popup>
            </Marker>
            
            {/* Spot radius circle */}
            <Circle 
              center={[spot.location.latitude, spot.location.longitude]}
              pathOptions={{
                color: getSpotColor(spot),
                fillColor: getSpotColor(spot),
                fillOpacity: 0.1,
                weight: 1
              }}
              radius={spot.radius}
            />
          </React.Fragment>
        ))}
        
        {/* Map controls */}
        <MapCenterControl position={userLocation} />
        
        {/* Recenter on active spot */}
        <MapRecenterOnSpot spot={activeSpot} />
      </MapContainer>
      
      {/* Create Spot Instructions */}
      {isCreatingSpot && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 glass-morphism rounded-full px-4 py-3 flex items-center space-x-3 animate-slide-up z-20 max-w-[90%] shadow-lg">
          <p className="text-sm font-medium">
            Tap on the map to place your Spot
          </p>
          <button
            className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
            onClick={onCancelCreation}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
