'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FolderGit, LogIn, Images, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { getDashboardPath, getRoleLabel, getUserInitials } from '@/lib/authUtils';
import { useAuthSession } from '@/hooks/useAuthSession';

interface NavbarProps {
  minimal?: boolean;
  onTransitionToLanding?: (targetHash?: string) => void;
}

export default function Navbar({ minimal = false, onTransitionToLanding }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuthSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/login';
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    apiClient.clearToken();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const navClass = isScrolled
    ? 'bg-white/95 border-slate-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] py-2 px-4 sm:py-3 sm:px-6'
    : 'bg-white/90 border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] py-3 px-4 sm:py-4 sm:px-8';

  const dashboardHref = user ? getDashboardPath(user) : '/dashboard';
  const initials = user ? getUserInitials(user.username) : '';
  const roleLabel = user ? getRoleLabel(user) : '';

  const authActionsDesktop = authLoading ? (
    <div className="h-9 w-28 rounded-xl bg-slate-100 animate-pulse" />
  ) : isAuthenticated ? (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={dashboardHref}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-200 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="flex flex-col min-w-0 max-w-[140px]">
          <span className="text-xs font-bold text-slate-900 truncate leading-tight">
            {user.username}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 truncate">
            {roleLabel}
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
        title="Déconnexion"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  ) : null;

  const guestActionsDesktop =
    !authLoading && !isAuthenticated ? (
      <>
        {!isLoginPage && (
          <Link
            href="/login"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-slate-950 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 whitespace-nowrap"
          >
            Connexion
          </Link>
        )}
      </>
    ) : null;

  const authActionsMobile = authLoading ? null : isAuthenticated ? (
    <>
      <Link
        href={dashboardHref}
        onClick={() => setIsMobileMenuOpen(false)}
        className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{user.username}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{roleLabel}</p>
        </div>
        <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all font-bold text-xs uppercase tracking-wider w-full cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </>
  ) : null;

  const guestActionsMobile =
    !authLoading && !isAuthenticated ? (
      <>
        {!isLoginPage && (
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white hover:bg-slate-950 transition-all font-bold text-xs uppercase tracking-wider justify-center shadow-md shadow-blue-500/10"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </Link>
        )}
      </>
    ) : null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
      <nav className={`w-full rounded-2xl border transition-all duration-300 ${navClass} backdrop-blur-md`}>
        <div className="flex items-center justify-between gap-2">

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
            <div className="relative w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Gandal Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider leading-none text-slate-900 truncate">
                  GANDAL
                </span>
                <span className="text-[7px] font-bold px-1 py-0.5 rounded uppercase bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
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
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/projects"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Catalogue Projets
                </Link>
                <Link
                  href="/gallery"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Galerie
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-3 shrink-0">
                {authActionsDesktop}
                {guestActionsDesktop}
              </div>

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
            <Link
              href="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-wider"
            >
              <Images className="w-4 h-4 text-slate-500" />
              Galerie
            </Link>
            <div className="h-px bg-slate-100" />
            <div className="flex flex-col gap-2">
              {authActionsMobile}
              {guestActionsMobile}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

