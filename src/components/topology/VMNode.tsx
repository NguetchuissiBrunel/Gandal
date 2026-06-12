'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cpu, MemoryStick, Globe, GlobeLock, Play, Square, Loader2 } from 'lucide-react';
import { STATUS_META, type VMNodeData } from './types';

/**
 * Nœud VM de la toile : carte « glassmorphism » sombre avec halo selon l'état,
 * indicateur internet cliquable, infos-bulle au survol, poignées de liaison
 * (glisser d'une VM à une autre pour les relier en réseau).
 */
function VMNodeComponent({ data, selected }: NodeProps) {
  const { vm, onToggleInternet, onLifecycle, busy } = data as VMNodeData;
  const meta = STATUS_META[vm.status];
  const ramGb = vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : null;

  return (
    <div className="group relative">
      {/* Poignée HAUT = uplink Internet (glisser vers le nœud Internet). */}
      <Handle
        id="inet"
        type="source"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !bg-sky-400/80 !border-sky-200/50"
      />
      {/* Poignées GAUCHE/DROITE = liens réseau VM↔VM (glisser droite→gauche). */}
      <Handle
        id="net-in"
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !bg-cyan-400/70 !border-cyan-200/50"
      />
      <Handle
        id="net-out"
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !bg-cyan-400/70 !border-cyan-200/50"
      />

      <div
        className={[
          'w-[210px] rounded-2xl border bg-slate-900/80 backdrop-blur-md px-3.5 py-3',
          'transition-all duration-200',
          meta.glow,
          selected ? 'ring-2 ring-cyan-400/70 scale-[1.02]' : 'hover:scale-[1.02]',
        ].join(' ')}
      >
        {/* En-tête : état + internet */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot} ${vm.status === 'up' ? 'animate-pulse' : ''}`} />
            <span className="truncate text-[13px] font-semibold text-slate-100">
              {vm.name || `vm-${vm.vmid}`}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleInternet(vm);
            }}
            title={vm.internet ? 'Connectée à Internet — cliquer pour déconnecter' : 'Isolée — cliquer pour connecter à Internet'}
            className={[
              'shrink-0 rounded-lg p-1 transition-colors',
              vm.internet
                ? 'text-sky-300 hover:text-sky-200 bg-sky-400/10'
                : 'text-slate-500 hover:text-slate-300 bg-slate-700/30',
            ].join(' ')}
          >
            {vm.internet ? <Globe size={15} /> : <GlobeLock size={15} />}
          </button>
        </div>

        {/* Ressources */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu size={12} /> {vm.maxcpu ?? '—'} vCPU
          </span>
          <span className="flex items-center gap-1">
            <MemoryStick size={12} /> {ramGb ? `${ramGb} Go` : '—'}
          </span>
        </div>

        {/* IP + nœud-hôte */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-slate-300">{vm.ip ?? '—'}</span>
          <span className={`text-[10px] uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
        </div>

        {/* Actions cycle de vie (au survol) */}
        {onLifecycle && (
          <div className="mt-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={busy || vm.status === 'up'}
              onClick={(e) => { e.stopPropagation(); onLifecycle(vm, 'start'); }}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500/15 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-30"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Démarrer
            </button>
            <button
              type="button"
              disabled={busy || vm.status === 'stopped'}
              onClick={(e) => { e.stopPropagation(); onLifecycle(vm, 'stop'); }}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-rose-500/15 py-1 text-[11px] text-rose-300 hover:bg-rose-500/25 disabled:opacity-30"
            >
              <Square size={12} /> Arrêter
            </button>
          </div>
        )}
      </div>

      {/* Infos-bulle riche au survol */}
      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 scale-95 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-[11px] text-slate-300 opacity-0 shadow-xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        <p className="mb-1 text-[12px] font-semibold text-slate-100">{vm.name || `vm-${vm.vmid}`}</p>
        <dl className="space-y-0.5">
          <Row k="VMID" v={String(vm.vmid)} />
          <Row k="Hôte" v={vm.node ?? '—'} />
          <Row k="État" v={meta.label} />
          <Row k="IP" v={vm.ip ?? '—'} mono />
          <Row k="Internet" v={vm.internet ? 'Connectée' : 'Isolée'} />
          {vm.owner_name && <Row k="Propriétaire" v={vm.owner_name} />}
        </dl>
      </div>
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
