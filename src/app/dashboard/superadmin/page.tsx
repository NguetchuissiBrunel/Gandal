'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Server, FileText, User, UserPlus, GraduationCap, Globe, Network } from 'lucide-react';
import DashboardShell, { type DashboardTab } from '@/components/dashboard/DashboardShell';
import AdminOverviewTab from '@/components/dashboard/AdminOverviewTab';
import DNSTab from '@/components/dashboard/DNSTab';
import TopologyView from '@/components/topology/TopologyView';
import VMMonitoring from '@/components/dashboard/superadmin/VMMonitoring';
import RequestsPanel from '@/components/dashboard/superadmin/RequestsPanel';
import TeachersPanel from '@/components/dashboard/superadmin/TeachersPanel';
import StudentsPanel from '@/components/dashboard/superadmin/StudentsPanel';
import AdminProfile from '@/components/dashboard/superadmin/AdminProfile';
import { apiClient } from '@/lib/apiClient';
import type { TeacherRead } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';

const INITIAL_PENDING = 0;

type AdminTabId = 'overview' | 'profile' | 'students' | 'teachers' | 'requests' | 'vms' | 'topology' | 'dns';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { confirm } = useFeedback();
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [pendingCount, setPendingCount] = useState(INITIAL_PENDING);
  const [adminUser, setAdminUser] = useState<TeacherRead | null>(null);
  const [vmStats, setVmStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = apiClient.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      try {
        const me = await apiClient.getMe();
        if (me.type !== 'teacher' || (me.role?.toLowerCase() !== 'superadmin' && me.role?.toLowerCase() !== 'admin')) {
          router.replace('/dashboard');
          return;
        }
        setAdminUser(me);

        const [requestsData, vmsData, healthOk] = await Promise.all([
          apiClient.getRequests(),
          apiClient.getVms().catch(() => ({ items: [] })),
          apiClient.health().then(() => true).catch(() => false),
        ]);
        setApiOnline(healthOk);
        const pending = (requestsData.items || []).filter(
          (r: { status?: string }) => r.status === 'pending',
        ).length;
        setPendingCount(pending);

        const vms = vmsData.items || [];
        setVmStats({
          total: vms.length,
          active: vms.filter((v: { status?: string }) => v.status === 'up').length,
        });
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Déconnexion',
      message: 'Voulez-vous quitter la session superadmin ?',
      confirmLabel: 'Se déconnecter',
      variant: 'danger',
    });
    if (!ok) return;
    apiClient.clearToken();
    router.push('/');
  };

  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      label: 'Centre de contrôle',
      shortLabel: 'Accueil',
      description: 'Vue d\'ensemble de l\'infrastructure et des actions prioritaires.',
      icon: LayoutDashboard,
      group: 'Vue d\'ensemble',
      badge: pendingCount,
      mobilePrimary: true,
      hideHeader: true,
    },
    {
      id: 'requests',
      label: 'Requêtes',
      description: 'Validez ou refusez les demandes des utilisateurs.',
      icon: FileText,
      group: 'Opérations',
      badge: pendingCount,
      mobilePrimary: true,
    },
    {
      id: 'students',
      label: 'Étudiants',
      description: 'Créer, modifier ou supprimer des comptes étudiants.',
      icon: GraduationCap,
      group: 'Utilisateurs',
      mobilePrimary: true,
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      description: 'Gérer les comptes enseignants et administrateurs.',
      icon: UserPlus,
      group: 'Utilisateurs',
      mobilePrimary: true,
    },
    {
      id: 'vms',
      label: 'Machines virtuelles',
      shortLabel: 'VMs',
      description: 'Surveillance et contrôle du parc de VMs Proxmox.',
      icon: Server,
      group: 'Opérations',
    },
    {
      id: 'topology',
      label: 'Topologie réseau',
      shortLabel: 'Réseau',
      description: 'Toile interactive du cluster : VMs, liens réseau, accès Internet, distribution.',
      icon: Network,
      group: 'Opérations',
    },
    {
      id: 'dns',
      label: 'DNS',
      description: 'Gestion globale des entrées DNS du cluster.',
      icon: Globe,
      group: 'Système',
    },
    {
      id: 'profile',
      label: 'Mon profil',
      description: 'Informations du compte administrateur.',
      icon: User,
      group: 'Compte',
    },
  ];

  return (
    <DashboardShell
      theme="admin"
      roleBadge="SUPER ADMIN"
      roleSubtitle="PANEL D'ADMINISTRATION · CLUSTER PROXMOX"
      user={{
        id: adminUser?.id ?? 0,
        username: adminUser?.username || 'Administrateur',
        subtitle: adminUser?.role || 'Super Admin',
      }}
      userVariant="admin"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as AdminTabId)}
      onLogout={handleLogout}
      sidebarFooter={
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut système</h4>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                apiOnline === null ? 'bg-slate-400' : apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <p className="text-xs font-bold">API {apiOnline === null ? '…' : apiOnline ? 'en ligne' : 'hors ligne'}</p>
          </div>
          <p className="text-xs font-bold">
            VMs : {vmStats.active}/{vmStats.total || '—'} actives
          </p>
          <a
            href="https://gandal-api.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-indigo-300 hover:underline inline-block"
          >
            Documentation API →
          </a>
        </div>
      }
    >
          {activeTab === 'overview' && (
            <AdminOverviewTab
              username={adminUser?.username || 'Administrateur'}
              role={adminUser?.role || 'Super Admin'}
              pendingCount={pendingCount}
              vmTotal={vmStats.total}
              vmActive={vmStats.active}
              apiOnline={apiOnline}
              onTabChange={(tab) => setActiveTab(tab as AdminTabId)}
            />
          )}
          {activeTab === 'profile' && <AdminProfile />}
          {activeTab === 'students' && <StudentsPanel />}
          {activeTab === 'teachers' && <TeachersPanel />}
          {activeTab === 'requests' && <RequestsPanel />}
          {activeTab === 'vms' && <VMMonitoring />}
          {activeTab === 'topology' && <TopologyView canControlLifecycle showDistribution />}
          {activeTab === 'dns' && <DNSTab listMode="all" />}
    </DashboardShell>
  );
}
