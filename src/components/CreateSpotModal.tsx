import React, { useState, useEffect } from 'react';
import { X, Users, Clock, MapPin, ChevronRight, Infinity } from 'lucide-react';
import { Friend } from '@/lib/types';
import Avatar from './common/Avatar';
import Button from './common/Button';
import { MOCK_FRIENDS } from '@/lib/types';
import { saveSpot, getFriends } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface CreateSpotModalProps {
  location: { latitude: number; longitude: number };
  onClose: () => void;
  onCreateSpot: (spotData: {
    message: string;
    radius: number;
    duration: number;
    recipients: string[];
  }) => void;
}

const CreateSpotModal: React.FC<CreateSpotModalProps> = ({ 
  location, 
  onClose, 
  onCreateSpot 
}) => {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [radius, setRadius] = useState(100); // Default 100m
  const [duration, setDuration] = useState(24); // Default 24 hours
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const { data, error } = await getFriends();
        if (error) {
          console.error("Error loading friends:", error);
          setFriends(MOCK_FRIENDS);
          return;
        }
        
        if (data && data.length > 0) {
          setFriends(data);
        } else {
          setFriends(MOCK_FRIENDS);
        }
      } catch (err) {
        console.error("Failed to load friends:", err);
        setFriends(MOCK_FRIENDS);
      }
    };
    
    loadFriends();
  }, []);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const spotData = {
        message,
        location,
        radius,
        duration,
        recipients: selectedFriends,
      };
      
      const { data, error } = await saveSpot(spotData);
      
      if (error) {
        console.error("Error saving spot:", error);
        toast({
          title: "Failed to create Spot",
          description: error.message || "There was an error creating your Spot.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      onCreateSpot(spotData);
      
      toast({
        title: "Spot Created",
        description: "Your Spot has been successfully created and shared.",
      });
    } catch (err) {
      console.error("Failed to create spot:", err);
      toast({
        title: "Failed to create Spot",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFriendToggle = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };
  
  const isNextDisabled = () => {
    if (step === 1) return message.trim().length === 0;
    if (step === 3) return selectedFriends.length === 0;
    return false || isLoading;
  };
  
  const getRadiusColor = () => {
    const percentage = (radius - 10) / (500 - 10);
    return `rgba(59, 130, 246, ${1 - percentage}) rgba(139, 92, 246, ${percentage})`;
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-spot-blue to-spot-purple">
          <h2 className="text-lg font-semibold text-white">Create a Spot</h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-5 pt-2 flex items-center justify-between">
          <div className="flex space-x-1">
            <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-spot-blue to-spot-teal' : 'bg-gray-200'}`} />
            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-spot-teal to-spot-indigo' : 'bg-gray-200'}`} />
            <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-gradient-to-r from-spot-indigo to-spot-purple' : 'bg-gray-200'}`} />
          </div>
          <span className="text-sm text-gray-500">Step {step} of 3</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin size={18} />
                <span>Location set at {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  What's your message?
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  How far should your Spot reach?
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, ${getRadiusColor()})`
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>10m</span>
                    <span className="font-medium text-primary">{radius}m</span>
                    <span>500m</span>
                  </div>
                  
                  <div className="relative mt-4 mx-auto w-40 h-40 flex items-center justify-center">
                    <div 
                      className="absolute rounded-full bg-primary/10 border border-primary/30"
                      style={{
                        width: `${(radius / 500) * 100}%`,
                        height: `${(radius / 500) * 100}%`,
                      }}
                    />
                    <div className="z-10 w-4 h-4 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-gray-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    How long should your Spot last?
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 48, 72].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      className={`py-2 rounded-lg border ${
                        duration === hours 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDuration(hours)}
                    >
                      {hours} hours
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`py-2 rounded-lg border ${
                      duration === 168 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDuration(168)}
                  >
                    7 days
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-lg border ${
                      duration === 999999 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDuration(999999)}
                  >
                    <Infinity size={16} className="mx-auto" />
                    <span className="text-xs">Forever</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-gray-600" />
                <h3 className="text-lg font-medium">Who should receive this Spot?</h3>
              </div>
              
              <div className="space-y-2">
                {friends.map(friend => (
                  <div 
                    key={friend.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFriendToggle(friend.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        src={friend.avatar} 
                        name={friend.name} 
                        status={friend.status} 
                      />
                      <span className="font-medium">{friend.name}</span>
                    </div>
                    <div 
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedFriends.includes(friend.id)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedFriends.includes(friend.id) && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-5 py-4 border-t border-gray-200 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isLoading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            variant="primary"
            rightIcon={step < 3 ? <ChevronRight size={16} /> : undefined}
            disabled={isNextDisabled()}
            onClick={handleNext}
            isLoading={step === 3 && isLoading}
          >
            {step < 3 ? 'Next' : 'Create Spot'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpotModal;
