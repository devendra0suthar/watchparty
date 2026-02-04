'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import FriendsList from '@/components/FriendsList';

interface Room {
  id: string;
  name: string;
  videoUrl: string | null;
  hostId: string;
  host: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'friends'>('rooms');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchRooms();
    }
  }, [status, router, fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName }),
      });

      if (!res.ok) throw new Error('Failed to create room');

      const room = await res.json();
      router.push(`/room/${room.id}`);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete room');

      setRooms(rooms.filter(room => room.id !== roomId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting room:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isHost = (room: Room) => room.host.id === session.user.id;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            WatchParty
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Welcome, {session.user.username || session.user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            My Rooms
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'friends'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Friends
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Rooms</h2>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Room
              </button>
            </div>

            {showCreateRoom && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <form onSubmit={handleCreateRoom} className="flex gap-4">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Room name"
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {rooms.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">No rooms yet</p>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Create your first room
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors group relative"
                  >
                    <Link href={`/room/${room.id}`} className="block">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        Host: {room.host.username}
                        {isHost(room) && (
                          <span className="ml-2 text-purple-400 text-xs">(You)</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Created {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </Link>

                    {isHost(room) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteConfirm(room.id);
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete room"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && <FriendsList />}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Room?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this room? This action cannot be undone.
              All messages and members will be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoom(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
