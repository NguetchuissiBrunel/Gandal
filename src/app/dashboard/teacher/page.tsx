'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Screw3D from '@/components/Screw3D';
import { User, Users, Server, PlusCircle, BookOpen, ArrowLeft } from 'lucide-react';

import type { TeacherProfile, AccountRequest, VmRequest, Publication, ToastType } from './_modules/types';
import ProfileTab from './_modules/ProfileTab';
import InscriptionsTab from './_modules/InscriptionsTab';
import VmsTab from './_modules/VmsTab';
import InstantiationTab from './_modules/InstantiationTab';
import PublicationsTab from './_modules/PublicationsTab';

// === DONNÉES SIMULÉES INITIALES ===
const INITIAL_ACCOUNT_REQUESTS: AccountRequest[] = [
  { id: 'req-acc-1', name: 'Jean Eboa', matricule: '22P250', level: 'Niveau 4', department: 'Génie Informatique', email: 'jean.eboa@enspy-uy1.cm', date: '25/05/2026', reason: "Hébergement d'un projet de fin d'année en Systèmes Distribués (SMA)." },
  { id: 'req-acc-2', name: 'Marie Ngo Ndjock', matricule: '23P190', level: 'Niveau 3', department: 'Génie Télécommunications', email: 'marie.ngo@enspy-uy1.cm', date: '26/05/2026', reason: 'Accès aux ressources de calcul du cluster pour les travaux pratiques de Routage Dynamique.' },
  { id: 'req-acc-3', name: 'Arthur Kamga', matricule: '21P088', level: 'Niveau 5', department: 'Génie Informatique', email: 'arthur.kamga@enspy-uy1.cm', date: '24/05/2026', reason: "Déploiement expérimental d'un modèle d'apprentissage profond sur flux vidéo urbains." }
];

const INITIAL_VM_REQUESTS: VmRequest[] = [
  { id: 'req-vm-1', studentName: 'Jean Eboa', matricule: '22P250', projectName: 'Simulation Trafic Urbain SMA', vcpu: 4, ram: 8, storage: 100, os: 'Ubuntu Server 24.04 LTS', networkVlan: 'VLAN 102 (Isolated)', purpose: 'Exécuter 6 agents logiciels autonomes conformes FIPA en environnement Java JADE avec monitoring Prometheus.', date: '25/05/2026' },
  { id: 'req-vm-2', studentName: 'Arthur Kamga', matricule: '21P088', projectName: 'API Contrôle Intelligent de Trafic', vcpu: 8, ram: 16, storage: 200, os: 'Debian 12 Bookworm', networkVlan: 'VLAN 105 (Public Bridged)', purpose: "Hébergement d'un serveur d'inférence Flask/PyTorch exposé pour l'application mobile de supervision.", date: '26/05/2026' }
];

const INITIAL_PUBLICATIONS: Publication[] = [
  { id: 'pub-1', title: 'Portail de Supervision Multi-Agent', category: 'Système Multi-Agent', authors: 'Promotion GI27', desc: 'Supervise et orchestre en temps réel les ressources physiques et virtuelles de GANDAL grâce à une architecture de 6 agents logiciels autonomes conformes aux normes FIPA.', git: 'https://github.com/enspy-gi27/gandal-sma', status: 'En ligne', ip: '20.20.20.10', vms: 'gandal-sma-master', specs: '4 vCPUs / 8 Go RAM / 100 Go HDD', tags: ['Next.js', 'JADE', 'FIPA-ACL', 'Proxmox API'], grade: '18/20', approvedBy: 'Pr. Batchakui Bernabé', date: '15/05/2026' },
  { id: 'pub-2', title: 'Gestionnaire de Bibliothèque ENSPY', category: 'Application Web', authors: 'Eboa Jean, Ndjock Marie', desc: "Plateforme web centralisée facilitant la gestion, la recherche et l'emprunt d'ouvrages académiques et de mémoires de recherche pour les étudiants et enseignants de l'école.", git: 'https://github.com/enspy-gi27/enspy-library', status: 'En ligne', ip: '20.20.20.12', vms: 'library-prod-vm', specs: '2 vCPUs / 4 Go RAM / 50 Go HDD', tags: ['React', 'NestJS', 'PostgreSQL', 'Nginx'], grade: '16/20', approvedBy: 'Ing. Tedongmouo Abel', date: '20/05/2026' },
  { id: 'pub-3', title: 'Contrôle Intelligent de Trafic', category: 'IoT & Intelligence Artificielle', authors: 'Kamga Arthur', desc: "Système prédictif de régulation des feux de signalisation de Yaoundé basé sur l'analyse de flux vidéo par apprentissage profond, hébergé localement sur nos clusters.", git: 'https://github.com/enspy-gi27/intelligent-traffic', status: 'Hors ligne', ip: '20.20.20.15', vms: 'traffic-inference-node', specs: '8 vCPUs / 16 Go RAM / 200 Go SSD', tags: ['Python', 'PyTorch', 'Docker', 'FastAPI'], grade: '', approvedBy: '', date: '22/05/2026' }
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'inscriptions' | 'vms' | 'instantiation' | 'publications'>('profile');

  // État partagé
  const [profile, setProfile] = useState<TeacherProfile>({
    firstName: 'Bernabé', lastName: 'Batchakui', title: 'Professeur des Universités', role: 'Directeur de Projet',
    department: 'Génie Informatique', email: 'bernabe.batchakui@enspy-uy1.cm', bureau: 'Bâtiment des Enseignants, Bureau E-102',
    cluster: 'Cluster Local GANDAL (ENSPY Yaoundé)', specialty: 'Systèmes Multi-Agents & IA Distribuée',
  });
  
  const [accountRequests, setAccountRequests] = useState(INITIAL_ACCOUNT_REQUESTS);
  const [vmRequests, setVmRequests] = useState(INITIAL_VM_REQUESTS);
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const teacherFullName = `Pr. ${profile.lastName} ${profile.firstName}`;

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
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 transition-all duration-300 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'danger' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
        }`}>
          <span className="font-black text-sm uppercase">{toast.type === 'success' ? '✓ Succès' : toast.type === 'danger' ? '⚠ Alerte' : 'ℹ Info'} :</span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="relative w-full bg-white border-b border-slate-200 py-6 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 hover:scale-105 transition-transform duration-200">
            <Image src="/logo-removebg-preview (1).png" alt="Gandal Logo" fill className="object-contain p-0.5" />
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
                <span className="text-2xl font-black text-blue-600">{`${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight">{profile.title}</h3>
              <p className="text-sm font-black text-black mt-0.5">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{profile.role}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">ENSPY · Dpt. {profile.department}</p>
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
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all duration-200 border cursor-pointer ${
                      isActive ? 'bg-blue-50 text-blue-600 border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'
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
              showToast={showToast} teacherName={teacherFullName} 
              onVmCreated={(pub) => setPublications(p => [pub, ...p])} 
            />
          )}

          {activeTab === 'publications' && (
            <PublicationsTab 
              publications={publications} teacherName={teacherFullName}
              onSaveGrade={(pubId, grade) => {
                setPublications(p => p.map(pub => pub.id === pubId ? { ...pub, grade: grade ? `${grade}/20` : '', approvedBy: teacherFullName } : pub));
                showToast("Évaluation enregistrée.", "success");
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
