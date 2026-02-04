'use client';

import { useState, useEffect, useCallback } from 'react';

interface Friend {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface FriendRequest {
  id: string;
  sender: Friend;
  receiver: Friend;
  status: string;
}

interface FriendsListProps {
  onInvite?: (friendId: string) => void;
}

export default function FriendsList({ onInvite }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (!res.ok) throw new Error('Failed to fetch friends');
      const data = await res.json();
      setFriends(data.friends || []);
      setSentRequests(data.sentRequests || []);
      setReceivedRequests(data.receivedRequests || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newFriendUsername }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send request');
      }

      setSuccess('Friend request sent!');
      setNewFriendUsername('');
      fetchFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Failed to handle request');
      fetchFriends();
    } catch (err) {
      console.error('Error handling request:', err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove friend');
      fetchFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Add Friend</h3>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <input
            type="text"
            value={newFriendUsername}
            onChange={(e) => setNewFriendUsername(e.target.value)}
            placeholder="Enter username"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Send Request
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
      </div>

      {receivedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Friend Requests ({receivedRequests.length})
          </h3>
          <div className="space-y-2">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.sender.username[0].toUpperCase()}
                  </div>
                  <span className="text-white">{request.sender.username}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestAction(request.id, 'accept')}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, 'decline')}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Pending Requests ({sentRequests.length})
          </h3>
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.receiver.username[0].toUpperCase()}
                  </div>
                  <span className="text-white">{request.receiver.username}</span>
                </div>
                <span className="text-gray-400 text-sm">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-gray-400">No friends yet. Add some!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {friend.username[0].toUpperCase()}
                  </div>
                  <span className="text-white">{friend.username}</span>
                </div>
                <div className="flex gap-2">
                  {onInvite && (
                    <button
                      onClick={() => onInvite(friend.id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                    >
                      Invite
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
