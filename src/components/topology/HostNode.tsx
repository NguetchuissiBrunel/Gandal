'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Server } from 'lucide-react';
import { hostAccent, type HostNodeData } from './types';

/**
 * Lane-hôte : conteneur de fond regroupant les VMs d'un nœud Proxmox (emilia/ram/rem),
 * façon « rack » — en-tête net avec nom + compteur, fond subtil teinté. Non interactif.
 */
function HostNodeComponent({ data }: NodeProps) {
  const { host, count } = data as HostNodeData;
  const accent = hostAccent(host);
  return (
    <div className={`h-full w-full rounded-2xl border ${accent}`}
      style={{ background: 'linear-gradient(180deg, rgba(30,41,59,0.35) 0%, rgba(15,23,42,0.15) 100%)' }}>
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-black/30">
          <Server size={15} />
        </span>
        <span className="text-sm font-bold uppercase tracking-widest">{host}</span>
        <span className="ml-auto rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold">
          {count} VM{count > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export const HostNode = memo(HostNodeComponent);
