'use client';

import { useState, useEffect } from 'react';
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
  Menu, 
  X, 
  Bell, 
  Activity, 
  Network,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
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
  checklist: {
    code: boolean;
    report: boolean;
    guide: boolean;
    vm: boolean;
  };
  views: number;
  likes: number;
}

// Initial Mock Data
const INITIAL_STUDENT = {
  username: 'Nguetchuissi Brunel',
  email: 'nguetchuissi.brunel@enspy-uy1.cm',
  matricule: '22P250',
  level: '4',
  department: 'Informatique',
};

const INITIAL_VMS: VM[] = [
  {
    id: 'vm-1',
    name: 'gandal-ubuntu-srv',
    os: 'Ubuntu',
    status: 'Active',
    cpu: 2,
    ram: 4,
    disk: 40,
    ip: '192.168.10.15',
    project: 'Portail de Supervision Multi-Agent',
    handover: 'Prêt',
  },
  {
    id: 'vm-2',
    name: 'enspy-web-portal',
    os: 'Debian',
    status: 'Arrêtée',
    cpu: 1,
    ram: 2,
    disk: 20,
    ip: '192.168.10.22',
    project: 'Gestionnaire de Bibliothèque ENSPY',
    handover: 'Non initié',
  },
  {
    id: 'vm-3',
    name: 'traffic-control-ai',
    os: 'CentOS',
    status: 'Active',
    cpu: 4,
    ram: 8,
    disk: 100,
    ip: '192.168.10.35',
    project: 'Contrôle Intelligent de Trafic',
    handover: 'En cours',
  },
];

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    type: 'Augmentation RAM',
    vmName: 'enspy-web-portal',
    details: '+2 Go RAM',
    justification: 'Besoin de plus de mémoire vive pour compiler et faire tourner l\'application Java Spring Boot.',
    status: 'Validée',
    date: '25 Mai 2026',
    adminFeedback: 'Validée par l\'administrateur. Les ressources RAM ont été allouées sur le nœud physique n°2.',
  },
  {
    id: 'req-2',
    type: 'Allocation CPU additionnels',
    vmName: 'gandal-ubuntu-srv',
    details: '+2 Cores CPU',
    justification: 'Nécessaire pour le calcul parallèle intensif de nos 6 agents logiciels conformes FIPA.',
    status: 'Rejetée',
    date: '26 Mai 2026',
    adminFeedback: 'Rejetée. La capacité totale allouée à votre projet dépasse le quota standard par étudiant (max 8 cores). Veuillez libérer des ressources sur d\'autres VMs.',
  },
  {
    id: 'req-3',
    type: 'Ouverture Port Réseau',
    vmName: 'traffic-control-ai',
    details: 'Port 8080 TCP (Public)',
    justification: 'Besoin de rendre l\'API publique du modèle de détection de trafic accessible pour l\'application frontend mobile.',
    status: 'En attente',
    date: 'Aujourd\'hui',
  },
];

const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'Portail de Supervision Multi-Agent',
    category: 'Système Multi-Agent',
    desc: 'Supervise et orchestre en temps réel les ressources physiques et virtuelles de GANDAL grâce à une architecture de 6 agents logiciels autonomes conformes aux normes FIPA.',
    vmName: 'gandal-ubuntu-srv',
    gitUrl: 'https://github.com/enspy-gi27/supervision-sma',
    date: '15 Mai 2026',
    checklist: {
      code: true,
      report: true,
      guide: true,
      vm: true,
    },
    views: 142,
    likes: 28,
  },
  {
    id: 'pub-2',
    title: 'Gestionnaire de Bibliothèque ENSPY',
    category: 'Application Web',
    desc: 'Plateforme web centralisée facilitant la gestion, la recherche et l\'emprunt d\'ouvrages académiques et de mémoires de recherche pour les étudiants et enseignants de l\'école.',
    vmName: 'enspy-web-portal',
    gitUrl: 'https://github.com/enspy-gi27/library-mgr',
    date: '18 Mai 2026',
    checklist: {
      code: true,
      report: true,
      guide: false,
      vm: false,
    },
    views: 89,
    likes: 12,
  },
];

