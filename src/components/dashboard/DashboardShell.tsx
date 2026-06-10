'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import UserAvatar from '@/components/ui/UserAvatar';

export type DashboardTheme = 'student' | 'teacher' | 'admin';

export type DashboardTab = {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  icon: LucideIcon;
  group: string;
  badge?: number;
  /** Affiché dans la barre de navigation mobile (max 4) */
  mobilePrimary?: boolean;
  /** Masque l'en-tête de page (ex. tableau de bord avec bannière intégrée) */
  hideHeader?: boolean;
};

type UserInfo = {
  id: number;
  username: string;
  subtitle?: string;
  meta?: ReactNode;
};

interface DashboardShellProps {
  theme: DashboardTheme;
  roleBadge: string;
  roleSubtitle: string;
  user: UserInfo;
  userVariant: 'student' | 'teacher' | 'admin';
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

const THEME_STYLES: Record<
  DashboardTheme,
  {
    badge: string;
    navActive: string;
    navInactive: string;
    mobileBarActive: string;
    mobileBarInactive: string;
    linkHover: string;
    groupLabel: string;
  }
> = {
  student: {
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    navActive: 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm',
    navInactive:
      'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md',
    mobileBarActive: 'text-emerald-600',
    mobileBarInactive: 'text-slate-400',
    linkHover: 'hover:text-emerald-600',
    groupLabel: 'text-emerald-600/70',
  },
  teacher: {
    badge: 'bg-blue-50 text-blue-600 border-blue-200',
    navActive: 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm',
    navInactive:
      'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md',
    mobileBarActive: 'text-blue-600',
    mobileBarInactive: 'text-slate-400',
    linkHover: 'hover:text-blue-600',
    groupLabel: 'text-blue-600/70',
  },
  admin: {
    badge: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    navActive: 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm',
    navInactive:
      'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md',
    mobileBarActive: 'text-indigo-600',
    mobileBarInactive: 'text-slate-400',
    linkHover: 'hover:text-indigo-600',
    groupLabel: 'text-indigo-600/70',
  },
};

function groupTabs(tabs: DashboardTab[]): { group: string; items: DashboardTab[] }[] {
  const order: string[] = [];
  const map = new Map<string, DashboardTab[]>();
  for (const tab of tabs) {
    if (!map.has(tab.group)) {
      map.set(tab.group, []);
      order.push(tab.group);
    }
    map.get(tab.group)!.push(tab);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}

export default function DashboardShell({
  theme,
  roleBadge,
  roleSubtitle,
  user,
  userVariant,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  sidebarFooter,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const styles = THEME_STYLES[theme];
  const grouped = groupTabs(tabs);
  const activeTabDef = tabs.find((t) => t.id === activeTab);
  const mobilePrimary = tabs.filter((t) => t.mobilePrimary);
  const mobileSecondary = tabs.filter((t) => !t.mobilePrimary);

  const handleTabChange = (id: string) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 lg:pb-12 overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full bg-slate-200/50 border border-slate-300/60" />
        <div className="absolute top-[600px] -left-[150px] w-[450px] h-[450px] rounded-full bg-slate-200/50 border border-slate-300/40" />
      </div>

      <header
        className="relative w-full bg-white border-b border-slate-200 py-3 sm:py-4 px-4 lg:px-10 flex items-center justify-between gap-3"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 hover:scale-105 transition-transform duration-200 block"
          >
            <Image src="/logo.png" alt="Gandal Logo" fill sizes="48px" className="object-contain" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="hidden sm:inline text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
                GANDAL
              </span>
              <span
                className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${styles.badge}`}
              >
                {roleBadge}
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5 truncate">
              {roleSubtitle}
            </p>
          </div>
        </div>
        <Link
          href="/"
          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 ${styles.linkHover} border border-slate-200 bg-white rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm shrink-0`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Portail</span>
        </Link>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 lg:px-8 mt-5 lg:mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 lg:gap-8">
        <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start space-y-5">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            <div className="text-center pt-3 pb-5 border-b border-slate-100 flex flex-col items-center">
              <UserAvatar
                userId={user.id}
                username={user.username}
                size="lg"
                variant={userVariant}
                border
                className="mb-3"
              />
              <h3 className="font-black text-slate-900 text-sm leading-tight truncate max-w-full px-2">
                {user.username}
              </h3>
              {user.subtitle && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{user.subtitle}</p>
              )}
              {user.meta}
            </div>

            <nav className="pt-4 space-y-4">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-1.5 ${styles.groupLabel}`}>
                    {group}
                  </p>
                  <div className="flex flex-col gap-1">
                    {items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabChange(tab.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide flex items-center justify-between transition-all duration-200 border cursor-pointer ${
                            isActive ? styles.navActive : styles.navInactive
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{tab.label}</span>
                          </span>
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                                isActive ? 'bg-white/80' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={onLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-wide flex items-center gap-2.5 border border-slate-200 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-sm mt-1"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Déconnexion
              </button>
            </nav>
          </div>

          {sidebarFooter}
        </aside>

        <section className="min-w-0 space-y-4">
          {activeTabDef && !activeTabDef.hideHeader && (
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{activeTabDef.label}</h1>
              {activeTabDef.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">{activeTabDef.description}</p>
              )}
            </div>
          )}
          <div className="animate-fade-in min-w-0">{children}</div>
        </section>
      </main>

      {/* Barre de navigation mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb">
        <div className="flex items-stretch justify-around px-1 pt-1 pb-2 max-w-lg mx-auto">
          {mobilePrimary.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 rounded-xl transition-colors ${
                  isActive ? styles.mobileBarActive : styles.mobileBarInactive
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-bold truncate max-w-full">{tab.shortLabel ?? tab.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 px-1 rounded-xl transition-colors ${
              mobileMenuOpen || mobileSecondary.some((t) => t.id === activeTab)
                ? styles.mobileBarActive
                : styles.mobileBarInactive
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[9px] font-bold">Plus</span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Fermer le menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[75vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Navigation</h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 pb-8">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <p className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${styles.groupLabel}`}>
                    {group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabChange(tab.id)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl text-left text-xs font-bold border transition-all ${
                            isActive ? styles.navActive : styles.navInactive
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate flex-1">{tab.label}</span>
                          {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 shrink-0">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-red-200 bg-red-50 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
