'use client';

import { useState } from 'react';
import { Server, Cpu, HardDrive, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import ScrewCard, { Screw } from '@/components/dashboard/superadmin/ScrewCard';

interface VM {
  id: string;
  id_proxmox: string;
  nom: string;
  size_rom: string;
  size_ram: string;
  iso: string;
  iso_image: string;
  ip_address: string;
  mode: string;
  n_cpu: number;
  status: 'active' | 'suspendue' | 'arrêtée';
  date_stop_at: string | null;
  ssh_public_key: string;
}

const INITIAL_VMS: VM[] = [
  {
    id: 'vm-001',
    id_proxmox: 'proxmox-node1-001',
    nom: 'Portail SMA',
    size_rom: '120 Go',
    size_ram: '8 Go',
    iso: 'ubuntu-22.04-live-server-amd64.iso',
    iso_image: 'Ubuntu 22.04 LTS',
    ip_address: '192.168.10.11',
    mode: 'KVM',
    n_cpu: 4,
    status: 'active',
    date_stop_at: null,
    ssh_public_key: 'ssh-rsa AAAA...node1',
  },
  {
    id: 'vm-002',
    id_proxmox: 'proxmox-node1-002',
    nom: 'Bibliothèque ENSPY',
    size_rom: '80 Go',
    size_ram: '4 Go',
    iso: 'debian-12-amd64-netinst.iso',
    iso_image: 'Debian 12',
    ip_address: '192.168.10.12',
    mode: 'KVM',
    n_cpu: 2,
    status: 'active',
    date_stop_at: null,
    ssh_public_key: 'ssh-rsa AAAA...node2',
  },
  {
    id: 'vm-003',
    id_proxmox: 'proxmox-node2-001',
    nom: 'Contrôle Trafic IA',
    size_rom: '200 Go',
    size_ram: '16 Go',
    iso: 'ubuntu-20.04-live-server-amd64.iso',
    iso_image: 'Ubuntu 20.04 LTS',
    ip_address: '192.168.10.13',
    mode: 'KVM',
    n_cpu: 8,
    status: 'active',
    date_stop_at: null,
    ssh_public_key: 'ssh-rsa AAAA...node3',
  },
  {
    id: 'vm-004',
    id_proxmox: 'proxmox-node2-002',
    nom: 'Serveur GitLab',
    size_rom: '500 Go',
    size_ram: '8 Go',
    iso: 'centos-9-x86_64-dvd.iso',
    iso_image: 'CentOS 9',
    ip_address: '192.168.10.14',
    mode: 'KVM',
    n_cpu: 4,
    status: 'suspendue',
    date_stop_at: '2026-05-24',
    ssh_public_key: 'ssh-rsa AAAA...node4',
  },
  {
    id: 'vm-005',
    id_proxmox: 'proxmox-node3-001',
    nom: 'Base de données centrale',
    size_rom: '1 To',
    size_ram: '32 Go',
    iso: 'ubuntu-22.04-live-server-amd64.iso',
    iso_image: 'Ubuntu 22.04 LTS',
    ip_address: '192.168.10.15',
    mode: 'KVM',
    n_cpu: 8,
    status: 'arrêtée',
    date_stop_at: '2026-05-20',
    ssh_public_key: 'ssh-rsa AAAA...node5',
  },
  {
    id: 'vm-006',
    id_proxmox: 'proxmox-node3-002',
    nom: 'Monitoring Grafana',
    size_rom: '40 Go',
    size_ram: '2 Go',
    iso: 'alpine-virt-3.19.0-x86_64.iso',
    iso_image: 'Alpine Linux 3.19',
    ip_address: '192.168.10.16',
    mode: 'LXC',
    n_cpu: 2,
    status: 'active',
    date_stop_at: null,
    ssh_public_key: 'ssh-rsa AAAA...node6',
  },
];

const STATUT_BADGE: Record<VM['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  suspendue: 'bg-amber-50 text-amber-700 border border-amber-200',
  arrêtée: 'bg-red-50 text-red-600 border border-red-200',
};

const RESOURCE_BARS = [
  { label: 'CPU Moyen', value: 67 },
  { label: 'RAM Moyenne', value: 54 },
  { label: 'Stockage Utilisé', value: 48 },
];

export default function VMMonitoring() {
  const [vms, setVms] = useState<VM[]>(INITIAL_VMS);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const activeCount = vms.filter(v => v.status === 'active').length;

  const handleToggleSuspend = (id: string) => {
    setVms(prev =>
      prev.map(v => {
        if (v.id !== id) return v;
        return { ...v, status: v.status === 'active' ? 'suspendue' : 'active' };
      })
    );
  };

  const handleDelete = (id: string) => {
    setVms(prev => prev.filter(v => v.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-8">

      {/* ── Cartes métriques ── */}
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">CPU Moyen</p>
            <p className="text-3xl font-black text-slate-900">
              67<span className="text-lg text-slate-400">%</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <HardDrive size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">RAM Moyenne</p>
            <p className="text-3xl font-black text-slate-900">
              54<span className="text-lg text-slate-400">%</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Barres de ressources ── */}
      <ScrewCard className="p-6">
        <h2 className="text-base font-black text-slate-900 mb-6 pt-2 px-2">Utilisation des Ressources</h2>
        <div className="space-y-5">
          {RESOURCE_BARS.map(bar => (
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

      {/* ── Liste des VMs ── */}
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

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-8 pb-4 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-sm truncate pr-2">{vm.nom}</p>
                <span className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[vm.status]}`}>
                  {vm.status}
                </span>
              </div>

              {/* Infos grid 2×4 */}
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

              {/* Clé SSH publique */}
              <div className="px-5 pb-4 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Clé SSH publique</p>
                <p className="font-mono text-[10px] text-slate-500 truncate">
                  {vm.ssh_public_key.length > 30
                    ? `${vm.ssh_public_key.slice(0, 30)}...`
                    : vm.ssh_public_key}
                </p>
              </div>

              {/* Actions */}
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
    </div>
  );
}
