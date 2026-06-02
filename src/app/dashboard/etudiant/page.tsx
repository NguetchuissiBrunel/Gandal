'use client';

import { useState } from 'react';
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
} from 'lucide-react';

import Screw3D from '@/components/Screw3D';
import OverviewTab from '@/components/dashboard/OverviewTab';
import VMsTab from '@/components/dashboard/VMsTab';
import RequestsTab from '@/components/dashboard/RequestsTab';
import PublicationsTab from '@/components/dashboard/PublicationsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';

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

// ── Données initiales ──
const INITIAL_STUDENT = {
  username: 'Nguetchuissi Brunel',
  email: 'nguetchuissi.brunel@enspy-uy1.cm',
  matricule: '22P250',
  level: '4',
  department: 'Informatique',
};

const INITIAL_VMS: VM[] = [
  { id: 'vm-1', name: 'gandal-ubuntu-srv', os: 'Ubuntu', status: 'Active', cpu: 2, ram: 4, disk: 40, ip: '192.168.10.15', project: 'Portail de Supervision Multi-Agent', handover: 'Prêt' },
  { id: 'vm-2', name: 'enspy-web-portal', os: 'Debian', status: 'Arrêtée', cpu: 1, ram: 2, disk: 20, ip: '192.168.10.22', project: 'Gestionnaire de Bibliothèque ENSPY', handover: 'Non initié' },
  { id: 'vm-3', name: 'traffic-control-ai', os: 'CentOS', status: 'Active', cpu: 4, ram: 8, disk: 100, ip: '192.168.10.35', project: 'Contrôle Intelligent de Trafic', handover: 'En cours' },
];

const INITIAL_REQUESTS: RequestItem[] = [
  { id: 'req-1', type: 'Augmentation RAM', vmName: 'enspy-web-portal', details: '+2 Go RAM', justification: "Besoin de plus de mémoire vive pour compiler l'application Java Spring Boot.", status: 'Validée', date: '25 Mai 2026', adminFeedback: "Validée par l'administrateur. RAM allouée sur le nœud n°2." },
  { id: 'req-2', type: 'Allocation CPU additionnels', vmName: 'gandal-ubuntu-srv', details: '+2 Cores CPU', justification: 'Nécessaire pour le calcul parallèle de nos 6 agents FIPA.', status: 'Rejetée', date: '26 Mai 2026', adminFeedback: 'Quota standard dépassé (max 8 cores). Libérez des ressources.' },
  { id: 'req-3', type: 'Ouverture Port Réseau', vmName: 'traffic-control-ai', details: 'Port 8080 TCP (Public)', justification: "API du modèle de détection de trafic accessible pour l'application frontend.", status: 'En attente', date: "Aujourd'hui" },
];

const INITIAL_PUBLICATIONS: Publication[] = [
  { id: 'pub-1', title: 'Portail de Supervision Multi-Agent', category: 'Système Multi-Agent', desc: 'Orchestre les ressources de GANDAL via 6 agents FIPA.', vmName: 'gandal-ubuntu-srv', gitUrl: 'https://github.com/enspy-gi27/supervision-sma', date: '15 Mai 2026', checklist: { code: true, report: true, guide: true, vm: true }, views: 142, likes: 28 },
  { id: 'pub-2', title: 'Gestionnaire de Bibliothèque ENSPY', category: 'Application Web', desc: "Plateforme de gestion d'ouvrages académiques pour étudiants et enseignants.", vmName: 'enspy-web-portal', gitUrl: 'https://github.com/enspy-gi27/library-mgr', date: '18 Mai 2026', checklist: { code: true, report: true, guide: false, vm: false }, views: 89, likes: 12 },
];

