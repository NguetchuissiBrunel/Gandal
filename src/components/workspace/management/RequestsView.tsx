'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Plus, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { MgmtView, Card, Badge, Empty, inputCls, btnPrimary, btnGhost } from './ui';

interface Props { role: 'student' | 'teacher' | 'admin' }

const STATUS: Record<string, { tone: 'pending' | 'ok' | 'reject'; label: string }> = {
  pending: { tone: 'pending', label: 'En attente' },
  waiting: { tone: 'pending', label: 'En attente' },
  validated: { tone: 'ok', label: 'Validée' },
  approved: { tone: 'ok', label: 'Validée' },
  rejected: { tone: 'reject', label: 'Rejetée' },
};

/** Requêtes : l'admin/enseignant approuve/rejette ; l'étudiant crée et suit les siennes. */
export default function RequestsView({ role }: Props) {
  const { toast } = useFeedback();
  const isApprover = role === 'admin' || role === 'teacher';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try { const r = await apiClient.getRequests({ size: 100 }); setItems(r.items); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const act = async (id: number, action: 'approve' | 'reject') => {
    setBusy(id);
    try {
      if (action === 'approve') await apiClient.approveRequest(id);
      else await apiClient.rejectRequest(id);
      toast(action === 'approve' ? 'Requête approuvée — VM en provisionnement' : 'Requête rejetée', 'success');
      await load();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(null); }
  };

  return (
    <MgmtView title="Requêtes" subtitle={isApprover ? 'Approuvez ou rejetez les demandes des étudiants' : 'Créez et suivez vos demandes'}
      actions={
        <div className="flex gap-2">
          <button onClick={load} className={btnGhost}><RefreshCw size={14} /> Actualiser</button>
          {!isApprover && <button onClick={() => setShowForm(true)} className={btnPrimary}><Plus size={15} /> Nouvelle requête</button>}
        </div>
      }>
      {loading ? <Empty>Chargement…</Empty> : items.length === 0 ? (
        <Empty>Aucune requête pour le moment.</Empty>
      ) : (
        <Card>
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] uppercase text-slate-400 dark:text-slate-500">
              <tr><Th>Type</Th><Th>Objet</Th><Th>Détails</Th><Th>Statut</Th>{isApprover && <Th>Actions</Th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
              {items.map((r) => {
                const st = STATUS[(r.status || '').toLowerCase()] ?? { tone: 'muted' as const, label: r.status };
                const pending = ['pending', 'waiting'].includes((r.status || '').toLowerCase());
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-[#1c1c1c] dark:bg-[#0a0a0a]">
                    <td className="px-4 py-3"><span className="text-slate-700 dark:text-slate-300">{labelType(r.type)}</span></td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{r.object || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{details(r)}</td>
                    <td className="px-4 py-3"><Badge tone={st.tone as any}>{st.label}</Badge></td>
                    {isApprover && (
                      <td className="px-4 py-3">
                        {pending ? (
                          <div className="flex gap-1.5">
                            <button disabled={busy === r.id} onClick={() => act(r.id, 'approve')}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 text-[12px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40">
                              {busy === r.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approuver
                            </button>
                            <button disabled={busy === r.id} onClick={() => act(r.id, 'reject')}
                              className="flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-500/15 px-2.5 py-1 text-[12px] text-rose-600 dark:text-rose-300 hover:bg-rose-100 disabled:opacity-40">
                              <X size={12} /> Rejeter
                            </button>
                          </div>
                        ) : <span className="text-[12px] text-slate-400 dark:text-slate-500">—</span>}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && <NewRequestModal onClose={() => setShowForm(false)} onDone={load} />}
    </MgmtView>
  );
}

function NewRequestModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useFeedback();
  const [kind, setKind] = useState<'create-vm' | 'account' | 'domain'>('create-vm');
  const [object, setObject] = useState('');
  const [os, setOs] = useState('Debian 12');
  const [ram, setRam] = useState(4);
  const [rom, setRom] = useState(20);
  const [cpu, setCpu] = useState(2);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  // Domaine
  const [vms, setVms] = useState<{ id: number; name?: string | null }[]>([]);
  const [vmId, setVmId] = useState<number | ''>('');
  const [hostname, setHostname] = useState('');
  const [port, setPort] = useState(3000);
  useEffect(() => { apiClient.getVms({ size: 100 }).then((r) => setVms(r.items as any)).catch(() => {}); }, []);

  const submit = async () => {
    setBusy(true);
    try {
      if (kind === 'create-vm') {
        await apiClient.createVmRequest({ object, content, teacher_id: 1, size_rom: rom, size_ram: ram, n_cpu: cpu, os } as any);
      } else if (kind === 'domain') {
        if (!vmId || !hostname.trim()) { toast('Choisissez une VM et un nom', 'danger'); setBusy(false); return; }
        await apiClient.domainRequest({ object, content, teacher_id: 1, vm_id: Number(vmId), hostname: hostname.trim(), port });
      } else {
        await apiClient.createAccountRequest({ object, content } as any);
      }
      toast('Requête envoyée', 'success'); onDone(); onClose();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5">
        <div className="mb-4 flex items-center gap-2"><FileText size={18} className="text-cyan-600" /><h3 className="font-semibold text-slate-900 dark:text-slate-100">Nouvelle requête</h3></div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setKind('create-vm')} className={`flex-1 rounded-lg border px-2 py-2 text-[12px] ${kind === 'create-vm' ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'border-slate-200 dark:border-[#2a2a2a] text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}>Création VM</button>
            <button onClick={() => setKind('domain')} className={`flex-1 rounded-lg border px-2 py-2 text-[12px] ${kind === 'domain' ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'border-slate-200 dark:border-[#2a2a2a] text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}>Domaine</button>
            <button onClick={() => setKind('account')} className={`flex-1 rounded-lg border px-2 py-2 text-[12px] ${kind === 'account' ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'border-slate-200 dark:border-[#2a2a2a] text-slate-500 dark:text-slate-400 dark:text-slate-500'}`}>Compte</button>
          </div>
          <input className={inputCls} placeholder="Objet" value={object} onChange={(e) => setObject(e.target.value)} />
          {kind === 'create-vm' && (
            <>
              <select className={inputCls} value={os} onChange={(e) => setOs(e.target.value)}>
                <option>Debian 12</option><option>Ubuntu 22.04</option>
              </select>
              <div className="grid grid-cols-3 gap-2">
                <NumIn label="vCPU" v={cpu} set={setCpu} />
                <NumIn label="RAM Go" v={ram} set={setRam} />
                <NumIn label="Disque Go" v={rom} set={setRom} />
              </div>
            </>
          )}
          {kind === 'domain' && (
            <>
              <select className={inputCls} value={vmId} onChange={(e) => setVmId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">— Votre VM (qui expose le port) —</option>
                {vms.map((v) => <option key={v.id} value={v.id}>{v.name || `vm-${v.id}`}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] text-slate-400 dark:text-slate-500">Nom souhaité</span>
                  <input className={inputCls} placeholder="monapp" value={hostname} onChange={(e) => setHostname(e.target.value)} />
                </label>
                <NumIn label="Port exposé (3000, 5000…)" v={port} set={setPort} />
              </div>
              <p className="rounded-lg bg-cyan-50 dark:bg-cyan-500/10 px-3 py-2 text-[11px] text-cyan-700 dark:text-cyan-300">
                → http://{(hostname.trim() || 'monapp')}.enspy-gi.gandal redirigera vers votre VM sur le port {port}.
              </p>
            </>
          )}
          <textarea className={inputCls} rows={2} placeholder="Justification (optionnel)" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className={btnGhost + ' flex-1'}>Annuler</button>
          <button onClick={submit} disabled={busy || !object} className={btnPrimary + ' flex-[2]'}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Envoyer</button>
        </div>
      </div>
    </div>
  );
}

function NumIn({ label, v, set }: { label: string; v: number; set: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] text-slate-400 dark:text-slate-500">{label}</span>
      <input type="number" className={inputCls} value={v} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

function Th({ children }: { children?: React.ReactNode }) { return <th className="px-4 py-2.5 font-semibold">{children}</th>; }
function labelType(t: string) {
  return t?.includes('create') ? 'Création VM' : t?.includes('delete') ? 'Suppression VM'
    : t?.includes('domain') ? 'Domaine' : t?.includes('account') ? 'Compte' : t || '—';
}
function details(r: any) {
  if (r.type?.includes('create')) return `${r.os ?? ''} · ${r.n_cpu ?? '?'} vCPU · ${r.size_ram ?? '?'} Go · ${r.size_rom ?? '?'} Go`;
  if (r.type?.includes('delete')) return `VM #${r.vm_id ?? '?'}`;
  if (r.type?.includes('domain')) return `${r.hostname ?? '?'}.enspy-gi.gandal → VM #${r.vm_id ?? '?'}:${r.port ?? '?'}`;
  return r.content || '—';
}
