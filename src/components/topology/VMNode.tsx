'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Server, Cpu, MemoryStick, Globe, GlobeLock, Play, Square, Loader2, Circle } from 'lucide-react';
import { STATUS_META, type VMNodeData } from './types';

/**
 * Nœud VM façon n8n raffiné : carte claire à coins arrondis, barre d'accent latérale
 * colorée selon l'état, icône serveur, nom + IP, jauges CPU/RAM, badge Internet.
 * Poignées de connexion nettes (uplink Internet en haut, liens réseau gauche/droite).
 */
function VMNodeComponent({ data, selected }: NodeProps) {
  const { vm, onToggleInternet, busy } = data as VMNodeData;
  const meta = STATUS_META[vm.status];
  const ramGb = vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : null;

  return (
    <div className="group relative">
      {/* Poignée HAUT = uplink Internet */}
      <Handle id="inet" type="source" position={Position.Top}
        className="!h-3 !w-3 !-top-1.5 !bg-sky-400 !border-2 !border-slate-900 hover:!bg-sky-300 transition-colors" />
      {/* Poignées latérales = liens réseau VM↔VM */}
      <Handle id="net-in" type="target" position={Position.Left}
        className="!h-3 !w-3 !-left-1.5 !bg-cyan-400 !border-2 !border-slate-900" />
      <Handle id="net-out" type="source" position={Position.Right}
        className="!h-3 !w-3 !-right-1.5 !bg-cyan-400 !border-2 !border-slate-900" />

      <div
        className={[
          'flex w-[230px] overflow-hidden rounded-xl border bg-slate-850/95 backdrop-blur-sm',
          'shadow-lg transition-all duration-200',
          selected
            ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-[1.02]'
            : 'border-slate-700/80 hover:border-slate-500 hover:shadow-cyan-500/10 hover:scale-[1.01]',
        ].join(' ')}
        style={{ background: 'rgba(17,24,39,0.96)' }}
      >
        {/* Barre d'accent latérale (état) */}
        <span className={`w-1.5 shrink-0 ${meta.dot}`} />

        <div className="min-w-0 flex-1 p-3">
          {/* En-tête : icône + nom + badge internet */}
          <div className="flex items-center gap-2">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-800 ${meta.text}`}>
              <Server size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-slate-100">
                {vm.name || `vm-${vm.vmid}`}
              </p>
              <p className="flex items-center gap-1 text-[10px] text-slate-500">
                <Circle size={6} className={`${meta.dot} rounded-full ${vm.status === 'up' ? 'animate-pulse' : ''}`} fill="currentColor" />
                {meta.label} · #{vm.vmid}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleInternet(vm); }}
              title={vm.internet ? 'Connectée à Internet — cliquer pour isoler' : 'Isolée — cliquer pour connecter à Internet'}
              className={[
                'shrink-0 rounded-lg p-1.5 transition-colors',
                vm.internet ? 'bg-sky-400/15 text-sky-300 hover:bg-sky-400/25'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300',
              ].join(' ')}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : vm.internet ? <Globe size={14} /> : <GlobeLock size={14} />}
            </button>
          </div>

          {/* IP */}
          <div className="mt-2.5 rounded-lg bg-slate-800/60 px-2 py-1 font-mono text-[11px] text-slate-300">
            {vm.ip ?? '— pas d\'IP —'}
          </div>

          {/* Jauges ressources */}
          <div className="mt-2 space-y-1.5">
            <Gauge icon={<Cpu size={11} />} label={`${vm.maxcpu ?? '—'} vCPU`} />
            <Gauge icon={<MemoryStick size={11} />} label={ramGb ? `${ramGb} Go RAM` : '— RAM'} />
          </div>
        </div>
      </div>

      {/* Infos-bulle au survol */}
      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 scale-95 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-[11px] text-slate-300 opacity-0 shadow-2xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        <p className="mb-1.5 text-[12px] font-semibold text-slate-100">{vm.name || `vm-${vm.vmid}`}</p>
        <dl className="space-y-0.5">
          <Row k="Hôte" v={vm.node ?? '—'} />
          <Row k="État" v={meta.label} />
          <Row k="IP" v={vm.ip ?? '—'} mono />
          <Row k="Internet" v={vm.internet ? '✓ connectée' : '✗ isolée'} />
          {vm.owner_name && <Row k="Propriétaire" v={vm.owner_name} />}
        </dl>
        <p className="mt-2 border-t border-slate-800 pt-1.5 text-[10px] text-slate-500">Cliquer pour gérer cette VM</p>
      </div>
    </div>
  );
}

function Gauge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className={mono ? 'font-mono text-slate-200' : 'text-slate-200'}>{v}</dd>
    </div>
  );
}

export const VMNode = memo(VMNodeComponent);
