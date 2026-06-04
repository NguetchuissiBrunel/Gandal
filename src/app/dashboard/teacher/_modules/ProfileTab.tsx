'use client';

import { useState } from 'react';
import { User, Mail, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { TeacherProfile, ShowToastFn } from './types';

export interface TeacherProfileStats {
  activeVms: number;
  validatedProjects: number;
  pendingRequests: number;
}

interface ProfileTabProps {
  profile: TeacherProfile;
  onSave: (updated: TeacherProfile) => void;
  showToast: ShowToastFn;
  stats: TeacherProfileStats;
}

export default function ProfileTab({ profile, onSave, showToast, stats }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TeacherProfile>(profile);
  const [showPassword, setShowPassword] = useState(false);

  const handleEdit = () => {
    setDraft({ ...profile, password: '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setIsEditing(false);
    setShowPassword(false);
    showToast('Profil mis à jour avec succès.', 'success');
  };

  const set = (key: keyof TeacherProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Screw3D className="top-2 left-2 -rotate-12" />
      <Screw3D className="top-2 right-2 rotate-[85deg]" />
      <Screw3D className="bottom-2 left-2 rotate-[45deg]" />
      <Screw3D className="bottom-2 right-2 -rotate-[120deg]" />

      {/* ── EN-TÊTE ── */}
      <div className="px-8 pt-10 pb-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <h2 className="text-xl font-black text-black tracking-tight uppercase leading-none">
          Fiche Académique Enseignant
        </h2>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
            >
              Annuler
            </button>
            <button
              form="profile-edit-form"
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* ── CORPS ── */}
      <div className="p-8 pb-14 space-y-8">

        {/* ── MODE LECTURE ── */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Nom d'utilisateur */}
            <ReadField
              icon={<User className="w-4 h-4 text-blue-500" />}
              label="Nom d'utilisateur"
              value={profile.username || '—'}
            />

            {/* Adresse email */}
            <ReadField
              icon={<Mail className="w-4 h-4 text-blue-500" />}
              label="Adresse email"
              value={profile.email || '—'}
            />

            {/* Fonction / Rôle — pleine largeur si seul en bas */}
            <ReadField
              icon={<Briefcase className="w-4 h-4 text-blue-500" />}
              label="Fonction / Rôle"
              value={profile.role || '—'}
            />

            {/* Sécurité — mot de passe masqué */}
            <ReadField
              icon={<Lock className="w-4 h-4 text-blue-500" />}
              label="Mot de passe"
              value="••••••••••••"
            />
          </div>
        )}

        {/* ── MODE ÉDITION ── */}
        {isEditing && (
          <form id="profile-edit-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Nom d'utilisateur */}
              <EditField
                icon={<User className="w-4 h-4 text-slate-400" />}
                label="Nom d'utilisateur"
                type="text"
                value={draft.username}
                onChange={set('username')}
                required
              />

              {/* Adresse email (lecture seule — non modifiable via PATCH enseignant) */}
              <EditField
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                label="Adresse email"
                type="email"
                value={draft.email}
                onChange={set('email')}
                required
                readOnly
              />

              {/* Fonction / Rôle */}
              <EditField
                icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                label="Fonction / Rôle"
                type="text"
                value={draft.role}
                onChange={set('role')}
                required
              />

              <p className="text-[10px] text-slate-500 font-medium md:col-span-2">
                L&apos;e-mail et le mot de passe ne sont pas modifiables via l&apos;API actuelle. Seuls le nom d&apos;utilisateur et le rôle sont enregistrés.
              </p>
            </div>
          </form>
        )}

        {/* ── STATISTIQUES ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Ressources &amp; Activités sous Supervision
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'VMs Actives', count: String(stats.activeVms), unit: 'Machines', accent: 'bg-blue-600' },
              { label: 'Projets Validés', count: String(stats.validatedProjects), unit: 'Projets', accent: 'bg-emerald-500' },
              { label: 'Demandes en attente', count: String(stats.pendingRequests), unit: 'Requêtes', accent: 'bg-amber-500' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${stat.accent}`} />
                <div className="px-5 py-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{stat.label}</span>
                  <div className="flex items-end gap-1.5 mt-1.5">
                    <span className="text-2xl font-black text-black leading-none">{stat.count}</span>
                    <span className="text-xs font-bold text-slate-400 mb-0.5">{stat.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Champ lecture ── */
function ReadField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex flex-col gap-1 hover:border-slate-300 transition-colors">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2.5 mt-0.5">
        {icon}
        <span className="text-sm font-bold text-slate-800 truncate">{value}</span>
      </div>
    </div>
  );
}

/* ── Champ édition ── */
function EditField({
  icon, label, type, value, onChange, required, readOnly,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          required={required}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          className={`w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-xl pl-10 pr-3 py-3 transition-all ${
            readOnly
              ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
              : 'bg-slate-50 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
          }`}
        />
      </div>
    </div>
  );
}
