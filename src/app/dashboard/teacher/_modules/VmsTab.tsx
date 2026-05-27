'use client';

import { useState } from 'react';
import { Server, Cpu, Layers, HardDrive, FileCode2, X } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { VmRequest } from './types';

interface VmsTabProps {
  requests: VmRequest[];
  onApprove: (id: string, demandeur: string, objet: string) => void;
  onReject: (id: string, demandeur: string) => void;
}

export default function VmsTab({ requests, onApprove, onReject }: VmsTabProps) {
  const [selected, setSelected] = useState<VmRequest | null>(null);

  const approve = (req: VmRequest) => { onApprove(req.id, req.Demandeur, req.objet); setSelected(null); };
  const reject = (req: VmRequest) => { onReject(req.id, req.Demandeur); setSelected(null); };

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
            <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Demandes d'Allocation VM</h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">ANALYSES TECHNIQUES ET ACCORDS D'HÉBERGEMENT SUR CLUSTER PROXMOX</p>
          </div>
          <span className="self-start text-[10px] font-black px-3 py-1.5 border-2 border-black rounded-lg uppercase tracking-wider text-slate-700 select-none">
            {requests.length} Requêtes VM
          </span>
        </div>

        {/* Liste */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider">VM ID: REQUEST</span>
                    <span className="text-base font-black text-black">Objet : "{req.objet}"</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-widest">{req.statut}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500">
                    <p><span className="text-slate-400">Demandeur :</span> {req.Demandeur}</p>
                    <p className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-slate-400" />{req.size_RAM} Go RAM</p>
                    <p className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-slate-400" />{req.size_ROM} Go ROM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button onClick={() => setSelected(req)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    Détails
                  </button>
                  <button onClick={() => approve(req)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    Approuver
                  </button>
                  <button onClick={() => reject(req)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
            <Server className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">Aucune demande de VM en attente</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Toutes les allocations de machines virtuelles ont été résolues.</p>
          </div>
        )}
      </div>

      {/* Modal Détails VM */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-8 overflow-hidden shadow-xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-4 mb-6 text-center pt-2">
              Spécifications VM Demandée
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-700 mb-8">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <p><span className="text-slate-400 font-bold uppercase text-[9px]">Demandeur</span> {selected.Demandeur}</p>
                <p className="text-right"><span className="text-slate-400 font-bold uppercase text-[9px]">Statut</span> {selected.statut}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4">
                <p className="flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600 shrink-0" /> <span className="font-bold">{selected.size_RAM} Go RAM</span></p>
                <p className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-blue-600 shrink-0" /> <span className="font-bold">{selected.size_ROM} Go ROM</span></p>
                <p className="flex items-center gap-2 col-span-2"><FileCode2 className="w-4 h-4 text-blue-600 shrink-0" /> <span className="font-bold">{selected.OS}</span></p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                  <span className="text-blue-600 font-bold block uppercase text-[9px]">Objet &amp; Contenu (Besoin)</span>
                  <p className="leading-relaxed font-medium text-slate-700">Objet : "{selected.objet}"</p>
                  <p className="leading-relaxed text-slate-600">{selected.contenu}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => reject(selected)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                Rejeter la demande
              </button>
              <button onClick={() => approve(selected)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                Approuver l'allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
