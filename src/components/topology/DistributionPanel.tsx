'use client';

import { useCallback, useEffect, useState } from 'react';
import { Scale, RefreshCw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiClient, type DistributionNode } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { hostAccent } from './types';

/**
 * Bandeau admin : occupation des VMs par nœud vs cible (1 Emilia / 2 Ram / 2 Rem),
 * avec déclenchement de réconciliation (live-migration vers la cible).
 */
export default function DistributionPanel() {
  const { toast } = useFeedback();
  const [nodes, setNodes] = useState<DistributionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getDistribution();
      setNodes(data.nodes ?? []);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const reconcile = async () => {
    setReconciling(true);
    try {
      const r = await apiClient.reconcile();
      toast(r.ok ? 'Réconciliation déclenchée (migration en cours)' : 'Réconciliation refusée', r.ok ? 'success' : 'warning');
      setTimeout(load, 2500);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setReconciling(false);
    }
  };

  const conformant = nodes.length > 0 && nodes.every((n) => n.current === n.target);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Scale size={18} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-slate-100">Distribution des VMs</h3>
        {!loading && (
          conformant ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">
              <CheckCircle2 size={12} /> conforme
            </span>
          ) : nodes.length > 0 ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-300">
              <AlertTriangle size={12} /> déséquilibrée
            </span>
          ) : null
        )}
        <button
          onClick={reconcile}
          disabled={reconciling || conformant}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-violet-400/40 bg-violet-500/15 px-3 py-1.5 text-[12px] text-violet-200 hover:bg-violet-500/25 disabled:opacity-40"
        >
          {reconciling ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Réconcilier
        </button>
      </div>

      {loading ? (
        <p className="text-[12px] text-slate-500">Chargement…</p>
      ) : nodes.length === 0 ? (
        <p className="text-[12px] text-slate-500">
          Données indisponibles (le réconciliateur n'est pas déployé sur le contrôleur).
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {nodes.map((n) => {
            const pct = n.quota ? Math.min(100, (n.current / n.quota) * 100) : 0;
            const over = n.current > n.target;
            const under = n.current < n.target;
            return (
              <div key={n.node} className={`rounded-xl border bg-gradient-to-b to-transparent p-3 ${hostAccent(n.node)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide">{n.node}</span>
                  <span className="text-[12px] text-slate-300">
                    {n.current}/{n.quota} <span className="text-slate-500">· cible {n.target}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-amber-400' : under ? 'bg-sky-400' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.max(pct, 6)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {over ? 'surchargé — migrera vers un autre nœud' : under ? 'sous la cible' : 'à la cible'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