const NOTIFICATIONS = [
  { id: 'n-1', text: '[Agent-Déploiement] VM gandal-ubuntu-srv démarrée avec succès.', time: 'Il y a 10 min' },
  { id: 'n-2', text: '[Système] Votre requête d\'augmentation de RAM pour enspy-web-portal a été VALIDÉE.', time: 'Il y a 2 heures' },
  { id: 'n-3', text: '[Agent-Passation] Alerte : Rapport PDF manquant pour le projet de Bibliothèque.', time: 'Hier' },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Core App States
  const [studentInfo, setStudentInfo] = useState(INITIAL_STUDENT);
  const [vms, setVms] = useState<VM[]>(INITIAL_VMS);
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [publications, setPublications] = useState<Publication[]>(INITIAL_PUBLICATIONS);

  // Authenticate simulation (Check if session mock is active, redirect to login if not)
  useEffect(() => {
    // Check if session storage exists or we are on client side
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('gandal_intro_seen') === 'true';
      // For presentation/test robustness, if they haven't seen intro, we don't hard block them, but recommend login.
    }
  }, []);

  // VM Callbacks
  const handleCreateVM = (newVM: Omit<VM, 'id' | 'ip' | 'handover'>) => {
    // Check name duplicate
    if (vms.some(v => v.name.toLowerCase() === newVM.name.toLowerCase())) {
      return 'Une machine virtuelle avec ce nom existe déjà.';
    }

    const randomIp = `192.168.10.${Math.floor(Math.random() * 200) + 50}`;
    const created: VM = {
      ...newVM,
      id: `vm-${vms.length + 1}`,
      ip: randomIp,
      handover: 'Non initié',
    };

    setVms((prev) => [...prev, created]);

    // Simulate agent auto-starting VM after 3 seconds
    setTimeout(() => {
      setVms((prev) => 
        prev.map(v => v.id === created.id ? { ...v, status: 'Active' } : v)
      );
    }, 3000);

    return true;
  };

  const handleDeleteVM = (id: string) => {
    setVms((prev) => prev.filter(v => v.id !== id));
  };

  const handleUpdateVMStatus = (id: string, newStatus: 'Active' | 'Arrêtée' | 'En cours') => {
    setVms((prev) => 
      prev.map(v => v.id === id ? { ...v, status: newStatus } : v)
    );
  };

  // Request Callbacks
  const handleSubmitRequest = (newReq: Omit<RequestItem, 'id' | 'status' | 'date'>) => {
    const created: RequestItem = {
      ...newReq,
      id: `req-${requests.length + 1}`,
      status: 'En attente',
      date: 'Aujourd\'hui',
    };
    setRequests((prev) => [created, ...prev]);
  };

  // Publication Callbacks
  const handleSubmitPublication = (newPub: Omit<Publication, 'id' | 'date' | 'views' | 'likes'>) => {
    const created: Publication = {
      ...newPub,
      id: `pub-${publications.length + 1}`,
      date: 'Aujourd\'hui',
      views: 0,
      likes: 0,
    };
    setPublications((prev) => [created, ...prev]);

    // Update VM handover tag to match checklist progress
    const isComplete = Object.values(newPub.checklist).filter(Boolean).length === 4;
    const associatedVm = vms.find(v => v.name === newPub.vmName);
    if (associatedVm) {
      setVms((prev) => 
        prev.map(v => v.id === associatedVm.id 
          ? { ...v, handover: (isComplete ? 'Prêt' : 'En cours') as 'Prêt' | 'En cours' | 'Non initié' } 
          : v
        )
      );
    }
  };

  // Profile Callbacks
  const handleUpdateProfile = (updatedInfo: typeof INITIAL_STUDENT) => {
    setStudentInfo(updatedInfo);
  };

  // Logout Handler
  const handleLogout = () => {
    if (confirm('Voulez-vous vous déconnecter de la plateforme ?')) {
      sessionStorage.removeItem('gandal_intro_seen');
      router.push('/');
    }
  };

  // Sidebar Items
  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'vms', label: 'Mes VMs', icon: Server },
    { id: 'requests', label: 'Mes Requêtes', icon: FileText },
    { id: 'publications', label: 'Mes Publications', icon: BookOpen },
    { id: 'profile', label: 'Mon Profil', icon: User },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden font-sans">
      
      {/* ── BACKGROUND ORNAMENTAL BLOBS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/2 border border-blue-500/10 dark:border-blue-500/1 blur-xl" />
        <div className="absolute bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/2 border border-indigo-500/10 dark:border-indigo-500/1 blur-xl" />
      </div>

      {/* ── RESPONSIVE SIDEBAR ── */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between transition-transform duration-300 xl:translate-x-0 xl:static xl:shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white p-0.5 shadow-sm">
                <Image
                  src="/logo-removebg-preview (1).png"
                  alt="Gandal Logo"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider leading-none text-slate-900 dark:text-white uppercase">
                  GANDAL
                </span>
                <span className="text-[7px] font-bold tracking-widest text-slate-400 mt-1 uppercase">
                  Data Center ENSPY
                </span>
              </div>
            </Link>
            
            {/* Close sidebar on mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="xl:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-650 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Block & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm">
              👨‍💻
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {studentInfo.username}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                Mat: {studentInfo.matricule}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4.5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT SHELL ── */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Topbar */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 px-6 py-4.5 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Info badges */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                <span>Nœuds Cluster : 3/3 Actifs</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>SMA : Supervision Active</span>
              </div>
            </div>
          </div>

          {/* Quick options panel */}
          <div className="flex items-center gap-4 relative">
            
            {/* Search placeholder */}
            <div className="hidden md:relative md:block w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                disabled
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 text-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-[11px] outline-none cursor-not-allowed opacity-75"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-350 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden z-50 animate-fade-in p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Notifications du Système
                    </span>
                    <span className="text-[9px] font-bold text-blue-600 cursor-pointer hover:underline uppercase tracking-wider">
                      Tout marquer lu
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {NOTIFICATIONS.map((notif) => (
                      <div key={notif.id} className="text-xs border-b border-slate-50 dark:border-slate-950 pb-2.5 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
                          {notif.text}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-widest">
                          {notif.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile shortcut */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-150 dark:bg-blue-900/40 flex items-center justify-center text-xs">
                👨‍💻
              </div>
              <span className="hidden md:inline text-xs font-black text-slate-800 dark:text-slate-200 pr-2">
                {studentInfo.username.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Central Workspace container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'overview' && (
            <OverviewTab 
              studentInfo={studentInfo} 
              vms={vms} 
              requests={requests} 
              publications={publications}
              onTabChange={setActiveTab}
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
              vmsCount={vms.filter(v => v.status === 'Active').length}
              publicationsCount={publications.length}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

    </div>
  );
}
