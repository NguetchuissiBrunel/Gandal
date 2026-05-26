'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Search, ArrowLeft, ArrowRight, Layers } from 'lucide-react';

const ALL_PROJECTS = [
  {
    id: 'supervision',
    title: 'Portail de Supervision Multi-Agent',
    category: 'Système Multi-Agent',
    desc: 'Supervise et orchestre en temps réel les ressources physiques et virtuelles de GANDAL grâce à une architecture de 6 agents logiciels autonomes conformes aux normes FIPA.',
    href: '#',
  },
  {
    id: 'library',
    title: 'Gestionnaire de Bibliothèque ENSPY',
    category: 'Application Web',
    desc: "Plateforme web centralisée facilitant la gestion, la recherche et l'emprunt d'ouvrages académiques et de mémoires de recherche pour les étudiants et enseignants de l'école.",
    href: '#',
  },
  {
    id: 'traffic',
    title: 'Contrôle Intelligent de Trafic',
    category: 'IoT & Intelligence Artificielle',
    desc: "Système prédictif de régulation des feux de signalisation de Yaoundé basé sur l'analyse de flux vidéo par apprentissage profond, hébergé localement sur nos clusters.",
    href: '#',
  },
];

const CATEGORIES = ['Tout', 'Système Multi-Agent', 'Application Web', 'IoT & Intelligence Artificielle'];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = ALL_PROJECTS.filter((p) => {
    const matchesCategory = selectedCategory === 'Tout' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">
      <Navbar />

      {/* Subtle background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/8 border border-blue-500/10" />
        <div className="absolute top-[500px] -left-40 w-[450px] h-[450px] rounded-full bg-cyan-500/8 border border-cyan-500/10" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 pt-36 pb-12" style={{ zIndex: 10 }}>

        {/* Back link */}
        <div className="mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </a>
        </div>

        {/* Header */}
        <div className="mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none">
            Catalogue des{' '}
            <span className="text-blue-600">Projets Hébergés</span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Applications et systèmes développés par les élèves-ingénieurs de l'ENSPY, déployés et supervisés
            sur le cluster local de GANDAL.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-10 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search */}
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

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
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
        </div>

        {/* Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/long-hallway-with-row-servers-center.jpg"
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4 flex-grow">
                  <h2 className="text-lg font-black text-black group-hover:text-blue-600 transition-colors leading-snug">
                    {project.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                    {project.desc}
                  </p>
                  <a
                    href={project.href}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-black uppercase tracking-wider transition-all duration-200 group-hover:translate-x-1 w-fit"
                  >
                    Accéder au projet
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-3xl border border-slate-200 p-16 space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-black">Aucun projet trouvé</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Modifiez votre recherche ou choisissez une autre catégorie.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
