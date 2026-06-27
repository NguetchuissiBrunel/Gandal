'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Globe, Trash2, Loader2 } from 'lucide-react';
import { apiClient, type TopologyVM } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { MgmtView, Card, Empty, inputCls, btnPrimary, btnGhost } from './ui';

interface Props { vms: TopologyVM[] }

/** DNS : entrées de la zone enspy-gi.gandal associées aux VMs. */
export default function DnsView({ vms }: Props) {
  const { toast } = useFeedback();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try { const r = await apiClient.getDnsEntries({ size: 100 }); setItems(r.items); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    if (!confirm('Supprimer cette entrée DNS ?')) return;
    try { await apiClient.deleteDnsEntry(id); toast('Entrée DNS supprimée', 'success'); await load(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  };

  return (
    <MgmtView title="DNS" subtitle="Zone enspy-gi.gandal — noms des machines virtuelles"
      actions={<div className="flex gap-2"><button onClick={load} className={btnGhost}><RefreshCw size={14} /></button>
        <button onClick={() => setShowForm(true)} className={btnPrimary}><Plus size={15} /> Nouvelle entrée</button></div>}>
      {loading ? <Empty>Chargement…</Empty> : items.length === 0 ? <Empty>Aucune entrée DNS.</Empty> : (
        <Card>
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] uppercase text-slate-400 dark:text-slate-500">
              <tr><Th>Nom d'hôte</Th><Th>VM</Th><Th>IP</Th><Th></Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
              {items.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-[#1c1c1c] dark:bg-[#0a0a0a]">
                  <td className="px-4 py-3"><span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200"><Globe size={14} className="text-violet-600" />{e.hostname}<span className="text-slate-400 dark:text-slate-500">.enspy-gi.gandal</span></span></td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">#{e.vm_id}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-700 dark:text-slate-300">{e.ip_address ?? '—'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => del(e.id)} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:bg-rose-500/15 hover:text-rose-600 dark:text-rose-300"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {showForm && <NewDnsModal vms={vms} onClose={() => setShowForm(false)} onDone={load} />}
    </MgmtView>
  );
}

function NewDnsModal({ vms, onClose, onDone }: { vms: TopologyVM[]; onClose: () => void; onDone: () => void }) {
  const { toast } = useFeedback();
  const [hostname, setHostname] = useState('');
  const [vmId, setVmId] = useState<number | ''>(vms[0]?.vmid ?? '');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!hostname || vmId === '') return;
    setBusy(true);
    try {
      // 1) Enregistre RÉELLEMENT dans pfSense Unbound (résolution effective).
      await apiClient.registerVmDns(Number(vmId), hostname);
      // 2) Trace l'entrée en base pour l'affichage de la liste.
      try { await apiClient.createDnsEntry({ hostname, vm_id: Number(vmId) }); } catch { /* déjà en pfSense */ }
      toast('Entrée DNS créée et résoluble', 'success'); onDone(); onClose();
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Nouvelle entrée DNS</h3>
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-[11px] text-slate-400 dark:text-slate-500">Nom d'hôte</span>
            <div className="flex items-center gap-2"><input className={inputCls} placeholder="mon-projet" value={hostname} onChange={(e) => setHostname(e.target.value)} /><span className="text-[12px] text-slate-400 dark:text-slate-500">.enspy-gi.gandal</span></div>
          </label>
          <label className="block"><span className="mb-1 block text-[11px] text-slate-400 dark:text-slate-500">Machine virtuelle</span>
            <select className={inputCls} value={vmId} onChange={(e) => setVmId(Number(e.target.value))}>
              {vms.map((v) => <option key={v.vmid} value={v.vmid}>{v.name || `vm-${v.vmid}`} ({v.ip ?? '—'})</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className={btnGhost + ' flex-1'}>Annuler</button>
          <button onClick={submit} disabled={busy || !hostname} className={btnPrimary + ' flex-[2]'}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Créer</button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) { return <th className="px-4 py-2.5 font-semibold">{children}</th>; }
