'use client';

import { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { Cpu, Zap } from 'lucide-react';

/**
 * Nœud Pool GPU : la grappe de GPU partagés du cluster (Omega). Contrairement au
 * routeur, l'accès GPU n'est PAS posé à la main : il est DÉRIVÉ de l'état réel
 * (une VM running avec un budget VRAM > 0). On ne peut donc ni le créer ni le
 * supprimer par glisser-déposer ; la bulle/lien apparaît quand la VM est allumée
 * avec de la VRAM et disparaît quand elle s'éteint. 1 bulle verte par VM connectée.
 */
function GPUNodeComponent({ id, data }: NodeProps) {
  const d = data as { gpuPeers?: number[]; vramTotalGb?: number };
  const gpuPeers = d?.gpuPeers ?? [];
  // Que des bulles occupées (pas de bulle « libre » : la connexion est automatique).
  const bubbles = gpuPeers.map((p) => ({ id: `gpu-${p}`, peer: p }));

  // Re-mesure des handles quand le nombre de connexions change.
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, bubbles.length, updateNodeInternals]);

  return (
    <div className="relative">
      {/* Bulles (bas) : 1 par VM avec accès GPU (verte, le lien pointillé s'y pose). */}
      {bubbles.map((b, i) => (
        <Handle key={b.id} id={b.id} type="target" position={Position.Bottom} isConnectable={false}
          title={`GPU → vm-${b.peer}`}
          className="!h-3.5 !w-3.5 !rounded-full !border-2 !border-white !bg-emerald-500"
          style={{ bottom: -8, left: `${((i + 1) / (bubbles.length + 1)) * 100}%` }} />
      ))}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 px-6 py-4 shadow-md dark:border-emerald-500/40 dark:from-emerald-500/10 dark:to-green-500/10">
        <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
          <Cpu size={24} className="text-emerald-600 dark:text-emerald-400" />
          <Zap size={12} className="absolute -right-1 -top-1 text-emerald-500 animate-pulse" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300">Pool GPU</p>
          <p className="text-[11px] text-emerald-500/80">
            calcul partagé{d?.vramTotalGb ? ` · ${d.vramTotalGb} Go VRAM` : ''} · {gpuPeers.length} VM{gpuPeers.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export const GPUNode = memo(GPUNodeComponent);
