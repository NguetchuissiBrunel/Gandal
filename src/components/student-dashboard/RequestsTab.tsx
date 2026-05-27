import React from 'react';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function RequestsTab() {
  const requests = [
    { id: 'REQ-001', vmName: 'Projet-Web-App', date: '25 Mai 2026', status: 'pending', justification: 'Déploiement application React/Nodejs pour le PFE' },
    { id: 'REQ-002', vmName: 'DB-Cluster', date: '10 Mai 2026', status: 'approved', justification: 'Base de données distribuée pour le cours de Big Data' },
    { id: 'REQ-003', vmName: 'Mining-Node', date: '02 Mai 2026', status: 'rejected', justification: 'Test de réseau blockchain avec forte demande GPU' }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50">En attente</span>;
      case 'approved': 
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">Approuvé</span>;
      case 'rejected': 
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50">Rejeté</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mes Requêtes</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Suivez l&apos;état de vos demandes de création de machines virtuelles.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">ID Requête</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Nom de la VM</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date de demande</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Justification</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{req.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{req.vmName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{req.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs" title={req.justification}>
                      {req.justification}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusIcon(req.status)}
                      {getStatusBadge(req.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {requests.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Aucune requête trouvée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
