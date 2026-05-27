import React, { useState } from 'react';
import { Server, Plus, Power, Trash2, X, Cpu, MemoryStick, HardDrive, Search, Filter, Activity, Clock, Settings } from 'lucide-react';

// Types
type VmStatus = 'running' | 'stopped' | 'creating';

interface VM {
  id: number;
  name: string;
  os: string;
  status: VmStatus;
  cpu: number;
  cpuMax: number;
  ram: number;
  ramMax: number;
  disk: number;
  diskMax: number;
  uptime?: string;
}

export default function VmsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VmStatus>('all');

  // Modal State
  const [newVmCpu, setNewVmCpu] = useState(4);
  const [newVmRam, setNewVmRam] = useState(8);
  const [newVmDisk, setNewVmDisk] = useState(50);

  // Mock Data with numeric values for progress bars
  const [vms] = useState<VM[]>([
    { 
      id: 1, name: 'Projet-AI-Model', os: 'Ubuntu 22.04', status: 'running', 
      cpu: 2, cpuMax: 4, 
      ram: 12, ramMax: 16, 
      disk: 80, diskMax: 100,
      uptime: '14h 23m'
    },
    { 
      id: 2, name: 'Web-Backend', os: 'Debian 11', status: 'stopped', 
      cpu: 0, cpuMax: 2, 
      ram: 0, ramMax: 4, 
      disk: 25, diskMax: 50,
      uptime: '-'
    },
    { 
      id: 3, name: 'DB-Cluster', os: 'CentOS 9', status: 'creating', 
      cpu: 0, cpuMax: 8, 
      ram: 0, ramMax: 32, 
      disk: 0, diskMax: 200,
      uptime: '-'
    }
  ]);

  const filteredVms = vms.filter(vm => {
    const matchesSearch = vm.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: VmStatus) => {
    switch (status) {
      case 'running': return { color: 'emerald', label: 'En ligne', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50' };
      case 'stopped': return { color: 'slate', label: 'Arrêtée', bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
      case 'creating': return { color: 'blue', label: 'Création...', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' };
    }
  };

  const calculatePercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((current / max) * 100);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
            Mes Machines Virtuelles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Supervisez et gérez vos environnements de développement cloud.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nouvelle VM
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une VM..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-900 dark:text-white shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VmStatus | 'all')}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-900 dark:text-white shadow-sm appearance-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="running">En ligne</option>
            <option value="stopped">Arrêtée</option>
            <option value="creating">En création</option>
          </select>
        </div>
      </div>

      {/* VMs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVms.map((vm) => {
          const statusConf = getStatusConfig(vm.status);
          const cpuUsage = calculatePercentage(vm.cpu, vm.cpuMax);
          const ramUsage = calculatePercentage(vm.ram, vm.ramMax);
          const diskUsage = calculatePercentage(vm.disk, vm.diskMax);

          return (
            <div key={vm.id} className="group bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-${statusConf.color}-500 transition-opacity ${vm.status === 'running' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl transition-colors ${statusConf.bg} ${statusConf.text}`}>
                    <Server className={`w-6 h-6 ${vm.status === 'creating' ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{vm.name}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      {vm.os}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusConf.border} ${statusConf.bg} ${statusConf.text} flex items-center gap-1.5`}>
                  {vm.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {vm.status === 'creating' && <Activity className="w-3 h-3 animate-spin" />}
                  {statusConf.label}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Clock className="w-3 h-3" />
                  {vm.uptime}
                </span>
              </div>

              {/* Resource Bars */}
              <div className="space-y-4 mb-6">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <Cpu className="w-3.5 h-3.5" /> CPU
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{vm.cpu} / {vm.cpuMax} vCPU ({cpuUsage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 50 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                      style={{ width: `${vm.status === 'stopped' ? 0 : cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* RAM */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <MemoryStick className="w-3.5 h-3.5" /> RAM
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{vm.ram} / {vm.ramMax} GB ({ramUsage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${ramUsage > 80 ? 'bg-red-500' : ramUsage > 50 ? 'bg-orange-500' : 'bg-purple-500'}`}
                      style={{ width: `${vm.status === 'stopped' ? 0 : ramUsage}%` }}
                    />
                  </div>
                </div>

                {/* Disk */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <HardDrive className="w-3.5 h-3.5" /> Stockage
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{vm.disk} / {vm.diskMax} GB ({diskUsage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${diskUsage > 80 ? 'bg-red-500' : diskUsage > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ width: `${diskUsage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button 
                  disabled={vm.status === 'creating'}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    vm.status === 'running' 
                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:hover:bg-orange-900/40' 
                      : vm.status === 'stopped'
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                        : 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {vm.status === 'running' ? 'Arrêter' : vm.status === 'creating' ? 'Patientez...' : 'Démarrer'}
                </button>
                <button 
                  disabled={vm.status === 'creating'}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVms.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 mt-6">
          <Server className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aucune VM trouvée</h3>
          <p className="text-slate-500 mt-2">Modifiez vos filtres ou créez une nouvelle machine virtuelle.</p>
        </div>
      )}

      {/* Modern VM Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Créer une nouvelle VM
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
              <div className="space-y-8">
                {/* General Info */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom de la VM</label>
                    <input 
                      type="text" 
                      placeholder="ex: Projet-Web-App" 
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Système d&apos;exploitation</label>
                    <select className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white shadow-sm appearance-none">
                      <option value="ubuntu22">Ubuntu 22.04 LTS</option>
                      <option value="debian11">Debian 11</option>
                      <option value="centos9">CentOS Stream 9</option>
                      <option value="windows2022">Windows Server 2022</option>
                    </select>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

                {/* Resource Sliders */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ressources allouées</h3>
                  
                  {/* CPU Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Cpu className="w-4 h-4 text-indigo-500"/> CPU (Cœurs)</label>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{newVmCpu} vCPU</span>
                    </div>
                    <input 
                      type="range" min="1" max="16" step="1" 
                      value={newVmCpu} onChange={(e) => setNewVmCpu(Number(e.target.value))}
                      className="w-full accent-indigo-600 dark:accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* RAM Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MemoryStick className="w-4 h-4 text-purple-500"/> RAM (Go)</label>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{newVmRam} GB</span>
                    </div>
                    <input 
                      type="range" min="2" max="64" step="2" 
                      value={newVmRam} onChange={(e) => setNewVmRam(Number(e.target.value))}
                      className="w-full accent-purple-600 dark:accent-purple-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Disk Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><HardDrive className="w-4 h-4 text-emerald-500"/> Stockage (Go)</label>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{newVmDisk} GB</span>
                    </div>
                    <input 
                      type="range" min="20" max="500" step="10" 
                      value={newVmDisk} onChange={(e) => setNewVmDisk(Number(e.target.value))}
                      className="w-full accent-emerald-600 dark:accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

                {/* Justification */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Justification du besoin</label>
                  <textarea 
                    rows={3}
                    placeholder="Expliquez brièvement pourquoi vous avez besoin de cette ressource (projet, TP, recherche...)"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none shadow-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                Créer la machine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
