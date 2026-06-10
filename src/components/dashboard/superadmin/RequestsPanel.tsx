'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Eye, Users, Server, Trash2 } from 'lucide-react';
import EntityDetailModal from '@/components/dashboard/EntityDetailModal';
import ScrewCard from '@/components/dashboard/superadmin/ScrewCard';
import EmptyState from '@/components/ui/EmptyState';
import CredentialsModal from '@/components/dashboard/CredentialsModal';
import { apiClient } from '@/lib/apiClient';
import {
  loadStudentNameMap,
  parseApprovalCredentials,
  studentLabel,
} from '@/lib/approvalUtils';
import type { ApprovalCredentials } from '@/lib/approvalUtils';

interface RequeteVM {
  id: string;
  etudiant: string;
  matricule: string;
  email?: string;
  objet: string;
  contenu: string;
  size_rom: string;
  size_ram: string;
  os: string;
  statut: 'en attente' | 'acceptée' | 'rejetée';
}

interface RequeteSuppression {
  id: string;
  etudiant: string;
  matricule: string;
  vm: string;
  raison: string;
  statut: 'en attente' | 'acceptée' | 'rejetée';
}

interface RequeteInscription {
  id: string;
  etudiant: string;
  matricule: string;
  email: string;
  organisation: string;
  message: string;
  statut: 'en attente' | 'acceptée' | 'rejetée';
}

const STATUT_BADGE: Record<'en attente' | 'acceptée' | 'rejetée', string> = {
  'en attente': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  acceptée: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejetée: 'bg-red-50 text-red-600 border border-red-200',
};

type SubTab = 'création' | 'suppression' | 'inscriptions';

