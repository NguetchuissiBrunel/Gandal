'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, BookOpen, Trash2, ExternalLink, Loader2, Check, X, Clock } from 'lucide-react';
import { apiClient, type PublicationRead } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { MgmtView, Card, Empty, inputCls, btnPrimary, btnGhost } from './ui';

interface Props { role: 'student' | 'teacher' | 'admin' }

/** Publications : projets académiques (nom de domaine déployé) partagés au catalogue.
 *  - Enseignant : « Demander une publication » → en attente de validation.
 *  - Super admin (admin) : valide/rejette les demandes ; ses propres publications
 *    sont publiées directement. */
export default function PublicationsView({ role }: Props) {
  const { toast } = useFeedback();
  const isTeacher = role === 'teacher' || role === 'admin';
  const isSuperAdmin = role === 'admin';
  const [items, setItems] = useState<PublicationRead[]>([]);
  const [pending, setPending] = useState<PublicationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await apiClient.getPublications({ size: 100 });
      setItems(r.items);
      if (isSuperAdmin) {
        const p = await apiClient.getPendingPublications({ size: 100 });
        setPending(p.items);
      }
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [toast, isSuperAdmin]);
  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    if (!confirm('Supprimer cette publication ?')) return;
    try { await apiClient.deletePublication(id); toast('Publication supprimée', 'success'); await load(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };

  const validate = async (id: number) => {
    try { await apiClient.validatePublication(id); toast('Publication validée — visible au catalogue', 'success'); await load(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };
  const reject = async (id: number) => {
    try { await apiClient.rejectPublication(id); toast('Demande rejetée', 'success'); await load(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      published: { label: 'Publié', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
      draft: { label: 'En attente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
      archived: { label: 'Archivé', cls: 'bg-slate-100 text-slate-500 dark:bg-[#1c1c1c] dark:text-slate-400' },
    };
    const m = map[s] ?? map.archived;
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>{m.label}</span>;
  };

  return (
    <MgmtView title="Publications" subtitle="Projets académiques déployés (nom de domaine sur Gandal)"
      actions={<div className="flex gap-2"><button onClick={load} className={btnGhost}><RefreshCw size={14} /></button>
        {/* Seul un enseignant demande une publication. Le super admin ne fait que valider/rejeter. */}
        {role === 'teacher' && <button onClick={() => setShowForm(true)} className={btnPrimary}><Plus size={15} /> Demander une publication</button>}</div>}>
      {loading ? <Empty>Chargement…</Empty> : (
        <div className="space-y-6">
          {/* File d'attente de validation (super admin) */}
          {isSuperAdmin && pending.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-amber-700 dark:text-amber-300"><Clock size={15} /> Demandes en attente ({pending.length})</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pending.map((p) => (
                  <Card key={p.id} className="border-amber-200 dark:border-amber-500/30 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2"><BookOpen size={16} className="text-amber-600" /><h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.nom}</h3></div>
                      {statusBadge(p.status)}
                    </div>
                    <p className="mb-2 text-[12px] text-slate-400 dark:text-slate-500 line-clamp-3">{p.description || '—'}</p>
                    {p.lien && <a href={p.lien} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-cyan-600 hover:underline"><ExternalLink size={12} /> {p.lien}</a>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => validate(p.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 py-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"><Check size={13} /> Valider</button>
                      <button onClick={() => reject(p.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-500/15 py-1.5 text-[12px] font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100"><X size={13} /> Rejeter</button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Catalogue */}
          {items.length === 0 ? <Empty>Aucune publication.</Empty> : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2"><BookOpen size={16} className="text-cyan-600" /><h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.nom}</h3></div>
                    <div className="flex items-center gap-2">
                      {statusBadge(p.status)}
                      {isTeacher && <button onClick={() => del(p.id)} className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-300"><Trash2 size={14} /></button>}
                    </div>
                  </div>
                  <p className="mb-2 text-[12px] text-slate-400 dark:text-slate-500 line-clamp-3">{p.description || '—'}</p>
                  {p.lien && (
                    <a href={p.lien} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-[12px] text-cyan-600 hover:underline">
                      <ExternalLink size={12} /> {p.lien}
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {showForm && <NewPubModal pending={!isSuperAdmin} onClose={() => setShowForm(false)} onDone={load} />}
    </MgmtView>
  );
}

function NewPubModal({ pending, onClose, onDone }: { pending: boolean; onClose: () => void; onDone: () => void }) {
  const { toast } = useFeedback();
  const [f, setF] = useState({ nom: '', description: '', lien: '', photo: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await apiClient.createPublication({
        nom: f.nom.trim(),
        description: f.description.trim() || null,
        lien: f.lien.trim() || null,
        photo: f.photo.trim() || null,
      } as never);
      toast(pending ? 'Demande envoyée — en attente de validation du super admin' : 'Publication ajoutée au catalogue', 'success');
      onDone(); onClose();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5">
        <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">{pending ? 'Demander une publication' : 'Nouvelle publication'}</h3>
        <p className="mb-4 text-[12px] text-slate-400 dark:text-slate-500">On publie un projet déployé : une URL (nom de domaine Gandal, IP ou IP:port).</p>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Nom du projet" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} />
          <textarea className={inputCls} rows={3} placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className={inputCls} placeholder="URL (ex: http://monapp.enspy-gi.gandal, 10.50.30.5 ou 10.50.30.5:8080)" value={f.lien} onChange={(e) => setF({ ...f, lien: e.target.value })} />
          <input className={inputCls} placeholder="Image (URL, optionnel)" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className={btnGhost + ' flex-1'}>Annuler</button>
          <button onClick={submit} disabled={busy || !f.nom.trim()} className={btnPrimary + ' flex-[2]'}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {pending ? 'Envoyer la demande' : 'Publier'}</button>
        </div>
      </div>
    </div>
  );
}
