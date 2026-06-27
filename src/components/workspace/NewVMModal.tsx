'use client';

import { useState } from 'react';
import { X, Box, Cpu, MemoryStick, HardDrive, Sparkles, Globe, Power, Loader2, Plus } from 'lucide-react';

export interface NewVMValues {
  name: string;
  vcpu: number;
  ram_gb: number;
  disk_gb: number;
  vram_gb: number;
  internet: boolean;
  autostart: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (v: NewVMValues) => Promise<void>;
}

/**
 * Pop-up de création d'une VM (déclenché par « + »). Pas de choix d'OS : le projet
 * impose son image (Debian/omega préparée). Caractéristiques par sliders + options.
 */
export default function NewVMModal({ open, onClose, onCreate }: Props) {
  const [v, setV] = useState<NewVMValues>({
    name: '', vcpu: 4, ram_gb: 4, disk_gb: 20, vram_gb: 0, internet: false, autostart: false,
  });
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await onCreate(v);
      setV({ name: '', vcpu: 4, ram_gb: 4, disk_gb: 20, vram_gb: 0, internet: false, autostart: false });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
            <Box size={20} />
          </span>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Nouvelle machine virtuelle</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">Image Debian/omega · provisionnée sur le cluster</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-[#1c1c1c] dark:hover:bg-[#1c1c1c] hover:text-slate-800 dark:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-400 dark:text-slate-500">Nom (optionnel)</span>
            <input
              value={v.name}
              onChange={(e) => setV({ ...v, name: e.target.value })}
              placeholder="omega-vm"
              className="w-full rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500"
            />
          </label>

          <Slider icon={<Cpu size={14} />} label="vCPU (plafond)" value={v.vcpu} min={2} max={16}
            onChange={(n) => setV({ ...v, vcpu: n })} suffix="vCPU" />
          <Slider icon={<MemoryStick size={14} />} label="RAM" value={v.ram_gb} min={1} max={32}
            onChange={(n) => setV({ ...v, ram_gb: n })} suffix="Go" />
          <Slider icon={<HardDrive size={14} />} label="Disque" value={v.disk_gb} min={10} max={200} step={5}
            onChange={(n) => setV({ ...v, disk_gb: n })} suffix="Go" />
          <Slider icon={<Sparkles size={14} />} label="GPU (VRAM)" value={v.vram_gb} min={0} max={24}
            onChange={(n) => setV({ ...v, vram_gb: n })} suffix="Go" hint="0 = pas de GPU" />

          <div className="flex gap-2 pt-1">
            <Toggle icon={<Globe size={14} />} label="Internet" on={v.internet}
              onClick={() => setV({ ...v, internet: !v.internet })} />
            <Toggle icon={<Power size={14} />} label="Always-on" on={v.autostart}
              onClick={() => setV({ ...v, autostart: !v.autostart })} />
          </div>
        </div>

        {/* Pied */}
        <div className="flex gap-2 border-t border-slate-200 dark:border-[#2a2a2a] px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 dark:border-[#2a2a2a] py-2 text-[13px] text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-[#1c1c1c] dark:hover:bg-[#1c1c1c]">
            Annuler
          </button>
          <button onClick={submit} disabled={busy}
            className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2 text-[13px] font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Créer la VM
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ icon, label, value, min, max, step = 1, onChange, suffix, hint }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; suffix: string; hint?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">{icon} {label}</span>
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{value} {suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500" />
      {hint && <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function Toggle({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-1 items-center justify-between rounded-lg border px-3 py-2 text-[12px] transition-colors ${
        on ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300' : 'border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] text-slate-400 dark:text-slate-500'
      }`}>
      <span className="flex items-center gap-1.5">{icon} {label}</span>
      <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${on ? 'bg-cyan-500' : 'bg-slate-300'}`}>
        <span className={`block h-3 w-3 rounded-full bg-white dark:bg-[#141414] transition-transform ${on ? 'translate-x-3' : ''}`} />
      </span>
    </button>
  );
}
