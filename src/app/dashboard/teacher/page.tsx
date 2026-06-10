'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, User, Users, Server, PlusCircle, BookOpen, Globe } from 'lucide-react';

import DashboardShell, { type DashboardTab } from '@/components/dashboard/DashboardShell';
import TeacherOverviewTab from '@/components/dashboard/TeacherOverviewTab';
import type { TeacherProfile, AccountRequest, VmRequest, Publication, DeployedVm, ToastType } from './_modules/types';
import ProfileTab from './_modules/ProfileTab';
import InscriptionsTab from './_modules/InscriptionsTab';
import VmsTab from './_modules/VmsTab';
import InstantiationTab from './_modules/InstantiationTab';
import PublicationsTab from './_modules/PublicationsTab';
import DNSTab from '@/components/dashboard/DNSTab';
import CredentialsModal from '@/components/dashboard/CredentialsModal';
import { apiClient, type PublicationRead } from '@/lib/apiClient';
import { parseApprovalCredentials, parseApprovedVmId } from '@/lib/approvalUtils';
import type { ApprovalCredentials } from '@/lib/approvalUtils';
import {
  collectStudentIdsForTeacher,
  loadVmsForTeacherDashboard,
} from '@/lib/teacherDashboardUtils';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';

type TabId =
  | 'overview'
  | 'profile'
  | 'inscriptions'
  | 'vms'
  | 'instantiation'
  | 'publications'
  | 'dns';

const mapAccountRequest = (req: any): AccountRequest => ({
  id: req.id.toString(),
  nom: req.nom || req.object || 'Étudiant',
  email: req.email || 'etudiant@enspy-uy1.cm',
  matricule: req.matricule || 'N/A',
  organisation: req.organisation || 'ENSPY',
  justification: req.justification || req.content || 'Pas de justification.',
  statut: req.status === 'validated' ? 'validated' : req.status === 'rejected' ? 'rejected' : 'pending',
});

const mapVmRequest = (req: any): VmRequest => ({
  id: req.id.toString(),
  objet: req.object || 'Simulation',
  contenu: req.content || 'Détails non fournis.',
  size_RAM: req.size_ram || 4,
  size_ROM: req.size_rom || 40,
  OS: req.os || 'Ubuntu Server',
  Demandeur: req.student_id ? `Étudiant #${req.student_id}` : 'Étudiant',
  statut: req.status === 'validated' ? 'validated' : req.status === 'rejected' ? 'rejected' : 'pending',
});

const mapPublication = (pub: any): Publication => ({
  id: pub.id.toString(),
  nom: pub.nom,
  lien: pub.lien || '',
  description: pub.description || '',
  photo: pub.photo || '/default-photo.png',
  status: pub.status || 'published',
});

const mapDeployedVM = (vm: any): DeployedVm => ({
  id: vm.id.toString(),
  nom: vm.node || `vm-${vm.id}`,
  iso: vm.iso || 'Ubuntu',
  ram: `${vm.size_ram} Go`,
  rom: `${vm.size_rom} Go`,
  cpu: `${vm.n_cpu} Cores`,
  mode: vm.status === 'up' ? 'Active' : 'Arrêtée',
  ip: vm.ip_address || '—',
  lien: vm.ip_address ? `ssh student@${vm.ip_address}` : '—',
  createdAt: vm.date_stop_at || 'Récemment',
});

