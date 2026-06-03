'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Server, FileText, User, LogOut, ArrowLeft, Shield } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import VMMonitoring from '@/components/dashboard/superadmin/VMMonitoring';
import RequestsPanel from '@/components/dashboard/superadmin/RequestsPanel';
import AdminProfile from '@/components/dashboard/superadmin/AdminProfile';
import { apiClient } from '@/lib/apiClient';

const INITIAL_PENDING = 0;

const TABS = [
  { id: 'profile' as const, label: 'Mon Profil', icon: User },
  { id: 'vms' as const, label: 'VMs', icon: Server },
  { id: 'requests' as const, label: 'Requêtes', icon: FileText },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'vms' | 'requests' | 'profile'>('vms');
  const [pendingCount, setPendingCount] = useState(INITIAL_PENDING);

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
        const requestsData = await apiClient.getRequests();
        const pending = (requestsData.items || []).filter((r: any) => r.status === 'pending').length;
        setPendingCount(pending);
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const handleLogout = () => {
    if (confirm('Voulez-vous vous déconnecter de la session superadmin ?')) {
      apiClient.clearToken();
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 overflow-x-hidden">

      {/* ── ARRIÈRE-PLAN ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-indigo-200/50 border border-indigo-300/60 blur-[2px]" />
        <div className="absolute top-[600px] -left-[150px] w-[450px] h-[450px] rounded-full bg-indigo-200/50 border border-indigo-300/40 blur-[2px]" />
        <div className="absolute bottom-[200px] right-[10%] w-[250px] h-[250px] rounded-full border-[3px] border-indigo-200/80 blur-[1px]" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative w-full bg-white border-b border-slate-200 py-3 sm:py-5 px-4 lg:px-12 flex items-center justify-between gap-3" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 hover:scale-105 transition-transform duration-200 block">
            <Image src="/logo.png" alt="Gandal Logo" fill className="object-contain" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="hidden sm:inline text-lg sm:text-xl font-black tracking-wider text-slate-900 uppercase">GANDAL</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase shrink-0">SUPER ADMIN</span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5 truncate">PANEL D'ADMINISTRATION · CLUSTER PROXMOX</p>
          </div>
        </div>
        <Link href="/" className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 border border-slate-200 bg-white rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm shrink-0">
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
            const badge = tab.id === 'requests' ? pendingCount : undefined;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border ${isActive
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
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
            Déconnexion
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

            {/* Admin Info */}
            <div className="text-center pt-4 pb-6 border-b border-slate-100 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-indigo-50 flex items-center justify-center mb-4 select-none">
                <Shield className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="font-black text-slate-900 text-base leading-tight">Gandal Root</h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Super Admin</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 pt-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const badge = tab.id === 'requests' ? pendingCount : undefined;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all duration-200 border cursor-pointer ${isActive
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.id === 'vms' ? 'Machines Virtuelles' : tab.id === 'requests' ? 'Requêtes' : tab.label}
                    </div>
                    {badge !== undefined && badge > 0 && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{badge}</span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-slate-200 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-sm mt-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Déconnexion
              </button>
            </nav>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Système</h4>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-xs font-bold leading-tight">Proxmox Cluster : 3/3 Actifs</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Supervision globale de l'annuaire GANDAL, de l'allocation des VMs et de la validation des inscriptions.
            </p>
          </div>
        </aside>

        {/* ── WORKSPACE ── */}
        <section className="col-span-1 lg:col-span-3">
          {activeTab === 'profile' && <AdminProfile />}
          {activeTab === 'vms' && <VMMonitoring />}
          {activeTab === 'requests' && <RequestsPanel />}
        </section>
      </main>
    </div>
  );
}
