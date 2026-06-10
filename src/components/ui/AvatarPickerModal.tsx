'use client';

import { X, User } from 'lucide-react';
import { PREDEFINED_AVATARS } from '@/lib/userAvatar';
import UserAvatar from '@/components/ui/UserAvatar';

type AvatarVariant = 'student' | 'teacher' | 'admin' | 'neutral';

interface AvatarPickerModalProps {
  userId: number;
  username: string;
  selectedId: string | null;
  variant?: AvatarVariant;
  onSelect: (avatarId: string) => void;
  onUseInitials: () => void;
  onClose: () => void;
}

export default function AvatarPickerModal({
  userId,
  username,
  selectedId,
  variant = 'student',
  onSelect,
  onUseInitials,
  onClose,
}: AvatarPickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-[10070] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
    >
      <div className="relative bg-white border-2 border-black rounded-2xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3
          id="avatar-picker-title"
          className="text-base font-black text-slate-900 uppercase tracking-wide mb-1"
        >
          Choisir un avatar
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Sélectionnez un avatar prédéfini ou gardez vos initiales par défaut.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-5">
          {PREDEFINED_AVATARS.map((av) => (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-all cursor-pointer ${
                selectedId === av.id
                  ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-sm'
                  : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              } ${av.bgClass}`}
              title={`Avatar ${av.emoji}`}
            >
              {av.emoji}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onUseInitials}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            !selectedId
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          Utiliser mes initiales
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <span className="text-[10px] font-bold uppercase text-slate-400">Aperçu</span>
          <UserAvatar userId={userId} username={username} size="lg" shape="rounded" variant={variant} />
        </div>
      </div>
    </div>
  );
}
