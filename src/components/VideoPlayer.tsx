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
  const [isSeeking, setIsSeeking] = useState(false);
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
      if (!isHost || syncingRef.current || !isSeeking) return;
      socket?.emit('video:seek', { roomId, currentTime: seconds });
    },
    [isHost, roomId, socket, isSeeking]
  );

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No video selected</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
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
        onStart={handleSeekStart}
        onBuffer={handleSeekEnd}
      />
      {!isHost && (
        <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-sm text-white">
          Synced with host
        </div>
      )}
    </div>
  );
}
