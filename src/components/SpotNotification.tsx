
import React from 'react';
import { MapPin, MessageCircle, X } from 'lucide-react';
import { Spot, User } from '@/lib/types';
import Avatar from './common/Avatar';
import Button from './common/Button';
import { MOCK_FRIENDS, MOCK_CURRENT_USER } from '@/lib/types';

interface SpotNotificationProps {
  spot: Spot;
  onClose: () => void;
  onReply: (spot: Spot, reply: string) => void;
}

const SpotNotification: React.FC<SpotNotificationProps> = ({ 
  spot, 
  onClose,
  onReply
}) => {
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  
  const creator = MOCK_FRIENDS.find(friend => friend.id === spot.creatorId) || {
    id: 'unknown',
    name: 'Unknown User',
    avatar: '',
    status: 'offline' as const
  };
  
  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(spot, replyText);
      setReplyText('');
      setShowReply(false);
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
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
    <>
      {/* Dark overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 animate-fade-in"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-0 bottom-0 sm:bottom-10 z-40 px-4 pb-6 animate-slide-up">
        <div className="max-w-lg mx-auto glass-morphism rounded-2xl overflow-hidden shadow-xl border border-white/30">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="bg-spot-blue/20 p-2.5 rounded-full">
                <MapPin className="text-spot-blue" size={20} />
              </div>
              <h3 className="font-semibold text-lg bg-gradient-to-r from-spot-blue to-spot-purple bg-clip-text text-transparent">
                You found a Spot!
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100/50"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar src={creator.avatar} name={creator.name} status="none" />
              <div>
                <div className="font-medium">{creator.name}</div>
                <div className="text-sm text-gray-500">{formatTime(spot.createdAt)}</div>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-xl p-4 mb-5 shadow-sm">
              <p className="text-gray-800 font-medium">{spot.message}</p>
            </div>
            
            {/* Replies */}
            {spot.replies.length > 0 && (
              <div className="space-y-3 mb-5">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500">Replies</h4>
                {spot.replies.map(reply => {
                  const replier = reply.userId === MOCK_CURRENT_USER.id 
                    ? MOCK_CURRENT_USER 
                    : MOCK_FRIENDS.find(f => f.id === reply.userId) || { 
                        id: 'unknown', 
                        name: 'Unknown User',
                        avatar: ''
                      };
                  
                  return (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <Avatar 
                        src={replier.avatar} 
                        name={replier.name} 
                        size="sm" 
                        status="none" 
                      />
                      <div className="flex-1">
                        <div className="bg-white/60 rounded-lg p-3 shadow-sm">
                          <div className="font-medium text-sm">{replier.name}</div>
                          <p className="text-sm text-gray-800">{reply.message}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(reply.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Reply form */}
            {showReply ? (
              <div className="space-y-3">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-sm"
                  rows={3}
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReply(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!replyText.trim()}
                    onClick={handleSubmitReply}
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                leftIcon={<MessageCircle size={16} />}
                onClick={() => setShowReply(true)}
                className="w-full mt-2"
              >
                Reply to Spot
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpotNotification;
