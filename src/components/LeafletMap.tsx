
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Plus, Minus } from 'lucide-react';
import { Spot } from '@/lib/types';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Define the correct typings
interface LeafletMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
  askForSpotType?: (location: { latitude: number; longitude: number }) => void;
}

// Karachi coordinates as default
const KARACHI_COORDINATES = { lat: 24.8607, lng: 67.0011 };

// Fix Leaflet icon issue
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom marker for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'user-location-marker'
});

// Custom marker for temporary spot creation
const tempLocationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'temp-location-marker'
});

// Component to handle map controls and updates
function MapController({ 
  setMapRef, 
  onMapClick, 
  userLocation, 
  setMapZoom
}) {
  const map = useMap();
  
  useEffect(() => {
    setMapRef(map);
    map.on('click', onMapClick);
    map.on('zoom', () => setMapZoom(map.getZoom()));
    
    return () => {
      map.off('click', onMapClick);
      map.off('zoom');
    };
  }, [map, onMapClick, setMapRef, setMapZoom]);
  
  // Center on user location when it changes
  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      map.setView([userLocation.latitude, userLocation.longitude], map.getZoom());
    }
  }, [map, userLocation]);
  
  return null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  spots, 
  onSpotClick, 
  onCreateSpotClick,
  askForSpotType
}) => {
  const [userLocation, setUserLocation] = useState({ 
    latitude: KARACHI_COORDINATES.lat, 
    longitude: KARACHI_COORDINATES.lng 
  });
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log('Got user location:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Couldn't get your location",
            description: "Using Karachi as default location. Please enable location services for a better experience.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);
  
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isCreatingSpot) return;
    
    const { lat, lng } = e.latlng;
    setTempMarkerPosition({ latitude: lat, longitude: lng });

    // Ask for spot type before proceeding with creation
    if (askForSpotType) {
      askForSpotType({ latitude: lat, longitude: lng });
    }
  };
  
  const confirmSpotLocation = () => {
    if (tempMarkerPosition) {
      onCreateSpotClick(tempMarkerPosition);
      setIsCreatingSpot(false);
      setTempMarkerPosition(null);
    }
  };
  
  const cancelSpotCreation = () => {
    setIsCreatingSpot(false);
    setTempMarkerPosition(null);
  };
  
  const centerOnUser = () => {
    if (mapRef && userLocation) {
      mapRef.setView([userLocation.latitude, userLocation.longitude], mapZoom);
      toast({
        title: "Map Centered",
        description: "Map centered on your current location",
      });
    }
  };
  
  const zoomIn = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() + 1);
    }
  };
  
  const zoomOut = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() - 1);
    }
  };
  
  // Get a color for a spot based on its creator
  const getSpotColor = (spot: Spot) => {
    const colors = ['blue', 'teal', 'indigo', 'purple', 'pink', 'orange', 'green', 'rose'];
    const creatorNumber = parseInt(spot.creatorId.split('-')[1], 10) || 0;
    return colors[creatorNumber % colors.length];
  };

  return (
    <div className="h-full flex flex-col relative">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-spot-blue to-spot-purple mb-4"></div>
            <p className="text-sm font-medium">Loading map...</p>
          </div>
        </div>
      )}
      
      <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-purple-50 map-container touch-manipulation">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setIsMapLoaded(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            setMapRef={setMapRef}
            onMapClick={handleMapClick}
            userLocation={userLocation}
            setMapZoom={setMapZoom}
          />
          
          {/* User location marker */}
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <p>Lat: {userLocation.latitude.toFixed(6)}</p>
                <p>Long: {userLocation.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Spot markers */}
          {spots.map(spot => {
            const spotColor = getSpotColor(spot);
            const isHovered = hoveredSpot === spot.id;
            
            return (
              <React.Fragment key={spot.id}>
                <Marker 
                  position={[spot.location.latitude, spot.location.longitude]} 
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => onSpotClick(spot)
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <strong>{spot.message.substring(0, 20)}...</strong>
                      <p>Created by: {spot.creatorId}</p>
                      <p>Radius: {spot.radius}m</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Radius circle */}
                <Circle 
                  center={[spot.location.latitude, spot.location.longitude]} 
                  radius={spot.radius}
                  pathOptions={{
                    color: spotColor === 'blue' ? '#3b82f6' : 
                           spotColor === 'teal' ? '#14b8a6' :
                           spotColor === 'indigo' ? '#6366f1' :
                           spotColor === 'purple' ? '#8b5cf6' :
                           spotColor === 'pink' ? '#ec4899' :
                           spotColor === 'orange' ? '#f97316' :
                           spotColor === 'green' ? '#22c55e' :
                           '#f43f5e',
                    fillColor: spotColor === 'blue' ? '#3b82f6' : 
                               spotColor === 'teal' ? '#14b8a6' :
                               spotColor === 'indigo' ? '#6366f1' :
                               spotColor === 'purple' ? '#8b5cf6' :
                               spotColor === 'pink' ? '#ec4899' :
                               spotColor === 'orange' ? '#f97316' :
                               spotColor === 'green' ? '#22c55e' :
                               '#f43f5e',
                    fillOpacity: 0.2,
                    weight: 1
                  }}
                />
              </React.Fragment>
            );
          })}
          
          {/* Temporary marker for spot creation */}
          {tempMarkerPosition && (
            <React.Fragment>
              <Marker 
                position={[tempMarkerPosition.latitude, tempMarkerPosition.longitude]} 
                icon={tempLocationIcon}
              >
                <Popup>
                  <div className="text-center p-2">
                    <strong>New Spot Location</strong>
                    <div className="flex space-x-2 mt-2">
                      <button 
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={confirmSpotLocation}
                      >
                        Confirm
                      </button>
                      <button 
                        className="px-2 py-1 bg-gray-500 text-white rounded"
                        onClick={cancelSpotCreation}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Radius preview for new spot */}
              <Circle 
                center={[tempMarkerPosition.latitude, tempMarkerPosition.longitude]} 
                radius={100}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 1
                }}
              />
            </React.Fragment>
          )}
        </MapContainer>
        
        {/* Map Controls */}
        <div className="absolute bottom-24 right-4 flex flex-col space-y-3">
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Center on my location"
            onClick={centerOnUser}
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <Navigation size={24} />
          </Button>
          
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Zoom in"
            onClick={zoomIn}
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <Plus size={24} />
          </Button>
          
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Zoom out"
            onClick={zoomOut}
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <Minus size={24} />
          </Button>
        </div>
        
        {/* Create Spot Button */}
        {!isCreatingSpot && (
          <div className="absolute bottom-24 left-4">
            <Button
              variant="primary"
              size="lg"
              className="rounded-full shadow-lg"
              onClick={() => setIsCreatingSpot(true)}
            >
              <MapPin className="mr-2" size={18} />
              Create Spot
            </Button>
          </div>
        )}
      </div>
      
      {/* Spot creation controls */}
      {isCreatingSpot && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 glass-morphism rounded-full px-4 py-3 flex items-center space-x-3 animate-slide-up z-20 max-w-[90%] shadow-lg">
          <p className="text-sm font-medium">
            {tempMarkerPosition ? 'Tap to confirm location' : 'Tap on the map to place your Spot'}
          </p>
          {tempMarkerPosition && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmSpotLocation}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSpotCreation}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
