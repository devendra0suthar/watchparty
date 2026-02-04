export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string | null;
}

export interface Room {
  id: string;
  name: string;
  videoUrl?: string | null;
  hostId: string;
  host: User;
  isActive: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  user: User;
  createdAt: Date;
}

export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  user: User;
  joinedAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  sender: User;
  receiver: User;
  createdAt: Date;
}

// Socket.io event types
export interface VideoSyncPayload {
  roomId: string;
  currentTime: number;
  isPlaying: boolean;
}

export interface ChatMessagePayload {
  roomId: string;
  content: string;
  user: User;
  createdAt: string;
}

export interface RoomJoinPayload {
  roomId: string;
  user: User;
}
