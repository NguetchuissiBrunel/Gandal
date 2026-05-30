'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface ChatbotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  position: Position;
  setPosition: (position: Position) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('gandal-chatbot-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.position) setPosition(parsed.position);
        if (parsed.isMinimized !== undefined) setIsMinimized(parsed.isMinimized);
        // Don't restore isOpen - always start closed
      } else {
        // Default position - bottom right corner
        const chatWidth = 80;
        const chatHeight = 80;
        const defaultX = window.innerWidth - chatWidth - 20;
        const defaultY = window.innerHeight - chatHeight - 20;
        
        setPosition({
          x: Math.max(20, defaultX),
          y: Math.max(20, defaultY),
        });
      }
    } catch (error) {
      console.error('Error loading chatbot state:', error);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const state = {
        position,
        isMinimized,
        // Don't save isOpen
      };
      localStorage.setItem('gandal-chatbot-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving chatbot state:', error);
    }
  }, [position, isMinimized]);

  return (
    <ChatbotContext.Provider value={{
      isOpen,
      setIsOpen,
      position,
      setPosition,
      isMinimized,
      setIsMinimized,
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};