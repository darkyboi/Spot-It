
import React, { useState } from 'react';
import { Spot } from '@/lib/types';
import LeafletMap from './LeafletMap';
import SpotTypeSelector from './SpotTypeSelector';

interface SpotMapProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onCreateSpotClick: (location: { latitude: number; longitude: number }) => void;
}

const SpotMap: React.FC<SpotMapProps> = ({ 
  spots, 
  onSpotClick, 
  onCreateSpotClick 
}) => {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedSpotType, setSelectedSpotType] = useState<string>('');

  const handleAskForSpotType = (location: { latitude: number; longitude: number }) => {
    setPendingLocation(location);
    setShowTypeSelector(true);
  };

  const handleSpotTypeSelected = (spotType: string) => {
    setSelectedSpotType(spotType);
    if (pendingLocation) {
      onCreateSpotClick(pendingLocation);
      setPendingLocation(null);
    }
    setShowTypeSelector(false);
  };

  const handleTypeSelectionCancelled = () => {
    setPendingLocation(null);
    setShowTypeSelector(false);
  };

  return (
    <div className="h-full relative">
      <LeafletMap 
        spots={spots}
        onSpotClick={onSpotClick}
        onCreateSpotClick={onCreateSpotClick}
        askForSpotType={handleAskForSpotType}
      />

      {showTypeSelector && (
        <SpotTypeSelector
          onSelectType={handleSpotTypeSelected}
          onCancel={handleTypeSelectionCancelled}
        />
      )}
    </div>
  );
};

export default SpotMap;
