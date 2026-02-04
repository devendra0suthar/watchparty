'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface RoomControlsProps {
  roomId: string;
  currentVideoUrl: string | null;
  isHost: boolean;
  socket: Socket | null;
  onVideoChange: (url: string) => void;
}

export default function RoomControls({
  roomId,
  currentVideoUrl,
  isHost,
  socket,
  onVideoChange,
}: RoomControlsProps) {
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const [isEditing, setIsEditing] = useState(!currentVideoUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync with prop changes
  useEffect(() => {
    if (currentVideoUrl) {
      setVideoUrl(currentVideoUrl);
      setIsEditing(false);
    }
  }, [currentVideoUrl]);

  const isValidYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleChangeVideo = async () => {
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) return;

    if (!isValidYouTubeUrl(trimmedUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: trimmedUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update video');
      }

      socket?.emit('video:change', { roomId, videoUrl: trimmedUrl });
      onVideoChange(trimmedUrl);
      setIsEditing(false);
    } catch (err) {
      console.error('Error changing video:', err);
      setError(err instanceof Error ? err.message : 'Failed to update video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChangeVideo();
    }
  };

  if (!isHost) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Host Controls</h3>

      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">
              YouTube Video URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={handleChangeVideo}
                disabled={!videoUrl.trim() || isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Set Video'}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <p className="text-gray-500 text-xs">
              Supported: youtube.com/watch, youtu.be, youtube.com/shorts
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate">
              <p className="text-sm text-gray-400">Current video:</p>
              <p className="text-white truncate">{currentVideoUrl}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors ml-4"
            >
              Change Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
