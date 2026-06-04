'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Loader2,
  Trash2,
  Pencil,
  X,
  Save,
  Eye,
} from 'lucide-react';
import EntityDetailModal from '@/components/dashboard/EntityDetailModal';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';
import { apiClient, type TeacherRead } from '@/lib/apiClient';

const ROLES = [
  { value: 'teacher', label: 'Enseignant (validation inscriptions)' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'superadmin', label: 'Super administrateur' },
];

export default function TeachersPanel() {
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailTeacherId, setDetailTeacherId] = useState<number | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'teacher',
  });

  const loadTeachers = async () => {
    try {
      const { items } = await apiClient.getTeachers({ size: 100 });
      setTeachers(items);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username.trim() || !email.trim() || password.length < 6) {
      setError('Renseignez nom, e-mail et un mot de passe (6 caractères min.).');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.signupTeacher({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setSuccess('Enseignant créé via POST /api/v1/users/teachers');
      await loadTeachers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: TeacherRead) => {
    setEditingId(t.id);
    setEditForm({
      username: t.username,
      email: t.email,
      role: t.role,
    });
  };

  const handleUpdate = async (id: number) => {
    setError('');
    try {
      await apiClient.updateTeacher(id, {
        username: editForm.username.trim(),
        role: editForm.role,
      });
      setEditingId(null);
      setSuccess('Enseignant mis à jour');
      await loadTeachers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const handleDelete = async (t: TeacherRead) => {
    if (!confirm(`Supprimer le compte « ${t.username} » (${t.role}) ? Action irréversible.`)) {
      return;
    }
    setError('');
    try {
      await apiClient.deleteTeacher(t.id);
      if (editingId === t.id) setEditingId(null);
      setSuccess('Enseignant supprimé');
      await loadTeachers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition bg-white';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement des enseignants…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrewCard className="p-8">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4 mb-6">
          Créer un enseignant / validateur
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          POST /api/v1/users/teachers — les enseignants et admins valident les inscriptions.
        </p>

        <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Nom complet"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Mot de passe initial"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} cursor-pointer appearance-none`}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-5 py-3 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Créer le compte
          </button>
        </form>
      </ScrewCard>

      {(error || success) && (
        <p
          className={`text-xs font-semibold rounded-lg px-3 py-2 border ${
            error
              ? 'text-red-600 bg-red-50 border-red-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}
        >
          {error || success}
        </p>
      )}

      <ScrewCard className="p-8">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
          Enseignants ({teachers.length})
        </h3>
        <div className="space-y-3">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-slate-50 border border-slate-100 rounded-xl"
            >
              {editingId === t.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, username: e.target.value }))
                    }
                  />
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <select
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm sm:col-span-2"
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <div className="sm:col-span-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(t.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-xs font-bold uppercase rounded-lg cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{t.username}</p>
                    <p className="text-xs text-slate-500">{t.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {t.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailTeacherId(t.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white cursor-pointer"
                      title="Voir détail API"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t)}
                      className="p-2 rounded-lg border border-red-200 hover:bg-red-50 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">Aucun enseignant.</p>
          )}
        </div>
      </ScrewCard>

      {detailTeacherId != null && (
        <EntityDetailModal
          kind="teacher"
          id={detailTeacherId}
          onClose={() => setDetailTeacherId(null)}
        />
      )}
    </div>
  );
}
