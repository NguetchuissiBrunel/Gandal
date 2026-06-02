'use client';

import { useState } from 'react';
import { Play, Server, Cpu, HardDrive, Layers, Globe, CheckCircle2, Trash2 } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { DeployedVm, ShowToastFn } from './types';

interface InstantiationTabProps {
  showToast: ShowToastFn;
  onVmCreated: (vm: DeployedVm) => void;
  teacherName: string;
  deployedVms: DeployedVm[];
  onDeleteVm: (id: string) => void;
}

export default function InstantiationTab({
  showToast,
  onVmCreated,
  teacherName,
  deployedVms,
  onDeleteVm,
}: InstantiationTabProps) {
  const [size_RAM, setSize_RAM] = useState('4');
  const [size_ROM, setSize_ROM] = useState('80');
  const [N_CPU, setN_CPU] = useState('2');
  const [ISO_image, setISO_image] = useState('Ubuntu Server 24.04 LTS');
  const [mode, setMode] = useState('Isolé');
  const [SSH_Public_Key, setSSH_Public_Key] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ip = `20.20.20.${19 + deployedVms.length}`;

    const newVm: DeployedVm = {
      id: `vm-${Date.now()}`,
      nom: `VM — ${ISO_image} · ${N_CPU} CPU / ${size_RAM} Go RAM`,
      iso: ISO_image,
      ram: size_RAM,
      rom: size_ROM,
      cpu: N_CPU,
      mode,
      ip,
      lien: `https://vm.gandal.enspy-uy1.cm/${ip}`,
      createdAt: new Date().toLocaleString('fr-FR'),
    };

    onVmCreated(newVm);
    showToast(`VM déployée — IP : ${ip}`, 'success');

    // Réinitialiser le formulaire
    setSize_RAM('4');
    setSize_ROM('80');
    setN_CPU('2');
    setISO_image('Ubuntu Server 24.04 LTS');
    setMode('Isolé');
    setSSH_Public_Key('');
  };

  return (
    <div className="space-y-8">

      {/* ── CONSOLE D'INSTANCIATION ── */}
      <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Screw3D className="top-2 left-2 -rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[60deg]" />
        <Screw3D className="bottom-[-1.5rem] left-2 -rotate-45" />
        <Screw3D className="bottom-[-1.5rem] right-2 -rotate-[45deg]" />

        <div className="border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">
            Console d'Instanciation Directe
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">
            DÉPLOIEMENT FORCÉ DE MACHINES VIRTUELLES SUR PROXMOX PAR ORCHESTRATION SMA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Field label="ISO_image (Système OS)">
              <select
                value={ISO_image}
                onChange={(e) => setISO_image(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer"
              >
                <option>Ubuntu Server 24.04 LTS</option>
                <option>Debian 12 Bookworm</option>
                <option>Alpine Linux 3.20 (Minimal)</option>
              </select>
            </Field>

            <Field label="N_CPU (Cœurs vCPU)">
              <select
                value={N_CPU}
                onChange={(e) => setN_CPU(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer"
              >
                {['1', '2', '4', '8'].map((c) => (
                  <option key={c} value={c}>{c} Cœur{Number(c) > 1 ? 's' : ''}</option>
                ))}
              </select>
            </Field>

            <Field label="size_RAM (Mémoire vive)">
              <select
                value={size_RAM}
                onChange={(e) => setSize_RAM(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer"
              >
                {['1', '2', '4', '8', '16', '32'].map((r) => (
                  <option key={r} value={r}>{r} Go</option>
                ))}
              </select>
            </Field>

            <Field label="size_ROM (Espace Disque)">
              <div className="relative flex items-center">
                <input
                  type="number" min="10" max="500" required
                  value={size_ROM}
                  onChange={(e) => setSize_ROM(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-blue-600 text-sm font-semibold font-mono"
                />
                <span className="absolute right-4 text-xs font-bold text-slate-400">Go</span>
              </div>
            </Field>

            <Field label="mode (Réseau & Isolation)">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer"
              >
                <option value="Isolé">Isolé (Étudiants)</option>
                <option value="Public restreint">Public restreint</option>
                <option value="Administration">Administration</option>
              </select>
            </Field>

            <Field label="SSH_Public_Key (optionnel)">
              <input
                type="text"
                placeholder="ssh-rsa AAAA..."
                value={SSH_Public_Key}
                onChange={(e) => setSSH_Public_Key(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold font-mono"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <Play className="w-4 h-4 fill-white" />
            Lancer l'instanciation de la VM
          </button>
        </form>
      </div>

      {/* ── VMs DÉPLOYÉES ── */}
      <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Screw3D className="top-2 left-2 rotate-[20deg]" />
        <Screw3D className="top-2 right-2 -rotate-[50deg]" />
        <Screw3D className="bottom-[-1.5rem] left-2 rotate-[80deg]" />
        <Screw3D className="bottom-[-1.5rem] right-2 -rotate-[130deg]" />

        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-black tracking-tight uppercase leading-none">VMs Déployées</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Machines virtuelles actives sur le cluster Proxmox ENSPY
            </p>
          </div>
          <span className="self-start text-[10px] font-black px-3 py-1.5 border-2 border-black rounded-lg uppercase tracking-wider text-slate-700 select-none">
            {deployedVms.length} VM{deployedVms.length !== 1 ? 's' : ''}
          </span>
        </div>

        {deployedVms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {deployedVms.map((vm) => (
              <VmCard key={vm.id} vm={vm} onDelete={() => onDeleteVm(vm.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
            <Server className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Aucune VM déployée</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Utilisez la console ci-dessus pour instancier votre première machine virtuelle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Carte VM ── */
function VmCard({ vm, onDelete }: { vm: DeployedVm; onDelete: () => void }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="h-1.5 w-full bg-emerald-500" />
      <div className="p-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-black text-black uppercase tracking-wide leading-tight line-clamp-1">{vm.nom}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Running</span>
              </div>
            </div>
          </div>
          <button
            onClick={onDelete}
            title="Supprimer cette VM"
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2">
          <SpecChip icon={<Cpu className="w-3 h-3 text-slate-400" />} label="vCPU" value={`${vm.cpu} cœur${Number(vm.cpu) > 1 ? 's' : ''}`} />
          <SpecChip icon={<Layers className="w-3 h-3 text-slate-400" />} label="RAM" value={`${vm.ram} Go`} />
          <SpecChip icon={<HardDrive className="w-3 h-3 text-slate-400" />} label="Disque" value={`${vm.rom} Go`} />
          <SpecChip icon={<Globe className="w-3 h-3 text-slate-400" />} label="IP" value={vm.ip} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-lg">
            {vm.iso.split(' ')[0]} · {vm.mode}
          </span>
          <span className="text-[9px] font-medium text-slate-400">{vm.createdAt}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Spec chip ── */
function SpecChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
      {icon}
      <div>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">{label}</span>
        <span className="text-[10px] font-bold text-slate-800">{value}</span>
      </div>
    </div>
  );
}

/* ── Champ formulaire ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-600 block uppercase">{label}</label>
      {children}
    </div>
  );
}
