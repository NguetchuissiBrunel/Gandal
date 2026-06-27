'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus, RefreshCw, LogOut, Boxes, Wifi, Activity, LayoutDashboard, X,
  Loader2, Network as NetworkIcon, FileText, Users, BookOpen, Globe,
  Search, Sun, Moon,
} from 'lucide-react';
import { useTheme } from './useTheme';
import { apiClient, type ClusterTopology, type TopologyVM } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import VMInspector from './VMInspector';
import NewVMModal, { type NewVMValues } from './NewVMModal';
import DistributionPanel from '@/components/topology/DistributionPanel';
import GpuPanel from '@/components/topology/GpuPanel';
import MigrationsPanel from '@/components/topology/MigrationsPanel';
import RequestsView from './management/RequestsView';
import UsersView from './management/UsersView';
import PublicationsView from './management/PublicationsView';
import DnsView from './management/DnsView';

type WsView = 'flow' | 'requests' | 'users' | 'publications' | 'dns';

const FlowCanvas = dynamic(() => import('./FlowCanvas'), { ssr: false, loading: () => <CanvasLoader /> });

interface Props {
  role: 'student' | 'teacher' | 'admin';
  username: string;
  onLogout: () => void;
}

/**
 * Espace de travail canvas-first (style n8n / Postman flows). Surface unique :
 * toile de nœuds (VMs + routeur Internet), création par « + », inspecteur d'actions,
 * et panneaux cluster (admin). Tout est branché sur l'API réelle.
 */
