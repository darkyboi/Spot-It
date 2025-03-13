
import React, { useState } from 'react';
import { Users, Plus, Search, UserPlus, X } from 'lucide-react';
import { Friend } from '@/lib/types';
import Avatar from './common/Avatar';
import Button from './common/Button';
import { MOCK_FRIENDS } from '@/lib/types';

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  
  const filteredFriends = MOCK_FRIENDS.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddFriend = () => {
    console.log('Adding friend:', newFriendEmail);
    // In a real app, this would send a friend request
    setNewFriendEmail('');
    setShowAddFriend(false);
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
          
          {showAddFriend ? (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddFriend(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!newFriendEmail.includes('@')}
                  onClick={handleAddFriend}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserPlus size={16} />}
              onClick={() => setShowAddFriend(true)}
              className="w-full"
            >
              Add Friend
            </Button>
          )}
        </div>
        
        {/* Friends List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
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
                      onClick={() => console.log('View profile of', friend.name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPanel;
