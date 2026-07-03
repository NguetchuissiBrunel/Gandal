'use client';

import { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { Box, Cpu, MemoryStick, Globe, GlobeLock, Loader2, Wifi, Server, Sparkles } from 'lucide-react';
import { VM_STATUS, type VMNodeData } from './types';

/**
 * Nœud VM (fond bleu lisible) : carte à bandeau d'en-tête bleu plein (titre blanc),
 * corps bleu très clair. Handles ronds : gauche = entrée réseau, droite = sortie
 * réseau, haut = uplink Internet. Déplaçable librement sur la toile.
 */
function VMFlowNodeComponent({ id, data, selected }: NodeProps) {
  const { vm, onOpen, onToggleInternet, busy, highlight, peers } = data as VMNodeData;
  const st = VM_STATUS[vm.status];
  const ramGb = vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : null;
  const vramGb = vm.vram_mib ? Math.round(vm.vram_mib / 1024) : 0;
  // Accès GPU = dérivé : VM allumée AVEC un budget VRAM. Le lien vert pointillé
  // apparaît/disparaît tout seul ; il n'est ni créé ni supprimé à la main.
  const gpuAccess = vm.vram_mib > 0 && vm.status === 'up';

  // m bulles occupées (1 par lien existant) + 1 bulle libre pour le prochain glisser-déposer.
  const netBubbles: { id: string; occupied: boolean; peer?: number }[] = [
    ...(peers ?? []).map((p) => ({ id: `net-${p}`, occupied: true, peer: p })),
    { id: 'net-new', occupied: false },
  ];

  // Re-mesure des handles quand leur nombre change (sinon React Flow ignore la nouvelle bulle).
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => { updateNodeInternals(id); }, [id, netBubbles.length, vm.internet, gpuAccess, updateNodeInternals]);

  return (
    <div
      onClick={() => onOpen(vm)}
      className={[
        'relative w-[212px] cursor-pointer select-none rounded-xl border-2 shadow-md transition-all duration-150',
        st.border, st.dim ? 'bg-slate-50 opacity-80 hover:opacity-100 dark:bg-[#101010]' : 'bg-blue-50 dark:bg-[#141414]',
        selected ? 'ring-4 ring-blue-300 dark:ring-blue-500/40' : 'hover:shadow-lg hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-500/30',
        highlight ? 'gandal-blink !border-amber-500 !opacity-100' : '',
      ].join(' ')}
    >
      {/* Bulle Internet (haut) : pleine si connectée (le lien s'y pose), pointillée = libre pour glisser vers le routeur */}
      <Handle id="inet" type="source" position={Position.Top}
        title={vm.internet ? 'Connectée à Internet' : 'Glisser vers le routeur = Internet'}
        className={`!h-3.5 !w-3.5 !rounded-full !border-2 ${vm.internet ? '!border-white !bg-emerald-500 hover:!bg-emerald-600' : '!border-dashed !border-slate-400 !bg-white hover:!border-emerald-500 dark:!bg-[#141414]'}`}
        style={{ top: -8 }} />

      {/* Bulle GPU (bas) : présente UNIQUEMENT si la VM a accès GPU (VRAM>0 + allumée).
          Verte, non interactive — la connexion est automatique, pas posée à la main. */}
      {gpuAccess && (
        <Handle id="gpu" type="source" position={Position.Bottom} isConnectable={false}
          title={`Accès Pool GPU (${vramGb} Go VRAM)`}
          className="!h-3.5 !w-3.5 !rounded-full !border-2 !border-white !bg-emerald-500"
          style={{ bottom: -8 }} />
      )}

      {/* Bulle d'ENTRÉE réseau (gauche) : zone de dépôt quand on glisse une autre VM
          dessus pour créer un lien. type="target" → cible naturelle du glisser-déposer. */}
      <Handle id="net-in" type="target" position={Position.Left}
        title="Déposer une autre VM ici = lien réseau"
        className="!h-3.5 !w-3.5 !rounded-full !border-2 !border-dashed !border-blue-400 !bg-white hover:!border-blue-600 dark:!bg-[#141414]"
        style={{ left: -8 }} />

      {/* Bulles réseau (droite) : 1 par lien existant (pleine, le lien dessus) + 1 libre (pointillée) pour le prochain glisser-déposer */}
      {netBubbles.map((b, i) => (
        <Handle key={b.id} id={b.id} type="source" position={Position.Right}
          title={b.occupied ? `Lien réseau avec vm-${b.peer}` : 'Glisser vers une autre VM = nouveau lien réseau'}
          className={`!h-3.5 !w-3.5 !rounded-full !border-2 ${b.occupied ? '!border-white !bg-blue-600 hover:!bg-blue-800' : '!border-dashed !border-blue-400 !bg-white hover:!border-blue-600 dark:!bg-[#141414]'}`}
          style={{ right: -8, top: `${((i + 1) / (netBubbles.length + 1)) * 100}%` }} />
      ))}

      {/* Bandeau d'en-tête (bleu si active, gris si arrêtée) */}
      <div className="flex items-center gap-2 rounded-t-[10px] px-3 py-2.5" style={{ background: st.hex }}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/20">
          <Box size={13} className="text-white" />
        </span>
        <span className="flex-1 truncate text-[12px] font-semibold text-white">{vm.name || `vm-${vm.vmid}`}</span>
        {vm.internet && <Wifi size={13} className="text-white" />}
        <span className={`h-2 w-2 rounded-full ring-2 ring-white/60 ${st.dot} ${vm.status === 'up' ? 'animate-pulse' : ''}`} />
      </div>

      {/* Corps */}
      <div className="space-y-2 bg-white px-3 py-2.5 dark:bg-[#141414]">
        <div className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-medium text-blue-900 dark:bg-[#0a0a0a] dark:text-blue-300">{vm.ip ?? '— pas d\'IP —'}</div>
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1"><Cpu size={11} /> {vm.maxcpu ?? '—'}</span>
          <span className="flex items-center gap-1"><MemoryStick size={11} /> {ramGb ? `${ramGb} Go` : '—'}</span>
          <span className={`flex items-center gap-1 ${vramGb ? 'text-emerald-600 font-semibold' : ''}`}>
            <Sparkles size={11} /> {vramGb ? `${vramGb} Go` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-500">
          <Server size={10} /> {vm.node ?? '—'}{vm.owner_name ? ` · ${vm.owner_name}` : ''}
          <span className={`ml-auto font-medium ${st.text}`}>{st.label}</span>
        </div>
      </div>

      {/* Pied : actions */}
      <div className="flex divide-x divide-slate-200 overflow-hidden rounded-b-[10px] border-t border-slate-200 bg-white dark:divide-[#2a2a2a] dark:border-[#2a2a2a] dark:bg-[#141414]">
        <button onClick={(e) => { e.stopPropagation(); onToggleInternet(vm); }}
          className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium transition-colors ${vm.internet ? 'text-sky-700 hover:bg-sky-50' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-[#1c1c1c]'}`}>
          {busy ? <Loader2 size={12} className="animate-spin" /> : vm.internet ? <Globe size={12} /> : <GlobeLock size={12} />}
          {vm.internet ? 'En ligne' : 'Isolée'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpen(vm); }}
          className="flex flex-1 items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-[#1c1c1c]">
          Gérer
        </button>
      </div>
    </div>
  );
}

export const VMFlowNode = memo(VMFlowNodeComponent);
