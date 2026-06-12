import type { TopologyVM } from '@/lib/apiClient';

export type DisplayMode = 'graph' | 'table' | 'cards';

/** Données portées par un nœud VM dans React Flow. */
export interface VMNodeData {
  vm: TopologyVM;
  /** Bascule l'accès internet de la VM (geste ludique). */
  onToggleInternet: (vm: TopologyVM) => void;
  /** Action cycle de vie (start/stop) si disponible. */
  onLifecycle?: (vm: TopologyVM, action: 'start' | 'stop') => void;
  /** Vrai pendant qu'une action est en cours (spinner). */
  busy?: boolean;
  [key: string]: unknown;
}

export interface HostNodeData {
  host: string;
  count: number;
  [key: string]: unknown;
}

export const STATUS_META: Record<
  TopologyVM['status'],
  { label: string; dot: string; glow: string; text: string }
> = {
  up: {
    label: 'En marche',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_18px_-2px_rgba(52,211,153,0.7)] border-emerald-400/60',
    text: 'text-emerald-300',
  },
  waiting: {
    label: 'En pause',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_18px_-2px_rgba(251,191,36,0.6)] border-amber-400/60',
    text: 'text-amber-300',
  },
  stopped: {
    label: 'Arrêtée',
    dot: 'bg-slate-500',
    glow: 'border-slate-600/60',
    text: 'text-slate-400',
  },
};

export const HOST_ACCENT: Record<string, string> = {
  emilia: 'from-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-200',
  ram: 'from-cyan-500/15 border-cyan-400/30 text-cyan-200',
  rem: 'from-violet-500/15 border-violet-400/30 text-violet-200',
};

export function hostAccent(host: string): string {
  return HOST_ACCENT[host] ?? 'from-slate-500/15 border-slate-400/30 text-slate-200';
}
