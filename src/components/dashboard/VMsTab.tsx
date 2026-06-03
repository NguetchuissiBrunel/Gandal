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
  onCreateVM: (vm: Omit<VM, 'id' | 'ip' | 'handover'>) => Promise<boolean | string> | boolean | string;
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

  const [formName, setFormName] = useState('');
  const [formOs, setFormOs] = useState<'Ubuntu' | 'Debian' | 'CentOS' | 'Windows'>('Ubuntu');
  const [formCpu, setFormCpu] = useState(2);
  const [formRam, setFormRam] = useState(4);
  const [formDisk, setFormDisk] = useState(40);
  const [formProject, setFormProject] = useState('');
  const [formError, setFormError] = useState('');

  const quotaLimits = { cpu: 8, ram: 16, disk: 200 };
  const currentUsage = vms.reduce((acc, vm) => {
    if (vm.status !== 'Arrêtée') {
      acc.cpu += vm.cpu;
      acc.ram += vm.ram;
      acc.disk += vm.disk;
    }
    return acc;
  }, { cpu: 0, ram: 0, disk: 0 });

  const handleCreateSubmit = async (e: React.FormEvent) => {
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

    const res = await onCreateVM({
      name: formName,
      os: formOs,
      cpu: formCpu,
      ram: formRam,
      disk: formDisk,
      project: formProject || 'Aucun projet',
      status: 'En cours'
    });

    if (typeof res === 'string') {
      setFormError(res);
    } else {
      setIsModalOpen(false);
      setFormName('');
      setFormOs('Ubuntu');
      setFormCpu(2);
      setFormRam(4);
      setFormDisk(40);
      setFormProject('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVMs = vms.filter((vm) => {
    const matchesFilter = filter === 'Tout' || vm.status === filter;
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
      vm.project.toLowerCase().includes(search.toLowerCase()) ||
      vm.ip.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Mes Machines Virtuelles
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Gérez vos instances privées sur le cluster GANDAL pour vos projets académiques.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Créer une VM
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, IP, projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          {(['Tout', 'Active', 'Arrêtée', 'En cours'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filter === tab
                  ? 'bg-white text-emerald-600 border border-gray-200 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              {tab === 'Tout' ? 'Toutes' : tab}
            </button>
          ))}
        </div>
      </div>

      {filteredVMs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVMs.map((vm) => (
            <div
              key={vm.id}
              className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-sm overflow-hidden ${vm.status === 'Active'
                  ? 'border-gray-200 hover:border-emerald-400 hover:shadow-lg'
                  : vm.status === 'En cours'
                    ? 'border-emerald-300 animate-pulse'
                    : 'border-gray-200 opacity-80 hover:opacity-100 hover:shadow-md'
                }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${vm.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 tracking-wide truncate max-w-[150px]">
                        {vm.name}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                        {vm.os} OS
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${vm.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : vm.status === 'Arrêtée'
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                    {vm.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />}
                    {vm.status === 'En cours' && <RotateCw className="w-2.5 h-2.5 animate-spin shrink-0" />}
                    {vm.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 py-1.5 px-3 rounded-xl border border-gray-100 w-full truncate font-medium">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Projet:</span>
                  <span className="truncate text-gray-700">{vm.project}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">CPU</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-700">
                      <Cpu className="w-3.5 h-3.5 text-gray-400" />
                      <span>{vm.cpu} Cores</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 border-x border-gray-200">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">RAM</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-700">
                      <Database className="w-3.5 h-3.5 text-gray-400" />
                      <span>{vm.ram} Go</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Disque</span>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-gray-700">
                      <HardDrive className="w-3.5 h-3.5 text-gray-400" />
                      <span>{vm.disk} Go</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-medium border-t border-dashed border-gray-100 pt-3">
                  <span className="text-gray-400">Passation de projet</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${vm.handover === 'Prêt'
                      ? 'bg-emerald-50 text-emerald-600'
                      : vm.handover === 'En cours'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                    {vm.handover}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700 truncate select-all">
                    <Terminal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">ssh student@{vm.ip || '0.0.0.0'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`ssh student@${vm.ip}`, vm.id)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    title="Copier la commande"
                  >
                    {copiedId === vm.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex gap-2 justify-end">
                  {vm.status === 'Active' ? (
                    <button
                      onClick={() => onUpdateVMStatus(vm.id, 'Arrêtée')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-[10px] font-black text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Arrêter
                    </button>
                  ) : vm.status === 'Arrêtée' ? (
                    <button
                      onClick={() => onUpdateVMStatus(vm.id, 'Active')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl text-[10px] font-black text-gray-700 hover:text-emerald-600 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Démarrer
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 opacity-50 cursor-not-allowed"
                    >
                      En cours...
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onUpdateVMStatus(vm.id, 'En cours');
                      setTimeout(() => onUpdateVMStatus(vm.id, 'Active'), 2500);
                    }}
                    disabled={vm.status !== 'Active'}
                    className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redémarrer la VM"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer la machine virtuelle ${vm.name} ?`)) {
                        onDeleteVM(vm.id);
                      }
                    }}
                    className="p-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-gray-600 hover:text-red-600 transition-colors"
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
        <div className="text-center bg-white rounded-3xl border border-gray-200 p-16 space-y-4">
          <Server className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Aucune machine virtuelle</h3>
          <p className="text-gray-500 text-xs md:text-sm max-w-sm mx-auto font-medium">
            Vous n'avez pas encore configuré de machine virtuelle. Cliquez sur "Créer une VM" pour commencer votre déploiement.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">
                  Provisionner une machine virtuelle
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow">
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Nom de la machine virtuelle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. vm-supervision-sma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-xs border border-gray-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <span className="text-[10px] text-gray-500 block font-medium">Lettres minuscules, chiffres et tirets uniquement.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
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
                      className={`p-3 border rounded-2xl text-left transition-all ${formOs === osItem.name
                          ? 'border-emerald-600 bg-emerald-50/20'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-xs font-black block text-gray-900">{osItem.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 mt-0.5">{osItem.version}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Projet académique associé
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-xs"
                >
                  <option value="">Aucun projet spécifique</option>
                  <option value="Portail de Supervision Multi-Agent">Portail de Supervision Multi-Agent</option>
                  <option value="Gestionnaire de Bibliothèque ENSPY">Gestionnaire de Bibliothèque ENSPY</option>
                  <option value="Contrôle Intelligent de Trafic">Contrôle Intelligent de Trafic</option>
                </select>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Allocation des ressources
                </h4>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-700">Processeur (vCPU)</span>
                    <span className="text-emerald-600">{formCpu} Cores</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={formCpu}
                    onChange={(e) => setFormCpu(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                    <span>1 Core</span><span>2 Cores</span><span>3 Cores</span><span>4 Cores (max par VM)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-700">Mémoire Vive (RAM)</span>
                    <span className="text-emerald-600">{formRam} Go</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={formRam}
                    onChange={(e) => setFormRam(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                    <span>2 Go</span><span>4 Go</span><span>6 Go</span><span>8 Go (max par VM)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-700">Stockage SSD</span>
                    <span className="text-emerald-600">{formDisk} Go</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="10"
                    value={formDisk}
                    onChange={(e) => setFormDisk(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                    <span>20 Go</span><span>40 Go</span><span>60 Go</span><span>80 Go</span><span>100 Go (max par VM)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-emerald-500/10"
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