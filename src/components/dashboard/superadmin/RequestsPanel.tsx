'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare, Send } from 'lucide-react';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';

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

const INITIAL_CREATION: RequeteVM[] = [
  {
    id: 'r-001',
    etudiant: 'Jean Eboa',
    matricule: '22P150',
    objet: "Déploiement d'une API REST Python pour le projet de fin d'étude.",
    contenu: "Besoin d'un environnement isolé pour héberger une API REST Python Flask avec PostgreSQL.",
    size_rom: '50 Go',
    size_ram: '8 Go',
    os: 'Ubuntu 22.04 LTS',
    date: '2026-05-20',
    statut: 'en attente',
  },
  {
    id: 'r-002',
    etudiant: 'Marie Nguele',
    matricule: '22P200',
    objet: "Serveur Node.js pour application web de gestion des absences.",
    contenu: "Application Express.js avec MongoDB pour la gestion des présences en cours.",
    size_rom: '30 Go',
    size_ram: '4 Go',
    os: 'Debian 12',
    date: '2026-05-22',
    statut: 'en attente',
  },
  {
    id: 'r-003',
    etudiant: 'Paul Ndongo',
    matricule: '21P175',
    objet: "Environnement ML pour entraînement de modèles de vision artificielle.",
    contenu: "Nécessite GPU passthrough et bibliothèques CUDA pour PyTorch/TensorFlow.",
    size_rom: '100 Go',
    size_ram: '16 Go',
    os: 'Ubuntu 20.04 LTS',
    date: '2026-05-18',
    statut: 'acceptée',
  },
  {
    id: 'r-004',
    etudiant: 'Alice Balla',
    matricule: '22P230',
    objet: "Hébergement d'un site vitrine pour le club entrepreneuriat ENSPY.",
    contenu: "Site WordPress avec base de données MySQL et certificat SSL auto-signé.",
    size_rom: '20 Go',
    size_ram: '2 Go',
    os: 'Debian 12',
    date: '2026-05-15',
    statut: 'rejetée',
  },
];

const INITIAL_SUPPRESSION: RequeteSuppression[] = [
  {
    id: 's-001',
    etudiant: 'Kevin Samba',
    matricule: '21P100',
    vm: 'vm-dev-samba-01',
    raison: "Projet terminé et soutenu. La VM n'est plus nécessaire.",
    date: '2026-05-23',
    statut: 'en attente',
  },
  {
    id: 's-002',
    etudiant: 'Fatima Bello',
    matricule: '20P088',
    vm: 'vm-test-bello-03',
    raison: "Reconfiguration complète de l'environnement de test nécessaire.",
    date: '2026-05-24',
    statut: 'en attente',
  },
  {
    id: 's-003',
    etudiant: 'Marc Essomba',
    matricule: '22P312',
    vm: 'vm-prod-essomba-01',
    raison: 'Migration vers une nouvelle VM plus puissante.',
    date: '2026-05-19',
    statut: 'acceptée',
  },
];

const INITIAL_AUTRES: AutreRequete[] = [
  {
    id: 'a-001',
    etudiant: 'Laura Kengne',
    matricule: '22P445',
    type: 'Augmentation de ressources',
    message: "Bonjour, pourrait-il être possible d'augmenter la RAM de ma VM de 4 Go à 8 Go ? Mon projet d'analyse de données consomme trop de mémoire.",
    date: '2026-05-25',
  },
  {
    id: 'a-002',
    etudiant: 'Bruno Mfou',
    matricule: '21P298',
    type: 'Problème réseau',
    message: "Ma VM ne peut plus accéder à internet depuis hier matin. Le ping vers 8.8.8.8 est injoignable. Merci de vérifier la configuration réseau.",
    date: '2026-05-26',
    reponse: "Problème identifié côté routeur. Un redémarrage du service réseau est en cours.",
  },
  {
    id: 'a-003',
    etudiant: 'Claire Abomo',
    matricule: '22P501',
    type: 'Question sur Proxmox',
    message: "Comment puis-je créer un snapshot de ma VM avant une mise à jour majeure ? Y a-t-il une procédure standard ?",
    date: '2026-05-27',
  },
];

const STATUT_BADGE: Record<'en attente' | 'acceptée' | 'rejetée', string> = {
  'en attente': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  acceptée: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejetée: 'bg-red-50 text-red-600 border border-red-200',
};

type SubTab = 'création' | 'suppression' | 'autres';

export default function RequestsPanel() {
  const [activeTab, setActiveTab] = useState<SubTab>('création');
  const [creation, setCreation] = useState<RequeteVM[]>(INITIAL_CREATION);
  const [suppression, setSuppression] = useState<RequeteSuppression[]>(INITIAL_SUPPRESSION);
  const [autres, setAutres] = useState<AutreRequete[]>(INITIAL_AUTRES);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  const pendingCreation = creation.filter(r => r.statut === 'en attente').length;
  const pendingSuppression = suppression.filter(r => r.statut === 'en attente').length;

  const handleCreation = (id: string, action: 'acceptée' | 'rejetée') =>
    setCreation(prev => prev.map(r => r.id === id ? { ...r, statut: action } : r));

  const handleSuppression = (id: string, action: 'acceptée' | 'rejetée') =>
    setSuppression(prev => prev.map(r => r.id === id ? { ...r, statut: action } : r));

  const handleReply = (id: string) => {
    const text = replyDraft[id]?.trim();
    if (!text) return;
    setAutres(prev => prev.map(r => r.id === id ? { ...r, reponse: text } : r));
    setReplyDraft(prev => ({ ...prev, [id]: '' }));
    setReplyOpen(prev => ({ ...prev, [id]: false }));
  };

  const SUB_TABS: { key: SubTab; label: string; badge: number }[] = [
    { key: 'création', label: 'Création de VM', badge: pendingCreation },
    { key: 'suppression', label: 'Suppression de VM', badge: pendingSuppression },
    { key: 'autres', label: 'Autres', badge: 0 },
  ];

  return (
    <div className="space-y-6">

      {/* ── Sous-tabs (Design Pilule Premium Indigo) ── */}
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

      {/* ── Création de VM ── */}
      {activeTab === 'création' && (
        <div className="space-y-4">
          {creation.map(req => (
            <ScrewCard key={req.id} className="p-6">
              {/* En-tête */}
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule} · {req.date}</p>
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}>
                  {req.statut}
                </span>
              </div>

              {/* Objet + contenu */}
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

              {/* Ressources demandées — 3 colonnes */}
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

              {/* Actions */}
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

      {/* ── Suppression de VM ── */}
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

      {/* ── Autres ── */}
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
