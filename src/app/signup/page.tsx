'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  User,
  Hash,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

/* ── Vis métallique 3D ── */
const Screw = ({ className }: { className: string }) => (
  <div
    className={`absolute w-5 h-5 rounded-full bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500
      shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)]
      flex items-center justify-center border border-slate-300 select-none z-10 ${className}`}
  >
    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-100 to-slate-350 shadow-[inset_0_1px_1px_rgba(0,0,0,0.15)] flex items-center justify-center relative">
      <div className="w-2.5 h-[2px] bg-slate-600 rounded-[1px]" />
      <div className="absolute w-[2px] h-2.5 bg-slate-600 rounded-[1px] rotate-90 transform scale-y-[0.3]" />
    </div>
  </div>
);

/* ── Indicateur de progression ── */
const StepIndicator = ({ step }: { step: 1 | 2 }) => (
  <div className="flex items-center justify-center gap-0 w-full mb-8 select-none">
    {/* Boule gauche */}
    <div
      className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-500 ${
        step >= 1
          ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
          : 'bg-white border-slate-300'
      }`}
    />

    {/* Canal gauche (rempli = étape 2) */}
    <div className="relative h-[4px] flex-1 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-700 ease-in-out"
        style={{ width: step >= 2 ? '100%' : '0%' }}
      />
    </div>

    {/* Boule droite */}
    <div
      className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-500 ${
        step >= 2
          ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]'
          : 'bg-white border-slate-300'
      }`}
    />
  </div>
);

/* ── Données ── */
const DEPARTMENTS = [
  'Informatique',
  'Génie Mécanique',
  'Génie Électrique',
  'Génie Civil',
  'Génie Télécommunications',
  'Génie Chimique et Procédés',
  'Génie Industriel',
  'Génie Météorologique',
];

/* ── Page principale ── */
export default function SignupPage() {
  // Étape courante
  const [step, setStep] = useState<1 | 2>(1);

  // Champs
  const [matricule, setMatricule] = useState('');
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState('1');
  const [department, setDepartment] = useState('Informatique');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (!confirmPassword) { setPasswordsMatch(null); return; }
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  /* ── Validation étape 1 → 2 ── */
  const handleNextStep = () => {
    setError('');
    if (!matricule.trim() || !username.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setStep(2);
  };

  /* ── Soumission finale ── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1800);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-800 font-sans flex items-center justify-center p-6 overflow-hidden">

      {/* ── Arrière-plan : cercles bleus flous ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[140px] -right-[140px] w-[550px] h-[550px] rounded-full bg-blue-600/10 border border-blue-500/15 blur-md" />
        <div className="absolute -top-[40px] -right-[40px] w-[280px] h-[280px] rounded-full border-[3px] border-blue-400/15 blur-sm" />
        <div className="absolute top-[80px] left-[8%] w-[60px] h-[60px] rounded-full bg-blue-500/20 blur-sm" />
        <div className="absolute top-[-80px] left-[30%] w-[400px] h-[400px] rounded-full border border-blue-500/5 blur-[2px]" />
        <div className="absolute top-[300px] right-[8%] w-[120px] h-[120px] rounded-full bg-blue-500/12 border border-blue-400/12 blur-sm" />
        <div className="absolute top-[550px] -left-[180px] w-[420px] h-[420px] rounded-full bg-blue-500/10 border border-blue-400/12 blur-md" />
        <div className="absolute top-[200px] left-[20%] w-[24px] h-[24px] rounded-full bg-blue-600/25 blur-[1px]" />
        <div className="absolute top-[240px] left-[22%] w-[12px] h-[12px] rounded-full bg-blue-400/30 blur-[1px]" />
        <div className="absolute top-[180px] left-[24%] w-[18px] h-[18px] rounded-full bg-blue-500/25 blur-[1px]" />
      </div>

      <main className="relative z-10 w-full max-w-lg my-8">

        {/* Retour */}
        <div className="w-full flex justify-start mb-4">
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 hover:text-blue-600 transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Logo cliquable */}
        <Link href="/" className="flex flex-col items-center mb-6 group cursor-pointer">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 mb-3 shadow-md shadow-slate-100 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo-removebg-preview (1).png"
              alt="Gandal Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <h2 className="text-xl font-black tracking-wider uppercase text-slate-900 group-hover:text-blue-600 transition-colors">
            GANDAL
          </h2>
        </Link>

        {/* ── Panneau de contrôle ── */}
        <div className="relative bg-slate-50/90 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-2xl p-8 backdrop-blur-md">

          {/* Vis aux quatre coins */}
          <Screw className="top-3 left-3 rotate-45" />
          <Screw className="top-3 right-3 rotate-[105deg]" />
          <Screw className="bottom-3 left-3 -rotate-[15deg]" />
          <Screw className="bottom-3 right-3 rotate-[80deg]" />

          {/* Titre + sous-titre d'étape */}
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide text-center mb-1">
            Inscription
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-5">
            {step === 1 ? 'Étape 1 — Informations personnelles' : 'Étape 2 — Accès & sécurité'}
          </p>

          {/* Indicateur de progression */}
          <StepIndicator step={step} />

          {/* ────────────────── SUCCÈS ────────────────── */}
          {success ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-emerald-600 uppercase tracking-wide">Compte Créé</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Votre profil a été enregistré avec succès dans l'annuaire GANDAL.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>

          ) : step === 1 ? (

            /* ────────────────── ÉTAPE 1 ────────────────── */
            <div className="space-y-4">

              {/* Matricule */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Matricule</label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ex. 22P250"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Nom d'utilisateur</label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ex. Jean Eboa"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Niveau */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Niveau</label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-white text-slate-900 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-8 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none"
                  >
                    {['1', '2', '3', '4', '5'].map((l) => (
                      <option key={l} value={l}>Niveau {l}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>

              {/* Département */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Département</label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white text-slate-900 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-8 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* Bouton Suivant */}
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mt-2"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          ) : (

            /* ────────────────── ÉTAPE 2 ────────────────── */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Adresse mail */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Adresse mail</label>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="jean.eboa@enspy-uy1.cm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Mot de passe</label>
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
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 block">Confirmation</label>
                  {passwordsMatch !== null && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      passwordsMatch
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {passwordsMatch ? 'Match ✓' : 'Différent ✗'}
                    </span>
                  )}
                </div>
                <div className="relative rounded-xl overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm border border-slate-200 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* Boutons Retour + S'inscrire */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(1); }}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inscription...
                    </>
                  ) : "S'inscrire"}
                </button>
              </div>

            </form>
          )}

          {/* Toggle connexion */}
          {!success && (
            <div className="mt-6 text-center text-xs border-t border-slate-100 pt-4">
              <span className="text-slate-400 font-medium">Déjà inscrit ? </span>
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider transition-colors ml-1">
                Se connecter
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
