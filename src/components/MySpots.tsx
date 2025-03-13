
import React from 'react';
import { Spot } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, Edit, Trash } from 'lucide-react';
import Button from './common/Button';

interface MySpotsProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
  onEditSpot: (spot: Spot) => void;
  onDeleteSpot: (spotId: string) => void;
}

const MySpots: React.FC<MySpotsProps> = ({ 
  spots, 
  onSpotClick, 
  onEditSpot, 
  onDeleteSpot 
}) => {
  // Filter spots created by the current user
  const mySpots = spots.filter(spot => spot.creatorId === 'user-1');
  
  // Sort by creation date (newest first)
  const sortedSpots = [...mySpots].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="h-full py-20 px-4 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-spot-indigo to-spot-blue bg-clip-text text-transparent">
        My Spots
      </h2>
      
      <div className="space-y-4">
        {sortedSpots.length > 0 ? (
          sortedSpots.map(spot => (
            <div 
              key={spot.id}
              className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-spot-indigo to-spot-blue text-white cursor-pointer"
                    onClick={() => onSpotClick(spot)}
                  >
                    <MapPin size={18} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">{spot.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>
                        {spot.duration === 999999 
                          ? 'Never expires' 
                          : `Expires ${formatDistanceToNow(spot.expiresAt, { addSuffix: true })}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSpot(spot);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSpot(spot.id);
                        }}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={40} className="mx-auto mb-2 text-gray-400" />
            <p>You haven't created any spots yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySpots;
