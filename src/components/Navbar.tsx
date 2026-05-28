'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit, LogIn, UserPlus, Menu, X } from 'lucide-react';

interface NavbarProps {
  minimal?: boolean;
  onTransitionToLanding?: (targetHash?: string) => void;
}

export default function Navbar({ minimal = false, onTransitionToLanding }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize or navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navClass = isScrolled
    ? 'bg-white/95 border-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] py-2 px-4 sm:py-3 sm:px-6'
    : 'bg-white/90 border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-3 px-4 sm:py-4 sm:px-8';

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
      <nav className={`w-full rounded-2xl border transition-all duration-300 ${navClass} backdrop-blur-md`}>
        <div className="flex items-center justify-between gap-2">

          {/* Logo & Branding */}
          <a
            href="/"
            onClick={(e) => {
              if (onTransitionToLanding) {
                e.preventDefault();
                onTransitionToLanding();
              }
            }}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer min-w-0 shrink"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Gandal Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base md:text-lg font-black tracking-wider leading-none text-slate-900 truncate">
                  GANDAL
                </span>
                <span className="text-[6px] sm:text-[7px] font-bold px-1 py-0.5 rounded uppercase bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                  ENSPY
                </span>
              </div>
              <span className="hidden md:block text-[8px] font-bold tracking-widest mt-1.5 uppercase text-slate-500">
                Génie Informatique • UY1
              </span>
            </div>
          </a>

          {!minimal && (
            <>
              {/* Navigation Links — Desktop only */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/projects" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors">
                  Catalogue Projets
                </Link>
              </div>

              {/* Action Buttons — Desktop only */}
              <div className="hidden md:flex items-center gap-3 shrink-0">
                {!isLoginPage && (
                  <Link href="/login" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-all duration-200 whitespace-nowrap">
                    Connexion
                  </Link>
                )}
                {!isSignupPage && (
                  <Link href="/signup" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-slate-950 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 whitespace-nowrap">
                    S'inscrire
                  </Link>
                )}
              </div>

              {/* Hamburger Button — Mobile only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}

        </div>

        {/* Mobile Dropdown Menu */}
        {!minimal && isMobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col gap-3 animate-fade-in">
            <Link
              href="/projects"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-wider"
            >
              <FolderGit className="w-4 h-4 text-slate-500" />
              Catalogue Projets
            </Link>
            <div className="h-px bg-slate-100" />
            <div className="flex flex-col gap-2">
              {!isLoginPage && (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-wider"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Connexion
                </Link>
              )}
              {!isSignupPage && (
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white hover:bg-slate-950 transition-all font-bold text-xs uppercase tracking-wider justify-center shadow-md shadow-blue-500/10"
                >
                  <UserPlus className="w-4 h-4" />
                  S'inscrire
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
