'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  variant?: 'dark' | 'light';
  minimal?: boolean;
  onTransitionToLanding?: (targetHash?: string) => void;
}

export default function Navbar({ variant = 'dark', minimal = false, onTransitionToLanding }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isProjectsPage = pathname === '/projects';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (onTransitionToLanding) {
      e.preventDefault();
      onTransitionToLanding(hash);
    }
  };

  const handleActionClick = () => {
    if (onTransitionToLanding) {
      onTransitionToLanding();
    }
  };

  // Styles dynamically based on variant
  const isLight = variant === 'light';

  const navClass = isLight
    ? isScrolled
      ? 'bg-white/95 border-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] py-3 px-6'
      : 'bg-white/90 border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-4 px-8'
    : isScrolled
      ? 'bg-slate-950/95 border-blue-500/30 shadow-[0_12px_40px_-12px_rgba(59,130,246,0.25)] py-3 px-6'
      : 'bg-slate-950/90 border-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.15)] py-4 px-8';

  const brandTextClass = isLight ? 'text-slate-900' : 'text-white';
  const badgeClass = isLight
    ? 'bg-blue-50 text-blue-600 border border-blue-200'
    : 'bg-blue-600/30 text-blue-400 border border-blue-500/20';
  const brandSubtextClass = isLight ? 'text-slate-500' : 'text-slate-400';
  const logoBorderClass = isLight ? 'border-slate-200' : 'border-white/20';

  const linkClass = isLight
    ? 'text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors'
    : 'text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-blue-400 transition-colors';

  const loginBtnClass = isLight
    ? 'px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-all duration-200'
    : 'px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:text-blue-400 transition-all duration-200';

  const registerBtnClass = isLight
    ? 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-slate-950 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10'
    : 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-500/20';

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
            <div className={`relative w-10 h-10 rounded-lg overflow-hidden border ${logoBorderClass} transition-transform duration-300 group-hover:scale-105 bg-white`}>
              <Image
                src="/WhatsApp Image 2026-05-07 at 18.59.16.jpeg"
                alt="Gandal Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-black tracking-wider leading-none ${brandTextClass}`}>
                  GANDAL
                </span>
                <span className={`text-[7px] font-bold px-1 py-0.5 rounded uppercase ${badgeClass}`}>
                  ENSPY
                </span>
              </div>
              <span className={`text-[8px] font-bold tracking-widest mt-1 uppercase ${brandSubtextClass}`}>
                Génie Informatique • UY1
              </span>
            </div>
          </a>

          {!minimal && (
            <>
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <a
                  href={isProjectsPage ? '/#contexte' : '#contexte'}
                  onClick={(e) => handleLinkClick(e, '#contexte')}
                  className={linkClass}
                >
                  Contexte
                </a>
                <a
                  href={isProjectsPage ? '/#features' : '#features'}
                  onClick={(e) => handleLinkClick(e, '#features')}
                  className={linkClass}
                >
                  Multi-Agents
                </a>
                <a
                  href={isProjectsPage ? '/#architecture' : '#architecture'}
                  onClick={(e) => handleLinkClick(e, '#architecture')}
                  className={linkClass}
                >
                  Architecture
                </a>
                {isProjectsPage ? (
                  <a
                    href="/"
                    onClick={(e) => {
                      if (onTransitionToLanding) {
                        e.preventDefault();
                        onTransitionToLanding();
                      }
                    }}
                    className={`${linkClass} text-blue-600 font-extrabold`}
                  >
                    Accueil
                  </a>
                ) : (
                  <a
                    href="/projects"
                    onClick={handleActionClick}
                    className={`${linkClass} text-blue-600 font-extrabold`}
                  >
                    Catalogue Projets
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={handleActionClick} className={loginBtnClass}>
                  Connexion
                </button>
                <button onClick={handleActionClick} className={registerBtnClass}>
                  S'inscrire ici
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}




