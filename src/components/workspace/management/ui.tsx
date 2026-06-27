'use client';

import type { ReactNode } from 'react';

/** Conteneur de vue de gestion (sombre, plein écran sous la top bar). */
export function MgmtView({ title, subtitle, actions, children }: {
  title: string; subtitle?: string; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#ffffff] px-6 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            {subtitle && <p className="text-[12px] text-slate-400 dark:text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] ${className}`}>{children}</div>;
}

export function Badge({ tone, children }: { tone: 'pending' | 'ok' | 'reject' | 'muted'; children: ReactNode }) {
  const t = {
    pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
    ok: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    reject: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300',
    muted: 'bg-slate-100 dark:bg-[#1c1c1c] text-slate-500 dark:text-slate-400 dark:text-slate-500',
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${t}`}>{children}</span>;
}

export const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-[#ffffff] px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-500';
export const btnPrimary = 'flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-cyan-500 disabled:opacity-50';
export const btnGhost = 'flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-[#2a2a2a] px-3 py-2 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1c1c1c] dark:hover:bg-[#1c1c1c]';

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#0a0a0a] py-12 text-center text-[13px] text-slate-400 dark:text-slate-500">{children}</div>;
}