export default function TeacherDashboard() {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>({
    id: 0,
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [approvalCredentials, setApprovalCredentials] = useState<{
    creds: ApprovalCredentials;
    name: string;
    email?: string;
  } | null>(null);

  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [vmRequests, setVmRequests] = useState<VmRequest[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [deployedVms, setDeployedVms] = useState<DeployedVm[]>([]);
  const [profileStats, setProfileStats] = useState({
    activeVms: 0,
    validatedProjects: 0,
    pendingRequests: 0,
  });
  const showToast = (message: string, type: ToastType = 'success') => {
    toast(message, type);
  };

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const token = apiClient.getToken();
        if (!token) {
          router.replace('/login');
          return;
        }

        const me = await apiClient.getMe();
        if (me.type !== 'teacher') {
          router.replace('/dashboard');
          return;
        }

        setProfile({
          id: me.id,
          username: me.username,
          email: me.email,
          role: me.role || 'Enseignant',
        });

        const [requestsData, publicationsData] = await Promise.all([
          apiClient.getRequests().catch(() => ({ items: [] })),
          apiClient.getPublications().catch(() => ({ items: [] })),
        ]);

        const allRequests = requestsData.items || [];
        const roleLower = (me.role || '').toLowerCase();
        const canSeeAllAccounts = roleLower === 'admin' || roleLower === 'superadmin';

        const vmItems = await loadVmsForTeacherDashboard(me, allRequests).catch(() => []);
        const studentIds = collectStudentIdsForTeacher(allRequests, me.id, canSeeAllAccounts);
        setAccountRequests(
          allRequests
            .filter(
              (r: { type?: string; status?: string; teacher_id?: number }) =>
                r.type === 'r_account' &&
                r.status === 'pending' &&
                (canSeeAllAccounts || r.teacher_id === me.id),
            )
            .map(mapAccountRequest),
        );
        const pendingVm = allRequests.filter(
          (r: { type?: string; status?: string; teacher_id?: number }) =>
            (r.type === 'r_create_vm' || r.type === 'r_delete_vm') &&
            r.status === 'pending' &&
            (canSeeAllAccounts || r.teacher_id === me.id),
        );
        setVmRequests(pendingVm.map(mapVmRequest));

        const pendingAccounts = allRequests.filter(
          (r: { type?: string; status?: string; teacher_id?: number }) =>
            r.type === 'r_account' &&
            r.status === 'pending' &&
            (canSeeAllAccounts || r.teacher_id === me.id),
        );

        setPublications(
          (publicationsData.items || [])
            .filter(
              (p: { user_id?: number }) =>
                canSeeAllAccounts ||
                (typeof p.user_id === 'number' && studentIds.has(p.user_id)),
            )
            .map(mapPublication),
        );
        setDeployedVms(vmItems.map(mapDeployedVM));

        const validatedCount = allRequests.filter(
          (r: { status?: string; teacher_id?: number }) =>
            r.status === 'validated' &&
            (canSeeAllAccounts || r.teacher_id === me.id),
        ).length;

        setProfileStats({
          activeVms: vmItems.filter((v: { status?: string }) => v.status === 'up').length,
          validatedProjects: validatedCount,
          pendingRequests: pendingAccounts.length + pendingVm.length,
        });
      } catch (err) {
        console.error('Error loading teacher dashboard data:', err);
        toast(getApiErrorMessage(err, 'Erreur lors du chargement des données.'), 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [router]);

  const handleApproveAccount = async (id: string, name: string) => {
    try {
      const req = accountRequests.find((r) => r.id === id);
      const response = await apiClient.approveRequest(parseInt(id, 10), '');
      setAccountRequests((p) => p.filter((r) => r.id !== id));
      setProfileStats((s) => ({
        ...s,
        pendingRequests: Math.max(0, s.pendingRequests - 1),
        validatedProjects: s.validatedProjects + 1,
      }));
      const creds = parseApprovalCredentials(response);
      if (creds) {
        setApprovalCredentials({ creds, name, email: req?.email });
        showToast(`Compte de ${name} validé — identifiants disponibles.`);
      } else {
        showToast(
          `Compte de ${name} validé. Les identifiants ont été envoyés par e-mail à l'étudiant.`,
        );
      }
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la validation du compte.'), 'danger');
    }
  };

  const handleRejectAccount = async (id: string, name: string) => {
    try {
      await apiClient.rejectRequest(parseInt(id));
      setAccountRequests((p) => p.filter((r) => r.id !== id));
      setProfileStats((s) => ({
        ...s,
        pendingRequests: Math.max(0, s.pendingRequests - 1),
      }));
      showToast(`Compte de ${name} rejeté.`, 'danger');
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors du rejet du compte.'), 'danger');
    }
  };

  const handleApproveVM = async (id: string, sName: string, pName: string) => {
    try {
      const response = await apiClient.approveRequest(parseInt(id, 10), '');
      setVmRequests((p) => p.filter((r) => r.id !== id));
      setProfileStats((s) => ({
        ...s,
        pendingRequests: Math.max(0, s.pendingRequests - 1),
        validatedProjects: s.validatedProjects + 1,
      }));
      const newVmId = parseApprovedVmId(response);
      if (newVmId) {
        const vm = await apiClient.getVm(newVmId).catch(() => null);
        if (vm) {
          setDeployedVms((prev) => {
            const next = prev.filter((v) => v.id !== String(vm.id));
            return [mapDeployedVM(vm), ...next];
          });
        }
      }
      showToast(`Création VM validée pour "${pName}" !`);
      await refreshDeployedVms();
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la validation de la VM.'), 'danger');
    }
  };

  const handleRejectVM = async (id: string, sName: string) => {
    try {
      await apiClient.rejectRequest(parseInt(id));
      setVmRequests((p) => p.filter((r) => r.id !== id));
      setProfileStats((s) => ({
        ...s,
        pendingRequests: Math.max(0, s.pendingRequests - 1),
      }));
      showToast(`Demande de VM de ${sName} rejetée.`, 'danger');
      await refreshDeployedVms();
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors du rejet de la VM.'), 'danger');
    }
  };

  const refreshDeployedVms = async () => {
    try {
      const me = await apiClient.getMe();
      if (me.type !== 'teacher') return;
      const { items: allRequests } = await apiClient.getRequests().catch(() => ({ items: [] }));
      const vmItems = await loadVmsForTeacherDashboard(me, allRequests);
      setDeployedVms(vmItems.map(mapDeployedVM));
      setProfileStats((s) => ({
        ...s,
        activeVms: vmItems.filter((v) => v.status === 'up').length,
      }));
    } catch {
      /* ignore */
    }
  };

  const handleDeleteVmDirectly = async (id: string) => {
    const vm = deployedVms.find((v) => v.id === id);
    const ok = await confirm({
      title: 'Supprimer la VM',
      message: `Supprimer définitivement « ${vm?.nom ?? 'cette instance'} » ?`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.deleteVm(parseInt(id, 10));
      const removed = deployedVms.find((v) => v.id === id);
      setDeployedVms((prev) => prev.filter((v) => v.id !== id));
      if (removed?.mode === 'Active') {
        setProfileStats((s) => ({ ...s, activeVms: Math.max(0, s.activeVms - 1) }));
      }
      showToast('Instance VM supprimée.', 'danger');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Erreur lors de la suppression de la VM.');
      if (/403|non autorisé|forbidden/i.test(msg)) {
        toast(
          'Suppression non autorisée pour votre rôle. Traitez une requête de suppression VM.',
          'info',
        );
      } else {
        toast(msg, 'danger');
      }
    }
  };

  const handleUpdatePublication = async (updated: PublicationRead) => {
    const mapped = mapPublication(updated);
    setPublications((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
    showToast('Publication mise à jour.', 'success');
  };

  const handleCreatePublication = async (newPub: any) => {
    try {
      const response = await apiClient.createPublication({
        nom: newPub.nom,
        description: newPub.description,
        lien: newPub.lien,
        photo: newPub.photo || '/default-photo.png',
        user_id: profile.id,
        status: newPub.status || 'published',
      });
      setPublications((prev) => [mapPublication(response), ...prev]);
      showToast('Nouvelle publication enregistrée avec succès !');
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la création de la publication.'), 'danger');
    }
  };

  const handleUpdateProfile = async (newProfile: any) => {
    try {
      const updated = await apiClient.updateTeacher(profile.id, {
        username: newProfile.username,
        role: newProfile.role,
      });
      setProfile({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        role: updated.role,
      });
      showToast('Profil mis à jour avec succès.');
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la mise à jour du profil.'), 'danger');
    }
  };

  const dnsVms = useMemo(
    () => deployedVms.map((vm) => ({ id: vm.id, name: vm.nom, ip: vm.ip })),
    [deployedVms],
  );

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      message: 'Voulez-vous quitter votre espace enseignant ?',
      confirmLabel: 'Se déconnecter',
      variant: 'danger',
    });
    if (!ok) return;
    apiClient.clearToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">Chargement de l'espace enseignant...</p>
        </div>
      </div>
    );
  }

  const teacherFullName = profile.username;

  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      label: 'Tableau de bord',
      shortLabel: 'Accueil',
      description: 'Synthèse de vos validations et activités en cours.',
      icon: LayoutDashboard,
      group: 'Vue d\'ensemble',
      badge: profileStats.pendingRequests,
      mobilePrimary: true,
      hideHeader: true,
    },
    {
      id: 'inscriptions',
      label: 'Inscriptions',
      description: 'Validez ou refusez les demandes de création de compte.',
      icon: Users,
      group: 'Validation',
      badge: accountRequests.length,
      mobilePrimary: true,
    },
    {
      id: 'vms',
      label: 'Demandes VM',
      description: 'Traitez les demandes de création ou suppression de VMs.',
      icon: Server,
      group: 'Validation',
      badge: vmRequests.length,
      mobilePrimary: true,
    },
    {
      id: 'instantiation',
      label: 'VMs déployées',
      shortLabel: 'VMs',
      description: 'Instances actives sur le cluster Proxmox.',
      icon: PlusCircle,
      group: 'Infrastructure',
      mobilePrimary: true,
    },
    {
      id: 'dns',
      label: 'DNS',
      description: 'Gestion des entrées DNS pour vos machines.',
      icon: Globe,
      group: 'Infrastructure',
    },
    {
      id: 'publications',
      label: 'Publications',
      description: 'Projets publiés par vos étudiants.',
      icon: BookOpen,
      group: 'Contenu',
    },
    {
      id: 'profile',
      label: 'Mon profil',
      description: 'Informations personnelles et paramètres du compte.',
      icon: User,
      group: 'Compte',
    },
  ];

  return (
    <DashboardShell
      theme="teacher"
      roleBadge="ENSEIGNANT"
      roleSubtitle="ESPACE DE SUPERVISION · ENSPY"
      user={{
        id: profile.id,
        username: profile.username || 'Enseignant',
        subtitle: profile.role,
      }}
      userVariant="teacher"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      onLogout={handleLogout}
      sidebarFooter={
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Établissement</h4>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-xs font-bold">UY1 · ENSPY</p>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">Génie Informatique — Promotion 2026–2027</p>
        </div>
      }
    >
          {activeTab === 'overview' && (
            <TeacherOverviewTab
              username={teacherFullName}
              pendingAccounts={accountRequests.length}
              pendingVmRequests={vmRequests.length}
              deployedVms={deployedVms.length}
              publicationsCount={publications.length}
              onTabChange={(tab) => setActiveTab(tab as TabId)}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab profile={profile} onSave={handleUpdateProfile} showToast={showToast} stats={profileStats} />
          )}
          {activeTab === 'inscriptions' && (
            <InscriptionsTab
              requests={accountRequests}
              onApprove={handleApproveAccount}
              onReject={handleRejectAccount}
            />
          )}
          {activeTab === 'vms' && (
            <VmsTab
              requests={vmRequests}
              onApprove={handleApproveVM}
              onReject={handleRejectVM}
            />
          )}
          {activeTab === 'instantiation' && (
            <InstantiationTab
              deployedVms={deployedVms}
              onDeleteVm={handleDeleteVmDirectly}
            />
          )}
          {activeTab === 'publications' && (
            <PublicationsTab
              publications={publications}
              teacherName={teacherFullName}
              onCreatePublication={handleCreatePublication}
              onUpdatePublication={handleUpdatePublication}
            />
          )}
          {activeTab === 'dns' && (
            <DNSTab listMode="by-vm" vms={dnsVms} />
          )}

      {approvalCredentials && (
        <CredentialsModal
          credentials={approvalCredentials.creds}
          studentName={approvalCredentials.name}
          studentEmail={approvalCredentials.email}
          onClose={() => setApprovalCredentials(null)}
        />
      )}
    </DashboardShell>
  );
}
