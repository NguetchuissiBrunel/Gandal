'use client';

import {
  FileText,
  GraduationCap,
  UserPlus,
  Server,
  Globe,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AdminOverviewTabProps {
  username: string;
  role: string;
  pendingCount: number;
  vmTotal: number;
  vmActive: number;
  apiOnline: boolean | null;
  onTabChange: (tab: string) => void;
}

export default function AdminOverviewTab({
  username,
  role,
  pendingCount,
  vmTotal,
  vmActive,
  apiOnline,
  onTabChange,
}: AdminOverviewTabProps) {
  const sections = [
    {
      id: 'requests',
      label: 'Requêtes',
      desc: pendingCount > 0 ? `${pendingCount} en attente de validation` : 'Aucune requête en attente',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      urgent: pendingCount > 0,
    },
    {
      id: 'students',
      label: 'Étudiants',
      desc: 'Gérer les comptes étudiants',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      urgent: false,
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      desc: 'Gérer les comptes enseignants',
      icon: UserPlus,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      urgent: false,
    },
    {
      id: 'vms',
      label: 'Machines virtuelles',
      desc: `${vmActive}/${vmTotal || 0} VMs actives`,
      icon: Server,
      color: 'bg-violet-50 text-violet-600 border-violet-200',
      urgent: false,
    },
    {
      id: 'dns',
      label: 'DNS',
      desc: 'Entrées DNS du cluster',
      icon: Globe,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {role}
            </p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Centre de contrôle — <span className="text-indigo-300">{username}</span>
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-lg leading-relaxed">
              Supervisez les comptes, validez les requêtes et pilotez l&apos;infrastructure Proxmox.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:text-right shrink-0">
            <div className="flex items-center gap-2 sm:justify-end">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  apiOnline === null ? 'bg-slate-400' : apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="text-xs font-bold">
                API {apiOnline === null ? '…' : apiOnline ? 'en ligne' : 'hors ligne'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {vmActive} VM{vmActive !== 1 ? 's' : ''} active{vmActive !== 1 ? 's' : ''} sur {vmTotal || '—'}
            </span>
          </div>
        </div>
      </div>

      {pendingCount > 0 ? (
        <button
          type="button"
          onClick={() => onTabChange('requests')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left hover:bg-amber-100/80 transition-colors"
        >
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-900">
              {pendingCount} requête{pendingCount !== 1 ? 's' : ''} en attente
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Cliquez pour traiter les demandes en priorité</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" />
        </button>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Aucune requête en attente — le système est à jour.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onTabChange(section.id)}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
            >
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${section.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{section.label}</p>
                  {section.urgent && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{section.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
