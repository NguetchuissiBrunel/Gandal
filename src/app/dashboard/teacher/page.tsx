'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Screw3D from '@/components/Screw3D';
import { User, Users, Server, PlusCircle, BookOpen, ArrowLeft, Globe, LogOut } from 'lucide-react';

import type { TeacherProfile, AccountRequest, VmRequest, Publication, DeployedVm, ToastType } from './_modules/types';
import ProfileTab from './_modules/ProfileTab';
import InscriptionsTab from './_modules/InscriptionsTab';
import VmsTab from './_modules/VmsTab';
import InstantiationTab from './_modules/InstantiationTab';
import PublicationsTab from './_modules/PublicationsTab';
import FloatingChatbot from '@/components/FloatingChatbot';
import DNSTab from '@/components/dashboard/DNSTab';
import { apiClient } from '@/lib/apiClient';

const TABS = [
  { id: 'profile', label: 'Mon Profil', icon: User },
  { id: 'inscriptions', label: 'Inscriptions', icon: Users },
  { id: 'vms', label: 'Demandes VM', icon: Server },
  { id: 'instantiation', label: 'Instancier', icon: PlusCircle },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'dns', label: 'DNS', icon: Globe },
] as const;

type TabId = typeof TABS[number]['id'];

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
  ip: vm.ip_address || '192.168.10.100',
  lien: `ssh student@${vm.ip_address || '0.0.0.0'}`,
  createdAt: vm.date_stop_at || 'Récemment',
});

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>({
    id: 0,
    username: 'bbatchakui',
    email: 'bernabe.batchakui@enspy-uy1.cm',
    password: '',
    role: 'Directeur de Projet'
  });

  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [vmRequests, setVmRequests] = useState<VmRequest[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [deployedVms, setDeployedVms] = useState<DeployedVm[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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

        const [requestsData, publicationsData, vmsData] = await Promise.all([
          apiClient.getRequests().catch(() => ({ items: [] })),
          apiClient.getPublications().catch(() => ({ items: [] })),
          apiClient.getVms().catch(() => ({ items: [] })),
        ]);

        const allRequests = requestsData.items || [];
        setAccountRequests(allRequests.filter((r: any) => r.type === 'r_account' && r.status === 'pending').map(mapAccountRequest));
        setVmRequests(allRequests.filter((r: any) => (r.type === 'r_create_vm' || r.type === 'r_delete_vm') && r.status === 'pending').map(mapVmRequest));
        setPublications((publicationsData.items || []).map(mapPublication));
        setDeployedVms((vmsData.items || []).map(mapDeployedVM));
      } catch (err) {
        console.error('Error loading teacher dashboard data:', err);
        showToast('Erreur lors du chargement des données.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [router]);

  const handleApproveAccount = async (id: string, name: string) => {
    try {
      await apiClient.approveRequest(parseInt(id), '');
      setAccountRequests(p => p.filter(r => r.id !== id));
      showToast(`Compte de ${name} validé !`);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la validation du compte.', 'danger');
    }
  };

  const handleRejectAccount = async (id: string, name: string) => {
    try {
      await apiClient.rejectRequest(parseInt(id));
      setAccountRequests(p => p.filter(r => r.id !== id));
      showToast(`Compte de ${name} rejeté.`, 'danger');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du rejet du compte.', 'danger');
    }
  };

  const handleApproveVM = async (id: string, sName: string, pName: string) => {
    try {
      await apiClient.approveRequest(parseInt(id), '');
      setVmRequests(p => p.filter(r => r.id !== id));
      showToast(`Création VM validée pour "${pName}" !`);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la validation de la VM.', 'danger');
    }
  };

  const handleRejectVM = async (id: string, sName: string) => {
    try {
      await apiClient.rejectRequest(parseInt(id));
      setVmRequests(p => p.filter(r => r.id !== id));
      showToast(`Demande de VM de ${sName} rejetée.`, 'danger');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du rejet de la VM.', 'danger');
    }
  };

  const handleCreateVmDirectly = async (vm: any) => {
    try {
      const response = await apiClient.createVm({
        user_id: profile.id,
        size_rom: parseInt(vm.rom),
        size_ram: parseInt(vm.ram),
        n_cpu: parseInt(vm.cpu),
        status: 'stopped',
        iso: vm.iso,
        node: vm.nom,
      });
      const mapped = mapDeployedVM(response);
      setDeployedVms((prev) => [mapped, ...prev]);
      showToast('Nouvelle instance VM créée avec succès !');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la création de la VM.', 'danger');
    }
  };

  const handleDeleteVmDirectly = async (id: string) => {
    try {
      await apiClient.deleteVm(parseInt(id));
      setDeployedVms((prev) => prev.filter((v) => v.id !== id));
      showToast('Instance VM supprimée.', 'danger');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression de la VM.', 'danger');
    }
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
      showToast(err.message || 'Erreur lors de la création de la publication.', 'danger');
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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">Chargement de l'espace enseignant...</p>
        </div>
      </div>
    );
  }

  const teacherFullName = profile.username;

  const tabBadges: Partial<Record<TabId, number>> = {
    inscriptions: accountRequests.length,
    vms: vmRequests.length,
  };

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
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase shrink-0">ENSEIGNANT</span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5 truncate">ESPACE DE SUPERVISION · ENSPY</p>
          </div>
        </div>
        <Link href="/" className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 border border-slate-200 bg-white rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Retour au portail</span>
        </Link>
      </header>

      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm w-full max-w-full overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar px-4 py-2.5 gap-2 w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = tabBadges[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border ${isActive
                  ? 'bg-blue-50 text-blue-600 border-blue-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    {badge}
                  </span>
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
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 pb-12 shadow-sm transition-shadow duration-300">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            <div className="text-center pt-4 pb-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-blue-50 flex items-center justify-center mb-4 select-none">
                <span className="text-2xl font-black text-blue-600">{profile.username ? profile.username.substring(0, 2).toUpperCase() : 'TE'}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight">{profile.username}</h3>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{profile.role}</p>
            </div>

            <nav className="flex flex-col gap-2 pt-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const badge = tabBadges[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all duration-200 border cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600 border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" />{tab.label}</div>
                    {badge !== undefined && badge > 0 && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{badge}</span>
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
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Data center local configuré pour les étudiants du Département de Génie Informatique, promotion 2026–2027.</p>
          </div>
        </aside>

        <section className="col-span-1 lg:col-span-3">
          {activeTab === 'profile' && (
            <ProfileTab profile={profile} onSave={handleUpdateProfile} showToast={showToast} pendingCount={accountRequests.length + vmRequests.length} />
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
              showToast={showToast}
              teacherName={teacherFullName}
              deployedVms={deployedVms}
              onVmCreated={handleCreateVmDirectly}
              onDeleteVm={handleDeleteVmDirectly}
            />
          )}
          {activeTab === 'publications' && (
            <PublicationsTab
              publications={publications}
              teacherName={teacherFullName}
              onCreatePublication={handleCreatePublication}
            />
          )}
          {activeTab === 'dns' && (
            <DNSTab vms={deployedVms.map(vm => ({ id: vm.id, name: vm.nom, ip: vm.ip }))} />
          )}
        </section>
      </main>

      <FloatingChatbot />
    </div>
  );
}
