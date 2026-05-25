'use client';

import { useState } from 'react';
import IntroPage from '@/components/IntroPage';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);

  return (
    <div>
      {!showLanding ? (
        <IntroPage onComplete={() => setShowLanding(true)} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

