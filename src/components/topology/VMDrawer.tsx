'use client';

import { useEffect, useState } from 'react';
import {
  X, Cpu, MemoryStick, HardDrive, Sparkles, Globe, GlobeLock, Power,
  Play, Square, Pause, Server, Save, Loader2, Network, Tag,
} from 'lucide-react';
import { apiClient, type TopologyVM } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';
import { STATUS_META } from './types';

interface Props {
  vm: TopologyVM | null;
  canControl?: boolean;
  onClose: () => void;
  onChanged: () => void;
}

/**
 * Panneau latéral de gestion COMPLÈTE d'une VM : toutes les capacités du projet
 * Omega exposées en un endroit — caractéristiques (vCPU/RAM/disque), GPU, Internet,
 * DNS, always-on, cycle de vie.
 */
export default function VMDrawer({ vm, canControl = true, onClose, onChanged }: Props) {
  const { toast } = useFeedback();
  const [busy, setBusy] = useState<string | null>(null);

  // Formulaire caractéristiques
  const [name, setName] = useState('');
  const [vcpu, setVcpu] = useState(4);
  const [ramGb, setRamGb] = useState(6);
  const [diskGb, setDiskGb] = useState(20);
  const [vramGb, setVramGb] = useState(0);
  const [hostname, setHostname] = useState('');

  useEffect(() => {
    if (!vm) return;
    setName(vm.name ?? '');
    setVcpu(vm.maxcpu ?? 4);
    setRamGb(vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024 / 1024) : 6);
    setDiskGb(20);
    setVramGb(0);
    setHostname('');
  }, [vm]);

  if (!vm) return null;
  const meta = STATUS_META[vm.status];

  const run = async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(key);
    try {
      await fn();
      toast(okMsg, 'success');
      onChanged();
    } catch (e) {
      toast(getApiErrorMessage(e), 'danger');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-950/95 p-5 shadow-2xl animate-[fade-in_0.2s_ease-out]">
        {/* En-tête */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
            <div>
              <h3 className="text-base font-semibold text-slate-100">{vm.name || `vm-${vm.vmid}`}</h3>
              <p className="text-[12px] text-slate-500">
                VMID {vm.vmid} · <Server size={11} className="inline" /> {vm.node} · <span className={meta.text}>{meta.label}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Cycle de vie */}
          {canControl && (
            <Section icon={<Power size={15} />} title="Cycle de vie">
              <div className="flex gap-2">
                <ActBtn busy={busy === 'start'} disabled={vm.status === 'up'} onClick={() => run('start', () => apiClient.clusterVmAction(vm.vmid, 'start'), 'Démarrage demandé')} tone="emerald" icon={<Play size={14} />} label="Démarrer" />
                <ActBtn busy={busy === 'stop'} disabled={vm.status === 'stopped'} onClick={() => run('stop', () => apiClient.clusterVmAction(vm.vmid, 'stop'), 'Arrêt demandé')} tone="rose" icon={<Square size={14} />} label="Arrêter" />
              </div>
            </Section>
          )}

          {/* Caractéristiques */}
          <Section icon={<Cpu size={15} />} title="Caractéristiques">
            <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
            <SliderField icon={<Cpu size={13} />} label="vCPU (plafond)" value={vcpu} min={2} max={16} onChange={setVcpu} suffix="vCPU" />
            <SliderField icon={<MemoryStick size={13} />} label="RAM" value={ramGb} min={1} max={64} onChange={setRamGb} suffix="Go" />
            <SliderField icon={<HardDrive size={13} />} label="Disque (agrandir)" value={diskGb} min={10} max={500} step={5} onChange={setDiskGb} suffix="Go" />
            <button
              disabled={busy === 'reconf'}
              onClick={() => run('reconf', () => apiClient.reconfigureVm(vm.vmid, {
                name, vcpu_max: vcpu, ram_mib: ramGb * 1024, disk_gib: diskGb,
              }), 'Caractéristiques appliquées')}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/20 py-2 text-[13px] font-medium text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40"
            >
              {busy === 'reconf' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Appliquer
            </button>
          </Section>

          {/* GPU */}
          <Section icon={<Sparkles size={15} />} title="GPU (VRAM partagée)">
            <SliderField icon={<Sparkles size={13} />} label="VRAM allouée" value={vramGb} min={0} max={24} onChange={setVramGb} suffix="Go" />
            <p className="mb-2 text-[11px] text-slate-500">0 = pas de GPU. Le GPU est partagé via le proxy Omega (pas de passthrough).</p>
            <button
              disabled={busy === 'gpu'}
              onClick={() => run('gpu', () => apiClient.setVmGpu(vm.vmid, vramGb * 1024), vramGb > 0 ? `GPU alloué (${vramGb} Go)` : 'GPU retiré')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-2 text-[13px] font-medium text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40"
            >
              {busy === 'gpu' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {vramGb > 0 ? 'Allouer le GPU' : 'Retirer le GPU'}
            </button>
          </Section>

          {/* Réseau & Internet */}
          <Section icon={<Network size={15} />} title="Réseau">
            <Toggle
              on={vm.internet}
              busy={busy === 'inet'}
              onIcon={<Globe size={15} />} offIcon={<GlobeLock size={15} />}
              onLabel="Connectée à Internet" offLabel="Isolée d'Internet"
              onClick={() => run('inet', () => apiClient.setVmInternet(vm.vmid, !vm.internet), vm.internet ? 'VM isolée' : 'VM connectée à Internet')}
            />
            <p className="text-[11px] text-slate-500">Les liens VM↔VM se créent en glissant sur la toile.</p>
          </Section>

          {/* DNS */}
          <Section icon={<Tag size={15} />} title="DNS (enspy-gi.gandal)">
            <div className="flex gap-2">
              <input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder={`omega-${vm.vmid}`} className={inputCls} />
              <button
                disabled={busy === 'dns'}
                onClick={() => run('dns', () => apiClient.registerVmDns(vm.vmid, hostname || undefined), 'Entrée DNS enregistrée')}
                className="shrink-0 rounded-xl bg-violet-500/20 px-3 text-[13px] text-violet-200 hover:bg-violet-500/30 disabled:opacity-40"
              >
                {busy === 'dns' ? <Loader2 size={15} className="animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </Section>

          {/* Always-on */}
          <Section icon={<Power size={15} />} title="Disponibilité">
            <div className="flex gap-2">
              <ActBtn busy={busy === 'auto-on'} onClick={() => run('auto-on', () => apiClient.setVmAutostart(vm.vmid, true), 'Always-on activé')} tone="emerald" icon={<Power size={14} />} label="Always-on" />
              <ActBtn busy={busy === 'auto-off'} onClick={() => run('auto-off', () => apiClient.setVmAutostart(vm.vmid, false), 'Always-on désactivé')} tone="slate" icon={<Pause size={14} />} label="Désactiver" />
            </div>
          </Section>
        </div>
      </aside>
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[13px] text-slate-100 outline-none focus:border-cyan-500';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-200">{icon} {title}</h4>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function SliderField({ icon, label, value, min, max, step = 1, onChange, suffix }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; suffix: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">{icon} {label}</span>
        <span className="font-mono text-slate-200">{value} {suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500" />
    </div>
  );
}

function ActBtn({ busy, disabled, onClick, tone, icon, label }: {
  busy?: boolean; disabled?: boolean; onClick: () => void; tone: string; icon: React.ReactNode; label: string;
}) {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
    rose: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25',
    slate: 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/60',
  };
  return (
    <button disabled={busy || disabled} onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-medium disabled:opacity-30 ${tones[tone]}`}>
      {busy ? <Loader2 size={14} className="animate-spin" /> : icon} {label}
    </button>
  );
}

function Toggle({ on, busy, onIcon, offIcon, onLabel, offLabel, onClick }: {
  on: boolean; busy?: boolean; onIcon: React.ReactNode; offIcon: React.ReactNode;
  onLabel: string; offLabel: string; onClick: () => void;
}) {
  return (
    <button disabled={busy} onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium ${on ? 'bg-sky-500/15 text-sky-200' : 'bg-slate-800/60 text-slate-300'} hover:opacity-90 disabled:opacity-40`}>
      <span className="flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : on ? onIcon : offIcon} {on ? onLabel : offLabel}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${on ? 'bg-sky-500' : 'bg-slate-600'}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}
