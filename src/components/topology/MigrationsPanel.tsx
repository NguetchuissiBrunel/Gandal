'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiClient, type MigrationEntry } from '@/lib/apiClient';

/** Historique récent des migrations de VMs (live-migration vers la cible 1/2/2). */
export default function MigrationsPanel() {
  const [items, setItems] = useState<MigrationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getMigrations();
      setItems(data.migrations ?? []);
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ArrowLeftRight size={18} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-slate-100">Migrations récentes</h3>
      </div>
      {loading ? (
        <p className="text-[12px] text-slate-500">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-slate-500">Aucune migration récente.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((m, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg bg-slate-800/40 px-3 py-2 text-[12px]">
              <StatusIcon status={m.status} />
              <span className="font-mono text-slate-200">VM {m.vmid ?? '—'}</span>
              <span className="text-slate-500">depuis</span>
              <span className="text-slate-300">{m.node_from ?? '—'}</span>
              <span className="ml-auto text-slate-500">{fmtTime(m.starttime)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'OK' || status === 'stopped') return <CheckCircle2 size={14} className="text-emerald-400" />;
  if (status === 'running') return <Loader2 size={14} className="animate-spin text-cyan-400" />;
  return <XCircle size={14} className="text-rose-400" />;
}

function fmtTime(ts: number | null): string {
  if (!ts) return '';
  try {
    return new Date(ts * 1000).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}
