'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient, AUTH_CHANGE_EVENT, type StudentRead, type TeacherRead } from '@/lib/apiClient';
import { syncAuthCookie } from '@/lib/authCookie';

export function useAuthSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<StudentRead | TeacherRead | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = apiClient.getToken();
    syncAuthCookie(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiClient.getMe();
      setUser(me);
    } catch {
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadSession();
  }, [pathname, loadSession]);

  useEffect(() => {
    const onAuthChange = () => {
      setLoading(true);
      loadSession();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, [loadSession]);

  return { user, loading, isAuthenticated: !!user };
}
