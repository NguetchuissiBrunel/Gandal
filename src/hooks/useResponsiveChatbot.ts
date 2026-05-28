'use client';

import { useState, useEffect } from 'react';

export function useResponsiveChatbot() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm breakpoint
      setIsTablet(width >= 640 && width < 1024); // sm to lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getChatbotStyles = (isOpen: boolean, isMinimized: boolean) => {
    if (isMobile) {
      return {
        container: isOpen 
          ? 'fixed inset-x-4 bottom-4 top-20 z-50 w-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden'
          : '',
        button: 'fixed bottom-6 right-6 z-50 w-14 h-14',
        overlay: 'fixed inset-0 bg-black bg-opacity-50 z-40'
      };
    }

    if (isTablet) {
      return {
        container: isOpen 
          ? `fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'}`
          : '',
        button: 'fixed bottom-6 right-6 z-50 w-14 h-14',
        overlay: ''
      };
    }

    // Desktop
    return {
      container: isOpen 
        ? `fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`
        : '',
      button: 'fixed bottom-6 right-6 z-50 w-14 h-14',
      overlay: ''
    };
  };

  return {
    isMobile,
    isTablet,
    getChatbotStyles
  };
}