'use client';

import { useState, useLayoutEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';

export default function IntroPage({ onComplete }: { onComplete: () => void }) {
  // initialise to 0 – same value the server renders, no mismatch
  const [scrollProgress, setScrollProgress] = useState(0);

  // useLayoutEffect runs synchronously BEFORE the browser paints,
  // so it fires before React compares hydration trees.
  // This guarantees the client state matches what is about to be shown.
  useLayoutEffect(() => {
    // --- hide scrollbar but keep page scrollable ---
    const style = document.createElement('style');
    style.id = 'intro-scrollbar-hide';
    style.textContent = `
      ::-webkit-scrollbar { display: none !important; }
      html, body { scrollbar-width: none !important; overflow-y: scroll !important; }
    `;
    document.head.appendChild(style);

    // scroll the page back to top whenever the intro mounts
    // (handles browser scroll-restoration messing things up)
    window.scrollTo({ top: 0, behavior: 'instant' });

    const onScroll = () => {
      const progress = Math.min(window.scrollY / 800, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.getElementById('intro-scrollbar-hide')?.remove();
    };
  }, []);

  const handleComplete = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    onComplete();
  };

  /* ---- derived values ---- */

  // zoom: 2.2 → 1.0
  const zoom = 2.2 - scrollProgress * 1.2;

  // dark overlay: 0.55 → 0.05 (brightens) — moins sombre au départ
  const overlayOpacity = Math.max(0.05, 0.55 - scrollProgress * 0.50);

  // cinematic vignette: 0.95 → 0.20
  const vignetteOpacity = Math.max(0.20, 0.95 - scrollProgress * 0.75);

  // film-noir desaturation: 90 % → 0 %
  const grayscale = Math.max(0, 90 - scrollProgress * 110);

  // contrast: 140 % → 100 %
  const contrast = Math.max(100, 140 - scrollProgress * 40);

  // Text-1: fades out linearly from 0 to 0.4
  const text1Alpha = Math.max(0, 1 - scrollProgress / 0.4);

  // Text-2: fades in linearly from 0.45 to 0.75
  const text2Alpha = scrollProgress < 0.45
    ? 0
    : Math.min(1, (scrollProgress - 0.45) / 0.3);

  // button: appears from 0.78 → 1.0
  const btnAlpha = scrollProgress < 0.78
    ? 0
    : Math.min(1, (scrollProgress - 0.78) / 0.22);

  // scroll hint: fades out early
  const hintAlpha = Math.max(0, 1 - scrollProgress * 1.6);

  return (
    /* The tall div makes the page scrollable without a fake scroll container */
    <div className="relative w-full bg-slate-950" style={{ height: '1800px' }}>

      {/* ── Background (fixed to viewport) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

        {/* server and client both render this div; dynamic styles get suppressHydrationWarning */}
        <div
          suppressHydrationWarning
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            filter: `grayscale(${grayscale}%) contrast(${contrast}%)`,
            transition: 'transform 0.06s ease-out, filter 0.06s ease-out',
          }}
        >
          <Image
            src="/long-hallway-with-row-servers-center.jpg"
            alt="Data Center"
            fill
            className="object-cover"
            priority
          />
          {/* Cyber Blue Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/35 via-cyan-500/15 to-transparent mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-slate-950/40 mix-blend-multiply" />
        </div>

        {/* dark overlay */}
        <div
          suppressHydrationWarning
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity, transition: 'opacity 0.06s ease-out' }}
        />

        {/* vignette */}
        <div
          suppressHydrationWarning
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.95) 100%)',
            opacity: vignetteOpacity,
            transition: 'opacity 0.06s ease-out',
          }}
        />

        {/* scanlines */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* ── HUD Decorative Layer ── */}

        {/* Top-left corner bracket */}
        <div className="absolute top-[80px] left-[40px] w-[80px] h-[80px] border-t-2 border-l-2 border-blue-400/40" />
        {/* Top-right corner bracket */}
        <div className="absolute top-[80px] right-[40px] w-[80px] h-[80px] border-t-2 border-r-2 border-blue-400/40" />
        {/* Bottom-left corner bracket */}
        <div className="absolute bottom-[80px] left-[40px] w-[80px] h-[80px] border-b-2 border-l-2 border-blue-400/40" />
        {/* Bottom-right corner bracket */}
        <div className="absolute bottom-[80px] right-[40px] w-[80px] h-[80px] border-b-2 border-r-2 border-blue-400/40" />

        {/* Center-left floating ring with pulse effect */}
        <div
          className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-blue-500/25"
        />
        <div
          className="absolute left-[9.5%] top-1/2 -translate-y-[55%] w-[120px] h-[120px] rounded-full border border-cyan-400/20"
        />
        <div
          className="absolute left-[11%] top-1/2 -translate-y-[45%] w-[60px] h-[60px] rounded-full bg-blue-600/20 border border-blue-400/30"
        />

        {/* Center-right floating ring */}
        <div
          className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-blue-500/25"
        />
        <div
          className="absolute right-[9.5%] top-1/2 -translate-y-[48%] w-[130px] h-[130px] rounded-full border border-cyan-400/15"
        />
        <div
          className="absolute right-[11.5%] top-1/2 -translate-y-[52%] w-[55px] h-[55px] rounded-full bg-blue-600/18 border border-blue-400/25"
        />

        {/* Top stat label – left */}
        <div
          className="absolute top-[160px] left-[40px] flex flex-col gap-1"
          style={{ opacity: 0.5 }}
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase">Cluster Actif</span>
          <span className="text-[11px] font-black text-white">3 Nœuds</span>
        </div>

        {/* Top stat label – right */}
        <div
          className="absolute top-[160px] right-[40px] flex flex-col items-end gap-1"
          style={{ opacity: 0.5 }}
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase">SMA Opérationnel</span>
          <span className="text-[11px] font-black text-white">6 Agents</span>
        </div>

        {/* Bottom stat label – left */}
        <div
          className="absolute bottom-[160px] left-[40px] flex flex-col gap-1"
          style={{ opacity: 0.4 }}
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase">Projets Hébergés</span>
          <span className="text-[11px] font-black text-white">GI27 · ENSPY</span>
        </div>

        {/* Bottom stat label – right */}
        <div
          className="absolute bottom-[160px] right-[40px] flex flex-col items-end gap-1"
          style={{ opacity: 0.4 }}
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase">Technologie</span>
          <span className="text-[11px] font-black text-white">Proxmox · FIPA</span>
        </div>

        {/* Horizontal thin divider lines */}
        <div
          className="absolute left-[38px] right-[38px] top-[175px] h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent"
        />
        <div
          className="absolute left-[38px] right-[38px] bottom-[175px] h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent"
        />

        {/* Vertical thin divider lines */}
        <div
          className="absolute top-[175px] bottom-[175px] left-[38px] w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        />
        <div
          className="absolute top-[175px] bottom-[175px] right-[38px] w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        />

        {/* Small floating dots – random positions */}
        <div className="absolute top-[35%] left-[4%] w-[6px] h-[6px] rounded-full bg-blue-400/50" />
        <div className="absolute top-[50%] left-[3%] w-[4px] h-[4px] rounded-full bg-cyan-400/40" />
        <div className="absolute top-[62%] left-[5%] w-[5px] h-[5px] rounded-full bg-blue-500/45" />
        <div className="absolute top-[38%] right-[4%] w-[6px] h-[6px] rounded-full bg-blue-400/50" />
        <div className="absolute top-[55%] right-[3%] w-[4px] h-[4px] rounded-full bg-cyan-400/40" />
        <div className="absolute top-[67%] right-[5%] w-[5px] h-[5px] rounded-full bg-blue-500/45" />

        {/* ── CENTER DECORATIVE ZONE ── */}

        {/* Concentric rings in the very center (subtle) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-500/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-blue-400/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-blue-500/12" />

        {/* Cross-hair lines through center */}
        <div className="absolute top-1/2 left-[calc(50%-300px)] w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/12 to-transparent" />
        <div className="absolute left-1/2 top-[calc(50%-300px)] w-px h-[600px] bg-gradient-to-b from-transparent via-blue-500/12 to-transparent" />

        {/* Dot grid — faint 5×5 array centered */}
        {[...Array(5)].map((_, row) =>
          [...Array(5)].map((_, col) => (
            <div
              key={`${row}-${col}`}
              className="absolute w-[3px] h-[3px] rounded-full bg-blue-400/25"
              style={{
                top: `calc(50% + ${(row - 2) * 60}px)`,
                left: `calc(50% + ${(col - 2) * 80}px)`,
              }}
            />
          ))
        )}

      </div>

      {/* ── Content (fixed to viewport) ── */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-4 pointer-events-none"
        style={{ zIndex: 10 }}
      >

        {/* text stage – both blocks absolutely-stacked; always rendered but opacity controlled */}
        <div className="relative w-full max-w-5xl px-6 flex items-center justify-center" style={{ minHeight: '400px' }}>

          {/* Text 1 – initial question */}
          <div
            suppressHydrationWarning
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{
              opacity: text1Alpha,
              visibility: text1Alpha > 0 ? 'visible' : 'hidden',
              transition: 'opacity 0.06s ease-out, visibility 0.06s',
            }}
          >
            <h2
              className="font-black text-white leading-none tracking-tight"
              style={{
                fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                textShadow: '0 4px 20px rgba(0,0,0,0.85)',
                lineHeight: 1.1,
              }}
            >
              Avez-vous jamais rêvé<br />
              d'un point
              <span
                className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}
              >
                centralisé pour vos projets ?
              </span>
            </h2>
          </div>

          {/* Text 2 – welcome */}
          <div
            suppressHydrationWarning
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{
              opacity: text2Alpha,
              visibility: text2Alpha > 0 ? 'visible' : 'hidden',
              transition: 'opacity 0.06s ease-out, visibility 0.06s',
            }}
          >
            <div style={{ textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
              {/* Logo GANDAL */}
              <div className="relative w-24 h-24 mx-auto mb-4 opacity-90">
                <Image
                  src="/logo.png"
                  alt="Gandal Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <h2
                className="font-black text-white leading-none"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}
              >
                Bienvenue sur
                <span
                  className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
                  style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1 }}
                >
                  GANDAL
                </span>
              </h2>
              <p className="mt-4 text-gray-300 font-medium" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)' }}>
                Votre infrastructure centralisée
              </p>
            </div>
          </div>
        </div>

        {/* Explorer link */}
        <div
          suppressHydrationWarning
          className="absolute pointer-events-auto"
          style={{
            bottom: '80px',
            left: 'calc(50% - 60px)',
            opacity: btnAlpha,
            visibility: btnAlpha > 0 ? 'visible' : 'hidden',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <button
            onClick={handleComplete}
            className="group cursor-pointer bg-transparent border-none p-0 flex flex-col items-start gap-1"
          >
            <span
              className="text-white group-hover:text-blue-400 font-semibold tracking-[0.3em] uppercase transition-colors duration-300"
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.3rem)',
                textShadow: '0 0 30px rgba(255,255,255,0.5), 0 2px 16px rgba(0,0,0,0.8)',
              }}
            >
              Explorer
            </span>
            <span
              className="block h-[1.5px] bg-white/50 group-hover:bg-blue-400 w-[40%] group-hover:w-[140%] transition-all duration-400 ease-out"
            />
          </button>
        </div>

        {/* scroll hint */}
        <div
          suppressHydrationWarning
          className="absolute bottom-8"
          style={{
            opacity: hintAlpha,
            visibility: hintAlpha > 0 ? 'visible' : 'hidden',
            transition: 'opacity 0.15s ease-out',
          }}
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <p className="text-sm font-medium" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              Scroller pour continuer
            </p>
            <ChevronUp className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
