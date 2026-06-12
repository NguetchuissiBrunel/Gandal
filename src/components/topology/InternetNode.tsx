'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe2 } from 'lucide-react';

/** Nœud « Internet » : cible visuelle des VMs connectées au monde extérieur. */
function InternetNodeComponent() {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Bottom} className="!h-3 !w-3 !bg-sky-400 !border-sky-200" />
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-sky-400/40 bg-gradient-to-b from-sky-500/20 to-sky-900/20 px-5 py-3 backdrop-blur-md shadow-[0_0_28px_-4px_rgba(56,189,248,0.6)]">
        <Globe2 size={26} className="text-sky-300 animate-[spin_18s_linear_infinite]" />
        <span className="text-[12px] font-semibold uppercase tracking-widest text-sky-200">Internet</span>
      </div>
    </div>
  );
}

export const InternetNode = memo(InternetNodeComponent);
