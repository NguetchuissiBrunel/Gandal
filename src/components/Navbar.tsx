'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
      <nav
        className={`w-full rounded-2xl border transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/95 border-blue-500/30 shadow-[0_12px_40px_-12px_rgba(59,130,246,0.25)] py-3 px-6'
            : 'bg-slate-950/90 border-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.15)] py-4 px-8'
        } backdrop-blur-md`}
      >
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/20 transition-transform duration-300 group-hover:scale-105 bg-white">
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
                <span className="text-lg font-black text-white tracking-wider leading-none">
                  GANDAL
                </span>
                <span className="text-[7px] font-bold bg-blue-600/30 text-blue-400 border border-blue-500/20 px-1 py-0.5 rounded uppercase">
                  ENSPY
                </span>
              </div>
              <span className="text-[8px] font-bold text-slate-400 tracking-widest mt-1 uppercase">
                Génie Informatique • UY1
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#contexte" className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-blue-400 transition-colors">
              Contexte
            </a>
            <a href="#features" className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-blue-400 transition-colors">
              Multi-Agents
            </a>
            <a href="#architecture" className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-blue-400 transition-colors">
              Architecture
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:text-blue-400 transition-all duration-200">
              Connexion
            </button>
            <button className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-500/20">
              S'inscrire ici
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}



