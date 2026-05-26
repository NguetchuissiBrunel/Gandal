'use client';

import { useState, useEffect } from 'react';
import IntroPage from '@/components/IntroPage';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('gandal_intro_seen') === 'true';
    if (hasSeenIntro) {
      setShowLanding(true);
    }

    // Check if there is an initial hash in the URL (e.g. #contexte)
    if (typeof window !== 'undefined' && window.location.hash) {
      setTargetSection(window.location.hash);
      // Skip the intro and go straight to the section
      setShowLanding(true);
    }

    setMounted(true);
  }, []);

  const handleComplete = (hash?: string) => {
    sessionStorage.setItem('gandal_intro_seen', 'true');
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

  if (!mounted) {
    // Return a dark background matching the theme during server/client transition
    return <div className="min-h-screen bg-slate-950" />;
  }

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

