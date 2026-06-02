'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, Square } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

const FloatingChatbot: React.FC = () => {
  const { isOpen, setIsOpen, position, setPosition, isMinimized, setIsMinimized } = useChatbot();
  
  // Check if we're on the intro page
  const [isIntroPage, setIsIntroPage] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIntroPage = () => {
        const hasSeenIntro = sessionStorage.getItem('gandal_intro_seen') === 'true';
        setIsIntroPage(!hasSeenIntro);
      };
      
      checkIntroPage();
      
      // Listen for storage changes
      window.addEventListener('storage', checkIntroPage);
      
      // Check periodically in case sessionStorage changes
      const interval = setInterval(checkIntroPage, 500);
      
      return () => {
        window.removeEventListener('storage', checkIntroPage);
        clearInterval(interval);
      };
    }
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant GANDAL. Comment puis-je vous aider aujourd\'hui ?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState<Position>({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const chatbotRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect mobile device and reposition on resize
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 640;
      setIsMobile(nowMobile);
      
      // Reposition chatbot when switching between mobile/desktop
      if (wasMobile !== nowMobile || !isInitialized) {
        const chatWidth = 80;
        const chatHeight = 80;
        const margin = nowMobile ? 10 : 20;
        const defaultX = window.innerWidth - chatWidth - margin;
        const defaultY = window.innerHeight - chatHeight - margin;
        
        setPosition({
          x: Math.max(margin, defaultX),
          y: Math.max(margin, defaultY),
        });
        setIsInitialized(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, isInitialized]);

  // Adjust position when window is resized or chat is opened
  useEffect(() => {
    if (isOpen && !isMaximized) {
      adjustPositionToViewport();
    }
  }, [isOpen, isMobile, isMaximized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatbotRef.current) return;
    
    // Prevent dragging when clicking on buttons inside the chat
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
      return;
    }
    
    const rect = chatbotRef.current.getBoundingClientRect();
    const startPos = { x: e.clientX, y: e.clientY };
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragStartTime(Date.now());
    setDragStartPos(startPos);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const chatWidth = isOpen ? (isMobile ? 280 : 384) : 60;
    const chatHeight = isOpen ? (isMobile ? 384 : 500) : 60;
    const margin = isMobile ? 10 : 20;
    const maxX = window.innerWidth - chatWidth - margin;
    const maxY = window.innerHeight - chatHeight - margin;
    
    setPosition({
      x: Math.max(margin, Math.min(newX, maxX)),
      y: Math.max(margin, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      const dragTime = Date.now() - dragStartTime;
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      // If it was a quick click (< 300ms) and minimal movement (< 10px), treat as click to toggle
      if (dragTime < 300 && dragDistance < 10) {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        
        // When opening, adjust position to keep window in viewport
        if (newIsOpen && !isMaximized) {
          adjustPositionToViewport();
        }
      }
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isOpen, isMobile]);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!chatbotRef.current) return;
    
    // Prevent dragging when touching buttons inside the chat
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
      return;
    }
    
    const touch = e.touches[0];
    const rect = chatbotRef.current.getBoundingClientRect();
    const startPos = { x: touch.clientX, y: touch.clientY };
    
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setDragStartTime(Date.now());
    setDragStartPos(startPos);
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    const chatWidth = isOpen ? 280 : 60;
    const chatHeight = isOpen ? 384 : 60;
    const margin = 10;
    const maxX = window.innerWidth - chatWidth - margin;
    const maxY = window.innerHeight - chatHeight - margin;
    
    setPosition({
      x: Math.max(margin, Math.min(newX, maxX)),
      y: Math.max(margin, Math.min(newY, maxY)),
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging) {
      const dragTime = Date.now() - dragStartTime;
      const touch = e.changedTouches[0];
      const dragDistance = Math.sqrt(
        Math.pow(touch.clientX - dragStartPos.x, 2) + Math.pow(touch.clientY - dragStartPos.y, 2)
      );
      
      // If it was a quick tap (< 300ms) and minimal movement (< 10px), treat as tap to toggle
      if (dragTime < 300 && dragDistance < 10) {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        
        // When opening, adjust position to keep window in viewport
        if (newIsOpen && !isMaximized) {
          adjustPositionToViewport();
        }
      }
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset, isOpen]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response with typing delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const toggleMaximize = () => {
    if (!isMaximized) {
      // Save current position before maximizing
      setSavedPosition(position);
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    } else {
      // Restore saved position
      setPosition(savedPosition);
      setIsMaximized(false);
    }
  };

  const adjustPositionToViewport = () => {
    // Get chat window dimensions
    const chatWidth = isMobile ? 280 : 384; // Réduit de 320 à 280 pour mobile
    const chatHeight = isMobile ? 384 : 500;
    
    // Calculate maximum allowed position with more margin on mobile
    const margin = isMobile ? 10 : 20;
    const maxX = window.innerWidth - chatWidth - margin;
    const maxY = window.innerHeight - chatHeight - margin;
    
    // Adjust position if needed
    const newX = Math.max(margin, Math.min(position.x, maxX));
    const newY = Math.max(margin, Math.min(position.y, maxY));
    
    // Only update if position changed
    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('bonjour') || input.includes('salut') || input.includes('hello')) {
      return 'Bonjour ! Comment puis-je vous aider avec la plateforme GANDAL ?';
    }
    
    if (input.includes('aide') || input.includes('help')) {
      return 'Je peux vous aider avec :\n• Navigation dans la plateforme\n• Gestion des VMs\n• Questions sur les projets\n• Support technique\n\nQue souhaitez-vous savoir ?';
    }
    
    if (input.includes('vm') || input.includes('machine virtuelle')) {
      return 'Pour les machines virtuelles, vous pouvez :\n• Créer de nouvelles instances\n• Gérer vos VMs existantes\n• Configurer les ressources\n• Accéder aux logs\n\nRendez-vous dans l\'onglet "VMs" de votre dashboard.';
    }
    
    if (input.includes('projet') || input.includes('project')) {
      return 'Pour vos projets académiques :\n• Consultez la section "Publications"\n• Gérez les inscriptions étudiantes\n• Suivez l\'avancement via "Instanciation"\n\nBesoin d\'aide spécifique ?';
    }

    if (input.includes('enseignant') || input.includes('teacher') || input.includes('prof')) {
      return 'En tant qu\'enseignant, vous avez accès à :\n• Dashboard enseignant (/dashboard/teacher)\n• Gestion des inscriptions étudiantes\n• Suivi des projets et publications\n• Administration des VMs\n\nQuelle fonctionnalité vous intéresse ?';
    }
    
    return 'Je comprends votre question. Pour une assistance plus détaillée, n\'hésitez pas à contacter l\'équipe support ou consulter la documentation de la plateforme GANDAL.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render chatbot on intro page
  if (isIntroPage) {
    return null;
  }

  const TypingIndicator = () => (
    <div className="mb-4 text-left relative z-10">
      <div className="inline-block bg-white text-gray-800 border border-gray-200 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-1">
          <Bot size={16} className="text-blue-600" />
          <span className="text-sm text-gray-600">Assistant GANDAL écrit</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={chatbotRef}
      className={`fixed transition-all chatbot-container ${
        isDragging ? 'cursor-grabbing chatbot-dragging' : 'cursor-grab'
      } ${isOpen ? 'chatbot-open-animation' : ''} ${isMobile && !isOpen ? 'chatbot-mobile-fixed' : ''}`}
      style={{
        left: isMobile && !isOpen ? 'auto' : 0,
        right: isMobile && !isOpen ? '10px' : 'auto',
        bottom: isMobile && !isOpen ? '10px' : 'auto',
        top: isMobile && !isOpen ? 'auto' : 0,
        transform: isMobile && !isOpen ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        zIndex: 9999,
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {!isOpen ? (
        // Floating Icon
        <div
          className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer chatbot-icon-pulse ${
            isMobile ? 'p-4' : 'p-4'
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <MessageCircle size={isMobile ? 28 : 24} />
        </div>
      ) : (
        // Chat Interface
        <div className={`bg-white shadow-2xl border border-gray-200 transition-all duration-300 overflow-hidden ${
          isMaximized 
            ? 'chatbot-fullscreen' 
            : `${isMobile ? 'w-[280px] h-96 chatbot-mobile' : 'w-96 h-[500px]'} rounded-3xl`
        }`}>
          {/* Header */}
          <div
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between ${
              isMaximized ? 'cursor-default' : 'cursor-move chatbot-drag-indicator rounded-t-3xl'
            }`}
            onMouseDown={isMaximized ? undefined : handleMouseDown}
            onTouchStart={isMaximized ? undefined : handleTouchStart}
          >
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-semibold text-sm sm:text-base">Assistant GANDAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMaximize();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
                title={isMaximized ? "Restaurer" : "Agrandir"}
              >
                {isMaximized ? <Square size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsMaximized(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
                title="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages and Input - Always visible when open */}
          <>
            {/* Messages */}
            <div className={`flex-1 p-4 overflow-y-auto bg-gray-50 chatbot-messages relative ${
              isMaximized 
                ? 'h-[calc(100vh-140px)]' 
                : isMobile 
                  ? 'h-64' 
                  : 'h-80'
            }`}>
              {/* Bot Icons Watermark - Multiple scattered icons */}
              <div className="chatbot-watermark chatbot-watermark-1">
                <Bot size={60} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-2">
                <Bot size={50} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-3">
                <Bot size={55} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-4">
                <Bot size={45} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-5">
                <Bot size={52} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-6">
                <Bot size={48} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-7">
                <Bot size={58} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-8">
                <Bot size={46} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-9">
                <Bot size={54} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-10">
                <Bot size={50} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-11">
                <Bot size={56} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-12">
                <Bot size={44} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-13">
                <Bot size={51} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-14">
                <Bot size={49} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-15">
                <Bot size={53} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-16">
                <Bot size={47} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-17">
                <Bot size={57} strokeWidth={1} />
              </div>
              <div className="chatbot-watermark chatbot-watermark-18">
                <Bot size={45} strokeWidth={1} />
              </div>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'} relative z-10`}
                  >
                    <div
                      className={`inline-block max-w-xs sm:max-w-sm p-3 rounded-2xl ${
                        message.isUser
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1 p-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isTyping}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white p-2 rounded-2xl transition-all duration-200"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;