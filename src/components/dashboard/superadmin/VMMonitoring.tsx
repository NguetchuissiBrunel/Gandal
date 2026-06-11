'use client';

import { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Trash2, PauseCircle, PlayCircle, Eye } from 'lucide-react';
import EntityDetailModal from '@/components/dashboard/EntityDetailModal';
import ScrewCard, { Screw } from '@/components/dashboard/superadmin/ScrewCard';
import { apiClient } from '@/lib/apiClient';
import { vmDisplayName, vmProxmoxLabel } from '@/lib/vmMapper';

interface VM {
  id: string;
  id_proxmox: string;
  nom: string;
  size_rom: string;
  size_ram: string;
  size_rom_num: number;
  size_ram_num: number;
  iso: string;
  iso_image: string;
  ip_address: string;
  mode: string;
  n_cpu: number;
  status: 'active' | 'suspendue' | 'arrêtée';
  date_stop_at: string | null;
  ssh_public_key: string;
}

const STATUT_BADGE: Record<VM['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  suspendue: 'bg-amber-50 text-amber-700 border border-amber-200',
  arrêtée: 'bg-red-50 text-red-600 border border-red-200',
};

function buildResourceBars(vms: { n_cpu: number; size_ram: number; size_rom: number }[]) {
  if (vms.length === 0) {
    return [
      { label: 'CPU alloués', value: 0 },
      { label: 'RAM allouée (Go)', value: 0 },
      { label: 'Stockage alloué (Go)', value: 0 },
    ];
  }
  const totalCpu = vms.reduce((s, v) => s + v.n_cpu, 0);
  const totalRam = vms.reduce((s, v) => s + v.size_ram, 0);
  const totalRom = vms.reduce((s, v) => s + v.size_rom, 0);
  const cap = (n: number, max: number) => Math.min(100, Math.round((n / max) * 100) || 0);
  return [
    { label: 'CPU alloués', value: cap(totalCpu, vms.length * 8) },
    { label: 'RAM allouée (Go)', value: cap(totalRam, vms.length * 16) },
    { label: 'Stockage alloué (Go)', value: cap(totalRom, vms.length * 100) },
  ];
}

