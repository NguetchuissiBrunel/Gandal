'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  FileText,
  BookOpen,
  User,
  Globe,
} from 'lucide-react';

import DashboardShell, { type DashboardTab } from '@/components/dashboard/DashboardShell';
import OverviewTab from '@/components/dashboard/OverviewTab';
import VMsTab from '@/components/dashboard/VMsTab';
import RequestsTab from '@/components/dashboard/RequestsTab';
import PublicationsTab from '@/components/dashboard/PublicationsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DNSTab from '@/components/dashboard/DNSTab';
import { apiClient, type TeacherRead, type PublicationRead } from '@/lib/apiClient';
import { filterByUserId, filterRequestsForStudent } from '@/lib/approvalUtils';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';

interface VM {
  id: string;
  name: string;
  os: 'Ubuntu' | 'Debian' | 'CentOS' | 'Windows';
  status: 'Active' | 'Arrêtée' | 'En cours';
  cpu: number;
  ram: number;
  disk: number;
  ip: string;
  project: string;
  handover: 'Prêt' | 'En cours' | 'Non initié';
}

interface RequestItem {
  id: string;
  type: string;
  vmName: string;
  details: string;
  justification: string;
  status: 'En attente' | 'Validée' | 'Rejetée' | 'En cours';
  date: string;
  adminFeedback?: string;
}

interface Publication {
  id: string;
  title: string;
  category: string;
  desc: string;
  vmName: string;
  gitUrl: string;
  date: string;
  checklist: { code: boolean; report: boolean; guide: boolean; vm: boolean };
  views: number;
  likes: number;
}

const mapVMToUI = (vm: any): VM => {
  let status: VM['status'] = 'Arrêtée';
  if (vm.status === 'up') status = 'Active';
  else if (vm.status === 'waiting') status = 'En cours';

  let os: VM['os'] = 'Ubuntu';
  const osLower = (vm.iso || '').toLowerCase();
  if (osLower.includes('debian')) os = 'Debian';
  else if (osLower.includes('centos')) os = 'CentOS';
  else if (osLower.includes('win')) os = 'Windows';

  return {
    id: vm.id.toString(),
    name: vm.node || `vm-${vm.id}`,
    os,
    status,
    cpu: vm.n_cpu,
    ram: vm.size_ram,
    disk: vm.size_rom,
    ip: vm.ip_address || '—',
    project: vm.iso_image || 'Projet Gandal',
    handover: (vm.date_stop_at ? 'Prêt' : 'Non initié') as VM['handover'],
  };
};

const mapRequestToUI = (req: any): RequestItem => {
  let type = 'Requête';
  let details = req.content || '';
  if (req.type === 'r_create_vm') {
    type = 'Création VM';
    details = `OS: ${req.os}, RAM: ${req.size_ram}Go, ROM: ${req.size_rom}Go`;
  } else if (req.type === 'r_delete_vm') {
    type = 'Suppression VM';
    details = `VM ID: ${req.vm_id}`;
  } else if (req.type === 'r_account') {
    type = 'Création Compte';
    details = `Matricule: ${req.matricule}, Org: ${req.organisation}`;
  }

  let status: RequestItem['status'] = 'En attente';
  if (req.status === 'validated') status = 'Validée';
  if (req.status === 'rejected') status = 'Rejetée';

  return {
    id: req.id.toString(),
    type,
    vmName: req.object || 'Gandal VM',
    details,
    justification: req.justification || req.content || 'Pas de justification fournie.',
    status,
    date: 'Récemment',
    adminFeedback: req.feedback || undefined,
  };
};

const mapPublicationToUI = (pub: any): Publication => {
  return {
    id: pub.id.toString(),
    title: pub.nom,
    category: pub.photo || 'Projet Académique',
    desc: pub.description || 'Pas de description.',
    vmName: 'gandal-vm',
    gitUrl: pub.lien || '',
    date: 'Récemment',
    checklist: { code: true, report: true, guide: false, vm: false },
    views: 0,
    likes: 0,
  };
};

