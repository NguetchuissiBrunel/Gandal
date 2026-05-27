'use client';

import React, { useState } from 'react';
import { LayoutDashboard, User, Server, FileText, BookOpen, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import ProfileTab from '@/components/student-dashboard/ProfileTab';
import VmsTab from '@/components/student-dashboard/VmsTab';
import RequestsTab from '@/components/student-dashboard/RequestsTab';
import PublicationsTab from '@/components/student-dashboard/PublicationsTab';

type Tab = 'profile' | 'vms' | 'requests' | 'publications';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'vms': return <VmsTab />;
      case 'requests': return <RequestsTab />;
      case 'publications': return <PublicationsTab />;
      default: return <ProfileTab />;
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'vms', label: 'Mes VMs', icon: Server },
    { id: 'requests', label: 'Mes Requêtes', icon: FileText },
    { id: 'publications', label: 'Mes Publications', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Gandal Edu
        </span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 dark:text-slate-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Gandal Edu
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Menu Étudiant
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {renderContent()}
      </main>
    </div>
  );
}
