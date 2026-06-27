'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe2 } from 'lucide-react';

/** Nœud « Internet » : cible des uplinks des VMs connectées au monde extérieur. */
function InternetNodeComponent() {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Bottom}
        className="!h-3.5 !w-3.5 !-bottom-1.5 !bg-sky-400 !border-2 !border-slate-900" />
      <div className="flex items-center gap-3 rounded-2xl border border-sky-400/40 bg-gradient-to-br from-sky-500/25 to-blue-700/15 px-6 py-3.5 backdrop-blur-md shadow-[0_0_40px_-6px_rgba(56,189,248,0.7)]">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/20">
          <Globe2 size={26} className="text-sky-300 animate-[spin_20s_linear_infinite]" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-sky-100">Internet</p>
          <p className="text-[11px] text-sky-300/70">accès extérieur</p>
        </div>
      </div>
    </div>
  );
}

export const InternetNode = memo(InternetNodeComponent);