type ToastType = 'success' | 'danger' | 'info';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'vms' | 'requests' | 'publications' | 'profile'>('overview');

  const [studentInfo, setStudentInfo] = useState(INITIAL_STUDENT);
  const [vms, setVms] = useState<VM[]>(INITIAL_VMS);
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [publications, setPublications] = useState<Publication[]>(INITIAL_PUBLICATIONS);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Callbacks VMs ──
  const handleCreateVM = (newVM: Omit<VM, 'id' | 'ip' | 'handover'>) => {
    if (vms.some((v) => v.name.toLowerCase() === newVM.name.toLowerCase())) {
      return 'Une machine virtuelle avec ce nom existe déjà.';
    }
    const ip = `192.168.10.${Math.floor(Math.random() * 200) + 50}`;
    const created: VM = { ...newVM, id: `vm-${Date.now()}`, ip, handover: 'Non initié' };
    setVms((prev) => [...prev, created]);
    setTimeout(() => setVms((prev) => prev.map((v) => v.id === created.id ? { ...v, status: 'Active' } : v)), 3000);
    showToast(`VM "${created.name}" créée avec succès !`);
    return true;
  };

  const handleDeleteVM = (id: string) => {
    setVms((prev) => prev.filter((v) => v.id !== id));
    showToast('Machine virtuelle supprimée.', 'danger');
  };

  const handleUpdateVMStatus = (id: string, newStatus: 'Active' | 'Arrêtée' | 'En cours') => {
    setVms((prev) => prev.map((v) => v.id === id ? { ...v, status: newStatus } : v));
  };

  // ── Callbacks Requêtes ──
  const handleSubmitRequest = (newReq: Omit<RequestItem, 'id' | 'status' | 'date'>) => {
    const created: RequestItem = { ...newReq, id: `req-${Date.now()}`, status: 'En attente', date: "Aujourd'hui" };
    setRequests((prev) => [created, ...prev]);
    showToast('Requête soumise avec succès.', 'info');
  };

  // ── Callbacks Publications ──
  const handleSubmitPublication = (newPub: Omit<Publication, 'id' | 'date' | 'views' | 'likes'>) => {
    const created: Publication = { ...newPub, id: `pub-${Date.now()}`, date: "Aujourd'hui", views: 0, likes: 0 };
    setPublications((prev) => [created, ...prev]);
    const isComplete = Object.values(newPub.checklist).filter(Boolean).length === 4;
    const associatedVm = vms.find((v) => v.name === newPub.vmName);
    if (associatedVm) {
      setVms((prev) => prev.map((v) => v.id === associatedVm.id ? { ...v, handover: (isComplete ? 'Prêt' : 'En cours') as VM['handover'] } : v));
    }
    showToast('Publication soumise avec succès !');
  };

  const handleLogout = () => {
    if (confirm('Voulez-vous vous déconnecter ?')) {
      sessionStorage.removeItem('gandal_intro_seen');
      router.push('/');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'En attente').length;
  const activeVms = vms.filter((v) => v.status === 'Active').length;

  const TABS = [
    { id: 'overview' as const, label: "Accueil", icon: LayoutDashboard },
    { id: 'vms' as const, label: 'Mes VMs', icon: Server, badge: activeVms },
    { id: 'requests' as const, label: 'Requêtes', icon: FileText, badge: pendingRequests },
    { id: 'publications' as const, label: 'Publications', icon: BookOpen },
    { id: 'profile' as const, label: 'Mon Profil', icon: User },
  ];

  const initials = studentInfo.username.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">

      {/* ── ARRIÈRE-PLAN GÉOMÉTRIQUE ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-slate-200/50 border border-slate-300/60" />
        <div className="absolute top-[600px] -left-[150px] w-[450px] h-[450px] rounded-full bg-slate-200/50 border border-slate-300/40" />
        <div className="absolute bottom-[200px] right-[10%] w-[250px] h-[250px] rounded-full border-[3px] border-slate-200/80" />
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 lg:max-w-sm z-50 px-5 py-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
          <span className="font-black text-sm uppercase shrink-0">{toast.type === 'success' ? '✓' : toast.type === 'danger' ? '⚠' : 'ℹ'}</span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── HEADER ── */}
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

      {/* ── MOBILE TAB BAR (visible < lg) ── */}
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

      {/* ── MAIN GRID ── */}
      <main className="relative max-w-7xl mx-auto px-4 lg:px-8 mt-6 lg:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

        {/* ── SIDEBAR (desktop only) ── */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 pb-12 shadow-sm">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            {/* Avatar + infos */}
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

            {/* Navigation */}
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

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-slate-200 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-sm mt-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Déconnexion
              </button>
            </nav>
          </div>

          {/* Info box établissement */}
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

        {/* ── CONTENU PRINCIPAL ── */}
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
              onCreateVM={handleCreateVM}
              onDeleteVM={handleDeleteVM}
              onUpdateVMStatus={handleUpdateVMStatus}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsTab
              requests={requests}
              vms={vms}
              onSubmitRequest={handleSubmitRequest}
            />
          )}

          {activeTab === 'publications' && (
            <PublicationsTab
              publications={publications}
              vms={vms}
              onSubmitPublication={handleSubmitPublication}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              studentInfo={studentInfo}
              vmsCount={activeVms}
              publicationsCount={publications.length}
              onUpdateProfile={setStudentInfo}
            />
          )}
        </section>
      </main>
    </div>
  );
}