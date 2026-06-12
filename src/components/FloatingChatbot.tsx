'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Square, Maximize2 } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const PANEL_W_DESKTOP = 384;
const PANEL_H_DESKTOP = 500;
const PANEL_W_MOBILE = 300;
const PANEL_H_MOBILE = 420;
const FAB_SIZE = 56;

const FloatingChatbot: React.FC = () => {
  const { isOpen, setIsOpen, position, setPosition } = useChatbot();

  const [isIntroPage, setIsIntroPage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! Je suis votre assistant GANDAL. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportW, setViewportW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const margin = isMobile ? 10 : 16;
  const panelW = isMobile
    ? Math.min(PANEL_W_MOBILE, Math.max(240, viewportW - margin * 2))
    : PANEL_W_DESKTOP;
  const panelH = isMobile ? PANEL_H_MOBILE : PANEL_H_DESKTOP;

  useEffect(() => {
    const checkIntro = () => {
      setIsIntroPage(sessionStorage.getItem('gandal_intro_seen') !== 'true');
    };
    checkIntro();
    window.addEventListener('storage', checkIntro);
    window.addEventListener('gandal-intro-done', checkIntro);
    return () => {
      window.removeEventListener('storage', checkIntro);
      window.removeEventListener('gandal-intro-done', checkIntro);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 640);
      setViewportW(window.innerWidth);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const clampPosition = useCallback(
    (pos: { x: number; y: number }, open: boolean) => {
      const w = open ? panelW : FAB_SIZE;
      const h = open ? panelH : FAB_SIZE;
      return {
        x: Math.max(margin, Math.min(pos.x, window.innerWidth - w - margin)),
        y: Math.max(margin, Math.min(pos.y, window.innerHeight - h - margin)),
      };
    },
    [isMobile, panelW, panelH],
  );

  const defaultPosition = useCallback(
    (open: boolean) => {
      const w = open ? panelW : FAB_SIZE;
      const h = open ? panelH : FAB_SIZE;
      return {
        x: window.innerWidth - w - margin,
        y: window.innerHeight - h - margin,
      };
    },
    [isMobile, panelW, panelH],
  );

  useLayoutEffect(() => {
    if (isMaximized) return;
    setPosition((p) => clampPosition(p, isOpen));
  }, [isOpen, isMobile, isMaximized, clampPosition, setPosition]);

  useEffect(() => {
    if (isOpen && !isMaximized) {
      const onResize = () => setPosition((p) => clampPosition(p, true));
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, [isOpen, isMaximized, clampPosition, setPosition]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [messages, isOpen, isTyping]);

  const openChat = () => {
    setIsOpen(true);
    if (!isMaximized) {
      setPosition(clampPosition(defaultPosition(true), true));
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMaximized(false);
    setPosition(clampPosition(defaultPosition(false), false));
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const text = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Appelle le service IA (RAG + LLM) ; repli sur la réponse locale si indisponible.
    const reply = await fetchAiReply(text);
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const fetchAiReply = async (text: string): Promise<string> => {
    // IA co-localisée (port 8090). Déduite du navigateur si pas d'override explicite.
    const env = process.env.NEXT_PUBLIC_CHAT_API_BASE?.replace(/\/$/, '');
    const base = env
      || (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8090`
        : '');
    if (!base) return getBotResponse(text);
    try {
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.reply as string) || getBotResponse(text);
    } catch {
      return getBotResponse(text);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized((m) => !m);
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
      return 'Pour les machines virtuelles :\n• Créer des instances via l\'onglet Requêtes\n• Gérer vos VMs dans le dashboard\n• Configurer les ressources allouées';
    }
    if (input.includes('projet') || input.includes('project')) {
      return 'Pour vos projets :\n• Section Publications pour partager vos travaux\n• Suivi des validations par votre enseignant';
    }
    if (input.includes('enseignant') || input.includes('teacher') || input.includes('prof')) {
      return 'Espace enseignant : /dashboard/teacher — inscriptions, demandes VM, publications.';
    }
    return 'Pour une aide détaillée, consultez la documentation GANDAL ou contactez l\'équipe support.';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isIntroPage) return null;

  if (isMaximized && isOpen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col chatbot-fullscreen">
        <ChatHeader
          isMaximized
          onToggleMaximize={toggleMaximize}
          onClose={closeChat}
        />
        <ChatBody
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          fullHeight
        />
        <ChatInput
          inputRef={inputRef}
          value={inputText}
          onChange={setInputText}
          onSend={sendMessage}
          disabled={isTyping}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed z-[9999] chatbot-container"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {!isOpen ? (
        <button
          type="button"
          onClick={openChat}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 p-4 cursor-pointer chatbot-icon-pulse"
          aria-label="Ouvrir l'assistant GANDAL"
        >
          <MessageCircle size={isMobile ? 28 : 24} />
        </button>
      ) : (
        <div
          className="bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden chatbot-panel-enter rounded-3xl max-w-[calc(100vw-2rem)]"
          style={{ width: panelW, height: panelH }}
        >
          <ChatHeader
            isMaximized={false}
            onToggleMaximize={toggleMaximize}
            onClose={closeChat}
          />
          <ChatBody
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            fullHeight={false}
            isMobile={isMobile}
          />
          <ChatInput
            inputRef={inputRef}
            value={inputText}
            onChange={setInputText}
            onSend={sendMessage}
            disabled={isTyping}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
    </div>
  );
};

function ChatHeader({
  isMaximized,
  onToggleMaximize,
  onClose,
}: {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shrink-0 rounded-t-3xl">
      <div className="flex items-center gap-2">
        <Bot size={20} />
        <span className="font-semibold text-sm sm:text-base">Assistant GANDAL</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMaximize}
          className="hover:bg-blue-700/80 p-1.5 rounded transition-colors cursor-pointer"
          title={isMaximized ? 'Restaurer' : 'Agrandir'}
        >
          {isMaximized ? <Square size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="hover:bg-blue-700/80 p-1.5 rounded transition-colors cursor-pointer"
          title="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function ChatBody({
  messages,
  isTyping,
  messagesEndRef,
  fullHeight,
  isMobile,
}: {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fullHeight: boolean;
  isMobile?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-h-0 p-4 overflow-y-auto bg-gray-50 chatbot-messages relative ${
        fullHeight ? '' : isMobile ? 'max-h-[280px]' : 'max-h-[340px]'
      }`}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'} relative z-10`}
        >
          <div
            className={`inline-block max-w-[85%] p-3 rounded-2xl ${
              message.isUser
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-line">{message.text}</p>
            <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="mb-3 text-left relative z-10">
          <div className="inline-block bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-blue-600" />
              <span className="text-sm text-gray-600">Écriture…</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatInput({
  inputRef,
  value,
  onChange,
  onSend,
  disabled,
  onKeyDown,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="p-4 border-t border-gray-200 shrink-0 bg-white rounded-b-3xl">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tapez votre message…"
          className="flex-1 p-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white p-2.5 rounded-2xl transition-colors cursor-pointer shrink-0"
          aria-label="Envoyer"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default FloatingChatbot;
