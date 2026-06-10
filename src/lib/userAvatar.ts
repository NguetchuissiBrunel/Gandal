import { getUserInitials } from '@/lib/authUtils';

export const AVATAR_CHANGE_EVENT = 'gandal-avatar-change';

export type PredefinedAvatar = {
  id: string;
  emoji: string;
  bgClass: string;
};

export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  { id: 'dev-1', emoji: '🧑‍💻', bgClass: 'bg-sky-100' },
  { id: 'dev-2', emoji: '👩‍💻', bgClass: 'bg-blue-100' },
  { id: 'dev-3', emoji: '👨‍💻', bgClass: 'bg-indigo-100' },
  { id: 'rocket', emoji: '🚀', bgClass: 'bg-violet-100' },
  { id: 'brain', emoji: '🧠', bgClass: 'bg-purple-100' },
  { id: 'gear', emoji: '⚙️', bgClass: 'bg-slate-200' },
  { id: 'robot', emoji: '🤖', bgClass: 'bg-cyan-100' },
  { id: 'grad', emoji: '🎓', bgClass: 'bg-amber-100' },
  { id: 'globe', emoji: '🌐', bgClass: 'bg-teal-100' },
  { id: 'lab', emoji: '🔬', bgClass: 'bg-rose-100' },
  { id: 'chip', emoji: '💻', bgClass: 'bg-emerald-100' },
  { id: 'star', emoji: '⭐', bgClass: 'bg-yellow-100' },
];

const STORAGE_PREFIX = 'gandal-avatar-';

function storageKey(userId: number): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getStoredAvatarId(userId: number): string | null {
  if (typeof window === 'undefined' || !userId) return null;
  return localStorage.getItem(storageKey(userId));
}

export function setStoredAvatarId(userId: number, avatarId: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  if (avatarId) {
    localStorage.setItem(storageKey(userId), avatarId);
  } else {
    localStorage.removeItem(storageKey(userId));
  }
  window.dispatchEvent(new Event(AVATAR_CHANGE_EVENT));
}

export function getAvatarById(id: string | null): PredefinedAvatar | undefined {
  if (!id) return undefined;
  return PREDEFINED_AVATARS.find((a) => a.id === id);
}

export function resolveUserAvatar(userId: number, username: string) {
  const avatar = getAvatarById(getStoredAvatarId(userId));
  return {
    avatar,
    initials: getUserInitials(username),
  };
}
