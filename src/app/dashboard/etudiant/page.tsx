'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  FileText,
  BookOpen,
  User,
  LogOut,
  ArrowLeft,
  Globe,
} from 'lucide-react';

import Screw3D from '@/components/Screw3D';
import OverviewTab from '@/components/dashboard/OverviewTab';
import VMsTab from '@/components/dashboard/VMsTab';
import RequestsTab from '@/components/dashboard/RequestsTab';
import PublicationsTab from '@/components/dashboard/PublicationsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DNSTab from '@/components/dashboard/DNSTab';
import { apiClient, type TeacherRead, type PublicationRead } from '@/lib/apiClient';
import { filterByUserId, filterRequestsForStudent } from '@/lib/approvalUtils';

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

type ToastType = 'success' | 'danger' | 'info';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'vms' | 'requests' | 'publications' | 'dns' | 'profile'>('overview');

  const [studentInfo, setStudentInfo] = useState<any>({
    id: 0,
    username: 'Chargement...',
    email: 'chargement...',
    matricule: '...',
    level: '...',
    department: '...',
  });
  const [vms, setVms] = useState<VM[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teachers, setTeachers] = useState<TeacherRead[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(true);

  const dnsVms = useMemo(() => {
    return vms.map((v) => ({ id: v.id, name: v.name, ip: v.ip }));
  }, [vms]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
        showToast('Erreur lors du chargement des données.', 'danger');
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
        showToast('Machine virtuelle démarrée.', 'success');
      } else if (newStatus === 'Arrêtée') {
        await apiClient.stopVm(vmId);
        setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: 'Arrêtée' } : v));
        showToast('Machine virtuelle arrêtée.', 'info');
      } else {
        await apiClient.pauseVm(vmId);
        setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: 'En cours' } : v));
        showToast('Machine virtuelle en pause.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || "Erreur de changement d'état de la VM.", 'danger');
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
          showToast('Sélectionnez une VM à supprimer.', 'danger');
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
      showToast('Requête soumise avec succès.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la soumission de la requête.', 'danger');
    }
  };

  // ── Callbacks Publications ──
  const handleDeletePublication = async (id: string) => {
    if (!confirm('Supprimer cette publication ?')) return;
    try {
      await apiClient.deletePublication(parseInt(id, 10));
      setPublications((prev) => prev.filter((p) => p.id !== id));
      showToast('Publication supprimée.', 'danger');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression.', 'danger');
    }
  };

  const handleUpdatePublication = async (updated: PublicationRead) => {
    const mapped = mapPublicationToUI(updated);
    setPublications((prev) => prev.map((p) => (p.id === mapped.id ? mapped : p)));
    showToast('Publication mise à jour.');
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
      showToast('Publication soumise avec succès !');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la soumission de la publication.', 'danger');
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
      showToast('Profil mis à jour avec succès.');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour du profil.', 'danger');
    }
  };

  const handleLogout = () => {
    if (confirm('Voulez-vous vous déconnecter ?')) {
      apiClient.clearToken();
      router.push('/');
    }
  };

  if (loading) {
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

  const TABS = [
    { id: 'overview' as const, label: "Accueil", icon: LayoutDashboard },
    { id: 'vms' as const, label: 'Mes VMs', icon: Server, badge: activeVms },
    { id: 'requests' as const, label: 'Requêtes', icon: FileText, badge: pendingRequests },
    { id: 'publications' as const, label: 'Publications', icon: BookOpen },
    { id: 'dns' as const, label: 'DNS', icon: Globe },
    { id: 'profile' as const, label: 'Mon Profil', icon: User },
  ];

  const initials = studentInfo.username.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-slate-200/50 border border-slate-300/60" />
        <div className="absolute top-[600px] -left-[150px] w-[450px] h-[450px] rounded-full bg-slate-200/50 border border-slate-300/40" />
        <div className="absolute bottom-[200px] right-[10%] w-[250px] h-[250px] rounded-full border-[3px] border-slate-200/80" />
      </div>

      {toast && (
        <div className={`fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 lg:max-w-sm z-50 px-5 py-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
          <span className="font-black text-sm uppercase shrink-0">{toast.type === 'success' ? '✓' : toast.type === 'danger' ? '⚠' : 'ℹ'}</span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <header className="relative w-full bg-white border-b border-slate-200 py-3 sm:py-5 px-4 lg:px-12 flex items-center justify-between gap-3" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 hover:scale-105 transition-transform duration-200 block">
            <Image src="/logo.png" alt="Gandal Logo" fill className="object-contain" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="hidden sm:inline text-lg sm:text-xl font-black tracking-wider text-slate-900 uppercase">GANDAL</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase shrink-0">ÉTUDIANT</span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5 truncate">PORTAIL ACADÉMIQUE · ENSPY</p>
          </div>
        </div>
        <Link href="/" className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 border border-slate-200 bg-white rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Retour au portail</span>
        </Link>
      </header>

      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm w-full max-w-full overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar px-4 py-2.5 gap-2 w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = 'badge' in tab ? tab.badge : undefined;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border ${
                  isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${ isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{badge}</span>
                )}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border border-slate-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Quitter
          </button>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 lg:px-8 mt-6 lg:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 pb-12 shadow-sm">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            <div className="text-center pt-4 pb-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-emerald-50 flex items-center justify-center mb-4 select-none">
                <span className="text-2xl font-black text-emerald-600">{initials}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight">{studentInfo.username}</h3>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">
                Niveau {studentInfo.level} · {studentInfo.department}
              </p>
              <span className="mt-2 text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest">
                Mat. {studentInfo.matricule}
              </span>
            </div>

            <nav className="flex flex-col gap-2 pt-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all duration-200 border cursor-pointer ${isActive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </div>
                    {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-slate-200 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-sm mt-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Déconnexion
              </button>
            </nav>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Établissement affilié</h4>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-xs font-bold leading-tight">Université de Yaoundé I · ENSPY</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Data center local configuré pour les étudiants du Département de Génie Informatique, promotion 2026–2027.
            </p>
          </div>
        </aside>

        <section className="lg:col-span-3">
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
            <DNSTab
              listMode="by-vm"
              vms={dnsVms}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              studentInfo={studentInfo}
              vmsCount={activeVms}
              publicationsCount={publications.length}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </section>
      </main>
    </div>
  );
}