'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Socket } from 'socket.io-client';

interface VideoPlayerProps {
  videoUrl: string | null;
  roomId: string;
  isHost: boolean;
  socket: Socket | null;
}

interface PlayerRef {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

export default function VideoPlayer({
  videoUrl,
  roomId,
  isHost,
  socket,
}: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const syncingRef = useRef(false);

  const getPlayer = (): PlayerRef | null => {
    return playerRef.current;
  };

  useEffect(() => {
    if (!socket) return;

    const handlePlay = (data: { currentTime: number }) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      getPlayer()?.seekTo(data.currentTime, 'seconds');
      setIsPlaying(true);
      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    const handlePause = (data: { currentTime: number }) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      getPlayer()?.seekTo(data.currentTime, 'seconds');
      setIsPlaying(false);
      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    const handleSeek = (data: { currentTime: number }) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      getPlayer()?.seekTo(data.currentTime, 'seconds');
      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    const handleState = (data: {
      currentTime: number;
      isPlaying: boolean;
    }) => {
      syncingRef.current = true;
      getPlayer()?.seekTo(data.currentTime, 'seconds');
      setIsPlaying(data.isPlaying);
      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    socket.on('video:play', handlePlay);
    socket.on('video:pause', handlePause);
    socket.on('video:seek', handleSeek);
    socket.on('video:state', handleState);

    return () => {
      socket.off('video:play', handlePlay);
      socket.off('video:pause', handlePause);
      socket.off('video:seek', handleSeek);
      socket.off('video:state', handleState);
    };
  }, [socket]);

  const handlePlay = useCallback(() => {
    if (!isHost || syncingRef.current) return;
    setIsPlaying(true);
    const currentTime = getPlayer()?.getCurrentTime() || 0;
    socket?.emit('video:play', { roomId, currentTime });
  }, [isHost, roomId, socket]);

  const handlePause = useCallback(() => {
    if (!isHost || syncingRef.current) return;
    setIsPlaying(false);
    const currentTime = getPlayer()?.getCurrentTime() || 0;
    socket?.emit('video:pause', { roomId, currentTime });
  }, [isHost, roomId, socket]);

  const handleSeek = useCallback(
    (seconds: number) => {
      if (!isHost || syncingRef.current) return;
      socket?.emit('video:seek', { roomId, currentTime: seconds });
    },
    [isHost, roomId, socket]
  );

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No video selected</p>
        {isHost && <p className="text-gray-600 text-xs mt-1">Paste a YouTube URL below to start watching</p>}
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-800">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls={isHost}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
      />
      {!isHost && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1.5 border border-white/10">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          Synced with host
        </div>
      )}
    </div>
  );
}
