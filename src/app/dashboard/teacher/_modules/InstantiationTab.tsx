'use client';

import { Server, Cpu, HardDrive, Layers, Globe, CheckCircle2, Trash2 } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { DeployedVm } from './types';

interface InstantiationTabProps {
  deployedVms: DeployedVm[];
  onDeleteVm: (id: string) => void;
}

export default function InstantiationTab({ deployedVms, onDeleteVm }: InstantiationTabProps) {
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
            VMs des étudiants
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Validez les demandes dans l&apos;onglet « Demandes VM » — la liste globale (GET /vms) est réservée aux admins.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
          <p>
            Pour créer une VM étudiante, approuvez une <strong>requête de création</strong> dans
            « Demandes VM ». Les machines listées ci-dessous sont chargées via l&apos;API (détail par ID).
          </p>
        </div>
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
              Approuvez une demande de création VM dans l&apos;onglet « Demandes VM » pour voir une machine ici.
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
