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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChangeVideo();
    }
  };

  if (!isHost) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Host Controls
      </h3>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-600"
              disabled={isLoading}
            />
            <button
              onClick={handleChangeVideo}
              disabled={!videoUrl.trim() || isLoading}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isLoading ? 'Loading...' : 'Set Video'}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <p className="text-gray-600 text-xs">
            Supported: youtube.com/watch, youtu.be, youtube.com/shorts
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{currentVideoUrl}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-800 text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all text-sm flex-shrink-0"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
