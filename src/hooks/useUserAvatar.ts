'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AVATAR_CHANGE_EVENT,
  getAvatarById,
  getStoredAvatarId,
  setStoredAvatarId,
  type PredefinedAvatar,
} from '@/lib/userAvatar';
import { getUserInitials } from '@/lib/authUtils';

export function useUserAvatar(userId: number, username: string) {
  const [avatarId, setAvatarId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      setAvatarId(null);
      return;
    }
    setAvatarId(getStoredAvatarId(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(AVATAR_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(AVATAR_CHANGE_EVENT, onChange);
  }, [refresh]);

  const avatar: PredefinedAvatar | undefined = getAvatarById(avatarId);
  const initials = getUserInitials(username);

  const selectAvatar = (id: string) => {
    setStoredAvatarId(userId, id);
    setAvatarId(id);
  };

  const clearAvatar = () => {
    setStoredAvatarId(userId, null);
    setAvatarId(null);
  };

  return { avatar, avatarId, initials, selectAvatar, clearAvatar };
}
