'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, BookOpen, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { MgmtView, Card, Empty, inputCls, btnPrimary, btnGhost } from './ui';

interface Props { canCreate?: boolean }

/** Publications : projets académiques partagés. */
export default function PublicationsView({ canCreate = true }: Props) {
  const { toast } = useFeedback();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try { const r = await apiClient.getPublications({ size: 100 }); setItems(r.items); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    if (!confirm('Supprimer cette publication ?')) return;
    try { await apiClient.deletePublication(id); toast('Publication supprimée', 'success'); await load(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };

  return (
    <MgmtView title="Publications" subtitle="Projets académiques déployés sur le data center"
      actions={<div className="flex gap-2"><button onClick={load} className={btnGhost}><RefreshCw size={14} /></button>
        {canCreate && <button onClick={() => setShowForm(true)} className={btnPrimary}><Plus size={15} /> Publier</button>}</div>}>
      {loading ? <Empty>Chargement…</Empty> : items.length === 0 ? <Empty>Aucune publication.</Empty> : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2"><BookOpen size={16} className="text-cyan-600" /><h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.title || p.object}</h3></div>
                <button onClick={() => del(p.id)} className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:text-rose-300"><Trash2 size={14} /></button>
              </div>
              <p className="mb-2 text-[12px] text-slate-400 dark:text-slate-500 line-clamp-3">{p.description || p.content || '—'}</p>
              {p.category && <span className="rounded-full bg-slate-100 dark:bg-[#1c1c1c] px-2 py-0.5 text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">{p.category}</span>}
              {(p.git_url || p.gitUrl) && (
                <a href={p.git_url || p.gitUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-[12px] text-cyan-600 hover:underline">
                  <ExternalLink size={12} /> Code source
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
      {showForm && <NewPubModal onClose={() => setShowForm(false)} onDone={load} />}
    </MgmtView>
  );
}

function NewPubModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useFeedback();
  const [f, setF] = useState({ title: '', description: '', category: '', git_url: '' });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await apiClient.createPublication(f as any); toast('Publication créée', 'success'); onDone(); onClose(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Nouvelle publication</h3>
        <div className="space-y-3">
          <input className={inputCls} placeholder="Titre" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <textarea className={inputCls} rows={3} placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input className={inputCls} placeholder="Catégorie" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          <input className={inputCls} placeholder="URL du dépôt (git)" value={f.git_url} onChange={(e) => setF({ ...f, git_url: e.target.value })} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className={btnGhost + ' flex-1'}>Annuler</button>
          <button onClick={submit} disabled={busy || !f.title} className={btnPrimary + ' flex-[2]'}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Publier</button>
        </div>
      </div>
    </div>
  );
}
