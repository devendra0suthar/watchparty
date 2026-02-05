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

  useEffect(() => {
    if (!session?.user?.id || !room) return;

    const sock = connectSocket(session.user.id, session.user.username || session.user.name || '');
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

    sock.on('room:user-joined', (data: { userId: string; username: string }) => {
      console.log(`${data.username} joined the room`);
      // Add user to members list if not already present
      setRoom((prev) => {
        if (!prev) return prev;
        const exists = prev.members.some((m) => m.user.id === data.userId);
        if (exists) return prev;
        return {
          ...prev,
          members: [
            ...prev.members,
            { user: { id: data.userId, username: data.username } },
          ],
        };
      });
    });

    sock.on('room:user-left', (data: { userId: string; username: string }) => {
      console.log(`${data.username} left the room`);
      // Remove user from members list
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.filter((m) => m.user.id !== data.userId),
        };
      });
    });

    return () => {
      sock.off('connect');
      sock.off('disconnect');
      sock.off('connect_error');
      sock.off('video:change');
      sock.off('room:user-joined');
      sock.off('room:user-left');
      sock.emit('room:leave', roomId);
      disconnectSocket();
    };
  }, [session, room, roomId]);

  const handleVideoChange = (url: string) => {
    setVideoUrl(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300"
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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            {isHost && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Host
              </span>
            )}
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-300' : 'bg-red-300'
              }`}></span>
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <QRShare roomId={roomId} />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Watch Mode Tabs */}
            <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setWatchMode('youtube')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition-all ${
                  watchMode === 'youtube'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                YouTube
              </button>
              <button
                onClick={() => setWatchMode('screen')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium transition-all ${
                  watchMode === 'screen'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                Members ({room.members.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.members.map((member) => (
                  <div
                    key={member.user.id}
                    className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1"
                  >
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {member.user.username[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm">
                      {member.user.username}
                    </span>
                    {member.user.id === room.hostId && (
                      <span className="text-purple-400 text-xs">(Host)</span>
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
              currentUser={currentUser}
              initialMessages={room.messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