export default function Workspace({ role, username, onLogout }: Props) {
  const { toast } = useFeedback();
  const isAdmin = role === 'admin' || role === 'teacher';
  const [topology, setTopology] = useState<ClusterTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TopologyVM | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showCluster, setShowCluster] = useState(false);
  const [busyVmid, setBusyVmid] = useState<number | null>(null);
  const [view, setView] = useState<WsView>('flow');
  const { theme, toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [gpuUtil, setGpuUtil] = useState<number | null>(null);
  const [pendingReq, setPendingReq] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped' | 'gpu'>('all');

  // Santé GPU + demandes en attente (pour la sidebar). Léger, rafraîchi en fond.
  const loadAux = useCallback(async () => {
    try {
      const g = await apiClient.getGpu();
      const u = (g.gpus || []).map((x) => x.util_pct).filter((n): n is number => typeof n === 'number');
      setGpuUtil(u.length ? Math.round(u.reduce((a, b) => a + b, 0) / u.length) : null);
    } catch { /* ignore */ }
    try {
      const r = await apiClient.getRequests({ size: 100 });
      setPendingReq(r.items.filter((x: { status?: string }) => ['pending', 'waiting'].includes((x.status || '').toLowerCase())).length);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { loadAux(); const t = setInterval(loadAux, 15000); return () => clearInterval(t); }, [loadAux]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.getTopology();
      setTopology(data);
      // garde l'inspecteur à jour
      setSelected((cur) => (cur ? data.vms.find((v) => v.vmid === cur.vmid) ?? null : cur));
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const toggleInternet = useCallback(async (vm: TopologyVM) => {
    setBusyVmid(vm.vmid);
    try {
      await apiClient.setVmInternet(vm.vmid, !vm.internet);
      toast(!vm.internet ? `${vm.name ?? vm.vmid} connectée à Internet` : `${vm.name ?? vm.vmid} isolée`, 'success');
      await load(true);
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusyVmid(null); }
  }, [load, toast]);

  const link = useCallback(async (a: number, b: number) => {
    try { await apiClient.networkLink([a, b], true); toast(`Lien réseau créé (${a} ↔ ${b})`, 'success'); await load(true); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  }, [load, toast]);

  const unlink = useCallback(async (a: number, b: number) => {
    try { await apiClient.networkLink([a, b], false); toast(`Lien réseau supprimé (${a} ↔ ${b})`, 'success'); await load(true); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  }, [load, toast]);

  const linkGroup = useCallback(async (vmids: number[], enable: boolean) => {
    try {
      await apiClient.networkLink(vmids, enable);
      toast(enable ? `${vmids.length} VMs reliées en réseau` : `${vmids.length} VMs isolées`, 'success');
      await load(true);
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); }
  }, [load, toast]);

  const createVm = useCallback(async (v: NewVMValues) => {
    try {
      await apiClient.createClusterVm({
        name: v.name || undefined, vcpu: v.vcpu, ram_gb: v.ram_gb, disk_gb: v.disk_gb,
        vram_gb: v.vram_gb, internet: v.internet, autostart: v.autostart,
      });
      toast('VM en cours de création — elle apparaîtra dans la toile', 'success');
      setTimeout(() => load(true), 3000);
    } catch (e) { toast(getApiErrorMessage(e), 'danger'); throw e; }
  }, [load, toast]);

  const vms = topology?.vms ?? [];
  const stats = useMemo(() => ({
    total: vms.length, up: vms.filter((v) => v.status === 'up').length, net: vms.filter((v) => v.internet).length,
  }), [vms]);

  // Recherche par nom OU id de VM → ensemble des VMs trouvées (qui clignoteront).
  const highlightVmids = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<number>();
    return new Set(vms.filter((v) =>
      String(v.vmid).includes(q) || (v.name ?? '').toLowerCase().includes(q) || (v.ip ?? '').includes(q),
    ).map((v) => v.vmid));
  }, [query, vms]);

  // Filtre canvas : estompe les VMs qui ne correspondent pas (sans les retirer → positions/drag préservés).
  const matchesFilter = useCallback((v: TopologyVM) => {
    if (filter === 'active') return v.status === 'up';
    if (filter === 'stopped') return v.status !== 'up';
    if (filter === 'gpu') return (v.vram_mib ?? 0) > 0;
    return true;
  }, [filter]);
  const dimVmids = useMemo(
    () => (filter === 'all' ? new Set<number>() : new Set(vms.filter((v) => !matchesFilter(v)).map((v) => v.vmid))),
    [filter, vms, matchesFilter],
  );
  const filterCounts = useMemo(() => ({
    all: vms.length,
    active: vms.filter((v) => v.status === 'up').length,
    stopped: vms.filter((v) => v.status !== 'up').length,
    gpu: vms.filter((v) => (v.vram_mib ?? 0) > 0).length,
  }), [vms]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0a0a0a] dark:text-slate-100">
      {/* Barre supérieure */}
      <header className="z-20 flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-[#1c1c1c] dark:bg-[#0d0d0f]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <Boxes size={19} />
          </span>
          <div>
            <p className="text-[14px] font-bold leading-none">GANDAL <span className="text-cyan-600">Flow</span></p>
            <p className="text-[10px] text-slate-400">plan de contrôle Omega</p>
          </div>
        </div>

        {/* Recherche VM (nom / id / ip) */}
        <div className="relative ml-2 w-64">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une VM (nom, id, IP)…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-[12px] text-slate-700 outline-none focus:border-cyan-500 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-slate-200"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
          {query && (
            <span className="absolute -bottom-5 left-1 text-[10px] text-amber-600">
              {highlightVmids.size} VM{highlightVmids.size > 1 ? 's' : ''} trouvée{highlightVmids.size > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="ml-2 flex items-center gap-3 text-[12px] text-slate-500">
          <Stat icon={<Boxes size={13} />} value={stats.total} label="VMs" />
          <Stat icon={<Activity size={13} />} value={stats.up} label="actives" tone="text-emerald-600" />
          <Stat icon={<Wifi size={13} />} value={stats.net} label="en ligne" tone="text-sky-600" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-medium text-emerald-700 md:flex dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
            {stats.up > 0 ? 'Cluster sain' : 'Cluster au repos'}
          </div>
          <button onClick={toggleTheme} title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-slate-300 dark:hover:bg-[#1c1c1c]">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAdmin && (
            <button onClick={() => setShowCluster((s) => !s)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] ${showCluster ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-slate-300 dark:hover:bg-[#1c1c1c]'}`}>
              <LayoutDashboard size={14} /> Cluster
            </button>
          )}
          <button onClick={() => load()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-slate-300 dark:hover:bg-[#1c1c1c]">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-cyan-500">
            <Plus size={15} /> Nouvelle VM
          </button>
          <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-[#2a2a2a]">
            <div className="text-right">
              <p className="text-[12px] font-medium leading-none">{username}</p>
              <p className="text-[10px] uppercase text-slate-400">{role}</p>
            </div>
            <button onClick={onLogout} title="Déconnexion" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-[#1c1c1c]">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Corps : barre latérale + contenu */}
      <div className="relative flex min-h-0 flex-1">
        {/* Barre latérale « Plan de contrôle » */}
        <nav className="flex w-52 shrink-0 flex-col gap-0.5 border-r border-slate-200 bg-white px-2.5 py-3 dark:border-[#1c1c1c] dark:bg-[#0d0d0f]">
          <p className="px-2.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Plan de contrôle</p>
          <SideItem icon={<NetworkIcon size={17} />} label="Topologie" active={view === 'flow'} onClick={() => setView('flow')} />
          <SideItem icon={<FileText size={17} />} label="Demandes" active={view === 'requests'} onClick={() => setView('requests')} badge={pendingReq || undefined} />
          {isAdmin && <SideItem icon={<Users size={17} />} label="Utilisateurs" active={view === 'users'} onClick={() => setView('users')} />}
          <SideItem icon={<BookOpen size={17} />} label="Publications" active={view === 'publications'} onClick={() => setView('publications')} />
          <SideItem icon={<Globe size={17} />} label="DNS & domaines" active={view === 'dns'} onClick={() => setView('dns')} />

          <div className="flex-1" />

          {/* Santé cluster */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2a2a2a] dark:bg-[#111113]">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Charge cluster</span>
              <span className="font-mono text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">{stats.total ? Math.round((stats.up / stats.total) * 100) : 0}%</span>
            </div>
            <Bar label="VMs" pct={stats.total ? Math.round((stats.up / stats.total) * 100) : 0} display={`${stats.up}/${stats.total}`} color="bg-cyan-500" />
            <Bar label="Net" pct={stats.total ? Math.round((stats.net / stats.total) * 100) : 0} display={`${stats.net}`} color="bg-sky-500" />
            <Bar label="GPU" pct={gpuUtil ?? 0} display={gpuUtil != null ? `${gpuUtil}%` : '—'} color="bg-emerald-500" />
          </div>
        </nav>

        {/* Contenu selon la vue */}
        {view === 'flow' ? (
          <>
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Barre d'outils du canvas : titre · compteur · filtres */}
              <div className="z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2 dark:border-[#1c1c1c] dark:bg-[#0d0d0f]">
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Topologie réseau</span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{stats.total} VMs · {stats.up} actives</span>
                <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-[#2a2a2a] dark:bg-[#141414]">
                  {([['all', 'Tous'], ['active', 'Actives'], ['stopped', 'Arrêtées'], ['gpu', 'GPU']] as const).map(([k, lbl]) => (
                    <button key={k} onClick={() => setFilter(k)}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                        filter === k ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1c1c1c]'
                      }`}>
                      {lbl} <span className={`font-mono text-[10px] ${filter === k ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>{filterCounts[k]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative min-h-0 flex-1">
              {loading && !topology ? <CanvasLoader /> : topology && (
                <FlowCanvas
                  topology={topology}
                  onOpen={setSelected}
                  onToggleInternet={toggleInternet}
                  onLink={link}
                  onUnlink={unlink}
                  onLinkGroup={linkGroup}
                  busyVmid={busyVmid}
                  theme={theme}
                  highlightVmids={highlightVmids}
                  dimVmids={dimVmids}
                />
              )}
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-[11px] text-slate-500 shadow-sm backdrop-blur dark:border-[#2a2a2a] dark:bg-[#141414]/90 dark:text-slate-400">
                Tirer d'un point <span className="text-cyan-600">●</span> d'une VM vers une autre = <span className="text-cyan-600">lien réseau</span> · vers le <span className="text-sky-600">routeur</span> = Internet · <kbd className="rounded bg-slate-100 border border-slate-200 px-1">Maj</kbd>+clic plusieurs VMs = relier <span className="text-cyan-600">en groupe (3+)</span> · cliquer une flèche = déconnecter
              </div>
              {showCluster && isAdmin && (
                <div className="absolute right-3 top-3 z-10 w-[420px] max-w-[calc(100%-1.5rem)] space-y-3">
                  <div className="flex justify-end">
                    <button onClick={() => setShowCluster(false)} className="rounded-lg bg-white border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 dark:bg-[#141414] dark:border-[#2a2a2a]"><X size={15} /></button>
                  </div>
                  <DistributionPanel />
                  <GpuPanel />
                  <MigrationsPanel />
                </div>
              )}
              </div>
            </div>
            {selected && <VMInspector vm={selected} onClose={() => setSelected(null)} onChanged={() => load(true)} />}
          </>
        ) : (
          <div className="min-w-0 flex-1">
            {view === 'requests' && <RequestsView role={role} />}
            {view === 'users' && isAdmin && <UsersView />}
            {view === 'publications' && <PublicationsView />}
            {view === 'dns' && <DnsView vms={vms} />}
          </div>
        )}
      </div>

      <NewVMModal open={showNew} onClose={() => setShowNew(false)} onCreate={createVm} />
    </div>
  );
}

function SideItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
        active ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-[#1c1c1c] dark:hover:text-slate-200'
      }`}>
      <span className={active ? 'text-cyan-600 dark:text-cyan-300' : ''}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10.5px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{badge}</span> : null}
    </button>
  );
}

function Bar({ label, pct, display, color }: { label: string; pct: number; display: string; color: string }) {
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className="w-7 font-mono text-[10px] text-slate-400 dark:text-slate-500">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#2a2a2a]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <span className="w-9 text-right font-mono text-[10px] text-slate-500 dark:text-slate-400">{display}</span>
    </div>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone?: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-slate-400">{icon}</span>
      <span className={`font-semibold ${tone ?? 'text-slate-700'}`}>{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function CanvasLoader() {
  return (
    <div className="grid h-full w-full place-items-center bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-cyan-600" size={30} />
        <span className="text-sm">Chargement de la toile…</span>
      </div>
    </div>
  );
}
