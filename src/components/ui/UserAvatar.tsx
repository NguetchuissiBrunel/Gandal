'use client';

import { useUserAvatar } from '@/hooks/useUserAvatar';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'rounded';
type AvatarVariant = 'student' | 'teacher' | 'admin' | 'neutral';

const SIZE_CLASSES: Record<AvatarSize, { box: string; emoji: string; text: string }> = {
  sm: { box: 'w-8 h-8', emoji: 'text-base', text: 'text-[10px]' },
  md: { box: 'w-10 h-10', emoji: 'text-xl', text: 'text-xs' },
  lg: { box: 'w-20 h-20', emoji: 'text-4xl', text: 'text-2xl' },
  xl: { box: 'w-24 h-24', emoji: 'text-5xl', text: 'text-3xl' },
};

const INITIALS_BG: Record<AvatarVariant, string> = {
  student: 'bg-emerald-600 text-white',
  teacher: 'bg-blue-600 text-white',
  admin: 'bg-indigo-600 text-white',
  neutral: 'bg-slate-700 text-white',
};

interface UserAvatarProps {
  userId: number;
  username: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  variant?: AvatarVariant;
  className?: string;
  border?: boolean;
}

export default function UserAvatar({
  userId,
  username,
  size = 'md',
  shape = 'circle',
  variant = 'neutral',
  className = '',
  border = false,
}: UserAvatarProps) {
  const { avatar, initials } = useUserAvatar(userId, username);
  const s = SIZE_CLASSES[size];
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const borderClass = border ? 'border-2 border-black' : 'border border-slate-200';

  if (avatar) {
    return (
      <div
        className={`${s.box} ${radius} ${avatar.bgClass} ${borderClass} flex items-center justify-center shrink-0 shadow-sm ${className}`}
        aria-hidden
      >
        <span className={s.emoji} role="img">
          {avatar.emoji}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${s.box} ${radius} ${INITIALS_BG[variant]} ${borderClass} flex items-center justify-center shrink-0 font-black ${s.text} ${className}`}
      aria-label={`Avatar ${initials}`}
    >
      {initials}
    </div>
  );
}
