'use client';

import { useState, useEffect } from 'react';
import IntroPage from '@/components/IntroPage';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);

  const handleComplete = (hash?: string) => {
    if (hash) {
      setTargetSection(hash);
    }
    setShowLanding(true);
  };

  useEffect(() => {
    if (showLanding && targetSection) {
      const timer = setTimeout(() => {
        const element = document.querySelector(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setTargetSection(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showLanding, targetSection]);

  return (
    <div>
      {!showLanding ? (
        <IntroPage onComplete={handleComplete} />
      ) : (
        <LandingPage initialSection={targetSection || undefined} />
      )}
    </div>
  );
}

