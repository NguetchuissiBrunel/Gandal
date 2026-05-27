'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Plus,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Server,
  AlertCircle
} from 'lucide-react';

interface RequestItem {
  id: string;
  type: string;
  vmName: string;
  details: string;
  justification: string;
  status: 'En attente' | 'Validée' | 'Rejetée' | 'En cours';
  date: string;
  adminFeedback?: string;
}

interface RequestsTabProps {
  requests: RequestItem[];
  vms: Array<{ id: string; name: string }>;
  onSubmitRequest: (request: Omit<RequestItem, 'id' | 'status' | 'date'>) => void;
}

export default function RequestsTab({
  requests,
  vms,
  onSubmitRequest
}: RequestsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'historique' | 'nouvelle'>('historique');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [reqType, setReqType] = useState('Augmentation RAM');
  const [reqVmId, setReqVmId] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [reqJustification, setReqJustification] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!reqVmId) {
      setFormError('Veuillez sélectionner la machine virtuelle cible.');
      return;
    }

    if (!reqDetails.trim()) {
      setFormError('Veuillez spécifier les détails des ressources demandées (ex: +4Go RAM).');
      return;
    }

    if (!reqJustification.trim() || reqJustification.trim().length < 15) {
      setFormError('Veuillez fournir une justification motivée d\'au moins 15 caractères.');
      return;
    }

    const selectedVm = vms.find(v => v.id === reqVmId);

    onSubmitRequest({
      type: reqType,
      vmName: selectedVm ? selectedVm.name : 'Toutes les VMs',
      details: reqDetails,
      justification: reqJustification
    });

    setFormSuccess(true);
    setReqType('Augmentation RAM');
    setReqVmId('');
    setReqDetails('');
    setReqJustification('');

    setTimeout(() => {
      setActiveSubTab('historique');
      setFormSuccess(false);
    }, 1800);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Mes requêtes de ressources
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Soumettez et suivez vos demandes d'extensions de quotas ou d'ouvertures réseau spécifiques.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubTab('historique')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSubTab === 'historique'
                ? 'bg-white text-blue-600 border border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            Historique
          </button>
          <button
            onClick={() => { setActiveSubTab('nouvelle'); setFormSuccess(false); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSubTab === 'nouvelle'
                ? 'bg-white text-blue-600 border border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            Nouvelle Requête
          </button>
        </div>
      </div>

      {activeSubTab === 'historique' && (
        <div className="space-y-4">
          <div className="relative max-w-md bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrer l'historique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const isExpanded = expandedId === req.id;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => toggleExpand(req.id)}
                      className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                    >
                      <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${req.status === 'Validée'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : req.status === 'Rejetée'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : req.status === 'En cours'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {req.status === 'Validée' && <CheckCircle2 className="w-5 h-5" />}
                          {req.status === 'Rejetée' && <XCircle className="w-5 h-5" />}
                          {req.status === 'En cours' && <Activity className="w-5 h-5 animate-pulse" />}
                          {req.status === 'En attente' && <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-gray-900 tracking-wide">
                            {req.type}
                          </h3>
                          <span className="text-[10px] text-gray-500 block font-bold mt-0.5 uppercase tracking-wider">
                            Cible: {req.vmName} • Demande: {req.details}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-100 pt-3.5 sm:pt-0">
                        <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${req.status === 'Validée'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : req.status === 'Rejetée'
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : req.status === 'En cours'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {req.status}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{req.date}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-200 p-5 space-y-4 text-xs">
                        <div className="space-y-1 bg-white p-4 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Motivation de l'étudiant :</span>
                          <p className="text-gray-800 font-medium leading-relaxed font-sans">{req.justification}</p>
                        </div>

                        {req.adminFeedback && (
                          <div className={`p-4 rounded-2xl border ${req.status === 'Validée'
                              ? 'bg-emerald-50/20 border-emerald-200 text-emerald-800'
                              : 'bg-red-50/20 border-red-200 text-red-800'
                            }`}>
                            <span className="text-[10px] font-black uppercase tracking-widest block opacity-70 mb-1">
                              Retour de l'administrateur :
                            </span>
                            <p className="font-semibold">{req.adminFeedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white rounded-3xl border border-gray-200 p-16 space-y-4">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Aucune requête trouvée</h3>
              <p className="text-gray-500 text-xs md:text-sm max-w-sm mx-auto font-medium">
                Vous n'avez soumis aucune requête correspondant à ces critères.
              </p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'nouvelle' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">
                Créer une demande d'extension
              </h2>
              <p className="text-gray-500 text-xs font-semibold">
                Votre requête sera analysée par l'administrateur système et validée sous 24h.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formSuccess && (
              <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold animate-fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <p>Votre requête a été envoyée avec succès à l'administration GANDAL.</p>
              </div>
            )}

            {formError && (
              <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Type de ressource demandée <span className="text-red-500">*</span>
              </label>
              <select
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
              >
                <option value="Augmentation RAM">Augmentation Mémoire vive (RAM)</option>
                <option value="Extension Stockage">Extension Stockage Disque SSD</option>
                <option value="Allocation CPU additionnels">Allocation Cœurs de processeur (vCPU)</option>
                <option value="Ouverture Port Réseau">Ouverture de port réseau (Firewall)</option>
                <option value="Hébergement nom de domaine local">Nom de domaine local (.gandal.enspy)</option>
                <option value="Autre requête administrative">Autre demande spécifique</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Machine Virtuelle concernée <span className="text-red-500">*</span>
              </label>
              <select
                value={reqVmId}
                onChange={(e) => setReqVmId(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-xs"
              >
                <option value="">Sélectionnez la machine...</option>
                {vms.map((vm) => (
                  <option key={vm.id} value={vm.id}>{vm.name}</option>
                ))}
                <option value="all-vms">Toutes mes machines (Projet Global)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Quantité / Détails demandés <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex. +4 Go RAM, +50 Go Disque, ou Ouverture du port 8080 en TCP"
                value={reqDetails}
                onChange={(e) => setReqDetails(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-xs border border-gray-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Motivations et justification technique <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Expliquez clairement pourquoi votre projet nécessite ces ressources additionnelles. (ex. Exécution d'un algorithme de Deep Learning nécessitant plus de RAM pour charger les poids du modèle...)"
                value={reqJustification}
                onChange={(e) => setReqJustification(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-xs border border-gray-200 rounded-xl py-3 px-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10"
            >
              Envoyer la requête
            </button>
          </form>
        </div>
      )}
    </div>
  );
}