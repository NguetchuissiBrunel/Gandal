'use client';

import { useState } from 'react';
import { Users, Building2, X, CheckCircle, XCircle } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { AccountRequest, ShowToastFn } from './types';

interface InscriptionsTabProps {
  requests: AccountRequest[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
}

export default function InscriptionsTab({ requests, onApprove, onReject }: InscriptionsTabProps) {
  const [selected, setSelected] = useState<AccountRequest | null>(null);

  const approve = (req: AccountRequest) => { onApprove(req.id, req.nom); setSelected(null); };
  const reject = (req: AccountRequest) => { onReject(req.id, req.nom); setSelected(null); };

  return (
    <>
      <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <Screw3D className="top-2 left-2 -rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[60deg]" />
        <Screw3D className="bottom-[-1rem] left-2 rotate-45" />
        <Screw3D className="bottom-[-1rem] right-2 -rotate-[45deg]" />

        {/* En-tête */}
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Demandes d'Inscription Étudiants</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">DÉCISIONS D'ACTIVATION ET DE CRÉATION DE COMPTE SUR L'ANNUAIRE GANDAL</p>
          </div>
          <span className="self-start text-[10px] font-black px-3 py-1.5 border-2 border-black rounded-lg uppercase tracking-wider text-slate-700 select-none">
            {requests.length} En attente
          </span>
        </div>

        {/* Liste */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-black">{req.nom}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-widest">{req.matricule}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-widest">{req.statut}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {req.organisation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button onClick={() => setSelected(req)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    Détails
                  </button>
                  <button
                    onClick={() => approve(req)}
                    title="Approuver"
                    className="w-9 h-9 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-110"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => reject(req)}
                    title="Rejeter"
                    className="w-9 h-9 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-110"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Aucune demande en attente</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Toutes les demandes de comptes étudiants ont été traitées.</p>
          </div>
        )}
      </div>

      {/* Modal Détails Inscription */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 overflow-hidden shadow-xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-4 mb-6 text-center pt-2">
              Détails de l'Étudiant
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-700 mb-8">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                {[
                  { label: 'Nom Complet', value: selected.nom },
                  { label: 'Matricule académique', value: selected.matricule },
                  { label: 'Organisation', value: selected.organisation },
                  { label: 'Adresse email', value: selected.email },
                  { label: 'Statut actuel', value: selected.statut },
                ].map(({ label, value }) => (
                  <p key={label}><span className="text-slate-400 font-bold block uppercase text-[9px] mb-0.5">{label}</span>{value}</p>
                ))}
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-blue-600 font-bold block uppercase text-[9px]">Justification</span>
                <p className="leading-relaxed text-slate-600">{selected.justification}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => reject(selected)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejeter
              </button>
              <button onClick={() => approve(selected)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
