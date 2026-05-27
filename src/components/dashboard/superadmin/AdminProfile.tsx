'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Shield, School, Hash, User, Lock, Key, CheckCircle, Save } from 'lucide-react';
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

  // Changement de mot de passe
  const [changePassword, setChangePassword] = useState(false);
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
    'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition bg-slate-50/50 hover:bg-slate-50 focus:bg-white';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      {/* ── COLONNE 1 : CARTE D'IDENTITÉ ADMINISTRATEUR ── */}
      <ScrewCard className="p-8 space-y-8 shadow-md">
        <div className="pt-2 border-b border-slate-100 pb-5">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Fiche Identitaire Admin
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Informations actuelles enregistrées sur le serveur GANDAL</p>
        </div>

        {/* Grand Avatar & Rôle */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 rounded-2xl border border-slate-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-lg ring-4 ring-indigo-50">
            SA
          </div>
          <div className="text-center sm:text-left space-y-1.5">
            <p className="font-black text-slate-950 text-base leading-tight">{MOCK_ADMIN.nom}</p>
          </div>
        </div>

        {/* Liste détaillée */}
        <div className="space-y-4">
          {[
            { label: 'Adresse Email', value: MOCK_ADMIN.email, icon: Mail },
            { label: 'Rôle Système', value: MOCK_ADMIN.role, icon: Shield },
            { label: 'Département', value: MOCK_ADMIN.departement, icon: School },
            { label: 'Matricule Unique', value: MOCK_ADMIN.matricule, icon: Hash },
          ].map((info, idx) => {
            const Icon = info.icon;
            return (
              <div key={idx} className="flex gap-4 p-4.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-150">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-black text-slate-800 truncate">{info.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrewCard>

      {/* ── COLONNE 2 : MODIFIER LE PROFIL ── */}
      <ScrewCard className="p-8 shadow-md">
        <div className="pt-2 border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Paramètres & Sécurité
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Mettre à jour vos coordonnées ou modifier votre mot de passe</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Nom complet */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Nom complet
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Adresse Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Interrupteur pour modifier le mot de passe */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={e => setChangePassword(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 group-hover:text-indigo-600 transition">
                Modifier le mot de passe
              </span>
            </label>
          </div>

          {/* Section mot de passe conditionnelle avec transition */}
          {changePassword && (
            <div className="space-y-5 bg-slate-50 border border-slate-100 rounded-2xl p-5 animate-slide-up duration-200">

              {/* Ancien MDP */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${inputClass} pr-11 bg-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${inputClass} pr-11 bg-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton Enregistrer */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-wider uppercase rounded-xl px-4 py-3.5 transition duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Modifications enregistrées
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Enregistrer
              </>
            )}
          </button>

        </form>
      </ScrewCard>
    </div>
  );
}
