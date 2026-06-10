'use client';

import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 space-y-3">
      <Icon className="w-10 h-10 text-slate-300 mx-auto" />
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{title}</h3>
      {description && (
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto font-medium leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
