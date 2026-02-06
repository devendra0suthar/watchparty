import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://watchparty-lac.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

interface RoomState {
  videoUrl: string | null;
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: number;
}

interface VoiceUser {
  userId: string;
  username: string;
}

const roomStates = new Map<string, RoomState>();
const voiceRooms = new Map<string, Map<string, VoiceUser>>();

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  const username = socket.handshake.auth.username;

  console.log(`User connected: ${username} (${userId})`);

  socket.on('room:join', (roomId: string) => {
    socket.join(roomId);
    console.log(`${username} joined room ${roomId}`);

    const state = roomStates.get(roomId);
    if (state) {
      socket.emit('video:state', state);
    }

    socket.to(roomId).emit('room:user-joined', {
      userId,
      username,
    });
  });

  socket.on('room:leave', (roomId: string) => {
    socket.leave(roomId);
    console.log(`${username} left room ${roomId}`);

    socket.to(roomId).emit('room:user-left', {
      userId,
      username,
    });
  });

  socket.on('video:play', (data: { roomId: string; currentTime: number }) => {
    const { roomId, currentTime } = data;

    const state: RoomState = {
      videoUrl: roomStates.get(roomId)?.videoUrl || null,
      currentTime,
      isPlaying: true,
      lastUpdate: Date.now(),
    };
    roomStates.set(roomId, state);

    socket.to(roomId).emit('video:play', { currentTime });
    console.log(`Video play in room ${roomId} at ${currentTime}`);
  });

  socket.on('video:pause', (data: { roomId: string; currentTime: number }) => {
    const { roomId, currentTime } = data;

    const state: RoomState = {
      videoUrl: roomStates.get(roomId)?.videoUrl || null,
      currentTime,
      isPlaying: false,
      lastUpdate: Date.now(),
    };
    roomStates.set(roomId, state);

    socket.to(roomId).emit('video:pause', { currentTime });
    console.log(`Video pause in room ${roomId} at ${currentTime}`);
  });

  socket.on('video:seek', (data: { roomId: string; currentTime: number }) => {
    const { roomId, currentTime } = data;

    const existingState = roomStates.get(roomId);
    const state: RoomState = {
      videoUrl: existingState?.videoUrl || null,
      currentTime,
      isPlaying: existingState?.isPlaying || false,
      lastUpdate: Date.now(),
    };
    roomStates.set(roomId, state);

    socket.to(roomId).emit('video:seek', { currentTime });
    console.log(`Video seek in room ${roomId} to ${currentTime}`);
  });

  socket.on('video:change', (data: { roomId: string; videoUrl: string }) => {
    const { roomId, videoUrl } = data;

    const state: RoomState = {
      videoUrl,
      currentTime: 0,
      isPlaying: false,
      lastUpdate: Date.now(),
    };
    roomStates.set(roomId, state);

    socket.to(roomId).emit('video:change', { videoUrl });
    console.log(`Video changed in room ${roomId} to ${videoUrl}`);
  });

  socket.on('chat:message', async (data: {
    roomId: string;
    content: string;
    user: { id: string; username: string; avatar?: string };
  }) => {
    const { roomId, content, user } = data;

    try {
      const saved = await prisma.message.create({
        data: {
          content,
          userId: user.id,
          roomId,
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      const message = {
        id: saved.id,
        content: saved.content,
        user: saved.user,
        createdAt: saved.createdAt.toISOString(),
      };

      io.to(roomId).emit('chat:message', message);
      console.log(`Chat message in room ${roomId} from ${user.username}: ${content}`);
    } catch (err) {
      console.error('Error saving chat message:', err);
      // Still broadcast even if DB save fails
      const message = {
        id: `${Date.now()}-${userId}`,
        content,
        user,
        createdAt: new Date().toISOString(),
      };
      io.to(roomId).emit('chat:message', message);
    }
  });

  socket.on('chat:typing', (data: { roomId: string; isTyping: boolean }) => {
    const { roomId, isTyping } = data;

    socket.to(roomId).emit('chat:typing', {
      userId,
      username,
      isTyping,
    });
  });

  // Voice chat events
  socket.on('voice:join', (data: { roomId: string; userId: string; username: string }) => {
    const { roomId } = data;

    if (!voiceRooms.has(roomId)) {
      voiceRooms.set(roomId, new Map());
    }

    voiceRooms.get(roomId)!.set(userId, { userId, username });

    socket.to(roomId).emit('voice:user-joined', {
      userId,
      username,
    });

    console.log(`${username} joined voice in room ${roomId}`);
  });

  socket.on('voice:leave', (data: { roomId: string; userId: string }) => {
    const { roomId } = data;

    voiceRooms.get(roomId)?.delete(userId);

    socket.to(roomId).emit('voice:user-left', {
      userId,
    });

    console.log(`${username} left voice in room ${roomId}`);
  });

  socket.on('voice:offer', (data: { roomId: string; targetId: string; offer: RTCSessionDescriptionInit }) => {
    const { targetId, offer } = data;

    io.to(targetId).emit('voice:offer', {
      senderId: userId,
      senderName: username,
      offer,
    });
  });

  socket.on('voice:answer', (data: { roomId: string; targetId: string; answer: RTCSessionDescriptionInit }) => {
    const { targetId, answer } = data;

    io.to(targetId).emit('voice:answer', {
      senderId: userId,
      answer,
    });
  });

  socket.on('voice:ice-candidate', (data: { roomId: string; targetId: string; candidate: RTCIceCandidateInit }) => {
    const { targetId, candidate } = data;

    io.to(targetId).emit('voice:ice-candidate', {
      senderId: userId,
      candidate,
    });
  });

  socket.on('voice:speaking', (data: { roomId: string; userId: string; isSpeaking: boolean }) => {
    const { roomId, isSpeaking } = data;

    socket.to(roomId).emit('voice:speaking', {
      userId,
      isSpeaking,
    });
  });

  // Screen sharing events
  socket.on('screen:start', (data: { roomId: string; oderId: string }) => {
    const { roomId, oderId } = data;
    socket.to(roomId).emit('screen:started', { oderId });
    console.log(`${username} started screen sharing in room ${roomId}`);
  });

  socket.on('screen:stop', (data: { roomId: string }) => {
    const { roomId } = data;
    socket.to(roomId).emit('screen:stopped', {});
    console.log(`${username} stopped screen sharing in room ${roomId}`);
  });

  socket.on('screen:request', (data: { roomId: string; oderId: string }) => {
    const { roomId, oderId } = data;
    socket.to(roomId).emit('screen:viewer-join', { oderId });
  });

  socket.on('screen:offer', (data: { roomId: string; targetId: string; offer: RTCSessionDescriptionInit }) => {
    const { targetId, offer } = data;
    io.to(targetId).emit('screen:offer', {
      senderId: userId,
      offer,
    });
  });

  socket.on('screen:answer', (data: { roomId: string; targetId: string; answer: RTCSessionDescriptionInit }) => {
    const { targetId, answer } = data;
    io.to(targetId).emit('screen:answer', {
      senderId: userId,
      answer,
    });
  });

  socket.on('screen:ice-candidate', (data: { roomId: string; targetId: string; candidate: RTCIceCandidateInit }) => {
    const { targetId, candidate } = data;
    io.to(targetId).emit('screen:ice-candidate', {
      senderId: userId,
      candidate,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${username} (${userId})`);

    // Clean up typing indicators in all rooms this socket was in
    Array.from(socket.rooms).forEach((roomId) => {
      socket.to(roomId).emit('chat:typing', {
        userId,
        username,
        isTyping: false,
      });
    });

    // Clean up voice rooms
    voiceRooms.forEach((users, roomId) => {
      if (users.has(userId)) {
        users.delete(userId);
        io.to(roomId).emit('voice:user-left', { userId });
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

export { io, httpServer };
