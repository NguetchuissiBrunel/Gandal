'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, MessageSquare, Send } from 'lucide-react';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';
import { apiClient } from '@/lib/apiClient';

interface RequeteVM {
  id: string;
  etudiant: string;
  matricule: string;
  objet: string;
  contenu: string;
  size_rom: string;
  size_ram: string;
  os: string;
  date: string;
  statut: 'en attente' | 'acceptée' | 'rejetée';
}

interface RequeteSuppression {
  id: string;
  etudiant: string;
  matricule: string;
  vm: string;
  raison: string;
  date: string;
  statut: 'en attente' | 'acceptée' | 'rejetée';
}

interface AutreRequete {
  id: string;
  etudiant: string;
  matricule: string;
  type: string;
  message: string;
  date: string;
  reponse?: string;
}

const STATUT_BADGE: Record<'en attente' | 'acceptée' | 'rejetée', string> = {
  'en attente': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  acceptée: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejetée: 'bg-red-50 text-red-600 border border-red-200',
};

type SubTab = 'création' | 'suppression' | 'autres';

export default function RequestsPanel() {
  const [activeTab, setActiveTab] = useState<SubTab>('création');
  const [loading, setLoading] = useState(true);
  const [creation, setCreation] = useState<RequeteVM[]>([]);
  const [suppression, setSuppression] = useState<RequeteSuppression[]>([]);
  const [autres, setAutres] = useState<AutreRequete[]>([]);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  const fetchRequests = async () => {
    try {
      const response = await apiClient.getRequests();
      const all = response.items || [];

      const cr = all.filter((r: any) => r.type === 'r_create_vm').map((r: any) => {
        let statut: RequeteVM['statut'] = 'en attente';
        if (r.status === 'validated') statut = 'acceptée';
        else if (r.status === 'rejected') statut = 'rejetée';

        return {
          id: r.id.toString(),
          etudiant: `Étudiant #${r.student_id}`,
          matricule: 'Matricule',
          objet: r.object || 'Création de VM',
          contenu: r.content || 'Demande de création de ressource.',
          size_rom: `${r.size_rom} Go`,
          size_ram: `${r.size_ram} Go`,
          os: r.os || 'Ubuntu Server',
          date: 'Récemment',
          statut,
        };
      });

      const sup = all.filter((r: any) => r.type === 'r_delete_vm').map((r: any) => {
        let statut: RequeteSuppression['statut'] = 'en attente';
        if (r.status === 'validated') statut = 'acceptée';
        else if (r.status === 'rejected') statut = 'rejetée';

        return {
          id: r.id.toString(),
          etudiant: `Étudiant #${r.student_id}`,
          matricule: 'Matricule',
          vm: `VM ID: ${r.vm_id}`,
          raison: r.content || 'Pas de justification fournie.',
          date: 'Récemment',
          statut,
        };
      });

      const aut = all.filter((r: any) => r.type === 'r_account').map((r: any) => {
        return {
          id: r.id.toString(),
          etudiant: r.nom || `Étudiant #${r.student_id}`,
          matricule: r.matricule || 'N/A',
          type: 'Création de Compte',
          message: r.justification || r.content || 'Pas de détails.',
          date: 'Récemment',
          reponse: r.status === 'validated' ? 'Acceptée' : r.status === 'rejected' ? 'Rejetée' : undefined,
        };
      });

      setCreation(cr);
      setSuppression(sup);
      setAutres(aut);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCreation = creation.filter(r => r.statut === 'en attente').length;
  const pendingSuppression = suppression.filter(r => r.statut === 'en attente').length;

  const handleCreation = async (id: string, action: 'acceptée' | 'rejetée') => {
    try {
      if (action === 'acceptée') {
        await apiClient.approveRequest(parseInt(id), 'Validé par Super Admin');
      } else {
        await apiClient.rejectRequest(parseInt(id));
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuppression = async (id: string, action: 'acceptée' | 'rejetée') => {
    try {
      if (action === 'acceptée') {
        await apiClient.approveRequest(parseInt(id), 'Suppression validée par Super Admin');
      } else {
        await apiClient.rejectRequest(parseInt(id));
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (id: string) => {
    const text = replyDraft[id]?.trim();
    if (!text) return;
    try {
      await apiClient.approveRequest(parseInt(id), text);
      fetchRequests();
      setReplyDraft(prev => ({ ...prev, [id]: '' }));
      setReplyOpen(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const SUB_TABS: { key: SubTab; label: string; badge: number }[] = [
    { key: 'création', label: 'Création de VM', badge: pendingCreation },
    { key: 'suppression', label: 'Suppression de VM', badge: pendingSuppression },
    { key: 'autres', label: 'Autres', badge: 0 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement des requêtes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 max-w-xl">
        {SUB_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="text-[10px] font-black bg-indigo-600 text-white rounded-full px-2 py-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'création' && (
        <div className="space-y-4">
          {creation.map(req => (
            <ScrewCard key={req.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule} · {req.date}</p>
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}>
                  {req.statut}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Objet</p>
                  <p className="text-sm font-bold text-slate-800">{req.objet}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Détails</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{req.contenu}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ressources demandées</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Stockage', value: req.size_rom },
                    { label: 'RAM', value: req.size_ram },
                    { label: 'OS', value: req.os },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{r.label}</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {req.statut === 'en attente' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleCreation(req.id, 'acceptée')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 transition hover:-translate-y-0.5 cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Accepter
                  </button>
                  <button
                    onClick={() => handleCreation(req.id, 'rejetée')}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:bg-red-100 transition cursor-pointer"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                </div>
              )}
            </ScrewCard>
          ))}
        </div>
      )}

      {activeTab === 'suppression' && (
        <div className="space-y-4">
          {suppression.map(req => (
            <ScrewCard key={req.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule} · {req.date}</p>
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}>
                  {req.statut}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">VM concernée</p>
                  <p className="text-sm font-bold text-slate-700 font-mono">{req.vm}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Raison</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{req.raison}</p>
                </div>
              </div>

              {req.statut === 'en attente' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSuppression(req.id, 'acceptée')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 transition hover:-translate-y-0.5 cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Accepter
                  </button>
                  <button
                    onClick={() => handleSuppression(req.id, 'rejetée')}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:bg-red-100 transition cursor-pointer"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                </div>
              )}
            </ScrewCard>
          ))}
        </div>
      )}

      {activeTab === 'autres' && (
        <div className="space-y-4">
          {autres.map(req => (
            <ScrewCard key={req.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule} · {req.date}</p>
                </div>
                <span className="text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  {req.type}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Message</p>
                <p className="text-sm text-slate-600 leading-relaxed">{req.message}</p>
              </div>

              {req.reponse && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">Réponse envoyée</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{req.reponse}</p>
                </div>
              )}

              {!req.reponse && (
                <div className="pt-4 border-t border-slate-100">
                  {replyOpen[req.id] ? (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={replyDraft[req.id] || ''}
                        onChange={e => setReplyDraft(prev => ({ ...prev, [req.id]: e.target.value }))}
                        placeholder="Rédigez votre réponse..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none transition"
                      />
                      <div className="flex gap-2">
                        <button
                           onClick={() => handleReply(req.id)}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 transition hover:-translate-y-0.5 cursor-pointer"
                        >
                          <Send size={12} /> Envoyer
                        </button>
                        <button
                          onClick={() => setReplyOpen(prev => ({ ...prev, [req.id]: false }))}
                          className="border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:border-black transition cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyOpen(prev => ({ ...prev, [req.id]: true }))}
                      className="flex items-center gap-1.5 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:border-black transition cursor-pointer"
                    >
                      <MessageSquare size={13} /> Répondre
                    </button>
                  )}
                </div>
              )}
            </ScrewCard>
          ))}
        </div>
      )}
    </div>
  );
}
