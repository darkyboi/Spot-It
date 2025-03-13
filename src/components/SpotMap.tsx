
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Spot } from '@/lib/types';
import Button from './common/Button';

interface SpotMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
}

// Mock user location for demo purposes
const MOCK_USER_LOCATION = {
  latitude: 34.0522,
  longitude: -118.2437 // Los Angeles coordinates
};

const SpotMap: React.FC<SpotMapProps> = ({ spots, onSpotClick, onCreateSpotClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState(MOCK_USER_LOCATION);
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Mock map initialization - in a real app, you'd use a library like Mapbox or Google Maps
  useEffect(() => {
    if (!mapRef.current) return;
    
    console.log('Map initialized with spots:', spots);
    
    // In a real implementation, this would be where we'd initialize the map
    // For now, we'll simulate the map with a styled div and CSS
    
    // Try to get the user's location
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
        }
      );
    }
  }, [spots]);
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreatingSpot) return;
    
    // Calculate relative click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to "map coordinates" (this is just a simulation)
    // In a real map implementation, you'd convert screen coordinates to geo coordinates
    const newLat = userLocation.latitude + (y - rect.height/2) / 10000;
    const newLng = userLocation.longitude + (x - rect.width/2) / 10000;
    
    setTempMarkerPosition({ latitude: newLat, longitude: newLng });
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

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={mapRef}
        className="relative flex-1 bg-[#f2f5fa] map-container"
        onClick={handleMapClick}
      >
        {/* Simulated map content */}
        <div className="absolute inset-0">
          {/* This would be a real map in production */}
          <div className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100">
            {/* Grid lines to simulate a map */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>
        </div>
        
        {/* User location marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full bg-primary shadow-lg flex items-center justify-center spot-pulse">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
        
        {/* Spot markers */}
        {spots.map(spot => (
          <div 
            key={spot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            style={{ 
              top: `calc(50% + ${(spot.location.latitude - userLocation.latitude) * 10000}px)`,
              left: `calc(50% + ${(spot.location.longitude - userLocation.longitude) * 10000}px)`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSpotClick(spot);
            }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-spot-blue text-white shadow-spot animate-pulse-spot`}>
              <MapPin size={20} />
            </div>
          </div>
        ))}
        
        {/* Temporary marker for spot creation */}
        {tempMarkerPosition && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ 
              top: `calc(50% + ${(tempMarkerPosition.latitude - userLocation.latitude) * 10000}px)`,
              left: `calc(50% + ${(tempMarkerPosition.longitude - userLocation.longitude) * 10000}px)`
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white shadow-md">
              <MapPin size={20} />
            </div>
          </div>
        )}
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Center on my location"
            onClick={(e) => {
              e.stopPropagation();
              // This would center the map on the user's location in a real implementation
              console.log('Centering on user location');
            }}
          >
            <Navigation size={24} />
          </Button>
          
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Zoom in"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Zoom in');
            }}
          >
            <span className="text-xl font-bold">+</span>
          </Button>
          
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Zoom out"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Zoom out');
            }}
          >
            <span className="text-xl font-bold">-</span>
          </Button>
        </div>
      </div>
      
      {/* Spot creation controls */}
      {isCreatingSpot && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 glass-morphism rounded-full px-4 py-2 flex items-center space-x-2 animate-slide-up">
          <p className="text-sm">
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
      
      {/* Create Spot button (only shown when not actively creating) */}
      {!isCreatingSpot && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <Button
            variant="primary"
            size="lg"
            className="shadow-lg"
            onClick={() => setIsCreatingSpot(true)}
          >
            Create a Spot
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpotMap;
