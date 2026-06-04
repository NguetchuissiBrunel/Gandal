import type { StudentRead, TeacherRead } from '@/lib/apiClient';

export type AuthUser = StudentRead | TeacherRead;

export function isAdminTeacher(user: AuthUser): boolean {
  if (user.type !== 'teacher') return false;
  const role = user.role?.toLowerCase() || '';
  return role === 'superadmin' || role === 'admin';
}

export function getDashboardPath(user: AuthUser): string {
  if (user.type === 'student') return '/dashboard/etudiant';
  if (user.type === 'teacher') {
    if (isAdminTeacher(user)) return '/dashboard/superadmin';
    return '/dashboard/teacher';
  }
  return '/dashboard';
}

/** Route-level guard used by middleware (pathname is exact dashboard segment). */
export function canAccessDashboardRoute(pathname: string, user: AuthUser): boolean {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (pathname === '/dashboard') return true;
    if (pathname.startsWith('/dashboard/etudiant')) return user.type === 'student';
    if (pathname.startsWith('/dashboard/teacher')) {
      return user.type === 'teacher' && !isAdminTeacher(user);
    }
    if (pathname.startsWith('/dashboard/superadmin')) {
      return user.type === 'teacher' && isAdminTeacher(user);
    }
  }
  return true;
}

export function getRoleLabel(user: StudentRead | TeacherRead): string {
  if (user.type === 'student') return 'Étudiant';
  if (user.type === 'teacher') {
    const role = user.role?.toLowerCase() || '';
    if (role === 'superadmin') return 'Super admin';
    if (role === 'admin') return 'Administrateur';
    return 'Enseignant';
  }
  return 'Utilisateur';
}

export function getUserInitials(username: string): string {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';
}
