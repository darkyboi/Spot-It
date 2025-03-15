
import React, { useState } from 'react';
import { Users, Plus, Search, UserPlus, X, Mail, User, Check, Shield, AlertTriangle } from 'lucide-react';
import { Friend } from '@/lib/types';
import Avatar from './common/Avatar';
import Button from './common/Button';
import { MOCK_FRIENDS } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addMethod, setAddMethod] = useState<'email' | 'username' | null>(null);
  const [inviteValue, setInviteValue] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'requests'>('all');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  
  // Mock friend requests data
  const [friendRequests] = useState([
    { id: 'req1', name: 'Jamie Smith', avatar: '', status: 'pending' as const },
    { id: 'req2', name: 'Taylor Wong', avatar: '', status: 'pending' as const }
  ]);
  
  const filteredFriends = MOCK_FRIENDS.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddFriend = () => {
    if (!inviteValue.trim()) return;
    
    // In a real app, this would send a friend request
    toast({
      title: "Friend Request Sent",
      description: `We've sent a request to ${inviteValue}`,
    });
    
    setInviteValue('');
    setAddMethod(null);
  };
  
  const handleAcceptRequest = (id: string) => {
    // In a real app, this would accept the friend request
    toast({
      title: "Friend Request Accepted",
      description: "You are now friends!",
    });
  };
  
  const handleRejectRequest = (id: string) => {
    // In a real app, this would reject the friend request
    toast({
      title: "Friend Request Declined",
      description: "The request has been removed",
    });
  };
  
  const handleBlockFriend = (friendId: string) => {
    // In a real app this would block the friend
    toast({
      title: "User Blocked",
      description: "You won't receive Spots from this user anymore",
      variant: "destructive",
    });
    setSelectedFriend(null);
  };
  
  const handleReportFriend = (friendId: string) => {
    // In a real app this would report the friend
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep our community safe",
    });
    setSelectedFriend(null);
  };
  
  // Format last active time
  const formatLastActive = (date?: Date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-white shadow-lg z-30 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-primary" />
            <h2 className="font-semibold">Friends</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-center font-medium text-sm ${
              selectedTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('all')}
          >
            All Friends
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium text-sm ${
              selectedTab === 'requests'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('requests')}
          >
            Requests {friendRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Search & Add */}
        <div className="px-4 py-3 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {addMethod ? (
            <div className="space-y-2">
              <div className="relative">
                {addMethod === 'email' ? (
                  <>
                    <Mail size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={inviteValue}
                      onChange={(e) => setInviteValue(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <User size={16} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter username"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={inviteValue}
                      onChange={(e) => setInviteValue(e.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAddMethod(null);
                    setInviteValue('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!inviteValue.trim()}
                  onClick={handleAddFriend}
                  leftIcon={<UserPlus size={16} />}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Mail size={16} />}
                onClick={() => setAddMethod('email')}
              >
                By Email
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<User size={16} />}
                onClick={() => setAddMethod('username')}
              >
                By Username
              </Button>
            </div>
          )}
        </div>
        
        {/* Friends List or Requests */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'all' ? (
            // All Friends Tab
            filteredFriends.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500">
                {searchQuery ? "No friends match your search" : "You haven't added any friends yet"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredFriends.map(friend => (
                  <li key={friend.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          src={friend.avatar} 
                          name={friend.name} 
                          status={friend.status} 
                        />
                        <div>
                          <div className="font-medium">{friend.name}</div>
                          <div className="text-sm text-gray-500">
                            {friend.status === 'online' 
                              ? 'Online now' 
                              : `Last active ${formatLastActive(friend.lastActive)}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="text-primary hover:text-primary/80 transition-colors"
                        onClick={() => setSelectedFriend(friend.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Friend Actions - Shown when selected */}
                    {selectedFriend === friend.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Shield size={14} />}
                            onClick={() => handleBlockFriend(friend.id)}
                            className="w-full justify-start text-sm text-gray-700 hover:text-destructive"
                          >
                            Block User
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<AlertTriangle size={14} />}
                            onClick={() => handleReportFriend(friend.id)}
                            className="w-full justify-start text-sm text-gray-700"
                          >
                            Report Abuse
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X size={14} />}
                            onClick={() => setSelectedFriend(null)}
                            className="w-full justify-start text-sm text-gray-500"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : (
            // Requests Tab
            friendRequests.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500">
                You don't have any friend requests
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {friendRequests.map(request => (
                  <li key={request.id} className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar 
                        src={request.avatar} 
                        name={request.name} 
                        status="none" 
                      />
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-gray-500">
                          Wants to be your friend
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        leftIcon={<Check size={16} />}
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        leftIcon={<X size={16} />}
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPanel;
