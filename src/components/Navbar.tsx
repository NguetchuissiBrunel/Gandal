'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  minimal?: boolean;
  onTransitionToLanding?: (targetHash?: string) => void;
}

export default function Navbar({ minimal = false, onTransitionToLanding }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Styles toujours blancs ── */
  const navClass = isScrolled
    ? 'bg-white/95 border-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] py-3 px-6'
    : 'bg-white/90 border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-4 px-8';

  const linkClass =
    'text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors';

  const loginBtnClass =
    'px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-all duration-200';

  const registerBtnClass =
    'px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-slate-950 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
      <nav className={`w-full rounded-2xl border transition-all duration-300 ${navClass} backdrop-blur-md`}>
        <div className="flex items-center justify-between">

          {/* Logo & Branding */}
          <a
            href="/"
            onClick={(e) => {
              if (onTransitionToLanding) {
                e.preventDefault();
                onTransitionToLanding();
              }
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 transition-transform duration-300 group-hover:scale-105 bg-white">
              <Image
                src="/logo.png"
                alt="Gandal Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider leading-none text-slate-900">
                  GANDAL
                </span>
                <span className="text-[7px] font-bold px-1 py-0.5 rounded uppercase bg-blue-50 text-blue-600 border border-blue-200">
                  ENSPY
                </span>
              </div>
              <span className="text-[8px] font-bold tracking-widest mt-1 uppercase text-slate-500">
                Génie Informatique • UY1
              </span>
            </div>
          </a>

          {!minimal && (
            <>
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/projects" className={`${linkClass}`}>
                  Catalogue Projets
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-4">
                {!isLoginPage && (
                  <Link href="/login" className={loginBtnClass}>
                    Connexion
                  </Link>
                )}
                {!isSignupPage && (
                  <Link href="/signup" className={registerBtnClass}>
                    S'inscrire ici
                  </Link>
                )}
              </div>
            </>
          )}

        </div>
      </nav>
    </div>
  );
}
