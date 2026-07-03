'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import Workspace from './Workspace';

/** Page workspace : récupère l'utilisateur courant, déduit le rôle, gère la déconnexion. */
export default function WorkspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: 'student' | 'teacher' | 'admin' } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me: any = await apiClient.getMe();
        const type = (me.type || '').toLowerCase();
        // Le super admin est un Teacher (type="teacher") avec role="SuperAdmin" :
        // on doit regarder `role` en priorité, sinon il est traité comme un simple
        // enseignant et perd ses droits (validation des publications, etc.).
        const subRole = (me.role || '').toLowerCase();
        const role = type === 'superadmin' || type === 'admin'
            || subRole === 'superadmin' || subRole === 'admin' ? 'admin'
          : type === 'teacher' ? 'teacher' : 'student';
        setUser({ username: me.username || 'utilisateur', role });
      } catch {
        apiClient.clearToken();
        router.push('/login');
      }
    })();
  }, [router]);

  const logout = () => {
    apiClient.clearToken();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin text-cyan-600" size={30} />
      </div>
    );
  }
  return <Workspace role={user.role} username={user.username} onLogout={logout} />;
}
