'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';

const MOCK_ADMIN = {
  nom: 'Super Administrateur GANDAL',
  email: 'superadmin@gandal-enspy.cm',
  role: 'Super Administrateur',
  departement: 'Génie Informatique — ENSPY',
  matricule: 'ADM-001',
};

export default function AdminProfile() {
  const [nom, setNom] = useState(MOCK_ADMIN.nom);
  const [email, setEmail] = useState(MOCK_ADMIN.email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Colonne 1 : Informations du compte ── */}
      <ScrewCard className="p-6 space-y-6">
        <h2 className="text-base font-black text-slate-900 pt-1">Informations du compte</h2>

        {/* Avatar + nom + badge */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
            SA
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-slate-900 leading-tight">{MOCK_ADMIN.nom}</p>
            <span className="inline-block text-xs font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
              Actif
            </span>
          </div>
        </div>

        {/* Infos détaillées */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {[
            { label: 'Email', value: MOCK_ADMIN.email },
            { label: 'Rôle', value: MOCK_ADMIN.role },
            { label: 'Département', value: MOCK_ADMIN.departement },
            { label: 'Matricule', value: MOCK_ADMIN.matricule },
          ].map(info => (
            <div key={info.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{info.label}</p>
              <p className="text-sm font-bold text-slate-700">{info.value}</p>
            </div>
          ))}
        </div>
      </ScrewCard>

      {/* ── Colonne 2 : Modifier le profil ── */}
      <ScrewCard className="p-6">
        <h2 className="text-base font-black text-slate-900 mb-6">Modifier le profil</h2>

        <form onSubmit={handleSave} className="space-y-5">

          {/* Nom complet */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Nom complet
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Section mot de passe */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Changer le mot de passe
            </p>

            {/* Ancien MDP */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nouveau MDP */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton Enregistrer */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-3 transition hover:-translate-y-0.5 cursor-pointer mt-2"
          >
            {saved ? '✓ Modifications enregistrées' : 'Enregistrer'}
          </button>

        </form>
      </ScrewCard>
    </div>
  );
}