export default function RequestsPanel() {
  const [activeTab, setActiveTab] = useState<SubTab>('inscriptions');
  const [loading, setLoading] = useState(true);
  const [creation, setCreation] = useState<RequeteVM[]>([]);
  const [suppression, setSuppression] = useState<RequeteSuppression[]>([]);
  const [inscriptions, setInscriptions] = useState<RequeteInscription[]>([]);
  const [detailRequestId, setDetailRequestId] = useState<number | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    creds: ApprovalCredentials;
    name: string;
    email?: string;
  } | null>(null);

  const mapStatus = (status: string): 'en attente' | 'acceptée' | 'rejetée' => {
    if (status === 'validated') return 'acceptée';
    if (status === 'rejected') return 'rejetée';
    return 'en attente';
  };

  const fetchRequests = async () => {
    try {
      const [response, studentMap] = await Promise.all([
        apiClient.getRequests(),
        loadStudentNameMap(() => apiClient.getStudents()),
      ]);
      const all = response.items || [];

      setCreation(
        all
          .filter((r: { type: string }) => r.type === 'r_create_vm')
          .map((r: any) => {
            const s = studentLabel(r.student_id, studentMap);
            return {
              id: r.id.toString(),
              etudiant: s.name,
              matricule: s.matricule,
              objet: r.object || 'Création de VM',
              contenu: r.content || 'Demande de création de ressource.',
              size_rom: `${r.size_rom} Go`,
              size_ram: `${r.size_ram} Go`,
              os: r.os || 'Ubuntu Server',
              statut: mapStatus(r.status),
            };
          }),
      );

      setSuppression(
        all
          .filter((r: { type: string }) => r.type === 'r_delete_vm')
          .map((r: any) => {
            const s = studentLabel(r.student_id, studentMap);
            return {
              id: r.id.toString(),
              etudiant: s.name,
              matricule: s.matricule,
              vm: `VM #${r.vm_id}`,
              raison: r.content || 'Pas de justification fournie.',
              statut: mapStatus(r.status),
            };
          }),
      );

      setInscriptions(
        all
          .filter((r: { type: string }) => r.type === 'r_account')
          .map((r: any) => ({
            id: r.id.toString(),
            etudiant: r.nom || studentLabel(r.student_id, studentMap).name,
            matricule: r.matricule || '—',
            email: r.email || '',
            organisation: r.organisation || '—',
            message: r.justification || r.content || '—',
            statut: mapStatus(r.status),
          })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCreation = creation.filter((r) => r.statut === 'en attente').length;
  const pendingSuppression = suppression.filter((r) => r.statut === 'en attente').length;
  const pendingInscriptions = inscriptions.filter((r) => r.statut === 'en attente').length;

  const handleVmAction = async (id: string, action: 'acceptée' | 'rejetée') => {
    try {
      if (action === 'acceptée') {
        await apiClient.approveRequest(parseInt(id, 10), '');
      } else {
        await apiClient.rejectRequest(parseInt(id, 10));
      }
      await fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInscriptionAction = async (
    req: RequeteInscription,
    action: 'acceptée' | 'rejetée',
  ) => {
    try {
      if (action === 'acceptée') {
        const response = await apiClient.approveRequest(parseInt(req.id, 10), '');
        const creds = parseApprovalCredentials(response);
        if (creds) {
          setCredentialsModal({ creds, name: req.etudiant, email: req.email });
        }
      } else {
        await apiClient.rejectRequest(parseInt(req.id, 10));
      }
      await fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const SUB_TABS: { key: SubTab; label: string; badge: number }[] = [
    { key: 'inscriptions', label: 'Inscriptions', badge: pendingInscriptions },
    { key: 'création', label: 'Création VM', badge: pendingCreation },
    { key: 'suppression', label: 'Suppression VM', badge: pendingSuppression },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 mt-4">Chargement des requêtes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {credentialsModal && (
        <CredentialsModal
          credentials={credentialsModal.creds}
          studentName={credentialsModal.name}
          studentEmail={credentialsModal.email}
          onClose={() => setCredentialsModal(null)}
        />
      )}

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 max-w-2xl">
        {SUB_TABS.map((tab) => (
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

      {activeTab === 'inscriptions' && (
        <div className="space-y-4">
          {inscriptions.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucune demande d'inscription"
              description="Les demandes de création de compte étudiant apparaîtront ici dès qu'elles seront soumises."
            />
          ) : (
            inscriptions.map((req) => (
              <ScrewCard key={req.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                  <div>
                    <p className="font-bold text-slate-900">{req.etudiant}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {req.matricule} · {req.email}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}
                  >
                    {req.statut}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <p>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Organisation</span>
                    <br />
                    {req.organisation}
                  </p>
                  <p>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Justification</span>
                    <br />
                    <span className="text-slate-600">{req.message}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailRequestId(parseInt(req.id, 10))}
                  className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 hover:underline cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Détail API
                </button>
                {req.statut === 'en attente' && (
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleInscriptionAction(req, 'acceptée')}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 transition cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Accepter
                    </button>
                    <button
                      onClick={() => handleInscriptionAction(req, 'rejetée')}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:bg-red-100 transition cursor-pointer"
                    >
                      <XCircle size={13} /> Rejeter
                    </button>
                  </div>
                )}
              </ScrewCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'création' && (
        <div className="space-y-4">
          {creation.length === 0 ? (
            <EmptyState
              icon={Server}
              title="Aucune demande de création VM"
              description="Les étudiants peuvent soumettre une requête de déploiement depuis leur espace. Elle s'affichera ici pour validation."
            />
          ) : (
            creation.map((req) => (
            <ScrewCard key={req.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule}</p>
                </div>
                <span
                  className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}
                >
                  {req.statut}
                </span>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm font-bold text-slate-800">{req.objet}</p>
                <p className="text-sm text-slate-600">{req.contenu}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Stockage', value: req.size_rom },
                  { label: 'RAM', value: req.size_ram },
                  { label: 'OS', value: req.os },
                ].map((r) => (
                  <div key={r.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <p className="text-[9px] font-bold uppercase text-slate-400">{r.label}</p>
                    <p className="text-xs font-bold text-slate-700">{r.value}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDetailRequestId(parseInt(req.id, 10))}
                className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 hover:underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Détail API
              </button>
              {req.statut === 'en attente' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleVmAction(req.id, 'acceptée')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl px-4 py-2 cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Accepter
                  </button>
                  <button
                    onClick={() => handleVmAction(req.id, 'rejetée')}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase rounded-xl px-4 py-2 cursor-pointer"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                </div>
              )}
            </ScrewCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'suppression' && (
        <div className="space-y-4">
          {suppression.length === 0 ? (
            <EmptyState
              icon={Trash2}
              title="Aucune demande de suppression VM"
              description="Lorsqu'un étudiant demande la suppression d'une machine virtuelle, la requête apparaîtra ici."
            />
          ) : (
            suppression.map((req) => (
            <ScrewCard key={req.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">{req.etudiant}</p>
                  <p className="text-xs text-slate-500 font-medium">{req.matricule}</p>
                </div>
                <span
                  className={`text-xs font-bold tracking-wider uppercase rounded-full px-3 py-1 shrink-0 ${STATUT_BADGE[req.statut]}`}
                >
                  {req.statut}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-700 mb-1">{req.vm}</p>
              <p className="text-sm text-slate-600 mb-4">{req.raison}</p>
              <button
                type="button"
                onClick={() => setDetailRequestId(parseInt(req.id, 10))}
                className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 hover:underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Détail API
              </button>
              {req.statut === 'en attente' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleVmAction(req.id, 'acceptée')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl px-4 py-2 cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Accepter
                  </button>
                  <button
                    onClick={() => handleVmAction(req.id, 'rejetée')}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase rounded-xl px-4 py-2 cursor-pointer"
                  >
                    <XCircle size={13} /> Rejeter
                  </button>
                </div>
              )}
            </ScrewCard>
            ))
          )}
        </div>
      )}

      {detailRequestId != null && (
        <EntityDetailModal
          kind="request"
          id={detailRequestId}
          onClose={() => setDetailRequestId(null)}
        />
      )}
    </div>
  );
}
