'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';

const Screw = ({ className }: { className: string }) => (
  <div className={`absolute w-5 h-5 rounded-full bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)] flex items-center justify-center border border-slate-300 select-none z-10 ${className}`}>
    {/* Inner screw slot reflection */}
    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-100 to-slate-350 shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)] flex items-center justify-center relative">
      {/* Screw groove */}
      <div className="w-2.5 h-[2px] bg-slate-600 rounded-[1px]"></div>
      {/* Cross slot */}
      <div className="absolute w-[2px] h-2.5 bg-slate-600 rounded-[1px] rotate-90 transform scale-y-[0.3]"></div>
    </div>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs requis.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-800 font-sans flex items-center justify-center p-6 overflow-hidden">

      {/* ── ARRIÈRE-PLAN : CERCLES BLEUS ÉPARPILLÉS PLUS FLOUS (LIGHT MODE) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[140px] -right-[140px] w-[550px] h-[550px] rounded-full bg-blue-600/10 border border-blue-500/15 blur-md" />
        <div className="absolute -top-[40px] -right-[40px] w-[280px] h-[280px] rounded-full border-[3px] border-blue-400/15 blur-sm" />
        <div className="absolute top-[80px] left-[8%] w-[60px] h-[60px] rounded-full bg-blue-500/20 blur-sm" />
        <div className="absolute top-[-80px] left-[30%] w-[400px] h-[400px] rounded-full border border-blue-500/5 blur-[2px]" />
        <div className="absolute top-[300px] right-[8%] w-[120px] h-[120px] rounded-full bg-blue-500/12 border border-blue-400/12 blur-sm" />
        <div className="absolute top-[550px] -left-[180px] w-[420px] h-[420px] rounded-full bg-blue-500/10 border border-blue-400/12 blur-md" />

        {/* Tiny dots cluster top-left */}
        <div className="absolute top-[200px] left-[20%] w-[24px] h-[24px] rounded-full bg-blue-600/25 blur-[1px]" />
        <div className="absolute top-[240px] left-[22%] w-[12px] h-[12px] rounded-full bg-blue-400/30 blur-[1px]" />
        <div className="absolute top-[180px] left-[24%] w-[18px] h-[18px] rounded-full bg-blue-500/25 blur-[1px]" />
      </div>

      <main className="relative z-10 w-full max-w-md my-8">

        {/* Navigation de Retour Dédiée */}
        <div className="w-full flex justify-start mb-4">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 hover:text-blue-600 transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Logo (Cliquable) */}
        <Link href="/" className="flex flex-col items-center mb-4 group cursor-pointer">
          <div className="relative w-20 h-20 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Gandal Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* ── PANNEAU DE CONTRÔLE (FORMULAIRE BLANC) ── */}
        <div className="relative bg-slate-50/90 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-2xl p-8 backdrop-blur-md">

          {/* Vis sur les quatre côtés (dans les coins avec orientations uniques) */}
          <Screw className="top-3 left-3 rotate-12" />
          <Screw className="top-3 right-3 rotate-[75deg]" />
          <Screw className="bottom-3 left-3 -rotate-[45deg]" />
          <Screw className="bottom-3 right-3 rotate-[120deg]" />

          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-4 mb-6 text-center">
            Connexion
          </h3>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Adresse mail */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Adresse Mail
                </label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nom.prenom@enspy-uy1.cm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Mot de passe
                </label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 animate-shake">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-500" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* Bouton Connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>

            </form>
          ) : (
            /* Message de Succès */
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="text-xl font-bold">✓</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-600 uppercase tracking-wide">Accès Autorisé</h3>
                <p className="text-xs text-slate-500 font-medium">Session initialisée avec succès.</p>
              </div>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  Accéder à la plateforme
                </Link>
              </div>
            </div>
          )}

          {/* Lien d'inscription sous le panneau */}
          <div className="mt-6 text-center text-xs border-t border-slate-100 pt-4">
            <span className="text-slate-400 font-medium">Nouveau sur GANDAL ? </span>
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider transition-colors ml-1"
            >
              Créer un compte
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
