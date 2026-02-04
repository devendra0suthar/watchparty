'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface VoiceChatProps {
  roomId: string;
  socket: Socket | null;
  currentUser: {
    id: string;
    username: string;
  };
}

interface PeerConnection {
  peerId: string;
  username: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function VoiceChat({ roomId, socket, currentUser }: VoiceChatProps) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  const createPeerConnection = useCallback((peerId: string, username: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('voice:ice-candidate', {
          roomId,
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;

      const peerConn = peersRef.current.get(peerId);
      if (peerConn) {
        peerConn.stream = event.streams[0];
        peersRef.current.set(peerId, peerConn);
        setPeers(new Map(peersRef.current));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removePeer(peerId);
      }
    };

    return pc;
  }, [socket, roomId]);

  const removePeer = (peerId: string) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(peerId);
      setPeers(new Map(peersRef.current));
    }
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Set up audio analysis for speaking indicator
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start speaking detection
      detectSpeaking();

      setIsMicOn(true);
      socket?.emit('voice:join', { roomId, userId: currentUser.id, username: currentUser.username });

      // Add tracks to existing peer connections
      peersRef.current.forEach((peer) => {
        stream.getTracks().forEach((track) => {
          peer.connection.addTrack(track, stream);
        });
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopMicrophone = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close all peer connections
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();
    setPeers(new Map());

    setIsMicOn(false);
    socket?.emit('voice:leave', { roomId, userId: currentUser.id });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const detectSpeaking = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const check = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (average > 30) {
        setSpeakingUsers((prev) => new Set([...prev, currentUser.id]));
        socket?.emit('voice:speaking', { roomId, userId: currentUser.id, isSpeaking: true });
      } else {
        setSpeakingUsers((prev) => {
          const next = new Set(prev);
          next.delete(currentUser.id);
          return next;
        });
        socket?.emit('voice:speaking', { roomId, userId: currentUser.id, isSpeaking: false });
      }

      if (isMicOn) {
        requestAnimationFrame(check);
      }
    };

    check();
  };

  useEffect(() => {
    if (!socket) return;

    const handleVoiceUserJoined = async (data: { userId: string; username: string }) => {
      if (data.userId === currentUser.id || !localStreamRef.current) return;

      const pc = createPeerConnection(data.userId, data.username);

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('voice:offer', {
        roomId,
        targetId: data.userId,
        offer,
      });

      peersRef.current.set(data.userId, { peerId: data.userId, username: data.username, connection: pc });
      setPeers(new Map(peersRef.current));
    };

    const handleVoiceOffer = async (data: { senderId: string; senderName: string; offer: RTCSessionDescriptionInit }) => {
      if (!localStreamRef.current) return;

      const pc = createPeerConnection(data.senderId, data.senderName);

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('voice:answer', {
        roomId,
        targetId: data.senderId,
        answer,
      });

      peersRef.current.set(data.senderId, { peerId: data.senderId, username: data.senderName, connection: pc });
      setPeers(new Map(peersRef.current));
    };

    const handleVoiceAnswer = async (data: { senderId: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    };

    const handleIceCandidate = async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
      const peer = peersRef.current.get(data.senderId);
      if (peer) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    const handleVoiceUserLeft = (data: { userId: string }) => {
      removePeer(data.userId);
    };

    const handleSpeaking = (data: { userId: string; isSpeaking: boolean }) => {
      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        if (data.isSpeaking) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    socket.on('voice:user-joined', handleVoiceUserJoined);
    socket.on('voice:offer', handleVoiceOffer);
    socket.on('voice:answer', handleVoiceAnswer);
    socket.on('voice:ice-candidate', handleIceCandidate);
    socket.on('voice:user-left', handleVoiceUserLeft);
    socket.on('voice:speaking', handleSpeaking);

    return () => {
      socket.off('voice:user-joined', handleVoiceUserJoined);
      socket.off('voice:offer', handleVoiceOffer);
      socket.off('voice:answer', handleVoiceAnswer);
      socket.off('voice:ice-candidate', handleIceCandidate);
      socket.off('voice:user-left', handleVoiceUserLeft);
      socket.off('voice:speaking', handleSpeaking);
    };
  }, [socket, roomId, currentUser.id, createPeerConnection]);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Voice Chat</h3>
        <div className="flex gap-2">
          {isMicOn ? (
            <>
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <button
                onClick={stopMicrophone}
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Leave Voice
              </button>
            </>
          ) : (
            <button
              onClick={startMicrophone}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Join Voice
            </button>
          )}
        </div>
      </div>

      {isMicOn && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            In voice: {peers.size + 1} {peers.size === 0 ? 'person' : 'people'}
          </p>
          <div className="flex flex-wrap gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                speakingUsers.has(currentUser.id)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${speakingUsers.has(currentUser.id) ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              {currentUser.username} (You)
              {isMuted && <span className="text-red-400 text-xs">(muted)</span>}
            </div>
            {Array.from(peers.values()).map((peer) => (
              <div
                key={peer.peerId}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  speakingUsers.has(peer.peerId)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${speakingUsers.has(peer.peerId) ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
                {peer.username}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
