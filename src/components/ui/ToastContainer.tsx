'use client';

import { X } from 'lucide-react';
import type { ToastType } from '@/contexts/FeedbackContext';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500 text-white',
  danger: 'bg-red-500 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-white',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  danger: '⚠',
  info: 'ℹ',
  warning: '!',
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 z-[10050] flex flex-col gap-2 lg:max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-5 py-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3 transition-all duration-300 ${STYLES[t.type]}`}
        >
          <span className="font-black text-sm uppercase shrink-0 mt-0.5">{ICONS[t.type]}</span>
          <span className="text-sm font-semibold flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
