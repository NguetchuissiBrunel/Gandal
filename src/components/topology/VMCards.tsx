'use client';

import { Cpu, MemoryStick, Globe, GlobeLock, Server, Play, Square } from 'lucide-react';
import type { TopologyVM } from '@/lib/apiClient';
import { STATUS_META } from './types';

interface Props {
  vms: TopologyVM[];
  onToggleInternet: (vm: TopologyVM) => void;
  onLifecycle?: (vm: TopologyVM, action: 'start' | 'stop') => void;
  onSelect?: (vm: TopologyVM) => void;
  busyVmid?: number | null;
}

/** Affichage en cartes — bon compromis lisibilité / densité moyenne. */
export default function VMCards({ vms, onToggleInternet, onLifecycle, onSelect, busyVmid }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vms.map((vm) => {
        const meta = STATUS_META[vm.status];
        const ramGb = vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : null;
        return (
          <div key={vm.vmid} className={`rounded-2xl border bg-slate-900/70 p-4 backdrop-blur ${meta.glow}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot} ${vm.status === 'up' ? 'animate-pulse' : ''}`} />
                <button onClick={() => onSelect?.(vm)} className="truncate font-semibold text-slate-100 hover:text-cyan-300 hover:underline">
                  {vm.name || `vm-${vm.vmid}`}
                </button>
              </div>
              <button
                onClick={() => onToggleInternet(vm)}
                className={`rounded-lg p-1.5 ${vm.internet ? 'bg-sky-400/10 text-sky-300' : 'bg-slate-700/30 text-slate-400'}`}
                title={vm.internet ? 'Déconnecter d\'Internet' : 'Connecter à Internet'}
              >
                {vm.internet ? <Globe size={15} /> : <GlobeLock size={15} />}
              </button>
            </div>
            <div className="mt-3 space-y-1.5 text-[12px] text-slate-400">
              <p className="flex items-center gap-2"><Server size={13} /> {vm.node ?? '—'} · <span className={meta.text}>{meta.label}</span></p>
              <p className="flex items-center gap-2 font-mono text-slate-300">{vm.ip ?? '—'}</p>
              <p className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Cpu size={13} /> {vm.maxcpu ?? '—'}</span>
                <span className="flex items-center gap-1"><MemoryStick size={13} /> {ramGb ? `${ramGb} Go` : '—'}</span>
              </p>
            </div>
            {onLifecycle && (
              <div className="mt-3 flex gap-2">
                <button
                  disabled={busyVmid === vm.vmid || vm.status === 'up'}
                  onClick={() => onLifecycle(vm, 'start')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/15 py-1.5 text-[12px] text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-30"
                ><Play size={13} /> Démarrer</button>
                <button
                  disabled={busyVmid === vm.vmid || vm.status === 'stopped'}
                  onClick={() => onLifecycle(vm, 'stop')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-500/15 py-1.5 text-[12px] text-rose-300 hover:bg-rose-500/25 disabled:opacity-30"
                ><Square size={13} /> Arrêter</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
