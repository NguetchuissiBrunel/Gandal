'use client';

import { useState } from 'react';
import { User, Mail } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { TeacherProfile, ShowToastFn } from './types';

interface ProfileTabProps {
  profile: TeacherProfile;
  onSave: (updated: TeacherProfile) => void;
  showToast: ShowToastFn;
  pendingCount: number; // total requêtes en attente (inscriptions + VMs)
}

export default function ProfileTab({ profile, onSave, showToast, pendingCount }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TeacherProfile>(profile);

  const displayInitials = profile.username ? profile.username.substring(0, 2).toUpperCase() : 'TE';
  const draftInitials = draft.username ? draft.username.substring(0, 2).toUpperCase() : 'TE';

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    setIsEditing(false);
    showToast('Profil académique mis à jour avec succès.', 'success');
  };

  const set = (key: keyof TeacherProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Screw3D className="top-2 left-2 -rotate-12" />
      <Screw3D className="top-2 right-2 rotate-[85deg]" />
      <Screw3D className="bottom-2 left-2 rotate-[45deg]" />
      <Screw3D className="bottom-2 right-2 -rotate-[120deg]" />

      {/* ── EN-TÊTE IDENTITAIRE ── */}
      <div className="px-8 pt-10 pb-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5">

          <div>
            <h2 className="text-xl font-black text-black tracking-tight uppercase leading-none">Fiche Académique Enseignant</h2>
          </div>
        </div>

        {/* Actions header */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Modifier le profil
          </button>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            <button
              form="profile-edit-form"
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* ── CORPS ── */}
      <div className="p-8 pb-14 space-y-8">
        {!isEditing ? (
          /* MODE LECTURE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldBlock icon={<User className="w-3.5 h-3.5 text-slate-400" />} title="Identité & Grade">
              {[
                { label: 'Nom d\'utilisateur', value: profile.username },
                { label: 'Adresse email', value: profile.email },
                { label: 'Fonction / Rôle', value: profile.role },
              ]}
            </FieldBlock>
          </div>
        ) : (
          /* MODE ÉDITION */
          <form id="profile-edit-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditBlock icon={<User className="w-3.5 h-3.5 text-slate-400" />} title="Identité & Grade">
                {([
                  { label: 'Nom d\'utilisateur', key: 'username' as const, type: 'text' },
                  { label: 'Adresse email', key: 'email' as const, type: 'email' },
                  { label: 'Mot de passe', key: 'password' as const, type: 'password' },
                  { label: 'Fonction / Rôle', key: 'role' as const, type: 'text' },
                ] as const).map(({ label, key, type }) => (
                  <EditField key={key} label={label} type={type} value={draft[key] || ''} onChange={set(key)} />
                ))}
              </EditBlock>
            </div>
          </form>
        )}

        {/* ── STATISTIQUES (toujours visibles) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ressources &amp; Activités sous Supervision</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'VMs Actives', count: '14', unit: 'Machines', accent: 'bg-blue-600' },
              { label: 'Projets Validés', count: '8', unit: 'Projets', accent: 'bg-emerald-500' },
              { label: 'Demandes en attente', count: `${pendingCount}`, unit: 'Requêtes', accent: 'bg-amber-500' },
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

// ── Sous-composants locaux (lecture) ──
function FieldBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: { label: string; value: string }[] }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
        {icon}
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-3 bg-white">
        {children.map(({ label, value }) => (
          <div key={label}>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            <span className="text-xs font-bold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sous-composants locaux (édition) ──
function EditBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2.5">
        {icon}
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-4 bg-white">{children}</div>
    </div>
  );
}

function EditField({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </div>
  );
}
