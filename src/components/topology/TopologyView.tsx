'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Network, Table2, LayoutGrid, RefreshCw, Loader2, Wifi } from 'lucide-react';
import { apiClient, type ClusterTopology, type TopologyVM } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import dynamic from 'next/dynamic';
import VMTable from './VMTable';
import VMCards from './VMCards';
import DistributionPanel from './DistributionPanel';
import GpuPanel from './GpuPanel';
import MigrationsPanel from './MigrationsPanel';
import VMDrawer from './VMDrawer';
import type { DisplayMode } from './types';

// La toile React Flow est lourde → chargée côté client uniquement.
const TopologyCanvas = dynamic(() => import('./TopologyCanvas'), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

/** Seuil au-delà duquel on DEMANDE à l'utilisateur le mode d'affichage. */
const LONG_LIST_THRESHOLD = 24;

interface Props {
  /** L'admin/enseignant peut piloter le cycle de vie ; l'étudiant aussi sur ses VMs. */
  canControlLifecycle?: boolean;
  /** Affiche le bandeau de distribution (admin). */
  showDistribution?: boolean;
}

export default function TopologyView({ canControlLifecycle = true, showDistribution = false }: Props) {
  const { toast } = useFeedback();
  const [topology, setTopology] = useState<ClusterTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DisplayMode>('graph');
  const [busyVmid, setBusyVmid] = useState<number | null>(null);
  const [askedForMode, setAskedForMode] = useState(false);
  const [selectedVm, setSelectedVm] = useState<TopologyVM | null>(null);
  const modeChosen = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.getTopology();
      setTopology(data);
      // Longue liste + mode pas encore choisi → on propose un choix.
      if (!modeChosen.current && data.vms.length > LONG_LIST_THRESHOLD) {
        setAskedForMode(true);
      }
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Rafraîchissement doux périodique (état live).
  useEffect(() => {
    const t = setInterval(() => load(true), 12000);
    return () => clearInterval(t);
  }, [load]);

  const chooseMode = (m: DisplayMode) => {
    modeChosen.current = true;
    setMode(m);
    setAskedForMode(false);
  };

  const toggleInternet = useCallback(async (vm: TopologyVM) => {
    setBusyVmid(vm.vmid);
    try {
      await apiClient.setVmInternet(vm.vmid, !vm.internet);
      toast(
        !vm.internet ? `${vm.name ?? vm.vmid} connectée à Internet` : `${vm.name ?? vm.vmid} isolée`,
        'success',
      );
      await load(true);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setBusyVmid(null);
    }
  }, [load, toast]);

  const link = useCallback(async (a: number, b: number) => {
    try {
      await apiClient.networkLink([a, b], true);
      toast(`Lien réseau créé entre ${a} et ${b}`, 'success');
      await load(true);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    }
  }, [load, toast]);

  const unlink = useCallback(async (a: number, b: number) => {
    try {
      await apiClient.networkLink([a, b], false);
      toast(`Lien réseau supprimé entre ${a} et ${b}`, 'success');
      await load(true);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    }
  }, [load, toast]);

  const lifecycle = useCallback(async (vm: TopologyVM, action: 'start' | 'stop') => {
    setBusyVmid(vm.vmid);
    try {
      await apiClient.clusterVmAction(vm.vmid, action);
      toast(`${vm.name ?? vm.vmid} : ${action === 'start' ? 'démarrage' : 'arrêt'} demandé`, 'success');
      await load(true);
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setBusyVmid(null);
    }
  }, [load, toast]);

  const vms = topology?.vms ?? [];
  const stats = useMemo(() => ({
    total: vms.length,
    up: vms.filter((v) => v.status === 'up').length,
    internet: vms.filter((v) => v.internet).length,
  }), [vms]);

  if (loading && !topology) return <CanvasSkeleton />;

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[560px] flex-col gap-3">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Network className="text-cyan-400" size={20} />
          <h2 className="text-lg font-semibold text-slate-100">Topologie du cluster</h2>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-slate-400">
          <Stat label="VMs" value={stats.total} />
          <Stat label="actives" value={stats.up} tone="emerald" />
          <Stat label="sur Internet" value={stats.internet} tone="sky" icon={<Wifi size={12} />} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ModeSwitcher mode={mode} onChange={chooseMode} />
          <button
            onClick={() => load()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-[13px] text-slate-300 hover:bg-slate-700/60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {/* Plan de contrôle admin : distribution 1/2/2 + GPU + migrations */}
      {showDistribution && (
        <div className="space-y-3">
          <DistributionPanel />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <GpuPanel />
            <MigrationsPanel />
          </div>
        </div>
      )}

      {/* Choix d'affichage pour longue liste */}
      {askedForMode && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
          <span className="text-[13px] text-amber-200">
            {vms.length} VMs détectées — quel affichage préférez-vous ?
          </span>
          <div className="flex gap-2">
            <ChoiceBtn onClick={() => chooseMode('graph')} icon={<Network size={14} />} label="Toile" />
            <ChoiceBtn onClick={() => chooseMode('cards')} icon={<LayoutGrid size={14} />} label="Cartes" />
            <ChoiceBtn onClick={() => chooseMode('table')} icon={<Table2 size={14} />} label="Tableau" />
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
        {mode === 'graph' && topology && (
          <TopologyCanvas
            topology={topology}
            onToggleInternet={toggleInternet}
            onLink={link}
            onUnlink={unlink}
            onLifecycle={canControlLifecycle ? lifecycle : undefined}
            onSelectVm={setSelectedVm}
            busyVmid={busyVmid}
          />
        )}
        {mode !== 'graph' && (
          <div className="h-full overflow-auto p-3">
            {mode === 'table' ? (
              <VMTable vms={vms} onToggleInternet={toggleInternet}
                onLifecycle={canControlLifecycle ? lifecycle : undefined}
                onSelect={setSelectedVm} busyVmid={busyVmid} />
            ) : (
              <VMCards vms={vms} onToggleInternet={toggleInternet}
                onLifecycle={canControlLifecycle ? lifecycle : undefined}
                onSelect={setSelectedVm} busyVmid={busyVmid} />
            )}
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Astuce : cliquez une VM pour la <span className="text-cyan-400">gérer</span> (caractéristiques, GPU, DNS…) ·
        glissez d'une VM à une autre pour les relier · glissez vers le nuage pour ouvrir Internet.
      </p>

      <VMDrawer
        vm={selectedVm}
        canControl={canControlLifecycle}
        onClose={() => setSelectedVm(null)}
        onChanged={() => load(true)}
      />
    </div>
  );
}

function ModeSwitcher({ mode, onChange }: { mode: DisplayMode; onChange: (m: DisplayMode) => void }) {
  const items: { id: DisplayMode; icon: React.ReactNode; label: string }[] = [
    { id: 'graph', icon: <Network size={15} />, label: 'Toile' },
    { id: 'cards', icon: <LayoutGrid size={15} />, label: 'Cartes' },
    { id: 'table', icon: <Table2 size={15} />, label: 'Tableau' },
  ];
  return (
    <div className="flex rounded-xl border border-slate-700 bg-slate-800/60 p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
            mode === it.id ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
          }`}
          title={it.label}
        >
          {it.icon}<span className="hidden sm:inline">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function ChoiceBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[13px] text-amber-100 hover:bg-amber-400/20">
      {icon}{label}
    </button>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: number; tone?: string; icon?: React.ReactNode }) {
  const c = tone === 'emerald' ? 'text-emerald-300' : tone === 'sky' ? 'text-sky-300' : 'text-slate-200';
  return (
    <span className="flex items-center gap-1">
      {icon}<span className={`font-semibold ${c}`}>{value}</span> {label}
    </span>
  );
}

function CanvasSkeleton() {
  return (
    <div className="flex h-[560px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-cyan-400" size={28} />
        <span className="text-sm">Chargement de la topologie…</span>
      </div>
    </div>
  );
}
