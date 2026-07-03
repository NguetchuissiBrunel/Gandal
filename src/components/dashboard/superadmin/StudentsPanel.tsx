'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  User,
  Hash,
  GraduationCap,
  Building2,
  Loader2,
  Trash2,
  Pencil,
  X,
  Save,
  Eye,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import EntityDetailModal from '@/components/dashboard/EntityDetailModal';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';
import { apiClient, type StudentRead } from '@/lib/apiClient';
import FeedbackBanner from '@/components/ui/FeedbackBanner';
import PasswordInput from '@/components/ui/PasswordInput';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';

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

export default function StudentsPanel() {
  const { confirm } = useFeedback();
  const [students, setStudents] = useState<StudentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailStudentId, setDetailStudentId] = useState<number | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matricule, setMatricule] = useState('');
  const [level, setLevel] = useState('1');
  const [departement, setDepartement] = useState('Informatique');

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    level: '',
    departement: '',
  });

  const loadStudents = async () => {
    try {
      const { items } = await apiClient.getStudents({ size: 100 });
      setStudents(items);
      setError('');
      setSuccess('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erreur de chargement'));
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username.trim() || !email.trim() || !matricule.trim() || password.length < 6) {
      setError('Remplissez tous les champs (mot de passe min. 6 caractères).');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.signupStudent({
        username: username.trim(),
        email: email.trim(),
        password,
        matricule: matricule.trim(),
        level,
        departement,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setMatricule('');
      setSuccess('Étudiant créé avec succès.');
      await loadStudents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Création impossible'));
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (s: StudentRead) => {
    setEditingId(s.id);
    setEditForm({
      username: s.username,
      email: s.email,
      level: s.level,
      departement: s.departement,
    });
  };

  const handleUpdate = async (id: number) => {
    setError('');
    try {
      await apiClient.updateStudent(id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        level: editForm.level,
        departement: editForm.departement,
      });
      setEditingId(null);
      setSuccess('Étudiant mis à jour.');
      await loadStudents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Mise à jour impossible'));
      setSuccess('');
    }
  };

  const handleDelete = async (s: StudentRead) => {
    const ok = await confirm({
      title: 'Supprimer le compte étudiant',
      message: `Supprimer définitivement « ${s.username} » ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    setError('');
    setSuccess('');
    try {
      await apiClient.deleteStudent(s.id);
      if (editingId === s.id) setEditingId(null);
      setSuccess('Étudiant supprimé.');
      await loadStudents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Suppression impossible'));
      setSuccess('');
    }
  };

  const handleToggleActive = async (s: StudentRead) => {
    const blocking = s.is_active !== false;
    setError('');
    setSuccess('');
    try {
      if (blocking) {
        await apiClient.blockStudent(s.id);
        setSuccess('Compte étudiant bloqué.');
      } else {
        await apiClient.unblockStudent(s.id);
        setSuccess('Compte étudiant activé.');
      }
      await loadStudents();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Action impossible'));
      setSuccess('');
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition bg-white';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement des étudiants…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrewCard className="p-8">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-4 mb-2">
          Créer un compte étudiant
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Création directe (admin). Les inscriptions publiques passent par les demandes
          d&apos;inscription.
        </p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="relative md:col-span-2">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Nom d'utilisateur"
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
          <PasswordInput
            required
            minLength={6}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputClassName={inputClass.replace('pr-4', 'pr-11')}
            autoComplete="new-password"
          />
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {['1', '2', '3', '4', '5'].map((l) => (
                <option key={l} value={l}>
                  Niveau {l}
                </option>
              ))}
            </select>
          </div>
          <div className="relative md:col-span-2">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={departement}
              onChange={(e) => setDepartement(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
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
              Créer
            </button>
          </div>
        </form>
      </ScrewCard>

      <FeedbackBanner
        error={error}
        success={success}
        onDismissError={() => setError('')}
        onDismissSuccess={() => setSuccess('')}
      />

      <ScrewCard className="p-8">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
          Étudiants ({students.length})
        </h3>
        <div className="space-y-3">
          {students.map((s) => (
            <div
              key={s.id}
              className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3"
            >
              {editingId === s.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, username: e.target.value }))
                    }
                    placeholder="Nom"
                  />
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="E-mail"
                  />
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.level}
                    onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))}
                    placeholder="Niveau"
                  />
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    value={editForm.departement}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, departement: e.target.value }))
                    }
                    placeholder="Département"
                  />
                  <div className="sm:col-span-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(s.id)}
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      {s.username}
                      {s.is_active === false && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Bloqué / en attente
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">
                      {s.matricule} · Niv. {s.level} · {s.departement}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailStudentId(s.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-600 cursor-pointer"
                      title="Voir détail API"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-600 cursor-pointer"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(s)}
                      className={`p-2 rounded-lg border cursor-pointer ${
                        s.is_active === false
                          ? 'border-emerald-200 hover:bg-emerald-50 text-emerald-600'
                          : 'border-amber-200 hover:bg-amber-50 text-amber-600'
                      }`}
                      title={s.is_active === false ? 'Activer / débloquer' : 'Bloquer'}
                    >
                      {s.is_active === false ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {students.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Aucun étudiant enregistré.</p>
          )}
        </div>
      </ScrewCard>

      {detailStudentId != null && (
        <EntityDetailModal
          kind="student"
          id={detailStudentId}
          onClose={() => setDetailStudentId(null)}
        />
      )}
    </div>
  );
}
