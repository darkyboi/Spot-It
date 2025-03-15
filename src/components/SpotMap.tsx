
import React, { useState } from 'react';
import { MapPin, Plus, Minus, Navigation } from 'lucide-react';
import { Spot } from '@/lib/types';
import Button from './common/Button';
import { toast } from '@/hooks/use-toast';
import LeafletMap from './LeafletMap';

interface SpotMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
}

const SpotMap: React.FC<SpotMapProps> = ({ spots, onSpotClick, onCreateSpotClick }) => {
  const [isCreatingSpot, setIsCreatingSpot] = useState(false);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  
  const handleSpotClick = (spot: Spot) => {
    setActiveSpot(spot);
    onSpotClick(spot);
  };
  
  const handleCreateSpotClick = (location: { latitude: number; longitude: number }) => {
    onCreateSpotClick(location);
    setIsCreatingSpot(false);
  };
  
  return (
    <div className="h-full flex flex-col relative">
      <LeafletMap 
        spots={spots}
        onSpotClick={handleSpotClick}
        onCreateSpotClick={handleCreateSpotClick}
        activeSpot={activeSpot}
        isCreatingSpot={isCreatingSpot}
        onCancelCreation={() => setIsCreatingSpot(false)}
      />
      
      {/* Create Spot Button - More noticeable for mobile */}
      {!isCreatingSpot && (
        <div className="absolute bottom-24 left-4 z-[1000]">
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
  );
};

export default SpotMap;
