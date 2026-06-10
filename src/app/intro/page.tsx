'use client';

import { useRouter } from 'next/navigation';
import IntroPage from '@/components/IntroPage';

export default function IntroRoute() {
  const router = useRouter();

  const handleComplete = () => {
    // Set the sessionStorage flag so they land on home properly
    sessionStorage.setItem('gandal_intro_seen', 'true');
    window.dispatchEvent(new Event('gandal-intro-done'));
    router.push('/');
  };

  return <IntroPage onComplete={handleComplete} />;
}
