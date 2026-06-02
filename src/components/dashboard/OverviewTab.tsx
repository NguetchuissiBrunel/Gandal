'use client';

import {
  Server,
  Cpu,
  Database,
  HardDrive,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Plus
} from 'lucide-react';

interface OverviewTabProps {
  studentInfo: {
    username: string;
    matricule: string;
    level: string;
    department: string;
    email: string;
  };
  vms: Array<{
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
  }>;
  requests: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
  }>;
  onTabChange: (tab: 'overview' | 'vms' | 'requests' | 'publications' | 'profile') => void;
}

export default function OverviewTab({
  studentInfo,
  vms,
  requests,
  publications,
  onTabChange
}: OverviewTabProps) {
  const quotaLimits = { vms: 5, cpu: 8, ram: 16, disk: 200 };
  const currentUsage = vms.reduce((acc, vm) => {
    if (vm.status !== 'Arrêtée') {
      acc.cpu += vm.cpu;
      acc.ram += vm.ram;
      acc.disk += vm.disk;
    }
    acc.vms += 1;
    return acc;
  }, { vms: 0, cpu: 0, ram: 0, disk: 0 });

  const osColors: Record<string, string> = {
    Ubuntu: 'bg-orange-50 text-orange-700 border-orange-200',
    Debian: 'bg-red-50 text-red-700 border-red-200',
    CentOS: 'bg-purple-50 text-purple-700 border-purple-200',
    Windows: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Arrêtée: 'bg-slate-100 text-slate-600 border-slate-200',
    'En cours': 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Greetings Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-955 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Session Étudiant Active
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              Bonjour, <span className="text-emerald-400">{studentInfo.username}</span> !
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl leading-relaxed">
              Bienvenue sur votre console GANDAL. Supervisez vos machines virtuelles, gérez vos demandes d'extension de ressources et préparez la passation de vos projets académiques.
            </p>
          </div>

          <div className="flex flex-col text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm self-stretch md:self-auto min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Classe & Promotion</span>
            <span className="text-sm font-bold text-white mt-1">{studentInfo.department}</span>
            <span className="text-xs text-emerald-400 font-bold mt-0.5">Niveau {studentInfo.level} • Promotion GI27</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-2">Matricule : {studentInfo.matricule}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid (Quotas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Machines Virtuelles</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{currentUsage.vms}</span>
              <span className="text-xs font-bold text-slate-400">/ {quotaLimits.vms} créées</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.vms / quotaLimits.vms) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Processeurs (vCPUs)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{currentUsage.cpu} Cores</span>
              <span className="text-xs font-bold text-slate-400">/ {quotaLimits.cpu} max</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.cpu / quotaLimits.cpu) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Mémoire (RAM)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{currentUsage.ram} Go</span>
              <span className="text-xs font-bold text-slate-400">/ {quotaLimits.ram} Go max</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.ram / quotaLimits.ram) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Stockage (Disque)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{currentUsage.disk} Go</span>
              <span className="text-xs font-bold text-slate-400">/ {quotaLimits.disk} Go max</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.disk / quotaLimits.disk) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Overview of current VMs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Mes Machines Actives
                </h2>
              </div>
              <button
                onClick={() => onTabChange('vms')}
                className="text-[11px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nouvelle VM
              </button>
            </div>

            {vms.length > 0 ? (
              <div className="space-y-4">
                {vms.map((vm) => (
                  <div key={vm.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">
                        <Server className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate font-mono">{vm.name}</p>
                        <p className="text-xs text-slate-500 truncate">{vm.project}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${osColors[vm.os] || 'bg-slate-100 text-slate-700'}`}>
                        {vm.os}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5">
                        {vm.cpu} vCPU · {vm.ram} Go
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5">
                        {vm.ip}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full ${statusColors[vm.status]}`}>
                        {vm.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-xs font-bold">Aucune machine virtuelle déployée pour le moment.</p>
                <button
                  onClick={() => onTabChange('vms')}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-sm hover:shadow"
                >
                  Déployer ma première VM
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Activities & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <Clock className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Activités Récentes
              </h2>
            </div>

            <div className="space-y-4 flex-grow">
              {vms.length > 0 ? (
                <div className="space-y-4">
                  {vms.slice(0, 2).map((vm) => (
                    <div key={vm.id} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Machine <span className="font-bold text-slate-900">{vm.name}</span> active
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Provisionnée avec succès sur le cluster</span>
                      </div>
                    </div>
                  ))}
                  {requests.slice(0, 1).map((req) => (
                    <div key={req.id} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3">
                      <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Requête : {req.type}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Statut : {req.status} • {req.date}</span>
                      </div>
                    </div>
                  ))}
                  {publications.slice(0, 1).map((pub) => (
                    <div key={pub.id} className="flex gap-3 items-start text-xs pb-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Projet publié : {pub.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Passation initiée • {pub.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 font-medium text-xs">
                  Aucune activité récente.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => onTabChange('vms')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all group"
              >
                <span>Accéder à mes machines</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onTabChange('requests')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all group"
              >
                <span>Faire une requête d'extension</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}