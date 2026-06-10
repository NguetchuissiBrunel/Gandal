'use client';

import {
  Users,
  Server,
  PlusCircle,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react';

interface TeacherOverviewTabProps {
  username: string;
  pendingAccounts: number;
  pendingVmRequests: number;
  deployedVms: number;
  publicationsCount: number;
  onTabChange: (tab: string) => void;
}

export default function TeacherOverviewTab({
  username,
  pendingAccounts,
  pendingVmRequests,
  deployedVms,
  publicationsCount,
  onTabChange,
}: TeacherOverviewTabProps) {
  const totalPending = pendingAccounts + pendingVmRequests;

  const quickActions = [
    {
      id: 'inscriptions',
      label: 'Inscriptions',
      desc: `${pendingAccounts} demande${pendingAccounts !== 1 ? 's' : ''} en attente`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      urgent: pendingAccounts > 0,
    },
    {
      id: 'vms',
      label: 'Demandes VM',
      desc: `${pendingVmRequests} à traiter`,
      icon: Server,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      urgent: pendingVmRequests > 0,
    },
    {
      id: 'instantiation',
      label: 'VMs déployées',
      desc: `${deployedVms} instance${deployedVms !== 1 ? 's' : ''} active${deployedVms !== 1 ? 's' : ''}`,
      icon: PlusCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      urgent: false,
    },
    {
      id: 'publications',
      label: 'Publications',
      desc: `${publicationsCount} projet${publicationsCount !== 1 ? 's' : ''}`,
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/80 mb-2">
            Espace enseignant
          </p>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Bonjour, <span className="text-blue-300">{username}</span>
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
            Validez les inscriptions, traitez les demandes de VMs et supervisez les projets de vos étudiants.
          </p>
          {totalPending > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              {totalPending} action{totalPending !== 1 ? 's' : ''} en attente
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Inscriptions', value: pendingAccounts, icon: Users, tab: 'inscriptions' },
          { label: 'Demandes VM', value: pendingVmRequests, icon: Server, tab: 'vms' },
          { label: 'VMs actives', value: deployedVms, icon: Activity, tab: 'instantiation' },
          { label: 'Publications', value: publicationsCount, icon: BookOpen, tab: 'publications' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => onTabChange(stat.tab)}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 mb-2" />
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                {stat.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onTabChange(action.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${action.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">{action.label}</p>
                    {action.urgent && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {totalPending === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Toutes les demandes sont à jour. Consultez vos VMs déployées ou vos publications.
        </div>
      )}
    </div>
  );
}
