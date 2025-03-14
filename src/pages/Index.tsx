import React, { useState, useEffect } from 'react';
import { Bell, Users } from 'lucide-react';
import { Spot, MOCK_SPOTS, MOCK_NOTIFICATIONS, SpotReply } from '@/lib/types';
import SpotMap from '@/components/SpotMap';
import CreateSpotModal from '@/components/CreateSpotModal';
import SpotNotification from '@/components/SpotNotification';
import FriendsPanel from '@/components/FriendsPanel';
import Button from '@/components/common/Button';
import { toast } from '@/hooks/use-toast';
import BottomMenu from '@/components/BottomMenu';
import PastSpots from '@/components/PastSpots';
import MySpots from '@/components/MySpots';
import { getSpots } from '@/lib/supabase';

const Index = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLocation, setCreateLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('map');
  const [blockedSpots, setBlockedSpots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadSpots();
  }, []);
  
  const loadSpots = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getSpots();
      
      if (error) {
        console.error("Error loading spots:", error);
        setSpots(MOCK_SPOTS);
      } else if (data && data.length > 0) {
        setSpots(data);
      } else {
        setSpots(MOCK_SPOTS);
      }
    } catch (err) {
      console.error("Failed to load spots:", err);
      setSpots(MOCK_SPOTS);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!activeSpot && notifications.length > 0) {
        const notification = notifications.find(n => !n.read);
        if (notification) {
          const spot = spots.find(s => s.id === notification.spotId);
          if (spot) {
            setActiveSpot(spot);
            setNotifications(notifications.map(n => 
              n.id === notification.id ? { ...n, read: true } : n
            ));
          }
        }
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [notifications, spots, activeSpot]);
  
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled",
              description: "You'll now receive alerts when you enter a Spot's radius.",
            });
          }
        });
      }
    }
  }, []);
  
  const handleSpotClick = (spot: Spot) => {
    if (blockedSpots.includes(spot.id)) return;
    
    setActiveSpot(spot);
  };
  
  const handleCreateSpotClick = (location: { latitude: number; longitude: number }) => {
    setCreateLocation(location);
    setShowCreateModal(true);
  };
  
  const handleCreateSpot = async (spotData: {
    message: string;
    radius: number;
    duration: number;
    recipients: string[];
  }) => {
    if (!createLocation) return;
    
    setShowCreateModal(false);
    await loadSpots();
    
    toast({
      title: "Spot Created",
      description: "Your Spot has been placed successfully.",
    });
  };
  
  const handleReplyToSpot = (spot: Spot, reply: string) => {
    const newReply: SpotReply = {
      id: `reply-${Date.now()}`,
      spotId: spot.id,
      userId: 'user-1', // Current user
      message: reply,
      createdAt: new Date()
    };
    
    const updatedSpots = spots.map(s => 
      s.id === spot.id 
        ? { ...s, replies: [...s.replies, newReply] } 
        : s
    );
    
    setSpots(updatedSpots);
    
    if (activeSpot && activeSpot.id === spot.id) {
      setActiveSpot({ ...activeSpot, replies: [...activeSpot.replies, newReply] });
    }
    
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent successfully.",
    });
  };
  
  const handleEditSpot = (spot: Spot) => {
    toast({
      title: "Edit Spot",
      description: "Editing functionality would open here in a real app.",
    });
  };
  
  const handleDeleteSpot = (spotId: string) => {
    setSpots(spots.filter(s => s.id !== spotId));
    
    if (activeSpot && activeSpot.id === spotId) {
      setActiveSpot(null);
    }
    
    toast({
      title: "Spot Deleted",
      description: "Your Spot has been successfully removed.",
    });
  };
  
  const handleTabChange = (tab: string) => {
    if (tab === 'create') {
      const centerLocation = {
        latitude: 34.0522,
        longitude: -118.2437
      };
      handleCreateSpotClick(centerLocation);
      return;
    }
    
    if (tab === 'friends') {
      setShowFriendsPanel(true);
      return;
    }
    
    setActiveTab(tab);
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="glass-morphism absolute top-4 left-1/2 transform -translate-x-1/2 z-10 rounded-full px-4 py-2 flex items-center space-x-2">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-spot-blue to-spot-purple rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="font-semibold text-lg ml-2 bg-gradient-to-r from-spot-blue to-spot-purple bg-clip-text text-transparent">Spot It</h1>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2" />
        
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-spot-red rounded-full" />
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          aria-label="Friends"
          onClick={() => setShowFriendsPanel(true)}
        >
          <Users size={20} />
        </Button>
      </header>
      
      <main className="h-full pb-20">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-spot-blue to-spot-purple mb-4"></div>
              <p className="text-sm font-medium">Loading spots...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <SpotMap 
                spots={spots.filter(spot => !blockedSpots.includes(spot.id))}
                onSpotClick={handleSpotClick}
                onCreateSpotClick={handleCreateSpotClick}
              />
            )}
            
            {activeTab === 'past-spots' && (
              <PastSpots 
                spots={spots.filter(spot => !blockedSpots.includes(spot.id))}
                onSpotClick={handleSpotClick}
              />
            )}
            
            {activeTab === 'my-spots' && (
              <MySpots 
                spots={spots}
                onSpotClick={handleSpotClick}
                onEditSpot={handleEditSpot}
                onDeleteSpot={handleDeleteSpot}
              />
            )}
          </>
        )}
      </main>
      
      <BottomMenu
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {showCreateModal && createLocation && (
        <CreateSpotModal
          location={createLocation}
          onClose={() => setShowCreateModal(false)}
          onCreateSpot={handleCreateSpot}
        />
      )}
      
      {activeSpot && (
        <SpotNotification
          spot={activeSpot}
          onClose={() => setActiveSpot(null)}
          onReply={handleReplyToSpot}
        />
      )}
      
      <FriendsPanel 
        isOpen={showFriendsPanel}
        onClose={() => setShowFriendsPanel(false)}
      />
      
      {(showFriendsPanel || activeSpot) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => {
            if (showFriendsPanel) setShowFriendsPanel(false);
            if (activeSpot) setActiveSpot(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
