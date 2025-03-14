
import React, { useState } from 'react';
import { MapPin, Navigation, Plus, Minus } from 'lucide-react';
import { Spot } from '@/lib/types';
import Button from './common/Button';
import { toast } from '@/hooks/use-toast';
import MapboxMap from './MapboxMap';

interface SpotMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
}

const SpotMap: React.FC<SpotMapProps> = ({ spots, onSpotClick, onCreateSpotClick }) => {
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const handleMapClick = (location: { latitude: number; longitude: number }) => {
    if (!isCreatingSpot) return;
    setTempMarkerPosition(location);
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
  
  const centerOnUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Map Centered",
      description: "Map centered on your current location",
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-purple-50 map-container touch-manipulation">
        <MapboxMap 
          spots={spots} 
          onSpotClick={onSpotClick}
          onMapClick={handleMapClick}
          isCreatingSpot={isCreatingSpot}
          tempMarkerPosition={tempMarkerPosition}
        />
        
        {/* Map Controls - Made more mobile-friendly with larger touch targets */}
        <div className="absolute bottom-24 right-4 flex flex-col space-y-3 z-10">
          <Button 
            variant="glass" 
            size="icon"
            aria-label="Center on my location"
            onClick={centerOnUser}
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <Navigation size={24} />
          </Button>
        </div>
        
        {/* Create Spot Button - More noticeable for mobile */}
        {!isCreatingSpot && (
          <div className="absolute bottom-24 left-4 z-10">
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
