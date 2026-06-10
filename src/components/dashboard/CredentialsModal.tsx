'use client';

import { X, Copy, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ApprovalCredentials } from '@/lib/approvalUtils';

interface CredentialsModalProps {
  credentials: ApprovalCredentials;
  studentName: string;
  studentEmail?: string;
  onClose: () => void;
}

export default function CredentialsModal({
  credentials,
  studentName,
  studentEmail,
  onClose,
}: CredentialsModalProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailLine = studentEmail || credentials.email || '—';

  const copyAll = async () => {
    const text = [
      `Compte GANDAL — ${studentName}`,
      `Nom d'utilisateur : ${credentials.username}`,
      `Mot de passe : ${credentials.password}`,
      `E-mail : ${emailLine}`,
      '',
      'Connectez-vous sur la plateforme avec ces identifiants.',
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
            Inscription validée
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Transmettez ces identifiants à <strong>{studentName}</strong>. Le backend peut aussi
            envoyer un e-mail à <strong>{emailLine}</strong>.
          </p>
        </div>

        <div className="space-y-3 text-sm mb-6">
          {[
            { label: "Nom d'utilisateur", value: credentials.username, secret: false },
            { label: 'Mot de passe', value: credentials.password, secret: true },
            { label: 'E-mail', value: emailLine, secret: false },
          ].map((row) => (
            <div
              key={row.label}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {row.label}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-bold text-slate-800 break-all flex-1">
                  {row.secret && !showPassword ? '••••••••••••' : row.value}
                </p>
                {row.secret && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyAll}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copié' : 'Copier'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
