'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Server } from 'lucide-react';
import { hostAccent, type HostNodeData } from './types';

/**
 * Région-hôte : grand cadre en arrière-plan regroupant les VMs d'un nœud Proxmox
 * (emilia / ram / rem). Non interactif — sert de repère visuel façon « rack ».
 */
function HostNodeComponent({ data }: NodeProps) {
  const { host, count } = data as HostNodeData;
  const accent = hostAccent(host);
  return (
    <div
      className={`h-full w-full rounded-3xl border bg-gradient-to-b to-transparent ${accent}`}
      style={{ borderStyle: 'dashed' }}
    >
      <div className="flex items-center gap-2 px-4 pt-3">
        <Server size={16} />
        <span className="text-sm font-semibold uppercase tracking-wider">{host}</span>
        <span className="ml-auto rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-medium">
          {count} VM{count > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export const HostNode = memo(HostNodeComponent);
