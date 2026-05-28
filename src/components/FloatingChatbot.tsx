'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { useResponsiveChatbot } from '@/hooks/useResponsiveChatbot';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FloatingChatbotProps {
  className?: string;
}

export default function FloatingChatbot({ className = '' }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant GANDAL. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isMobile, isTablet, getChatbotStyles } = useResponsiveChatbot();
  const styles = getChatbotStyles(isOpen, isMinimized);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Empêcher le scroll du body quand le chat est ouvert sur mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simuler une réponse du bot (remplacez par votre API)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('vm') || input.includes('machine virtuelle')) {
      return 'Je peux vous aider avec la gestion des machines virtuelles. Vous pouvez créer, modifier ou supprimer des VMs depuis l\'onglet "Instancier" de votre dashboard.';
    }
    
    if (input.includes('étudiant') || input.includes('inscription')) {
      return 'Pour gérer les inscriptions d\'étudiants, rendez-vous dans l\'onglet "Inscriptions" où vous pouvez approuver ou rejeter les demandes de comptes.';
    }
    
    if (input.includes('publication')) {
      return 'Vous pouvez gérer vos publications dans l\'onglet "Publications". Ajoutez de nouveaux projets ou modifiez les existants.';
    }
    
    if (input.includes('profil')) {
      return 'Votre profil peut être modifié dans l\'onglet "Mon Profil". Vous y trouverez vos informations personnelles et statistiques.';
    }
    
    if (input.includes('aide') || input.includes('help')) {
      return 'Je suis là pour vous aider ! Vous pouvez me poser des questions sur :\n• La gestion des VMs\n• Les inscriptions d\'étudiants\n• Vos publications\n• Votre profil\n• L\'utilisation du dashboard';
    }
    
    return 'Je comprends votre question. En tant qu\'assistant GANDAL, je peux vous aider avec la gestion de votre dashboard enseignant. Pouvez-vous être plus précis sur ce que vous souhaitez faire ?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`${styles.button} bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group chatbot-button chatbot-focus ${className}`}
          aria-label="Ouvrir le chatbot"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full notification-badge" />
        </button>
      )}

      {/* Overlay pour mobile */}
      {isOpen && isMobile && (
        <div className={styles.overlay} onClick={toggleChat} />
      )}

      {/* Interface de chat */}
      {isOpen && (
        <div className={`${styles.container} chatbot-enter ${isMobile ? 'chatbot-mobile-fullscreen' : ''}`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant GANDAL</h3>
                <p className="text-xs text-blue-100">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && (
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-blue-500 rounded transition-colors duration-200"
                  aria-label={isMinimized ? "Agrandir" : "Réduire"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-blue-500 rounded transition-colors duration-200"
                aria-label="Fermer le chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(!isMinimized || isMobile) && (
            <>
              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 chatbot-messages ${isMobile ? 'h-full' : isTablet ? 'h-64' : 'h-80'}`}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 message-enter ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        message.sender === 'user'
                          ? 'message-user text-white rounded-br-md'
                          : 'message-bot text-slate-900 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm chatbot-focus"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    aria-label="Envoyer le message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}