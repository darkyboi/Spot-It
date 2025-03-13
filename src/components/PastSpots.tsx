
import React from 'react';
import { Spot } from '@/lib/types';
import Avatar from './common/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

interface PastSpotsProps {
  spots: Spot[];
  onSpotClick: (spot: Spot) => void;
}

const PastSpots: React.FC<PastSpotsProps> = ({ spots, onSpotClick }) => {
  // Sort spots by creation date (newest first)
  const sortedSpots = [...spots].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="h-full py-20 px-4 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-spot-pink to-spot-purple bg-clip-text text-transparent">
        Past Spots
      </h2>
      
      <div className="space-y-4">
        {sortedSpots.length > 0 ? (
          sortedSpots.map(spot => (
            <div 
              key={spot.id}
              className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-md"
              onClick={() => onSpotClick(spot)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-spot-blue to-spot-teal text-white">
                    <MapPin size={18} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">{spot.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>{formatDistanceToNow(spot.createdAt, { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-1">{spot.replies.length} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={40} className="mx-auto mb-2 text-gray-400" />
            <p>No past spots found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastSpots;
