
import React, { useState, useEffect } from 'react';
import { Bell, Users } from 'lucide-react';
import { Spot, MOCK_SPOTS, MOCK_NOTIFICATIONS, SpotReply } from '@/lib/types';
import SpotMap from '@/components/SpotMap';
import CreateSpotModal from '@/components/CreateSpotModal';
import SpotNotification from '@/components/SpotNotification';
import FriendsPanel from '@/components/FriendsPanel';
import Button from '@/components/common/Button';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLocation, setCreateLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  useEffect(() => {
    // Simulate a new spot notification after 5 seconds
    const timer = setTimeout(() => {
      if (!activeSpot && notifications.length > 0) {
        // Find the first unread notification
        const notification = notifications.find(n => !n.read);
        if (notification) {
          // Find the corresponding spot
          const spot = spots.find(s => s.id === notification.spotId);
          if (spot) {
            setActiveSpot(spot);
            // Mark notification as read
            setNotifications(notifications.map(n => 
              n.id === notification.id ? { ...n, read: true } : n
            ));
          }
        }
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [notifications, spots, activeSpot]);
  
  const handleSpotClick = (spot: Spot) => {
    setActiveSpot(spot);
  };
  
  const handleCreateSpotClick = (location: { latitude: number; longitude: number }) => {
    setCreateLocation(location);
    setShowCreateModal(true);
  };
  
  const handleCreateSpot = (spotData: {
    message: string;
    radius: number;
    duration: number;
    recipients: string[];
  }) => {
    if (!createLocation) return;
    
    // Create a new spot
    const newSpot: Spot = {
      id: `spot-${Date.now()}`,
      creatorId: 'user-1', // Current user
      message: spotData.message,
      location: createLocation,
      radius: spotData.radius,
      duration: spotData.duration,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + spotData.duration * 60 * 60 * 1000),
      recipients: spotData.recipients,
      replies: []
    };
    
    setSpots([...spots, newSpot]);
    setShowCreateModal(false);
    
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
    
    // Add reply to the spot
    const updatedSpots = spots.map(s => 
      s.id === spot.id 
        ? { ...s, replies: [...s.replies, newReply] } 
        : s
    );
    
    setSpots(updatedSpots);
    
    // Update the active spot if it's the one being replied to
    if (activeSpot && activeSpot.id === spot.id) {
      setActiveSpot({ ...activeSpot, replies: [...activeSpot.replies, newReply] });
    }
    
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent successfully.",
    });
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* App Header */}
      <header className="glass-morphism absolute top-4 left-1/2 transform -translate-x-1/2 z-10 rounded-full px-4 py-2 flex items-center space-x-2">
        <div className="flex items-center">
          <div className="bg-spot-blue rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="font-semibold text-lg ml-2">Spot It</h1>
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
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
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
      
      {/* Main Map */}
      <main className="h-full">
        <SpotMap 
          spots={spots}
          onSpotClick={handleSpotClick}
          onCreateSpotClick={handleCreateSpotClick}
        />
      </main>
      
      {/* Modals and panels */}
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
      
      {/* Overlay for when panels are open */}
      {showFriendsPanel && (
        <div 
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setShowFriendsPanel(false)}
        />
      )}
    </div>
  );
};

export default Index;
