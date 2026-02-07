import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserResponse } from 'stream-chat';
import { chatService } from '../services/chatService';

interface ChatContextValue {
  currentUser: UserResponse | null;
  isConnecting: boolean;
  connectUser: (userId: string, userName?: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectUser = useCallback(
    async (userId: string, userName?: string) => {
      setIsConnecting(true);
      try {
        const user = await chatService.connectUser(userId, userName);
        setCurrentUser(user ?? null);
      } finally {
        setIsConnecting(false);
      }
    },
    [],
  );

  const disconnectUser = useCallback(async () => {
    await chatService.disconnectUser();
    setCurrentUser(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{ currentUser, isConnecting, connectUser, disconnectUser }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
