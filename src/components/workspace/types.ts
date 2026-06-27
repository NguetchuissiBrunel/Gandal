import type { TopologyVM } from '@/lib/apiClient';

/** État visuel par statut de VM : actives en BLEU, arrêtées en GRIS. */
export const VM_STATUS: Record<
  TopologyVM['status'],
  { label: string; border: string; dot: string; text: string; hex: string; dim: boolean }
> = {
  up: {
    label: 'En marche', border: 'border-blue-600', dot: 'bg-emerald-400',
    text: 'text-blue-700', hex: '#2563eb', dim: false,
  },
  waiting: {
    label: 'En cours', border: 'border-blue-600', dot: 'bg-amber-400',
    text: 'text-blue-700', hex: '#2563eb', dim: false,
  },
  stopped: {
    label: 'Arrêtée', border: 'border-slate-300', dot: 'bg-slate-400',
    text: 'text-slate-500', hex: '#94a3b8', dim: true,
  },
};

export interface VMNodeData {
  vm: TopologyVM;
  onOpen: (vm: TopologyVM) => void;
  onToggleInternet: (vm: TopologyVM) => void;
  busy?: boolean;
  highlight?: boolean;   // résultat de recherche → clignote
  dimmed?: boolean;      // hors filtre canvas → estompée
  [key: string]: unknown;
}
