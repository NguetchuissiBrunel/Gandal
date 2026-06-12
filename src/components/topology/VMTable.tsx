'use client';

import { Globe, GlobeLock, Play, Square } from 'lucide-react';
import type { TopologyVM } from '@/lib/apiClient';
import { STATUS_META } from './types';

interface Props {
  vms: TopologyVM[];
  onToggleInternet: (vm: TopologyVM) => void;
  onLifecycle?: (vm: TopologyVM, action: 'start' | 'stop') => void;
  onSelect?: (vm: TopologyVM) => void;
  busyVmid?: number | null;
}

/** Affichage tabulaire dense — adapté aux longues listes / lecture rapide. */
export default function VMTable({ vms, onToggleInternet, onLifecycle, onSelect, busyVmid }: Props) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-slate-900/95 text-[11px] uppercase tracking-wider text-slate-400">
          <tr>
            <Th>VM</Th><Th>Hôte</Th><Th>État</Th><Th>IP</Th>
            <Th>vCPU</Th><Th>Internet</Th><Th>Propriétaire</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {vms.map((vm) => {
            const meta = STATUS_META[vm.status];
            return (
              <tr key={vm.vmid} className="hover:bg-slate-800/40">
                <td className="px-3 py-2.5 font-medium text-slate-100">
                  <button onClick={() => onSelect?.(vm)} className="text-left hover:text-cyan-300 hover:underline">
                    {vm.name || `vm-${vm.vmid}`}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-slate-300">{vm.node ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 ${meta.text}`}>
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />{meta.label}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[12px] text-slate-300">{vm.ip ?? '—'}</td>
                <td className="px-3 py-2.5 text-slate-300">{vm.maxcpu ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onToggleInternet(vm)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] ${vm.internet ? 'bg-sky-400/10 text-sky-300' : 'bg-slate-700/30 text-slate-400'}`}
                  >
                    {vm.internet ? <Globe size={13} /> : <GlobeLock size={13} />}
                    {vm.internet ? 'Connectée' : 'Isolée'}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-slate-400">{vm.owner_name ?? '—'}</td>
                <td className="px-3 py-2.5">
                  {onLifecycle && (
                    <div className="flex gap-1.5">
                      <button
                        disabled={busyVmid === vm.vmid || vm.status === 'up'}
                        onClick={() => onLifecycle(vm, 'start')}
                        className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-30"
                        title="Démarrer"
                      ><Play size={13} /></button>
                      <button
                        disabled={busyVmid === vm.vmid || vm.status === 'stopped'}
                        onClick={() => onLifecycle(vm, 'stop')}
                        className="rounded-lg bg-rose-500/15 p-1.5 text-rose-300 hover:bg-rose-500/25 disabled:opacity-30"
                        title="Arrêter"
                      ><Square size={13} /></button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 font-semibold">{children}</th>;
}
