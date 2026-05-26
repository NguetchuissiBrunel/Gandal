'use client';

import { useState } from 'react';
import { Award, X } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { Publication, ShowToastFn } from './types';

interface PublicationsTabProps {
  publications: Publication[];
  onSaveGrade: (pubId: string, grade: string) => void;
  teacherName: string;
}

export default function PublicationsTab({ publications, onSaveGrade, teacherName }: PublicationsTabProps) {
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [gradeInput, setGradeInput] = useState('');

  const saveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPub) return;
    onSaveGrade(selectedPub.id, gradeInput);
    setSelectedPub(null);
    setGradeInput('');
  };

  return (
    <>
      <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Screw3D className="top-2 left-2 rotate-[30deg]"   />
        <Screw3D className="top-2 right-2 rotate-[110deg]" />
        <Screw3D className="bottom-2 left-2 rotate-[85deg]" />
        <Screw3D className="bottom-2 right-2 -rotate-12"    />

        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Fiches &amp; Publications Projets</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">DASHBOARD DE SUPERVISION ET D'ÉVALUATION DES PROJETS DÉPLOYÉS EN LOCAL</p>
          </div>
          <span className="self-start text-[10px] font-black px-3 py-1.5 border-2 border-black rounded-lg uppercase tracking-wider text-slate-700 select-none">
            {publications.length} Publications
          </span>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publications.map((pub) => (
            <div key={pub.id} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                    {pub.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${pub.status === 'En ligne' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{pub.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black text-black leading-snug">{pub.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">Auteurs : {pub.authors}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">{pub.desc}</p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <p><span className="text-slate-400 font-bold uppercase text-[9px] block">VM Associée</span> {pub.vms} ({pub.ip})</p>
                  <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Spécifications</span> {pub.specs}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pub.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-250 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200/60 mt-5 pt-4 flex items-center justify-between gap-4">
                {pub.grade ? (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-black text-black">Note : {pub.grade}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">Non noté</span>
                )}

                <button
                  onClick={() => { setSelectedPub(pub); setGradeInput(pub.grade ? pub.grade.split('/')[0] : ''); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  Évaluer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Évaluation */}
      {selectedPub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 overflow-hidden shadow-xl">
            <button onClick={() => { setSelectedPub(null); setGradeInput(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-4 mb-6 text-center pt-2">
              Évaluation du Projet
            </h3>

            <form onSubmit={saveGrade} className="space-y-6">
              <div className="space-y-1 font-semibold text-xs text-slate-700">
                <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Projet</span> {selectedPub.title}</p>
                <p><span className="text-slate-400 font-bold uppercase text-[9px] block">Auteurs</span> {selectedPub.authors}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-650 block uppercase">Attribuer une note (sur 20)</label>
                <div className="relative flex items-center">
                  <input
                    type="number" min="0" max="20" step="0.25" required placeholder="18"
                    value={gradeInput} onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold font-mono"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400">/ 20</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <p>Évaluation enregistrée sous le sceau : {teacherName}</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setSelectedPub(null); setGradeInput(''); }} className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
