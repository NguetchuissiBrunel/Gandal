'use client';

import { useState } from 'react';
import { 
  Server, 
  Play, 
  Square, 
  RotateCw, 
  Trash2, 
  Copy, 
  Plus, 
  X, 
  Search, 
  Cpu, 
  Database, 
  HardDrive, 
  Check, 
  Terminal,
  AlertTriangle
} from 'lucide-react';

interface VM {
  id: string;
  name: string;
  os: 'Ubuntu' | 'Debian' | 'CentOS' | 'Windows';
  status: 'Active' | 'Arrêtée' | 'En cours';
  cpu: number;
  ram: number;
  disk: number;
  ip: string;
  project: string;
  handover: 'Prêt' | 'En cours' | 'Non initié';
}

interface VMsTabProps {
  vms: VM[];
  onCreateVM: (vm: Omit<VM, 'id' | 'ip' | 'handover'>) => boolean | string;
  onDeleteVM: (id: string) => void;
  onUpdateVMStatus: (id: string, newStatus: 'Active' | 'Arrêtée' | 'En cours') => void;
}

export default function VMsTab({ 
  vms, 
  onCreateVM, 
  onDeleteVM, 
  onUpdateVMStatus 
}: VMsTabProps) {
  const [filter, setFilter] = useState<'Tout' | 'Active' | 'Arrêtée' | 'En cours'>('Tout');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formOs, setFormOs] = useState<'Ubuntu' | 'Debian' | 'CentOS' | 'Windows'>('Ubuntu');
  const [formCpu, setFormCpu] = useState(2);
  const [formRam, setFormRam] = useState(4);
  const [formDisk, setFormDisk] = useState(40);
  const [formProject, setFormProject] = useState('');
  const [formError, setFormError] = useState('');

  // Compute quotas
  const quotaLimits = { cpu: 8, ram: 16, disk: 200 };
  const currentUsage = vms.reduce((acc, vm) => {
    if (vm.status !== 'Arrêtée') {
      acc.cpu += vm.cpu;
      acc.ram += vm.ram;
      acc.disk += vm.disk;
    }
    return acc;
  }, { cpu: 0, ram: 0, disk: 0 });

  // Handle VM Creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Veuillez spécifier un nom de machine.');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formName)) {
      setFormError('Le nom de la VM doit être en minuscules, sans espaces ni caractères spéciaux (uniquement lettres, chiffres et tirets).');
      return;
    }

    // Check individual quotas limit (prevent local exceed)
    if (currentUsage.cpu + formCpu > quotaLimits.cpu) {
      setFormError(`Quota processeur dépassé. Il vous reste ${quotaLimits.cpu - currentUsage.cpu} Cores disponibles.`);
      return;
    }
    if (currentUsage.ram + formRam > quotaLimits.ram) {
      setFormError(`Quota mémoire (RAM) dépassé. Il vous reste ${quotaLimits.ram - currentUsage.ram} Go disponibles.`);
      return;
    }
    if (currentUsage.disk + formDisk > quotaLimits.disk) {
      setFormError(`Quota stockage (Disque) dépassé. Il vous reste ${quotaLimits.disk - currentUsage.disk} Go disponibles.`);
      return;
    }

    const res = onCreateVM({
      name: formName,
      os: formOs,
      cpu: formCpu,
      ram: formRam,
      disk: formDisk,
      project: formProject || 'Aucun projet',
      status: 'En cours' // starts as creating/starting
    });

    if (typeof res === 'string') {
      setFormError(res);
    } else {
      // Success
      setIsModalOpen(false);
      // Reset form
      setFormName('');
      setFormOs('Ubuntu');
      setFormCpu(2);
      setFormRam(4);
      setFormDisk(40);
      setFormProject('');
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Search VMs
  const filteredVMs = vms.filter((vm) => {
    const matchesFilter = filter === 'Tout' || vm.status === filter;
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) || 
                          vm.project.toLowerCase().includes(search.toLowerCase()) ||
                          vm.ip.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
            Mes Machines Virtuelles
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Gérez vos instances privées sur le cluster GANDAL pour vos projets académiques.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Créer une VM
        </button>
      </div>

      {/* ── SEARCH & FILTERS BAR ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, IP, projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
          {(['Tout', 'Active', 'Arrêtée', 'En cours'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'Tout' ? 'Toutes' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── VM GRID ── */}
      {filteredVMs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVMs.map((vm) => (
            <div
              key={vm.id}
              className={`group bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-sm overflow-hidden ${
                vm.status === 'Active' 
                  ? 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg'
                  : vm.status === 'En cours'
                  ? 'border-blue-300 dark:border-blue-900 animate-pulse'
                  : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:shadow-md'
              }`}
            >
              
              {/* Card Body */}
              <div className="p-5 space-y-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      vm.status === 'Active' 
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-100 dark:border-blue-900/40' 
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white tracking-wide truncate max-w-[150px]">
                        {vm.name}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {vm.os} OS
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    vm.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                      : vm.status === 'Arrêtée'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                  }`}>
                    {vm.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />}
                    {vm.status === 'En cours' && <RotateCw className="w-2.5 h-2.5 animate-spin shrink-0" />}
                    {vm.status}
                  </span>
                </div>

                {/* Project Tag */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 rounded-xl border border-slate-100 dark:border-slate-850 w-full truncate font-medium">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Projet:</span>
                  <span className="truncate text-slate-700 dark:text-slate-350">{vm.project}</span>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-2xl border border-slate-150 dark:border-slate-850/60 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">CPU</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-750 dark:text-slate-300">
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vm.cpu} Cores</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">RAM</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-750 dark:text-slate-300">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vm.ram} Go</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Disque</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-750 dark:text-slate-300">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vm.disk} Go</span>
                    </div>
                  </div>
                </div>

                {/* Handover indicator */}
                <div className="flex items-center justify-between text-[10px] font-medium border-t border-dashed border-slate-150 dark:border-slate-800 pt-3">
                  <span className="text-slate-400">Passation de projet</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    vm.handover === 'Prêt' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                      : vm.handover === 'En cours'
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {vm.handover}
                  </span>
                </div>

              </div>

              {/* Card Footer: Connection Details & Controls */}
              <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850 p-4 space-y-3">
                {/* IP address and SSH command */}
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate select-all">
                    <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">ssh student@{vm.ip || '0.0.0.0'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`ssh student@${vm.ip}`, vm.id)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
                    title="Copier la commande"
                  >
                    {copiedId === vm.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {/* Start/Stop Button */}
                  {vm.status === 'Active' ? (
                    <button
                      onClick={() => onUpdateVMStatus(vm.id, 'Arrêtée')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-800 hover:border-red-200 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-350 hover:text-red-650 transition-colors cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Arrêter
                    </button>
                  ) : vm.status === 'Arrêtée' ? (
                    <button
                      onClick={() => onUpdateVMStatus(vm.id, 'Active')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-350 hover:text-emerald-650 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Démarrer
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-400 transition-colors opacity-50 cursor-not-allowed"
                    >
                      En cours...
                    </button>
                  )}

                  {/* Restart Button */}
                  <button
                    onClick={() => {
                      onUpdateVMStatus(vm.id, 'En cours');
                      setTimeout(() => onUpdateVMStatus(vm.id, 'Active'), 2500);
                    }}
                    disabled={vm.status !== 'Active'}
                    className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-350 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redémarrer la VM"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer la machine virtuelle ${vm.name} ?`)) {
                        onDeleteVM(vm.id);
                      }
                    }}
                    className="p-2 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-800 hover:border-red-200 rounded-xl text-slate-650 hover:text-red-650 transition-colors cursor-pointer"
                    title="Supprimer la VM"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 space-y-4">
          <Server className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Aucune machine virtuelle</h3>
          <p className="text-slate-450 text-xs md:text-sm max-w-sm mx-auto font-medium">
            Vous n'avez pas encore configuré de machine virtuelle. Cliquez sur "Créer une VM" pour commencer votre déploiement.
          </p>
        </div>
      )}

      {/* ── CREATE VM MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Provisionner une machine virtuelle
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow">
              
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-650 dark:text-red-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              {/* VM Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  Nom de la machine virtuelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. vm-supervision-sma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <span className="text-[10px] text-slate-450 block font-medium">Lettres minuscules, chiffres et tirets uniquement.</span>
              </div>

              {/* Operating System */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  Système d'exploitation (OS) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { name: 'Ubuntu', version: '22.04 LTS' },
                    { name: 'Debian', version: '12 Bookworm' },
                    { name: 'CentOS', version: 'Stream 9' },
                    { name: 'Windows', version: 'Server 2022' }
                  ] as const).map((osItem) => (
                    <button
                      key={osItem.name}
                      type="button"
                      onClick={() => setFormOs(osItem.name)}
                      className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                        formOs === osItem.name
                          ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
                      }`}
                    >
                      <span className="text-xs font-black block text-slate-900 dark:text-white">{osItem.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">{osItem.version}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  Projet académique associé
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs cursor-pointer"
                >
                  <option value="">Aucun projet spécifique</option>
                  <option value="Portail de Supervision Multi-Agent">Portail de Supervision Multi-Agent</option>
                  <option value="Gestionnaire de Bibliothèque ENSPY">Gestionnaire de Bibliothèque ENSPY</option>
                  <option value="Contrôle Intelligent de Trafic">Contrôle Intelligent de Trafic</option>
                </select>
              </div>

              {/* Resource sliders */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Allocation des ressources
                </h4>

                {/* vCPU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Processeur (vCPU)</span>
                    <span className="text-blue-600 dark:text-blue-400">{formCpu} Cores</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={formCpu}
                    onChange={(e) => setFormCpu(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>1 Core</span>
                    <span>2 Cores</span>
                    <span>3 Cores</span>
                    <span>4 Cores (max par VM)</span>
                  </div>
                </div>

                {/* RAM */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Mémoire Vive (RAM)</span>
                    <span className="text-blue-600 dark:text-blue-400">{formRam} Go</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={formRam}
                    onChange={(e) => setFormRam(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>2 Go</span>
                    <span>4 Go</span>
                    <span>6 Go</span>
                    <span>8 Go (max par VM)</span>
                  </div>
                </div>

                {/* DISK */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Stockage SSD</span>
                    <span className="text-blue-600 dark:text-blue-400">{formDisk} Go</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="10"
                    value={formDisk}
                    onChange={(e) => setFormDisk(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>20 Go</span>
                    <span>40 Go</span>
                    <span>60 Go</span>
                    <span>80 Go</span>
                    <span>100 Go (max par VM)</span>
                  </div>
                </div>
              </div>

              {/* Resource Summary & Quota Impact */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-2.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Simulation d'impact des quotas de projet
                </span>
                
                {/* CPU usage impact */}
                <div className="flex justify-between items-center text-slate-650 dark:text-slate-400 font-medium">
                  <span>Processeur (Total projet) :</span>
                  <span className={currentUsage.cpu + formCpu > quotaLimits.cpu ? 'text-red-500 font-bold' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                    {currentUsage.cpu} + {formCpu} = {currentUsage.cpu + formCpu} / {quotaLimits.cpu} Cores
                  </span>
                </div>

                {/* RAM usage impact */}
                <div className="flex justify-between items-center text-slate-650 dark:text-slate-400 font-medium">
                  <span>Mémoire RAM (Total projet) :</span>
                  <span className={currentUsage.ram + formRam > quotaLimits.ram ? 'text-red-500 font-bold' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                    {currentUsage.ram} + {formRam} = {currentUsage.ram + formRam} / {quotaLimits.ram} Go
                  </span>
                </div>

                {/* Storage usage impact */}
                <div className="flex justify-between items-center text-slate-650 dark:text-slate-400 font-medium">
                  <span>Stockage Disque (Total projet) :</span>
                  <span className={currentUsage.disk + formDisk > quotaLimits.disk ? 'text-red-500 font-bold' : 'text-slate-800 dark:text-slate-200 font-semibold'}>
                    {currentUsage.disk} + {formDisk} = {currentUsage.disk + formDisk} / {quotaLimits.disk} Go
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-slate-250 dark:border-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Valider la création
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
