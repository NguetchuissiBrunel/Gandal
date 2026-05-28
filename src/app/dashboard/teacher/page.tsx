'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Screw3D from '@/components/Screw3D';
import { User, Users, Server, PlusCircle, BookOpen, ArrowLeft } from 'lucide-react';

import type { TeacherProfile, AccountRequest, VmRequest, Publication, DeployedVm, ToastType } from './_modules/types';
import ProfileTab from './_modules/ProfileTab';
import InscriptionsTab from './_modules/InscriptionsTab';
import VmsTab from './_modules/VmsTab';
import InstantiationTab from './_modules/InstantiationTab';
import PublicationsTab from './_modules/PublicationsTab';

// === DONNÉES SIMULÉES INITIALES ===
const INITIAL_ACCOUNT_REQUESTS: AccountRequest[] = [
  { id: 'req-acc-1', nom: 'Jean Eboa', matricule: '22P250', organisation: 'ENSPY', email: 'jean.eboa@enspy-uy1.cm', justification: "Hébergement d'un projet de fin d'année en Systèmes Distribués (SMA).", statut: 'pending' },
  { id: 'req-acc-2', nom: 'Marie Ngo Ndjock', matricule: '23P190', organisation: 'ENSPY', email: 'marie.ngo@enspy-uy1.cm', justification: 'Accès aux ressources de calcul du cluster pour les travaux pratiques de Routage Dynamique.', statut: 'pending' },
  { id: 'req-acc-3', nom: 'Arthur Kamga', matricule: '21P088', organisation: 'ENSPY', email: 'arthur.kamga@enspy-uy1.cm', justification: "Déploiement expérimental d'un modèle d'apprentissage profond sur flux vidéo urbains.", statut: 'pending' }
];

const INITIAL_VM_REQUESTS: VmRequest[] = [
  { id: 'req-vm-1', objet: 'Simulation Trafic Urbain SMA', contenu: 'Exécuter 6 agents logiciels autonomes conformes FIPA en environnement Java JADE avec monitoring Prometheus.', size_RAM: 8, size_ROM: 100, OS: 'Ubuntu Server 24.04 LTS', Demandeur: '22P250', statut: 'pending' },
  { id: 'req-vm-2', objet: 'API Contrôle Intelligent de Trafic', contenu: "Hébergement d'un serveur d'inférence Flask/PyTorch exposé pour l'application mobile de supervision.", size_RAM: 16, size_ROM: 200, OS: 'Debian 12 Bookworm', Demandeur: '21P088', statut: 'pending' }
];

