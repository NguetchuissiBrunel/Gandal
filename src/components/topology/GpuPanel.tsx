'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cpu, Thermometer, Activity } from 'lucide-react';
import { apiClient, type GpuNode } from '@/lib/apiClient';
import { hostAccent } from './types';

/** Bandeau admin : état des GPU par nœud (VRAM, utilisation, température). */
export default function GpuPanel() {
  const [gpus, setGpus] = useState<GpuNode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getGpu();
      setGpus(data.gpus ?? []);
    } catch {
      /* silencieux : cluster injoignable */
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
        <Cpu size={18} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-100">GPU par nœud</h3>
      </div>
      {loading ? (
        <p className="text-[12px] text-slate-500">Chargement…</p>
      ) : gpus.length === 0 ? (
        <p className="text-[12px] text-slate-500">Aucune donnée GPU disponible.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {gpus.map((g, i) => {
            const memPct = g.mem_total_mib ? Math.round(((g.mem_used_mib ?? 0) / g.mem_total_mib) * 100) : 0;
            return (
              <div key={`${g.node}-${i}`} className={`rounded-xl border bg-gradient-to-b to-transparent p-3 ${hostAccent(g.node)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide">{g.node}</span>
                  {g.available && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-300">
                      <Thermometer size={12} /> {g.temp_c}°C
                    </span>
                  )}
                </div>
                {!g.available ? (
                  <p className="mt-2 text-[12px] text-slate-500">GPU indisponible</p>
                ) : (
                  <>
                    <p className="mt-1 truncate text-[12px] text-slate-300">{g.gpu}</p>
                    <div className="mt-2 space-y-2">
                      <Bar label="VRAM" pct={memPct} detail={`${Math.round((g.mem_used_mib ?? 0) / 1024)} / ${Math.round((g.mem_total_mib ?? 0) / 1024)} Go`} color="bg-emerald-400" />
                      <Bar label={<span className="flex items-center gap-1"><Activity size={11} /> Charge</span>} pct={g.util_pct ?? 0} detail={`${g.util_pct ?? 0}%`} color="bg-cyan-400" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Bar({ label, pct, detail, color }: { label: React.ReactNode; pct: number; detail: string; color: string }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[11px] text-slate-400">
        <span>{label}</span><span>{detail}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}
