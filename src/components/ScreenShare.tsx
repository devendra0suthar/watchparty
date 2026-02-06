'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface ScreenShareProps {
  roomId: string;
  isHost: boolean;
  socket: Socket | null;
  currentUser: {
    id: string;
    username: string;
  };
}

interface PeerConnection {
  oderId: string;
  connection: RTCPeerConnection;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function ScreenShare({
  roomId,
  isHost,
  socket,
  currentUser,
}: ScreenShareProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  const [isSharing, setIsSharing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('screen:ice-candidate', {
          roomId,
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsReceiving(true);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peersRef.current.delete(peerId);
      }
    };

    return pc;
  }, [socket, roomId]);

  const startScreenShare = async () => {
    try {
      setError(null);

      // Request screen/tab capture with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as MediaTrackConstraints,
        audio: true, // Capture tab audio
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsSharing(true);

      // Notify others that screen sharing started
      socket?.emit('screen:start', { roomId, oderId: currentUser.id });

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Error starting screen share:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Screen sharing was cancelled or denied');
        } else {
          setError('Failed to start screen sharing');
        }
      }
    }
  };

  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Close all peer connections
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();

    setIsSharing(false);
    socket?.emit('screen:stop', { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    // Host: When a viewer wants to receive the stream
    const handleViewerJoin = async (data: { oderId: string }) => {
      if (!isHost || !localStreamRef.current) return;

      const pc = createPeerConnection(data.oderId);

      // Add local stream tracks to the connection
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('screen:offer', {
        roomId,
        targetId: data.oderId,
        offer,
      });

      peersRef.current.set(data.oderId, { oderId: data.oderId, connection: pc });
    };

    // Viewer: Receive offer from host
    const handleOffer = async (data: { senderId: string; offer: RTCSessionDescriptionInit }) => {
      if (isHost) return;

      const pc = createPeerConnection(data.senderId);

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('screen:answer', {
        roomId,
        targetId: data.senderId,
        answer,
      });

      peersRef.current.set(data.senderId, { oderId: data.senderId, connection: pc });
    };

    // Host: Receive answer from viewer
    const handleAnswer = async (data: { senderId: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    // Handle ICE candidates
    const handleIceCandidate = async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    // Viewer: Host started sharing
    const handleScreenStart = () => {
      if (!isHost) {
        // Request to receive the stream
        socket.emit('screen:request', { roomId, oderId: currentUser.id });
      }
    };

    // Viewer: Host stopped sharing
    const handleScreenStop = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setIsReceiving(false);

      peersRef.current.forEach((peer) => {
        peer.connection.close();
      });
      peersRef.current.clear();
    };

    socket.on('screen:viewer-join', handleViewerJoin);
    socket.on('screen:offer', handleOffer);
    socket.on('screen:answer', handleAnswer);
    socket.on('screen:ice-candidate', handleIceCandidate);
    socket.on('screen:started', handleScreenStart);
    socket.on('screen:stopped', handleScreenStop);

    return () => {
      socket.off('screen:viewer-join', handleViewerJoin);
      socket.off('screen:offer', handleOffer);
      socket.off('screen:answer', handleAnswer);
      socket.off('screen:ice-candidate', handleIceCandidate);
      socket.off('screen:started', handleScreenStart);
      socket.off('screen:stopped', handleScreenStop);
    };
  }, [socket, isHost, roomId, currentUser.id, createPeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    const peers = peersRef.current;
    const localStream = localStreamRef.current;

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peers.forEach((peer) => {
        peer.connection.close();
      });
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Video Display */}
      <div className="aspect-video bg-gray-900 relative">
        {isHost ? (
          // Host sees their own screen
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-contain ${!isSharing ? 'hidden' : ''}`}
          />
        ) : (
          // Viewers see the shared screen
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-contain ${!isReceiving ? 'hidden' : ''}`}
          />
        )}

        {/* Placeholder when not sharing/receiving */}
        {((isHost && !isSharing) || (!isHost && !isReceiving)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {isHost ? (
              <p>Click &quot;Share Screen&quot; to start sharing your browser tab</p>
            ) : (
              <p>Waiting for host to share their screen...</p>
            )}
          </div>
        )}

        {/* Sharing indicator */}
        {isSharing && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Sharing Screen
          </div>
        )}

        {isReceiving && !isHost && (
          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Watching Host&apos;s Screen
          </div>
        )}
      </div>

      {/* Controls (Host only) */}
      {isHost && (
        <div className="p-4 border-t border-gray-700">
          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}

          {!isSharing ? (
            <button
              onClick={startScreenShare}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share Screen / Browser Tab
            </button>
          ) : (
            <button
              onClick={stopScreenShare}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop Sharing
            </button>
          )}

          <p className="text-gray-400 text-xs mt-2 text-center">
            Share any browser tab to watch movies, shows, or any content together
          </p>
        </div>
      )}
    </div>
  );
}
