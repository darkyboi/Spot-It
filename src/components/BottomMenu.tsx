
import React from 'react';
import { MapPin, Users, Clock, Shield, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'past-spots', icon: Clock, label: 'Past Spots' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'my-spots', icon: Shield, label: 'My Spots' },
    { id: 'friends', icon: Users, label: 'Friends' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
      <div className="glass-morphism mx-auto rounded-full px-1 py-2 flex items-center justify-between max-w-md shadow-lg">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center justify-center p-1 rounded-full transition-all touch-manipulation", 
              activeTab === item.id 
                ? "text-primary scale-110" 
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => onTabChange(item.id)}
          >
            {item.id === 'create' ? (
              <div className="bg-primary text-white p-3 rounded-full shadow-lg">
                <item.icon size={20} />
              </div>
            ) : (
              <>
                <item.icon size={18} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomMenu;