const INITIAL_PUBLICATIONS: Publication[] = [
  { id: 'pub-1', nom: 'Portail de Supervision Multi-Agent', lien: 'https://github.com/enspy-gi27/gandal-sma', description: 'Supervise et orchestre en temps réel les ressources physiques et virtuelles de GANDAL grâce à une architecture de 6 agents logiciels autonomes conformes aux normes FIPA.', photo: '/default-photo.png', status: 'published' },
  { id: 'pub-2', nom: 'Gestionnaire de Bibliothèque ENSPY', lien: 'https://github.com/enspy-gi27/enspy-library', description: "Plateforme web centralisée facilitant la gestion, la recherche et l'emprunt d'ouvrages académiques et de mémoires de recherche pour les étudiants et enseignants de l'école.", photo: '/default-photo.png', status: 'published' }
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'inscriptions' | 'vms' | 'instantiation' | 'publications'>('profile');

  // État partagé
  const [profile, setProfile] = useState<TeacherProfile>({
    username: 'bbatchakui',
    email: 'bernabe.batchakui@enspy-uy1.cm',
    password: '',
    role: 'Directeur de Projet'
  });

  const [accountRequests, setAccountRequests] = useState(INITIAL_ACCOUNT_REQUESTS);
  const [vmRequests, setVmRequests] = useState(INITIAL_VM_REQUESTS);
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [deployedVms, setDeployedVms] = useState<DeployedVm[]>([]);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const teacherFullName = profile.username;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">

      {/* ── ARRIÈRE-PLAN GEOMETRIQUE ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-slate-200/50 border border-slate-300/60" />
        <div className="absolute top-[600px] -left-[150px] w-[450px] h-[450px] rounded-full bg-slate-200/50 border border-slate-300/40" />
        <div className="absolute bottom-[200px] right-[10%] w-[250px] h-[250px] rounded-full border-[3px] border-slate-200/80" />
      </div>

      {/* --- TOAST --- */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 animate-slide-up ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}>
          <span className="font-black text-sm uppercase">{toast.type === 'success' ? '✓ Succès' : toast.type === 'danger' ? '⚠ Alerte' : 'ℹ Info'} :</span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="relative w-full bg-white border-b border-slate-200 py-6 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="relative w-16 h-16 shrink-0 hover:scale-105 transition-transform duration-200 block">
            <Image src="/logo.png" alt="Gandal Logo" fill className="object-contain" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-slate-900 uppercase">GANDAL</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">CONTRÔLEUR SMA</span>
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">ESPACE ENSEIGNANT DE SUPERVISION · ENSPY</p>
          </div>
        </div>
        <Link href="/" className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 border border-slate-200 bg-white rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au portail public
        </Link>
      </header>

      {/* --- MAIN GRID LAYOUT --- */}
      <main className="relative max-w-7xl mx-auto px-4 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8" style={{ zIndex: 10 }}>

        {/* ── LEFT TACTICAL SIDEBAR ── */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-6 pb-12 shadow-sm transition-shadow duration-300">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            {/* Profile Summary */}
            <div className="text-center pt-4 pb-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-blue-50 flex items-center justify-center mb-4 select-none">
                <span className="text-2xl font-black text-blue-600">{profile.username ? profile.username.substring(0, 2).toUpperCase() : 'TE'}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight">{profile.username}</h3>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{profile.role}</p>
            </div>

            {/* Tab Navigation */}
            <nav className="flex flex-col gap-2 pt-6">
              {[
                { id: 'profile', label: 'Mon Profil', icon: User },
                { id: 'inscriptions', label: 'Demandes Inscription', icon: Users, badge: accountRequests.length },
                { id: 'vms', label: 'Demandes de VM', icon: Server, badge: vmRequests.length },
                { id: 'instantiation', label: 'Instancier une VM', icon: PlusCircle },
                { id: 'publications', label: 'Publications & Projets', icon: BookOpen }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all duration-200 border cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600 border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-3"><Icon className="w-4.5 h-4.5 shrink-0" />{tab.label}</div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
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

        {/* ── RIGHT CONTENT ZONE ── */}
        <section className="lg:col-span-3">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile} onSave={setProfile} showToast={showToast}
              pendingCount={accountRequests.length + vmRequests.length}
            />
          )}

          {activeTab === 'inscriptions' && (
            <InscriptionsTab
              requests={accountRequests}
              onApprove={(id, name) => { setAccountRequests(p => p.filter(r => r.id !== id)); showToast(`Compte de ${name} validé !`); }}
              onReject={(id, name) => { setAccountRequests(p => p.filter(r => r.id !== id)); showToast(`Compte de ${name} rejeté.`, 'danger'); }}
            />
          )}

          {activeTab === 'vms' && (
            <VmsTab
              requests={vmRequests}
              onApprove={(id, sName, pName) => { setVmRequests(p => p.filter(r => r.id !== id)); showToast(`Création VM validée pour "${pName}" !`); }}
              onReject={(id, sName) => { setVmRequests(p => p.filter(r => r.id !== id)); showToast(`Demande de VM de ${sName} rejetée.`, 'danger'); }}
            />
          )}

          {activeTab === 'instantiation' && (
            <InstantiationTab
              showToast={showToast}
              teacherName={teacherFullName}
              deployedVms={deployedVms}
              onVmCreated={(vm) => setDeployedVms((prev) => [vm, ...prev])}
              onDeleteVm={(id) => setDeployedVms((prev) => prev.filter((v) => v.id !== id))}
            />
          )}

          {activeTab === 'publications' && (
            <PublicationsTab
              publications={publications}
              teacherName={teacherFullName}
              onCreatePublication={(newPub) => {
                setPublications((prev) => [
                  { id: `pub-${prev.length + 1}`, ...newPub },
                  ...prev
                ]);
                showToast('Nouvelle publication enregistrée avec succès !');
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
