import { useState, useEffect } from 'react';

interface ChatbotPreferences {
  position: { x: number; y: number };
  isMinimized: boolean;
  theme: 'light' | 'dark';
}

const defaultPreferences: ChatbotPreferences = {
  position: { x: 20, y: 20 },
  isMinimized: false,
  theme: 'light',
};

export const useChatbot = () => {
  const [preferences, setPreferences] = useState<ChatbotPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gandal-chatbot-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading chatbot preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<ChatbotPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem('gandal-chatbot-preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving chatbot preferences:', error);
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoaded,
  };
};