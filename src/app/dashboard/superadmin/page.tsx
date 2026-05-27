'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VMMonitoring from '@/components/dashboard/superadmin/VMMonitoring';
import RequestsPanel from '@/components/dashboard/superadmin/RequestsPanel';
import AdminProfile from '@/components/dashboard/superadmin/AdminProfile';

const TABS = ['Machines Virtuelles', 'Requêtes', 'Profil'];
const INITIAL_PENDING = 4;

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('Machines Virtuelles');
  const [pendingCount, setPendingCount] = useState(INITIAL_PENDING);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* ── ARRIÈRE-PLAN : CERCLES BLEUS ÉPARPILLÉS PLUS FLOUS (LIGHT MODE) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[140px] -right-[140px] w-[550px] h-[550px] rounded-full bg-blue-600/10 border border-blue-500/15 blur-md" />
        <div className="absolute -top-[40px] -right-[40px] w-[280px] h-[280px] rounded-full border-[3px] border-blue-400/15 blur-sm" />
        <div className="absolute top-[80px] left-[8%] w-[60px] h-[60px] rounded-full bg-blue-500/20 blur-sm" />
        <div className="absolute top-[-80px] left-[30%] w-[400px] h-[400px] rounded-full border border-blue-500/5 blur-[2px]" />
        <div className="absolute top-[300px] right-[8%] w-[120px] h-[120px] rounded-full bg-blue-500/12 border border-blue-400/12 blur-sm" />
        <div className="absolute top-[550px] -left-[180px] w-[420px] h-[420px] rounded-full bg-blue-500/10 border border-blue-400/12 blur-md" />

        {/* Tiny dots cluster top-left */}
        <div className="absolute top-[200px] left-[20%] w-[24px] h-[24px] rounded-full bg-blue-600/25 blur-[1px]" />
        <div className="absolute top-[240px] left-[22%] w-[12px] h-[12px] rounded-full bg-blue-400/30 blur-[1px]" />
        <div className="absolute top-[180px] left-[24%] w-[18px] h-[18px] rounded-full bg-blue-500/25 blur-[1px]" />
      </div>

      {/* ── Navbar ── */}
      <Navbar minimal={false} />

      {/* ── Header ── */}
      <div className="relative z-10 pt-28 pb-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-1">
              Super Administrateur
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Tableau de Bord
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              GANDAL Data Center — ENSPY
            </p>
          </div>
          <button className="flex items-center gap-2 border border-slate-200 text-slate-700 text-xs font-bold tracking-wider uppercase rounded-xl px-4 py-2 hover:border-black hover:text-black transition cursor-pointer">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* ── Tabs de navigation ── */}
      <div className="relative z-10 border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex gap-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 flex items-center gap-2 transition cursor-pointer ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold text-sm'
                  : 'text-slate-500 hover:text-slate-900 font-medium text-sm'
              }`}
            >
              {tab}
              {tab === 'Requêtes' && (
                <span className="text-[10px] font-black bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'Machines Virtuelles' && <VMMonitoring />}
        {activeTab === 'Requêtes' && <RequestsPanel />}
        {activeTab === 'Profil' && <AdminProfile />}
      </div>

    </div>
  );
}
