
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, Minus } from 'lucide-react';
import { Spot } from '@/lib/types';
import Button from './common/Button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SpotMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
}

// Mock user location for demo purposes - in a real app, we'd use the device's GPS
const MOCK_USER_LOCATION = {
  latitude: 34.0522,
  longitude: -118.2437 // Los Angeles coordinates
};

const SpotMap: React.FC<SpotMapProps> = ({ spots, onSpotClick, onCreateSpotClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState(MOCK_USER_LOCATION);
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Mock map initialization - in a real app, you'd use a map library
  useEffect(() => {
    if (!mapRef.current) return;
    
    console.log('Map initialized with spots:', spots);
    
    // In a real implementation, this would be where we'd initialize the map
    // For now, we'll simulate the map with a styled div and CSS
    setIsMapLoaded(true);
    
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
          toast({
            title: "Couldn't get your location",
            description: "Using default location instead. Please enable location services for a better experience.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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
    const newLat = userLocation.latitude + (y - rect.height/2) / (10000 / mapZoom);
    const newLng = userLocation.longitude + (x - rect.width/2) / (10000 / mapZoom);
    
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
  
  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMapZoom(prev => Math.min(prev * 1.5, 5));
  };
  
  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMapZoom(prev => Math.max(prev / 1.5, 0.5));
  };
  
  const centerOnUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would actually center the map in a real implementation
    toast({
      title: "Map Centered",
      description: "Map centered on your current location",
    });
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
      
      <div 
        ref={mapRef}
        className="relative flex-1 bg-gradient-to-br from-blue-50 to-purple-50 map-container touch-manipulation"
        onClick={handleMapClick}
      >
        {/* Simulated map content */}
        <div className="absolute inset-0">
          {/* This would be a real map in production */}
          <div className="w-full h-full">
            {/* Grid lines to simulate a map */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
              backgroundSize: `${50 * mapZoom}px ${50 * mapZoom}px`
            }} />
          </div>
        </div>
        
        {/* User location marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-spot-blue to-spot-indigo shadow-lg flex items-center justify-center spot-pulse">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
        
        {/* Spot markers with radius circles */}
        {spots.map(spot => {
          const isHovered = hoveredSpot === spot.id;
          const spotColor = getSpotColor(spot);
          
          // Calculate distance based on zoom level
          const zoomFactor = mapZoom;
          
          return (
            <div 
              key={spot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform"
              style={{ 
                top: `calc(50% + ${(spot.location.latitude - userLocation.latitude) * 10000 * zoomFactor}px)`,
                left: `calc(50% + ${(spot.location.longitude - userLocation.longitude) * 10000 * zoomFactor}px)`,
                zIndex: isHovered ? 20 : 5
              }}
              onMouseEnter={() => setHoveredSpot(spot.id)}
              onMouseLeave={() => setHoveredSpot(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSpotClick(spot);
              }}
            >
              {/* Radius circle */}
              <div 
                className={`absolute rounded-full transition-all duration-300 opacity-30 bg-spot-${spotColor}`}
                style={{
                  width: `${Math.max(40, spot.radius / 5 * zoomFactor)}px`,
                  height: `${Math.max(40, spot.radius / 5 * zoomFactor)}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: isHovered ? 0.4 : 0.2,
                  boxShadow: isHovered ? `0 0 20px rgba(var(--spot-${spotColor}-rgb), 0.5)` : 'none'
                }}
              />
              
              {/* Spot marker */}
              <div 
                className={cn(
                  `w-10 h-10 rounded-full flex items-center justify-center text-white shadow-spot transition-transform`,
                  isHovered ? 'scale-110' : ''
                )}
                style={{
                  background: `linear-gradient(to right, var(--spot-${spotColor}), var(--spot-${spotColor}ee))`
                }}
              >
                <MapPin size={20} />
              </div>
              
              {/* Radius label (only show when hovered) */}
              {isHovered && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  {spot.radius}m radius
                </div>
              )}
            </div>
          );
        })}
        
        {/* Temporary marker for spot creation */}
        {tempMarkerPosition && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ 
              top: `calc(50% + ${(tempMarkerPosition.latitude - userLocation.latitude) * 10000 * mapZoom}px)`,
              left: `calc(50% + ${(tempMarkerPosition.longitude - userLocation.longitude) * 10000 * mapZoom}px)`
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-spot-blue to-spot-purple text-white shadow-md pulse-animation">
              <MapPin size={20} />
            </div>
            
            {/* Radius indicator for new spot */}
            <div 
              className="absolute rounded-full transition-all duration-300 opacity-30 bg-primary"
              style={{
                width: '80px',
                height: '80px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.3,
              }}
            />
          </div>
        )}
        
        {/* Map Controls - Made more mobile-friendly with larger touch targets */}
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
        
        {/* Create Spot Button - More noticeable for mobile */}
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
      
      {/* Spot creation controls - Improved for mobile */}
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

export default SpotMap;
