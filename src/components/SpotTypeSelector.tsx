
import React from 'react';
import { X, MapPin, MessageSquare, Users, Info } from 'lucide-react';
import Button from '@/components/common/Button';

interface SpotTypeSelectorProps {
  onSelectType: (type: string) => void;
  onCancel: () => void;
}

const SpotTypeSelector: React.FC<SpotTypeSelectorProps> = ({ onSelectType, onCancel }) => {
  const spotTypes = [
    { id: 'message', name: 'Message Spot', icon: <MessageSquare size={24} />, description: 'Leave a message for friends to find' },
    { id: 'meetup', name: 'Meetup Spot', icon: <Users size={24} />, description: 'Arrange a meetup at this location' },
    { id: 'info', name: 'Info Spot', icon: <Info size={24} />, description: 'Share information about this place' }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-spot-blue to-spot-purple">
          <h2 className="text-lg font-semibold text-white">Select Spot Type</h2>
          <button 
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <p className="text-gray-600">What kind of spot would you like to create?</p>
          
          <div className="space-y-3">
            {spotTypes.map((type) => (
              <div
                key={type.id}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => onSelectType(type.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpotTypeSelector;
