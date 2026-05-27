'use client';

import { useState } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { Publication, ShowToastFn } from './types';

interface PublicationsTabProps {
  publications: Publication[];
  onSaveGrade?: (pubId: string, grade: string) => void;
  teacherName: string;
}

const STATUS_COLORS: Record<Publication['status'], string> = {
  published: 'bg-emerald-500 animate-pulse',
  draft: 'bg-amber-500',
  archived: 'bg-slate-400',
};

const STATUS_LABELS: Record<Publication['status'], string> = {
  published: 'Publié',
  draft: 'Brouillon',
  archived: 'Archivé',
};

export default function PublicationsTab({ publications, teacherName }: PublicationsTabProps) {
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

  return (
    <>
      <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Screw3D className="top-2 left-2 -rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[60deg]" />
        <Screw3D className="bottom-[-1rem] left-2 rotate-45" />
        <Screw3D className="bottom-[-1rem] right-2 -rotate-[45deg]" />

        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Publications & Projets</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">GESTION DES PUBLICATIONS ASSOCIÉES AUX VMs DÉPLOYÉES</p>
          </div>
          <span className="self-start text-[10px] font-black px-3 py-1.5 border-2 border-black rounded-lg uppercase tracking-wider text-slate-700 select-none">
            {publications.length} Publications
          </span>
        </div>

        {/* Grille */}
        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publications.map((pub) => (
              <div key={pub.id} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  {/* Status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[pub.status]}`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{STATUS_LABELS[pub.status]}</span>
                    </div>
                    {pub.lien && (
                      <a href={pub.lien} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Lien
                      </a>
                    )}
                  </div>

                  {/* Nom & description */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-black leading-snug">{pub.nom}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">{pub.description}</p>
                  </div>

                  {/* Photo si disponible */}
                  {pub.photo && pub.photo !== '' && (
                    <div className="w-full h-28 bg-slate-200 rounded-xl overflow-hidden">
                      <img src={pub.photo} alt={pub.nom} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-slate-400 font-bold italic">{pub.id}</span>
                  <button
                    onClick={() => setSelectedPub(pub)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Aucune publication</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Les publications apparaissent ici après validation ou instanciation directe.</p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedPub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 overflow-hidden shadow-xl">
            <button onClick={() => setSelectedPub(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-4 mb-6 text-center pt-2">
              Détails Publication
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                {[
                  { label: 'nom', value: selectedPub.nom },
                  { label: 'lien', value: selectedPub.lien },
                  { label: 'status', value: STATUS_LABELS[selectedPub.status] },
                ].map(({ label, value }) => (
                  <p key={label}>
                    <span className="text-slate-400 font-bold block uppercase text-[9px] mb-0.5">{label}</span>
                    {label === 'lien' && value ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{value}</a>
                    ) : value}
                  </p>
                ))}
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-blue-600 font-bold block uppercase text-[9px]">description</span>
                <p className="leading-relaxed text-slate-600">{selectedPub.description}</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <p>Supervisé par : {teacherName}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPub(null)}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
