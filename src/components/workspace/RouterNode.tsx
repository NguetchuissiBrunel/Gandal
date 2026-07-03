'use client';

import { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { Router, Globe } from 'lucide-react';

/**
 * Nœud Routeur / Internet : passerelle vers l'extérieur. Comme une VM, il porte
 * 1 bulle par connexion Internet existante (le lien s'y pose) + 1 bulle libre
 * pour le prochain glisser-déposer — il peut relier jusqu'à toutes les VMs.
 */
function RouterNodeComponent({ id, data }: NodeProps) {
  const inetPeers = (data as { inetPeers?: number[] })?.inetPeers ?? [];
  const bubbles: { id: string; occupied: boolean; peer?: number }[] = [
    ...inetPeers.map((p) => ({ id: `inet-${p}`, occupied: true, peer: p })),
    { id: 'inet-new', occupied: false },
  ];

  // Re-mesure des handles quand le nombre de connexions change.
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, bubbles.length, updateNodeInternals]);

  return (
    <div className="relative">
      {/* Bulles (bas) : 1 par VM connectée (pleine) + 1 libre (pointillée) pour la prochaine connexion */}
      {bubbles.map((b, i) => (
        <Handle key={b.id} id={b.id} type="target" position={Position.Bottom}
          title={b.occupied ? `Internet → vm-${b.peer}` : 'Glisser une VM ici = accès Internet'}
          className={`!h-3.5 !w-3.5 !rounded-full !border-2 ${b.occupied ? '!border-white !bg-sky-500 hover:!bg-sky-400' : '!border-dashed !border-sky-400 !bg-white hover:!border-sky-500 dark:!bg-[#141414]'}`}
          style={{ bottom: -8, left: `${((i + 1) / (bubbles.length + 1)) * 100}%` }} />
      ))}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 px-6 py-4 shadow-md dark:border-sky-500/40 dark:from-sky-500/10 dark:to-blue-500/10">
        <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-sky-100 dark:bg-sky-500/15">
          <Router size={24} className="text-sky-600 dark:text-sky-400" />
          <Globe size={12} className="absolute -right-1 -top-1 text-sky-500 animate-[spin_12s_linear_infinite]" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-wide text-sky-700 dark:text-sky-300">Internet</p>
          <p className="text-[11px] text-sky-500/80">passerelle pfSense · {inetPeers.length} connectée{inetPeers.length > 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}

export const RouterNode = memo(RouterNodeComponent);
