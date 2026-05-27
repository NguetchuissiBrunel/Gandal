'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  FileText, 
  ThumbsUp, 
  Eye, 
  X, 
  FileCode, 
  Check, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface Publication {
  id: string;
  title: string;
  category: string;
  desc: string;
  vmName: string;
  gitUrl: string;
  date: string;
  checklist: {
    code: boolean;
    report: boolean;
    guide: boolean;
    vm: boolean;
  };
  views: number;
  likes: number;
}

interface PublicationsTabProps {
  publications: Publication[];
  vms: Array<{ id: string; name: string }>;
  onSubmitPublication: (pub: Omit<Publication, 'id' | 'date' | 'views' | 'likes'>) => void;
}

export default function PublicationsTab({ 
  publications, 
  vms, 
  onSubmitPublication 
}: PublicationsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [pubTitle, setPubTitle] = useState('');
  const [pubCategory, setPubCategory] = useState('Système Multi-Agent');
  const [pubDesc, setPubDesc] = useState('');
  const [pubVmId, setPubVmId] = useState('');
  const [pubGitUrl, setPubGitUrl] = useState('');
  
  // Checklist states
  const [checkCode, setCheckCode] = useState(false);
  const [checkReport, setCheckReport] = useState(false);
  const [checkGuide, setCheckGuide] = useState(false);
  const [checkVm, setCheckVm] = useState(false);

  const [formError, setFormError] = useState('');

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!pubTitle.trim()) {
      setFormError('Le titre du projet est obligatoire.');
      return;
    }

    if (!pubDesc.trim() || pubDesc.trim().length < 30) {
      setFormError('Veuillez fournir un résumé descriptif de votre projet (au moins 30 caractères).');
      return;
    }

    if (!pubGitUrl.startsWith('http://') && !pubGitUrl.startsWith('https://')) {
      setFormError('Le lien du dépôt Git doit être une URL valide (commençant par http:// ou https://).');
      return;
    }

    const selectedVm = vms.find(v => v.id === pubVmId);

    onSubmitPublication({
      title: pubTitle,
      category: pubCategory,
      desc: pubDesc,
      vmName: selectedVm ? selectedVm.name : 'Aucune VM liée',
      gitUrl: pubGitUrl,
      checklist: {
        code: checkCode,
        report: checkReport,
        guide: checkGuide,
        vm: checkVm
      }
    });

    setIsModalOpen(false);
    // Reset Form
    setPubTitle('');
    setPubCategory('Système Multi-Agent');
    setPubDesc('');
    setPubVmId('');
    setPubGitUrl('');
    setCheckCode(false);
    setCheckReport(false);
    setCheckGuide(false);
    setCheckVm(false);
  };

  // Filter publications
  const filteredPubs = publications.filter((pub) => {
    const matchesSearch = pub.title.toLowerCase().includes(search.toLowerCase()) ||
                          pub.category.toLowerCase().includes(search.toLowerCase()) ||
                          pub.desc.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
            Catalogue de mes publications
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Publiez vos travaux académiques pour centraliser vos livrables et valider les étapes de passation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Nouvelle publication
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher parmi mes publications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-all"
        />
      </div>

      {/* ── PUBLICATIONS LIST ── */}
      {filteredPubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPubs.map((pub) => {
            const completedSteps = Object.values(pub.checklist).filter(Boolean).length;
            const isComplete = completedSteps === 4;

            return (
              <div
                key={pub.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-880 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Category & Date */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/35 rounded-lg text-[9px] font-black uppercase tracking-wider">
                      {pub.category}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{pub.date}</span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-950 dark:text-white leading-snug">
                      {pub.title}
                    </h3>
                    <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">
                      {pub.desc}
                    </p>
                  </div>

                  {/* Associated Links */}
                  <div className="flex flex-wrap gap-2.5 pt-1 text-[11px] font-semibold text-slate-500">
                    <a
                      href={pub.gitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-blue-600 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code Source</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 rounded-xl border border-slate-100 dark:border-slate-850 truncate max-w-[200px]">
                      <FileCode className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                      <span className="truncate text-slate-700 dark:text-slate-350">VM: {pub.vmName}</span>
                    </div>
                  </div>

                  {/* Handover Checklist Summary */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Contrôle de Passation
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isComplete 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                      }`}>
                        {isComplete ? 'Validé' : `${completedSteps} / 4 étapes`}
                      </span>
                    </div>

                    {/* Step details */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          pub.checklist.code 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800'
                        }`}>
                          {pub.checklist.code && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>Dépôt Source</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          pub.checklist.report 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800'
                        }`}>
                          {pub.checklist.report && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>Rapport PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          pub.checklist.guide 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800'
                        }`}>
                          {pub.checklist.guide && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>Guide Déploiement</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          pub.checklist.vm 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800'
                        }`}>
                          {pub.checklist.vm && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span>VM Démonstration</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Card Footer: Metrics */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4 mt-5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      {pub.views} vues
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-slate-400" />
                      {pub.likes} likes
                    </span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline inline-flex items-center gap-0.5">
                    Voir détails
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 space-y-4">
          <FileText className="w-12 h-12 text-slate-305 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucune publication</h3>
          <p className="text-slate-450 text-xs md:text-sm max-w-sm mx-auto font-medium">
            Vous n'avez soumis aucun projet. Publiez vos travaux pour les mettre à disposition de la promotion suivante.
          </p>
        </div>
      )}

      {/* ── CREATE PUBLICATION MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Publier un nouveau projet
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setFormError(''); }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow">
              
              {formError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-650 dark:text-red-400 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  Titre du Projet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex. Système d'équilibrage de charge par agent logiciel"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  Catégorie technologique <span className="text-red-500">*</span>
                </label>
                <select
                  value={pubCategory}
                  onChange={(e) => setPubCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
                >
                  <option value="Système Multi-Agent">Système Multi-Agent (SMA)</option>
                  <option value="Application Web">Application Web / Cloud</option>
                  <option value="IoT & Intelligence Artificielle">IoT & Apprentissage Profond</option>
                  <option value="Systèmes Distribués & Réseau">Systèmes Distribués & Réseau</option>
                </select>
              </div>

              {/* Associated VM */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  VM de démonstration associée
                </label>
                <select
                  value={pubVmId}
                  onChange={(e) => setPubVmId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 transition-all text-xs cursor-pointer"
                >
                  <option value="">Sélectionnez la machine virtuelle...</option>
                  {vms.map((vm) => (
                    <option key={vm.id} value={vm.id}>{vm.name}</option>
                  ))}
                </select>
              </div>

              {/* Git URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  Lien du Dépôt Git <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/enspy-gi27/mon-projet"
                  value={pubGitUrl}
                  onChange={(e) => setPubGitUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>

              {/* Abstract */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 block">
                  Résumé et description technique <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Présentation rapide du projet, son utilité et les objectifs atteints."
                  value={pubDesc}
                  onChange={(e) => setPubDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-3.5 focus:outline-none focus:border-blue-600 transition-all font-sans"
                />
              </div>

              {/* Handover checklist */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Livraison de passation de projet
                </h4>
                
                <div className="space-y-2.5">
                  <label className="flex items-start gap-3 text-xs font-medium text-slate-650 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkCode}
                      onChange={(e) => setCheckCode(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-250 block">Code source complet déposé</span>
                      <span className="text-[10px] text-slate-400">Le code source final est poussé sur le dépôt Git lié.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs font-medium text-slate-650 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkReport}
                      onChange={(e) => setCheckReport(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-250 block">Rapport PDF de projet joint</span>
                      <span className="text-[10px] text-slate-400">Le mémoire technique et de recherche a été déposé en format PDF.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs font-medium text-slate-650 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkGuide}
                      onChange={(e) => setCheckGuide(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-250 block">Guide de déploiement et d'installation rédigé</span>
                      <span className="text-[10px] text-slate-400">La documentation technique contient les instructions de déploiement du projet.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs font-medium text-slate-650 dark:text-slate-450 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkVm}
                      onChange={(e) => setCheckVm(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-250 block">Machine Virtuelle de démonstration active</span>
                      <span className="text-[10px] text-slate-400">Le projet est hébergé de manière fonctionnelle sur l'une de vos instances de test.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormError(''); }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-slate-250 dark:border-slate-800 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Publier & Initier la passation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
