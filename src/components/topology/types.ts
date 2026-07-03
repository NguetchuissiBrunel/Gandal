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
  emilia: 'from-fuchsia-50 dark:from-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300',
  ram: 'from-cyan-50 dark:from-cyan-500/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
  rem: 'from-violet-50 dark:from-violet-500/10 border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-300',
};

export function hostAccent(host: string): string {
  return HOST_ACCENT[host] ?? 'from-slate-50 dark:from-slate-500/10 border-slate-200 dark:border-[#2a2a2a] text-slate-600 dark:text-slate-300';
}
