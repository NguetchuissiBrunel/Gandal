'use client';

import { useRouter } from 'next/navigation';
import IntroPage from '@/components/IntroPage';

export default function IntroRoute() {
  const router = useRouter();

  const handleComplete = () => {
    // Set the sessionStorage flag so they land on home properly
    sessionStorage.setItem('gandal_intro_seen', 'true');
    router.push('/');
  };

  return <IntroPage onComplete={handleComplete} />;
}
