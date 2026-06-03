'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const token = apiClient.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const user = await apiClient.getMe();
        if (user.type === 'student') {
          router.replace('/dashboard/etudiant');
        } else if (user.type === 'teacher') {
          const role = user.role?.toLowerCase() || '';
          if (role === 'superadmin' || role === 'admin') {
            router.replace('/dashboard/superadmin');
          } else {
            router.replace('/dashboard/teacher');
          }
        } else {
          // Fallback default
          router.replace('/dashboard/etudiant');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        apiClient.clearToken();
        router.replace('/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-black uppercase tracking-wider text-slate-500 animate-pulse">
          Vérification de la session et redirection...
        </p>
      </div>
    </div>
  );
}