export default function StudentDashboard() {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [activeTab, setActiveTab] = useState<'overview' | 'vms' | 'requests' | 'publications' | 'dns' | 'profile'>('overview');

  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [vms, setVms] = useState<VM[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = apiClient.getToken();
        if (!token) {
          router.replace('/login');
          return;
        }

        const me = await apiClient.getMe();
        if (me.type !== 'student') {
          router.replace('/dashboard');
          return;
        }

        setStudentInfo({
          id: me.id,
          username: me.username,
          email: me.email,
          matricule: me.matricule,
          level: me.level,
          department: me.departement,
        });

        const [vmsData, requestsData, publicationsData, teachersData] = await Promise.all([
          apiClient.getVms().catch(() => ({ items: [] })),
          apiClient.getRequests().catch(() => ({ items: [] })),
          apiClient.getPublications().catch(() => ({ items: [] })),
          apiClient.getTeachers().catch(() => ({ items: [] })),
        ]);

        setTeachers(teachersData.items || []);
        setLoadingTeachers(false);

        const myVms = filterByUserId(vmsData.items || [], me.id);
        const myRequests = filterRequestsForStudent(requestsData.items || [], me.id);
        const myPublications = filterByUserId(publicationsData.items || [], me.id);

        setVms(myVms.map(mapVMToUI));
        setRequests(myRequests.map(mapRequestToUI));
        setPublications(myPublications.map(mapPublicationToUI));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        toast(getApiErrorMessage(err, 'Erreur lors du chargement des données.'), 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  // ── Callbacks VMs (start/stop/pause uniquement ; création/suppression via requêtes) ──
  const handleUpdateVMStatus = async (id: string, newStatus: 'Active' | 'Arrêtée' | 'En cours') => {
    try {
      const vmId = parseInt(id);
      if (newStatus === 'Active') {
        await apiClient.startVm(vmId);
        setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: 'Active' } : v));
        toast('Machine virtuelle démarrée.', 'success');
      } else if (newStatus === 'Arrêtée') {
        await apiClient.stopVm(vmId);
        setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: 'Arrêtée' } : v));
        toast('Machine virtuelle arrêtée.', 'info');
      } else {
        await apiClient.pauseVm(vmId);
        setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: 'En cours' } : v));
        toast('Machine virtuelle en pause.', 'info');
      }
    } catch (err: any) {
      toast(getApiErrorMessage(err, "Erreur de changement d'état de la VM."), 'danger');
    }
  };

  // ── Callbacks Requêtes ──
  const handleSubmitRequest = async (
    newReq: Omit<RequestItem, 'id' | 'status' | 'date'> & {
      vmId?: string;
      os?: string;
      sizeRam?: number;
      sizeRom?: number;
      teacherId: number;
      vmLabel?: string;
    }
  ) => {
    try {
      const teacherId = newReq.teacherId;

      let response;
      if (newReq.type === 'Suppression VM') {
        if (!newReq.vmId) {
          toast('Sélectionnez une VM à supprimer.', 'danger');
          return;
        }
        response = await apiClient.deleteVmRequest({
          object: newReq.vmName,
          content: newReq.justification,
          teacher_id: teacherId,
          vm_id: parseInt(newReq.vmId, 10),
        });
      } else if (newReq.type === 'Création VM') {
        response = await apiClient.createVmRequest({
          object: newReq.vmLabel || newReq.vmName,
          content: newReq.justification,
          teacher_id: teacherId,
          size_rom: newReq.sizeRom ?? 40,
          size_ram: newReq.sizeRam ?? 4,
          os: newReq.os ?? 'Ubuntu',
        });
      } else {
        const targetVm = newReq.vmId ? vms.find((v) => v.id === newReq.vmId) : undefined;
        response = await apiClient.createVmRequest({
          object: newReq.type,
          content: `${newReq.vmName} — ${newReq.details}\n\n${newReq.justification}`,
          teacher_id: teacherId,
          size_rom: targetVm?.disk ?? 40,
          size_ram: targetVm?.ram ?? 4,
          os: targetVm?.os ?? 'Ubuntu',
        });
      }

      const mapped = mapRequestToUI(response);
      setRequests((prev) => [mapped, ...prev]);
      toast('Requête soumise avec succès.', 'info');
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la soumission de la requête.'), 'danger');
    }
  };

  // ── Callbacks Publications ──
  const handleDeletePublication = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer la publication',
      message: 'Cette action est définitive. Voulez-vous continuer ?',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await apiClient.deletePublication(parseInt(id, 10));
      setPublications((prev) => prev.filter((p) => p.id !== id));
      toast('Publication supprimée.', 'danger');
    } catch (err: unknown) {
      toast(getApiErrorMessage(err, 'Erreur lors de la suppression.'), 'danger');
    }
  };

  const handleUpdatePublication = async (updated: PublicationRead) => {
    const mapped = mapPublicationToUI(updated);
    setPublications((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
    toast('Publication mise à jour.');
  };

  const handleSubmitPublication = async (newPub: Omit<Publication, 'id' | 'date' | 'views' | 'likes'>) => {
    try {
      const livrables = [
        newPub.checklist.code && 'code',
        newPub.checklist.report && 'rapport',
        newPub.checklist.guide && 'guide',
        newPub.checklist.vm && 'vm',
      ].filter(Boolean).join(', ');

      const description = [
        `[${newPub.category}]`,
        newPub.vmName !== 'Aucune VM liée' ? `VM: ${newPub.vmName}` : null,
        newPub.desc,
        livrables ? `Livrables: ${livrables}` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await apiClient.createPublication({
        nom: newPub.title,
        description,
        lien: newPub.gitUrl || null,
        photo: null,
        user_id: studentInfo.id,
        status: 'published',
      });

      const mapped = mapPublicationToUI(response);
      setPublications((prev) => [mapped, ...prev]);
      toast('Publication soumise avec succès !');
    } catch (err: any) {
      toast(getApiErrorMessage(err, 'Erreur lors de la soumission de la publication.'), 'danger');
    }
  };

  const handleUpdateProfile = async (newInfo: any) => {
    try {
      const updated = await apiClient.updateStudent(studentInfo.id, {
        username: newInfo.username,
        email: newInfo.email,
        level: newInfo.level,
        departement: newInfo.department,
      });
      setStudentInfo({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        matricule: updated.matricule,
        level: updated.level,
        department: updated.departement,
      });
      toast('Profil mis à jour avec succès.');
    } catch (err: unknown) {
      toast(getApiErrorMessage(err, 'Erreur lors de la mise à jour du profil.'), 'danger');
    }
  };

  const dnsVms = useMemo(
    () => vms.map((v) => ({ id: v.id, name: v.name, ip: v.ip })),
    [vms],
  );

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      message: 'Voulez-vous quitter votre espace étudiant ?',
      confirmLabel: 'Se déconnecter',
      variant: 'danger',
    });
    if (!ok) return;
    apiClient.clearToken();
    router.push('/');
  };

  if (loading || !studentInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'En attente').length;
  const activeVms = vms.filter((v) => v.status === 'Active').length;

  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      label: 'Tableau de bord',
      shortLabel: 'Accueil',
      description: 'Vue d\'ensemble de vos VMs, requêtes et publications.',
      icon: LayoutDashboard,
      group: 'Vue d\'ensemble',
      mobilePrimary: true,
      hideHeader: true,
    },
    {
      id: 'vms',
      label: 'Mes machines virtuelles',
      shortLabel: 'VMs',
      description: 'Consultez et contrôlez vos instances Proxmox.',
      icon: Server,
      group: 'Infrastructure',
      badge: activeVms,
      mobilePrimary: true,
    },
    {
      id: 'dns',
      label: 'DNS',
      description: 'Noms de domaine associés à vos machines.',
      icon: Globe,
      group: 'Infrastructure',
    },
    {
      id: 'requests',
      label: 'Requêtes',
      description: 'Créez ou suivez vos demandes de ressources.',
      icon: FileText,
      group: 'Académique',
      badge: pendingRequests,
      mobilePrimary: true,
    },
    {
      id: 'publications',
      label: 'Publications',
      description: 'Partagez et gérez vos projets académiques.',
      icon: BookOpen,
      group: 'Académique',
      mobilePrimary: true,
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
      theme="student"
      roleBadge="ÉTUDIANT"
      roleSubtitle="PORTAIL ACADÉMIQUE · ENSPY"
      user={{
        id: studentInfo.id,
        username: studentInfo.username,
        subtitle: `Niveau ${studentInfo.level} · ${studentInfo.department}`,
        meta: (
          <span className="mt-2 text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest">
            Mat. {studentInfo.matricule}
          </span>
        ),
      }}
      userVariant="student"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
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
            <OverviewTab
              studentInfo={studentInfo}
              vms={vms}
              requests={requests}
              publications={publications}
              onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
            />
          )}

          {activeTab === 'vms' && (
            <VMsTab
              vms={vms}
              projectOptions={publications.map((p) => p.title)}
              requestsOnly
              onNavigateToRequests={() => setActiveTab('requests')}
              onUpdateVMStatus={handleUpdateVMStatus}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsTab
              requests={requests}
              vms={vms.map((v) => ({ id: v.id, name: v.name, os: v.os, ram: v.ram, disk: v.disk }))}
              teachers={teachers}
              loadingTeachers={loadingTeachers}
              onSubmitRequest={handleSubmitRequest}
            />
          )}

          {activeTab === 'publications' && (
            <PublicationsTab
              publications={publications}
              vms={vms.map(v => ({ id: v.id, name: v.name }))}
              onSubmitPublication={handleSubmitPublication}
              onDeletePublication={handleDeletePublication}
              onUpdatePublication={handleUpdatePublication}
            />
          )}

          {activeTab === 'dns' && (
            <DNSTab listMode="by-vm" vms={dnsVms} />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              studentInfo={studentInfo}
              vmsCount={activeVms}
              publicationsCount={publications.length}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
    </DashboardShell>
  );
}