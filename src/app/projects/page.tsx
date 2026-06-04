'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Search, ArrowLeft, ArrowRight, Layers, ExternalLink, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import {
  mapPublicationToCatalogueProject,
  buildCategoryFilters,
  type CatalogueProject,
} from '@/lib/publicationMapper';

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<CatalogueProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await apiClient.getPublicPublications({ size: 100 });
        const mapped = (data.items || []).map(mapPublicationToCatalogueProject);
        setProjects(mapped);
        setApiError(null);
      } catch (err) {
        console.error('Erreur chargement publications publiques:', err);
        setProjects([]);
        setApiError(
          err instanceof Error ? err.message : 'Impossible de charger les projets depuis l\'API.',
        );
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchPublications();
  }, []);

  const categories = useMemo(() => buildCategoryFilters(projects), [projects]);

  useEffect(() => {
    if (selectedCategory !== 'Tout' && !categories.includes(selectedCategory)) {
      setSelectedCategory('Tout');
    }
  }, [categories, selectedCategory]);

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'Tout' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/8 border border-blue-500/10" />
        <div className="absolute top-[500px] -left-40 w-[450px] h-[450px] rounded-full bg-cyan-500/8 border border-cyan-500/10" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 pt-36 pb-12" style={{ zIndex: 10 }}>

        <div className="mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </a>
        </div>

        <div className="mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
            Catalogue des{' '}
            <span className="text-blue-600">Projets Hébergés</span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Applications et systèmes développés par les élèves-ingénieurs de l&apos;ENSPY, déployés et
            supervisés sur le cluster local de GANDAL.
          </p>

          {!loadingProjects && (
            <div
              className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${
                apiError
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              {apiError
                ? 'Échec du chargement API'
                : `${projects.length} publication${projects.length > 1 ? 's' : ''} depuis GANDAL`}
            </div>
          )}
        </div>

        {apiError && !loadingProjects && (
          <div className="mb-8 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{apiError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-10 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 text-slate-800 text-sm transition-all"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-full" />
                  <div className="h-3 bg-slate-100 rounded-lg w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/long-hallway-with-row-servers-center.jpg"
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/90 text-blue-700 border border-blue-100">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-grow">
                  <h2 className="text-lg font-black text-black group-hover:text-blue-600 transition-colors leading-snug">
                    {project.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow">{project.desc}</p>
                  {project.href ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-black uppercase tracking-wider transition-all duration-200 w-fit"
                    >
                      Accéder au projet
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider w-fit">
                      Lien non renseigné
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-3xl border border-slate-200 p-16 space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-black">
              {apiError ? 'Catalogue indisponible' : 'Aucun projet publié'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              {apiError
                ? 'Vérifiez la connexion à l\'API GANDAL ou réessayez plus tard.'
                : searchQuery || selectedCategory !== 'Tout'
                  ? 'Modifiez votre recherche ou choisissez une autre catégorie.'
                  : 'Les publications publiées par les étudiants apparaîtront ici automatiquement.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
