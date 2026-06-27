'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Router, Globe } from 'lucide-react';

/** Nœud Routeur / Internet (thème clair) : passerelle vers l'extérieur. */
function RouterNodeComponent() {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Bottom}
        className="!h-4 !w-4 !-bottom-2 !bg-sky-500 !border-2 !border-white hover:!bg-sky-400" />
      <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 px-6 py-4 shadow-md">
        <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-sky-100">
          <Router size={24} className="text-sky-600" />
          <Globe size={12} className="absolute -right-1 -top-1 text-sky-500 animate-[spin_12s_linear_infinite]" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-wide text-sky-700 dark:text-sky-300">Internet</p>
          <p className="text-[11px] text-sky-500/80">passerelle pfSense · accès extérieur</p>
        </div>
      </div>
    </div>
  );
}

export const RouterNode = memo(RouterNodeComponent);
