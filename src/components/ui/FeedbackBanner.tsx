'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface FeedbackBannerProps {
  error?: string;
  success?: string;
  onDismissError?: () => void;
  onDismissSuccess?: () => void;
  /** Masque automatiquement le message de succès après N ms (0 = désactivé). */
  successAutoHideMs?: number;
}

export default function FeedbackBanner({
  error,
  success,
  onDismissError,
  onDismissSuccess,
  successAutoHideMs = 5000,
}: FeedbackBannerProps) {
  useEffect(() => {
    if (!success || !onDismissSuccess || successAutoHideMs <= 0) return;
    const timer = setTimeout(onDismissSuccess, successAutoHideMs);
    return () => clearTimeout(timer);
  }, [success, onDismissSuccess, successAutoHideMs]);

  if (!error && !success) return null;

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800"
      >
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="flex-1 font-medium leading-snug">{error}</p>
        {onDismissError && (
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 text-red-400 hover:text-red-700 transition-colors cursor-pointer"
            aria-label="Fermer le message d'erreur"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800"
    >
      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="flex-1 font-medium leading-snug">{success}</p>
      {onDismissSuccess && (
        <button
          type="button"
          onClick={onDismissSuccess}
          className="shrink-0 text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
          aria-label="Fermer le message de succès"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
