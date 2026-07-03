'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, GraduationCap, UserCog, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { MgmtView, Card, Empty, inputCls, btnPrimary, btnGhost } from './ui';
import PasswordInput from '@/components/ui/PasswordInput';

const TEACHER_ROLE_FR: Record<string, string> = {
  Teacher: 'Enseignant',
  Admin: 'Administrateur',
  SuperAdmin: 'Super administrateur',
};

/** Gestion des utilisateurs (admin) : étudiants & enseignants — liste, ajout, suppression. */
export default function UsersView() {
  const { toast } = useFeedback();
  const [tab, setTab] = useState<'students' | 'teachers'>('students');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = tab === 'students' ? await apiClient.getStudents({ size: 100 }) : await apiClient.getTeachers({ size: 100 });
      setItems(r.items);
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [tab, toast]);
  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      if (tab === 'students') await apiClient.deleteStudent(id); else await apiClient.deleteTeacher(id);
      toast('Utilisateur supprimé', 'success'); await load();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };

  return (
    <MgmtView title="Utilisateurs" subtitle="Étudiants et enseignants du data center"
      actions={<div className="flex gap-2"><button onClick={load} className={btnGhost}><RefreshCw size={14} /></button>
        <button onClick={() => setShowForm(true)} className={btnPrimary}><Plus size={15} /> Ajouter</button></div>}>
      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-1 w-fit">
        {(['students', 'teachers'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[13px] ${tab === t ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200'}`}>
            {t === 'students' ? <GraduationCap size={15} /> : <UserCog size={15} />}
            {t === 'students' ? 'Étudiants' : 'Enseignants'}
          </button>
        ))}
      </div>

      {loading ? <Empty>Chargement…</Empty> : items.length === 0 ? <Empty>Aucun {tab === 'students' ? 'étudiant' : 'enseignant'}.</Empty> : (
        <Card>
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] uppercase text-slate-400 dark:text-slate-500">
              <tr><Th>Nom</Th><Th>Email</Th>{tab === 'students' ? <><Th>Matricule</Th><Th>Niveau</Th></> : <Th>Rôle</Th>}<Th></Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#1c1c1c] dark:bg-[#0a0a0a]">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{u.username}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{u.email}</td>
                  {tab === 'students' ? <><td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{u.matricule}</td><td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{u.level}</td></> : <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{TEACHER_ROLE_FR[u.role] ?? u.role}</td>}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(u.id)} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:bg-rose-500/15 hover:text-rose-600 dark:text-rose-300"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && <NewUserModal tab={tab} onClose={() => setShowForm(false)} onDone={load} />}
    </MgmtView>
  );
}

function NewUserModal({ tab, onClose, onDone }: { tab: 'students' | 'teachers'; onClose: () => void; onDone: () => void }) {
  const { toast } = useFeedback();
  const [f, setF] = useState({ username: '', email: '', password: '', matricule: '', level: 'GI4', departement: 'Genie Informatique', role: 'Teacher' });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (tab === 'students') await apiClient.signupStudent({ username: f.username, email: f.email, password: f.password, matricule: f.matricule, level: f.level, departement: f.departement } as any);
      else await apiClient.signupTeacher({ username: f.username, email: f.email, password: f.password, role: 'Teacher' } as any);
      toast('Utilisateur créé', 'success'); onDone(); onClose();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Nouvel {tab === 'students' ? 'étudiant' : 'enseignant'}</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Nom d'utilisateur" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
          <input className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <PasswordInput inputClassName={inputCls + ' pr-11'} showLockIcon={false} placeholder="Mot de passe" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          {tab === 'students' && (
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Matricule" value={f.matricule} onChange={(e) => setF({ ...f, matricule: e.target.value })} />
              <input className={inputCls} placeholder="Niveau" value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} />
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className={btnGhost + ' flex-1'}>Annuler</button>
          <button onClick={submit} disabled={busy || !f.username || !f.password} className={btnPrimary + ' flex-[2]'}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Créer</button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) { return <th className="px-4 py-2.5 font-semibold">{children}</th>; }
