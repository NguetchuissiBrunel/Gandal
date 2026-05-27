import React, { useState } from 'react';
import { BookOpen, Plus, X, Link as LinkIcon, Calendar, UploadCloud, Tag } from 'lucide-react';

export default function PublicationsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publications = [
    { 
      id: 1, 
      title: 'Optimisation des requêtes distribuées', 
      date: '20 Mai 2026', 
      abstract: `Une étude sur la réduction de la latence dans les bases de données distribuées utilisant de nouvelles approches d'indexation.`,
      link: '#',
      tags: ['Base de données', 'Recherche']
    },
    { 
      id: 2, 
      title: 'Architecture Microservices avec Kafka', 
      date: '15 Avril 2026', 
      abstract: `Développement d'une architecture résiliente orientée événements pour les plateformes académiques.`,
      link: '#',
      tags: ['Microservices', 'Kafka', 'Architecture']
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mes Publications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Partagez vos projets, articles et travaux de recherche avec la communauté.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nouvelle publication
        </button>
      </div>

      <div className="space-y-6">
        {publications.map((pub) => (
          <div key={pub.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pub.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {pub.date}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {pub.abstract}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {pub.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <a href={pub.link} className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg text-sm font-medium transition-colors">
                  <LinkIcon className="w-4 h-4" />
                  Consulter
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Publication Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle Publication</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Titre de la publication</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Analyse des performances..." 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Résumé (Abstract)</label>
                  <textarea 
                    rows={4}
                    placeholder="Décrivez brièvement le sujet et les objectifs de votre publication..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lien externe (Optionnel)</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/..." 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Document (Optionnel)</label>
                  <div className="w-full px-4 py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center cursor-pointer group">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cliquez ou glissez un fichier ici</span>
                    <span className="text-xs text-slate-500 mt-1">PDF, DOCX jusqu&apos;à 10MB</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mots-clés (séparés par des virgules)</label>
                  <input 
                    type="text" 
                    placeholder="IA, Réseaux, Sécurité..." 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
