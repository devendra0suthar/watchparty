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
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Chat</h3>
          <span className="text-xs text-gray-500">{messages.length} messages</span>
        </div>
      </div>

      {!isConnected && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/10 text-red-400 text-xs text-center font-medium">
          Disconnected — messages won&apos;t be delivered
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-sm">No messages yet</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user.id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2 ${
                message.user.id === currentUser.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-white border border-gray-700/50'
              }`}
            >
              {message.user.id !== currentUser.id && (
                <p className="text-[11px] text-purple-400 font-medium mb-0.5">
                  {message.user.username}
                </p>
              )}
              <p className="break-words text-sm">{message.content}</p>
              <p className="text-[10px] opacity-50 mt-1">
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
        <div className="px-4 py-1.5 text-xs text-gray-500">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