export default function VMMonitoring() {
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [detailVmId, setDetailVmId] = useState<number | null>(null);

  const fetchVms = async () => {
    try {
      const vmsData = await apiClient.getVms();
      const mapped = (vmsData.items || []).map((vm: any) => {
        let status: VM['status'] = 'arrêtée';
        if (vm.status === 'up') status = 'active';
        else if (vm.status === 'waiting') status = 'suspendue';

        return {
          id: vm.id.toString(),
          id_proxmox: vmProxmoxLabel(vm),
          nom: vmDisplayName(vm),
          size_rom: `${vm.size_rom} Go`,
          size_ram: `${vm.size_ram} Go`,
          size_rom_num: vm.size_rom,
          size_ram_num: vm.size_ram,
          iso: vm.iso || 'ubuntu-22.04',
          iso_image: vm.iso_image || 'Ubuntu Server',
          ip_address: vm.ip_address || '—',
          mode: 'KVM',
          n_cpu: vm.n_cpu,
          status,
          date_stop_at: vm.date_stop_at || null,
          ssh_public_key: vm.ssh_public_key || '—',
        };
      });
      setVms(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVms();
  }, []);

  const activeCount = vms.filter(v => v.status === 'active').length;
  const resourceBars = buildResourceBars(
    vms.map((v) => ({
      n_cpu: v.n_cpu,
      size_ram: v.size_ram_num,
      size_rom: v.size_rom_num,
    })),
  );
  const totalCpu = vms.reduce((s, v) => s + v.n_cpu, 0);
  const totalRam = vms.reduce((s, v) => s + v.size_ram_num, 0);

  const handleToggleSuspend = async (id: string) => {
    const vm = vms.find(v => v.id === id);
    if (!vm) return;
    try {
      if (vm.status === 'active') {
        await apiClient.pauseVm(parseInt(id));
      } else {
        await apiClient.startVm(parseInt(id));
      }
      fetchVms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteVm(parseInt(id));
      setVms(prev => prev.filter(v => v.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement des machines virtuelles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Server size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">VMs Actives</p>
            <p className="text-3xl font-black text-slate-900">
              {activeCount}{' '}
              <span className="text-lg text-slate-400">/ {vms.length}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Cpu size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">CPU alloués</p>
            <p className="text-3xl font-black text-slate-900">
              {totalCpu}
              <span className="text-lg text-slate-400"> cores</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <HardDrive size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">RAM allouée</p>
            <p className="text-3xl font-black text-slate-900">
              {totalRam}
              <span className="text-lg text-slate-400"> Go</span>
            </p>
          </div>
        </div>
      </div>

      <ScrewCard className="p-6">
        <h2 className="text-base font-black text-slate-900 mb-6 pt-2 px-2">Utilisation des Ressources</h2>
        <div className="space-y-5">
          {resourceBars.map(bar => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">{bar.label}</p>
                <p className="text-xs font-black text-slate-900">{bar.value}%</p>
              </div>
              <div className="bg-slate-100 rounded-full h-3 w-full">
                <div
                  className="bg-indigo-600 rounded-full h-3 transition-all"
                  style={{ width: `${bar.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrewCard>

      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-black text-slate-900">Machines Virtuelles</h2>
          <span className="text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-3 py-1">
            {vms.length} machines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vms.map(vm => (
            <div
              key={vm.id}
              className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:border-black transition-all duration-300 flex flex-col"
            >
              <Screw className="top-1.5 left-1.5" />
              <Screw className="top-1.5 right-1.5" />
              <Screw className="bottom-1.5 left-1.5" />
              <Screw className="bottom-1.5 right-1.5" />

              <div className="flex items-center justify-between px-5 pt-8 pb-4 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-sm truncate pr-2">{vm.nom}</p>
                <span className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[vm.status]}`}>
                  {vm.status}
                </span>
              </div>

              <div className="p-5 grid grid-cols-2 gap-3 flex-grow">
                {[
                  { label: 'OS / Image', value: vm.iso_image },
                  { label: 'N° CPU', value: `${vm.n_cpu} vCPU` },
                  { label: 'RAM', value: vm.size_ram },
                  { label: 'Stockage', value: vm.size_rom },
                  { label: 'IP', value: vm.ip_address },
                  { label: 'Mode', value: vm.mode },
                  { label: 'ID Proxmox', value: vm.id_proxmox },
                  { label: 'Arrêt prévu', value: vm.date_stop_at ?? 'N/A' },
                ].map(info => (
                  <div key={info.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{info.label}</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{info.value}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-4 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Clé SSH publique</p>
                <p className="font-mono text-[10px] text-slate-500 truncate">
                  {vm.ssh_public_key.length > 30
                    ? `${vm.ssh_public_key.slice(0, 30)}...`
                    : vm.ssh_public_key}
                </p>
              </div>

              <div className="p-4 flex gap-2">
                {confirmDelete === vm.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <p className="text-xs font-bold text-red-600 flex-grow">Confirmer ?</p>
                    <button
                      onClick={() => handleDelete(vm.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold tracking-wider uppercase rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-lg hover:border-black transition cursor-pointer"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDetailVmId(parseInt(vm.id, 10))}
                      className="px-3 py-2 border border-slate-200 rounded-xl hover:border-indigo-400 cursor-pointer"
                      title="Détail API"
                    >
                      <Eye size={13} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(vm.id)}
                      className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-xl px-3 py-2 hover:border-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {vm.status === 'active' ? (
                        <><PauseCircle size={13} /> Suspendre</>
                      ) : (
                        <><PlayCircle size={13} /> Réactiver</>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(vm.id)}
                      className="flex-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wider uppercase rounded-xl px-3 py-2 hover:bg-red-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {detailVmId != null && (
        <EntityDetailModal kind="vm" id={detailVmId} onClose={() => setDetailVmId(null)} />
      )}
    </div>
  );
}
