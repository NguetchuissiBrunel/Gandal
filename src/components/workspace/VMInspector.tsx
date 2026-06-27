'use client';

import { useEffect, useState } from 'react';
import {
  X, Box, Server, Play, Square, Cpu, MemoryStick, HardDrive, Sparkles,
  Globe, GlobeLock, Power, Tag, Save, Loader2, Trash2, Network, Share2, ExternalLink,
} from 'lucide-react';
import { apiClient, type TopologyVM } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { VM_STATUS } from './types';

interface Props {
  vm: TopologyVM | null;
  onClose: () => void;
  onChanged: () => void;
}

/** Inspecteur de VM : toutes les options du projet pour la VM sélectionnée. */
export default function VMInspector({ vm, onClose, onChanged }: Props) {
  const { toast } = useFeedback();
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [vcpu, setVcpu] = useState(4);
  const [ramGb, setRamGb] = useState(4);
  const [diskGb, setDiskGb] = useState(20);
  const [vramGb, setVramGb] = useState(0);
  const [hostname, setHostname] = useState('');
  const [svcPort, setSvcPort] = useState(8080);
  const [extPort, setExtPort] = useState<number | ''>('');
  const [exposeName, setExposeName] = useState('');
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [domainName, setDomainName] = useState('');
  const [domainPort, setDomainPort] = useState(80);
  const [domainUrl, setDomainUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!vm) return;
    setName(vm.name ?? '');
    setVcpu(vm.maxcpu ?? 4);
    setRamGb(vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : 4);
    setDiskGb(20); setVramGb(0); setHostname('');
  }, [vm]);

  if (!vm) return null;
  const st = VM_STATUS[vm.status];

  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try { await fn(); toast(ok, 'success'); onChanged(); }
    catch (e) { toast(getApiErrorMessage(e), 'danger'); }
    finally { setBusy(null); }
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] backdrop-blur">
      {/* En-tête */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#2a2a2a] px-4 py-3.5">
        <span className={`grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-[#1c1c1c] ${st.text}`}><Box size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-slate-100">{vm.name || `vm-${vm.vmid}`}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
            <Server size={11} className="ml-1" /> {vm.node} · #{vm.vmid}
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-[#1c1c1c] dark:hover:bg-[#1c1c1c]"><X size={18} /></button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Tuiles métriques (résumé) */}
        <div className="grid grid-cols-2 gap-2">
          <Tile label="vCPU" value={String(vm.maxcpu ?? '—')} accent="text-cyan-600 dark:text-cyan-400" />
          <Tile label="Mémoire" value={vm.maxmem ? `${Math.round(vm.maxmem / 1024 / 1024 / 1024)} Go` : '—'} accent="text-sky-600 dark:text-sky-400" />
          <Tile label="VRAM" value={vm.vram_mib ? `${Math.round(vm.vram_mib / 1024)} Go` : '—'} accent="text-emerald-600 dark:text-emerald-400" />
          <Tile label="Statut" value={st.label} accent={st.text} />
        </div>

        {/* Cycle de vie */}
        <Section title="Cycle de vie" icon={<Power size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <Act busy={busy === 'start'} disabled={vm.status === 'up'} tone="emerald" icon={<Play size={14} />} label="Démarrer"
              onClick={() => run('start', () => apiClient.clusterVmAction(vm.vmid, 'start'), 'Démarrage demandé')} />
            <Act busy={busy === 'stop'} disabled={vm.status === 'stopped'} tone="rose" icon={<Square size={14} />} label="Arrêter"
              onClick={() => run('stop', () => apiClient.clusterVmAction(vm.vmid, 'stop'), 'Arrêt demandé')} />
          </div>
        </Section>

        {/* Réseau */}
        <Section title="Réseau & Internet" icon={<Network size={14} />}>
          <BigToggle on={vm.internet} busy={busy === 'inet'}
            onLabel="Connectée à Internet" offLabel="Isolée d'Internet"
            onIcon={<Globe size={15} />} offIcon={<GlobeLock size={15} />}
            onClick={() => run('inet', () => apiClient.setVmInternet(vm.vmid, !vm.internet), vm.internet ? 'VM isolée' : 'VM connectée')} />
          <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500">Les liens VM↔VM se créent en glissant sur la toile.</p>
        </Section>

        {/* Caractéristiques */}
        <Section title="Caractéristiques" icon={<Cpu size={14} />}>
          <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /></Field>
          <Mini icon={<Cpu size={12} />} label="vCPU" value={vcpu} min={2} max={16} onChange={setVcpu} suffix="vCPU" />
          <Mini icon={<MemoryStick size={12} />} label="RAM" value={ramGb} min={1} max={32} onChange={setRamGb} suffix="Go" />
          <Mini icon={<HardDrive size={12} />} label="Disque" value={diskGb} min={10} max={200} step={5} onChange={setDiskGb} suffix="Go" />
          <button disabled={busy === 'reconf'}
            onClick={() => run('reconf', () => apiClient.reconfigureVm(vm.vmid, { name, vcpu_max: vcpu, ram_mib: ramGb * 1024, disk_gib: diskGb }), 'Caractéristiques appliquées')}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/15 py-2 text-[12px] font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 disabled:opacity-40">
            {busy === 'reconf' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Appliquer
          </button>
        </Section>

        {/* GPU */}
        <Section title="GPU (VRAM partagée)" icon={<Sparkles size={14} />}>
          <Mini icon={<Sparkles size={12} />} label="VRAM" value={vramGb} min={0} max={24} onChange={setVramGb} suffix="Go" />
          <button disabled={busy === 'gpu'}
            onClick={() => run('gpu', () => apiClient.setVmGpu(vm.vmid, vramGb * 1024), vramGb > 0 ? `GPU alloué (${vramGb} Go)` : 'GPU retiré')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 py-2 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-40">
            {busy === 'gpu' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {vramGb > 0 ? 'Allouer le GPU' : 'Retirer le GPU'}
          </button>
        </Section>

        {/* DNS */}
        <Section title="DNS (enspy-gi.gandal)" icon={<Tag size={14} />}>
          <div className="flex gap-2">
            <input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder={`omega-${vm.vmid}`} className={inp} />
            <button disabled={busy === 'dns'}
              onClick={() => run('dns', () => apiClient.registerVmDns(vm.vmid, hostname || undefined), 'Entrée DNS enregistrée')}
              className="shrink-0 rounded-lg bg-violet-50 dark:bg-violet-500/15 px-3 text-[12px] text-violet-700 dark:text-violet-300 hover:bg-violet-100 disabled:opacity-40">
              {busy === 'dns' ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
            </button>
          </div>
        </Section>

        {/* Domaine SANS port (reverse proxy) */}
        <Section title="Nom de domaine (sans port)" icon={<Globe size={14} />}>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input value={domainName} onChange={(e) => setDomainName(e.target.value)} placeholder="monapp" className={inp} />
            <label className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">port
              <input type="number" value={domainPort} onChange={(e) => setDomainPort(Number(e.target.value))} className={inp + ' w-16'} /></label>
          </div>
          <button disabled={busy === 'domain' || !domainName}
            onClick={() => run('domain', async () => {
              const r = await apiClient.addDomain(vm.vmid, { hostname: domainName, port: domainPort, enable: true });
              setDomainUrl(r.url);
            }, 'Domaine publié')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-50 dark:bg-violet-500/15 py-2 text-[12px] font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-100 disabled:opacity-40">
            {busy === 'domain' ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Publier sous ce nom
          </button>
          {domainUrl && (
            <a href={domainUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-[#ffffff] px-2 py-1.5 text-[11px] text-violet-700 dark:text-violet-300 hover:underline">
              <ExternalLink size={12} /> {domainUrl}
            </a>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Accès direct par nom, sans port (http://nom.enspy-gi.gandal) depuis le LAN.</p>
        </Section>

        {/* Exposer un service vers le LAN (par port) */}
        <Section title="Exposer un service (par port)" icon={<Share2 size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="mb-1 block text-[10px] text-slate-400 dark:text-slate-500">Port du service (dans la VM)</span>
              <input type="number" value={svcPort} onChange={(e) => setSvcPort(Number(e.target.value))} className={inp} /></label>
            <label className="block"><span className="mb-1 block text-[10px] text-slate-400 dark:text-slate-500">Port externe (vide = même)</span>
              <input type="number" value={extPort} onChange={(e) => setExtPort(e.target.value === '' ? '' : Number(e.target.value))} placeholder={String(svcPort)} className={inp} /></label>
          </div>
          <input value={exposeName} onChange={(e) => setExposeName(e.target.value)} placeholder="nom DNS (optionnel)" className={inp} />
          <button disabled={busy === 'expose'}
            onClick={() => run('expose', async () => {
              const r = await apiClient.exposeService(vm.vmid, { service_port: svcPort, ext_port: extPort === '' ? undefined : Number(extPort), hostname: exposeName || undefined, enable: true });
              setLastUrl(exposeName ? `http://${exposeName}.enspy-gi.gandal:${r.ext_port}` : r.url);
            }, 'Service exposé vers le LAN')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-50 dark:bg-sky-500/15 py-2 text-[12px] font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 disabled:opacity-40">
            {busy === 'expose' ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Publier le service
          </button>
          {lastUrl && (
            <a href={lastUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-[#ffffff] px-2 py-1.5 text-[11px] text-sky-400 hover:underline">
              <ExternalLink size={12} /> {lastUrl}
            </a>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Accessible depuis le LAN (192.168.123.x) via pfSense. Ton PC doit utiliser pfSense comme DNS pour l'accès par nom.</p>
        </Section>

        {/* Disponibilité */}
        <Section title="Disponibilité" icon={<Power size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <Act busy={busy === 'auto1'} tone="emerald" icon={<Power size={14} />} label="Always-on"
              onClick={() => run('auto1', () => apiClient.setVmAutostart(vm.vmid, true), 'Always-on activé')} />
            <Act busy={busy === 'auto0'} tone="slate" icon={<Power size={14} />} label="Désactiver"
              onClick={() => run('auto0', () => apiClient.setVmAutostart(vm.vmid, false), 'Always-on désactivé')} />
          </div>
        </Section>
      </div>

      {/* Pied : suppression */}
      <div className="border-t border-slate-200 dark:border-[#2a2a2a] px-4 py-3">
        <button disabled={busy === 'del'}
          onClick={() => { if (confirm(`Supprimer définitivement ${vm.name || vm.vmid} ?`)) run('del', () => apiClient.deleteClusterVm(vm.vmid), 'VM supprimée'); }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 py-2 text-[12px] font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:bg-rose-500/15 disabled:opacity-40">
          {busy === 'del' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer la VM
        </button>
      </div>
    </aside>
  );
}

const inp = 'w-full rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 py-1.5 text-[12px] text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500';

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2a2a2a] dark:bg-[#0a0a0a]">
      <div className="mb-1 text-[10.5px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`font-mono text-[17px] font-semibold leading-none ${accent}`}>{value}</div>
    </div>
  );
}
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#0a0a0a] p-3">
      <h4 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500">{icon} {title}</h4>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">{label}</span>{children}</label>;
}
function Mini({ icon, label, value, min, max, step = 1, onChange, suffix }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span className="font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">{value} {suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-cyan-500" />
    </div>
  );
}
function Act({ busy, disabled, tone, icon, label, onClick }: {
  busy?: boolean; disabled?: boolean; tone: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  const t: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100',
    rose: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-100',
    slate: 'bg-slate-100 dark:bg-[#1c1c1c] text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2a2a2a]',
  };
  return (
    <button disabled={busy || disabled} onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium disabled:opacity-30 ${t[tone]}`}>
      {busy ? <Loader2 size={13} className="animate-spin" /> : icon} {label}
    </button>
  );
}
function BigToggle({ on, busy, onLabel, offLabel, onIcon, offIcon, onClick }: {
  on: boolean; busy?: boolean; onLabel: string; offLabel: string; onIcon: React.ReactNode; offIcon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button disabled={busy} onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[12px] font-medium ${on ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'bg-slate-100 dark:bg-[#1c1c1c] text-slate-600 dark:text-slate-400 dark:text-slate-500'} hover:opacity-90 disabled:opacity-40`}>
      <span className="flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : on ? onIcon : offIcon} {on ? onLabel : offLabel}</span>
      <span className={`h-4 w-7 rounded-full p-0.5 ${on ? 'bg-sky-500' : 'bg-slate-300'}`}>
        <span className={`block h-3 w-3 rounded-full bg-white dark:bg-[#141414] transition-transform ${on ? 'translate-x-3' : ''}`} />
      </span>
    </button>
  );
}
