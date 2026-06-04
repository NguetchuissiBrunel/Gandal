'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Shield, School, Hash, User, Lock, Key, CheckCircle, Save } from 'lucide-react';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';
import { apiClient } from '@/lib/apiClient';

export default function AdminProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');

  // Changement de mot de passe
  const [changePassword, setChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await apiClient.getMe();
        setProfile(me);
        setNom(me.username);
        setEmail(me.email);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.updateTeacher(profile.id, {
        username: nom.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition bg-slate-50/50 hover:bg-slate-50 focus:bg-white';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement du profil...</p>
      </div>
    );
  }

  const emailVal = profile?.email || '—';
  const roleVal = profile?.role || '—';
  const departmentVal = (profile as { departement?: string })?.departement || '—';
  const matriculeVal = (profile as { matricule?: string })?.matricule || '—';

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
            <p className="font-black text-slate-950 text-base leading-tight">{nom}</p>
          </div>
        </div>

        {/* Liste détaillée */}
        <div className="space-y-4">
          {[
            { label: 'Adresse Email', value: emailVal, icon: Mail },
            { label: 'Rôle Système', value: roleVal, icon: Shield },
            { label: 'Département', value: departmentVal, icon: School },
            { label: 'Matricule Unique', value: matriculeVal, icon: Hash },
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
          <p className="text-xs text-slate-500 mt-1 font-medium">Mettre à jour votre nom d&apos;utilisateur (PATCH /users/teachers)</p>
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
                disabled
                value={email}
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-medium pt-4 border-t border-slate-100">
            Le changement de mot de passe n&apos;est pas exposé par l&apos;API (TeacherUpdate : username uniquement).
          </p>

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
