'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Play, Maximize2, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  description: string;
  src: string;
  thumbnail?: string;
}

const GALLERY_ITEMS: MediaItem[] = [
  {
    id: 'img1',
    type: 'photo',
    title: 'Cluster Proxmox ENSPY',
    description: 'Armoire principale du datacenter hébergeant le cluster de virtualisation Proxmox VE.',
    src: '/datacenter_rack_view.png',
  },
  {
    id: 'vid1',
    type: 'video',
    title: 'Supervision Réseau en Temps Réel',
    description: 'Flux vidéo montrant le brassage réseau et l\'activité des commutateurs de cœur de réseau.',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-datacenter-cables-and-neon-lights-close-up-34326-large.mp4',
    thumbnail: '/long-hallway-with-row-servers-center.jpg',
  },
  {
    id: 'img2',
    type: 'photo',
    title: 'Tableau de Bord Virtuel',
    description: 'Interface d\'administration GANDAL orchestrant les agents de déploiement et de migration.',
    src: '/virtualization_dashboard.png',
  },
  {
    id: 'vid2',
    type: 'video',
    title: 'Câblage Fibre Optique',
    description: 'Gros plan sur les raccordements en fibre optique garantissant des débits de 10 Gbps.',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-cables-and-indicator-lights-34325-large.mp4',
    thumbnail: '/long-hallway-with-row-servers-center.jpg',
  },
  {
    id: 'img3',
    type: 'photo',
    title: 'Couloir Technique Datacenter',
    description: 'Vue d\'ensemble de l\'allée froide du datacenter du Département de Génie Informatique.',
    src: '/long-hallway-with-row-servers-center.jpg',
  },
  {
    id: 'img4',
    type: 'photo',
    title: 'Serveur de Test Local',
    description: 'Serveur rackable de test pour le maquettage physique des agents FIPA de la plateforme.',
    src: '/WhatsApp Image 2026-05-07 at 18.59.16.jpeg',
  },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const filteredItems = GALLERY_ITEMS.filter(
    (item) => filter === 'all' || item.type === filter
  );

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">
      <Navbar />

      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/8 border border-blue-500/10" />
        <div className="absolute top-[500px] -left-40 w-[450px] h-[450px] rounded-full bg-cyan-500/8 border border-cyan-500/10" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 pt-36 pb-12" style={{ zIndex: 10 }}>
        {/* Lien de retour */}
        <div className="mb-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </a>
        </div>

        {/* Titre et description */}
        <div className="mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-none uppercase">
            Galerie <span className="text-blue-600">Multimédia</span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm md:text-base leading-relaxed">
            Découvrez l&apos;infrastructure physique, le matériel de réseau et les interfaces virtuelles qui font tourner le datacenter GANDAL de l&apos;ENSPY.
          </p>
        </div>

        {/* Filtres de catégorie */}
        <div className="flex gap-2 mb-10 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setFilter('photo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'photo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            Vidéos
          </button>
        </div>

        {/* Grille multimédia */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-60 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {item.type === 'video' ? (
                  <>
                    <video
                      src={item.src}
                      className="absolute inset-0 h-full w-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative w-12 h-12 rounded-full bg-blue-600/90 text-white border-2 border-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-3 left-4">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/95 text-blue-700 border border-blue-100">
                    {item.type === 'video' ? 'Vidéo' : 'Photo'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-2 flex-grow">
                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox / Visionneuse plein écran */}
      {lightboxItem && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4 sm:p-8">
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 cursor-pointer"
            aria-label="Fermer la visionneuse"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl w-full h-[60vh] sm:h-[70vh] flex items-center justify-center">
            {lightboxItem.type === 'video' ? (
              <video
                src={lightboxItem.src}
                className="max-h-full max-w-full rounded-2xl border-2 border-slate-800 shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={lightboxItem.src}
                  alt={lightboxItem.title}
                  fill
                  sizes="100vw"
                  className="object-contain rounded-2xl"
                  priority
                />
              </div>
            )}
          </div>

          <div className="mt-6 text-center max-w-2xl px-4 text-white">
            <h3 className="text-lg font-black uppercase tracking-wider text-blue-400">
              {lightboxItem.title}
            </h3>
            <p className="text-slate-400 text-sm mt-2">{lightboxItem.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
