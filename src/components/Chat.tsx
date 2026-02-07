'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ChatProps {
  roomId: string;
  socket: Socket | null;
  isConnected: boolean;
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
  };
  initialMessages?: ChatMessage[];
}

export default function Chat({
  roomId,
  socket,
  isConnected,
  currentUser,
  initialMessages = [],
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: ChatMessage) => {
      // Skip own messages (already shown via optimistic update)
      if (message.user.id === currentUser.id) return;
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = (data: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (data.userId === currentUser.id) return;

      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.username)) {
          return [...prev, data.username];
        } else if (!data.isTyping) {
          return prev.filter((u) => u !== data.username);
        }
        return prev;
      });
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    const content = newMessage.trim();

    // Optimistic update — show message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        content,
        user: currentUser,
        createdAt: new Date().toISOString(),
      },
    ]);

    socket.emit('chat:message', {
      roomId,
      content,
      user: currentUser,
    });

    setNewMessage('');
    socket.emit('chat:typing', { roomId, isTyping: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    socket.emit('chat:typing', { roomId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { roomId, isTyping: false });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
      </div>

      {!isConnected && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm text-center">
          Disconnected — messages won&apos;t be delivered
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user.id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.user.id === currentUser.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {message.user.id !== currentUser.id && (
                <p className="text-xs text-purple-400 mb-1">
                  {message.user.username}
                </p>
              )}
              <p className="break-words">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-400">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
