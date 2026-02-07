'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import VideoPlayer from '@/components/VideoPlayer';
import Chat from '@/components/Chat';
import QRShare from '@/components/QRShare';
import RoomControls from '@/components/RoomControls';
import VoiceChat from '@/components/VoiceChat';
import ScreenShare from '@/components/ScreenShare';

interface RoomData {
  id: string;
  name: string;
  videoUrl: string | null;
  hostId: string;
  host: {
    id: string;
    username: string;
  };
  members: Array<{
    user: {
      id: string;
      username: string;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    user: {
      id: string;
      username: string;
    };
    createdAt: string;
  }>;
}

export default function RoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [watchMode, setWatchMode] = useState<'youtube' | 'screen'>('youtube');
  const [onlineMembers, setOnlineMembers] = useState<Array<{ userId: string; username: string }>>([]);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Room not found');
        } else {
          throw new Error('Failed to fetch room');
        }
        return;
      }
      const data = await res.json();
      setRoom(data);
      setVideoUrl(data.videoUrl);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const joinRoom = useCallback(async () => {
    try {
      await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error joining room:', err);
    }
  }, [roomId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=/room/${roomId}`);
    } else if (status === 'authenticated') {
      fetchRoom();
      joinRoom();
    }
  }, [status, router, roomId, fetchRoom, joinRoom]);

  const userId = session?.user?.id;
  const userName = session?.user?.username || session?.user?.name || '';
  const roomReady = !!room;

  useEffect(() => {
    if (!userId || !roomReady) return;

    const sock = connectSocket(userId, userName);
    setSocket(sock);

    sock.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      sock.emit('room:join', roomId);
    });

    sock.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    sock.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });

    // If already connected, join the room
    if (sock.connected) {
      sock.emit('room:join', roomId);
      setIsConnected(true);
    }

    sock.on('video:change', (data: { videoUrl: string }) => {
      setVideoUrl(data.videoUrl);
    });

    sock.on('room:members', (members: Array<{ userId: string; username: string }>) => {
      setOnlineMembers(members);
    });

    sock.on('room:user-joined', (data: { userId: string; username: string }) => {
      console.log(`${data.username} joined the room`);
      setOnlineMembers((prev) => {
        const exists = prev.some((m) => m.userId === data.userId);
        if (exists) return prev;
        return [...prev, { userId: data.userId, username: data.username }];
      });
    });

    sock.on('room:user-left', (data: { userId: string; username: string }) => {
      console.log(`${data.username} left the room`);
      setOnlineMembers((prev) => prev.filter((m) => m.userId !== data.userId));
    });

    return () => {
      sock.off('connect');
      sock.off('disconnect');
      sock.off('connect_error');
      sock.off('video:change');
      sock.off('room:members');
      sock.off('room:user-joined');
      sock.off('room:user-left');
      sock.emit('room:leave', roomId);
      disconnectSocket();
    };
  }, [userId, userName, roomReady, roomId]);

  const handleVideoChange = (url: string) => {
    setVideoUrl(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center bg-gray-900 rounded-2xl border border-gray-800 p-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-medium mb-2">{error}</p>
          <Link
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!session || !room) {
    return null;
  }

  const isHost = room.hostId === session.user.id;
  const currentUser = {
    id: session.user.id,
    username: session.user.username || session.user.name || 'Anonymous',
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-px h-6 bg-gray-800"></div>
            <h1 className="text-lg font-semibold text-white">{room.name}</h1>
            {isHost && (
              <span className="bg-purple-500/20 text-purple-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Host
              </span>
            )}
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              isConnected
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <QRShare roomId={roomId} />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {/* Watch Mode Tabs */}
            <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setWatchMode('youtube')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  watchMode === 'youtube'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                YouTube
              </button>
              <button
                onClick={() => setWatchMode('screen')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  watchMode === 'screen'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Screen Share
              </button>
            </div>

            {/* YouTube Mode */}
            {watchMode === 'youtube' && (
              <>
                <VideoPlayer
                  videoUrl={videoUrl}
                  roomId={roomId}
                  isHost={isHost}
                  socket={socket}
                />
                {isHost && (
                  <RoomControls
                    roomId={roomId}
                    currentVideoUrl={videoUrl}
                    isHost={isHost}
                    socket={socket}
                    onVideoChange={handleVideoChange}
                  />
                )}
              </>
            )}

            {/* Screen Share Mode */}
            {watchMode === 'screen' && (
              <ScreenShare
                roomId={roomId}
                isHost={isHost}
                socket={socket}
                currentUser={currentUser}
              />
            )}

            <VoiceChat
              roomId={roomId}
              socket={socket}
              currentUser={currentUser}
            />

            {/* Members */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Online</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {onlineMembers.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {onlineMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700/50"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {member.username[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm">
                      {member.username}
                    </span>
                    {member.userId === room.hostId && (
                      <span className="text-purple-400 text-[10px] font-medium bg-purple-500/10 px-1.5 py-0.5 rounded">Host</span>
                    )}
                    {member.userId === currentUser.id && (
                      <span className="text-gray-500 text-[10px]">(You)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 h-[600px]">
            <Chat
              roomId={roomId}
              socket={socket}
              isConnected={isConnected}
              currentUser={currentUser}
              initialMessages={room.messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
