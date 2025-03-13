
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Friend extends User {
  status: 'online' | 'offline';
  lastActive?: Date;
}

export interface Spot {
  id: string;
  creatorId: string;
  message: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number; // In meters
  duration: number; // In hours
  createdAt: Date;
  expiresAt: Date;
  recipients: string[]; // User IDs
  replies: SpotReply[];
}

export interface SpotReply {
  id: string;
  spotId: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export interface SpotNotification {
  id: string;
  spotId: string;
  read: boolean;
  receivedAt: Date;
}

// Mock data for development
export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  name: 'Morgan Adams',
  avatar: 'https://i.pravatar.cc/150?img=32'
};

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'Alex Chen',
    avatar: 'https://i.pravatar.cc/150?img=11',
    status: 'online'
  },
  {
    id: 'friend-2',
    name: 'Sam Wilson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'offline',
    lastActive: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 'friend-3',
    name: 'Taylor Swift',
    avatar: 'https://i.pravatar.cc/150?img=13',
    status: 'online'
  },
  {
    id: 'friend-4',
    name: 'Jordan Lee',
    avatar: 'https://i.pravatar.cc/150?img=14',
    status: 'offline',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 'friend-5',
    name: 'Casey Johnson',
    avatar: 'https://i.pravatar.cc/150?img=15',
    status: 'online'
  }
];

export const MOCK_SPOTS: Spot[] = [
  {
    id: 'spot-1',
    creatorId: 'friend-1',
    message: 'Remember when we saw that amazing sunset here? We should come back sometime!',
    location: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    radius: 100,
    duration: 48,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    recipients: ['user-1'],
    replies: []
  },
  {
    id: 'spot-2',
    creatorId: 'friend-2',
    message: 'I miss playing volleyball with you here. Let\'s plan a game soon!',
    location: {
      latitude: 34.0622,
      longitude: -118.2537
    },
    radius: 50,
    duration: 72,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 60), // 2.5 days from now
    recipients: ['user-1', 'friend-3'],
    replies: [
      {
        id: 'reply-1',
        spotId: 'spot-2',
        userId: 'friend-3',
        message: 'I\'m free next weekend!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
      }
    ]
  }
];

export const MOCK_NOTIFICATIONS: SpotNotification[] = [
  {
    id: 'notif-1',
    spotId: 'spot-1',
    read: false,
    receivedAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }
];
