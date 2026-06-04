export interface ApprovalCredentials {
  username: string;
  password: string;
  email?: string;
}

/** Extrait identifiants renvoyés par l'API après approbation d'une inscription. */
/** ID VM renvoyé après approbation d'une requête création (si l'API le fournit). */
export function parseApprovedVmId(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const vm =
    o.vm && typeof o.vm === 'object' ? (o.vm as Record<string, unknown>) : null;
  const raw = o.vm_id ?? vm?.id ?? o.id;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  return null;
}

export function parseApprovalCredentials(data: unknown): ApprovalCredentials | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;

  const nested =
    o.student && typeof o.student === 'object'
      ? (o.student as Record<string, unknown>)
      : o.credentials && typeof o.credentials === 'object'
        ? (o.credentials as Record<string, unknown>)
        : null;

  const username = String(
    o.username ?? o.login ?? nested?.username ?? ''
  ).trim();
  const password = String(
    o.password ?? o.temporary_password ?? o.temp_password ?? nested?.password ?? ''
  ).trim();
  const email = (o.email ?? nested?.email) as string | undefined;

  if (username && password) {
    return { username, password, email };
  }
  return null;
}

export function filterByUserId<T extends { user_id?: number }>(
  items: T[],
  userId: number
): T[] {
  return items.filter((item) => item.user_id === userId);
}

export function filterRequestsForStudent(
  items: { student_id?: number }[],
  studentId: number
): typeof items {
  return items.filter((item) => item.student_id === studentId);
}

export async function loadStudentNameMap(
  getStudents: () => Promise<{ items: { id: number; username: string; matricule?: string }[] }>
): Promise<Map<number, { name: string; matricule: string }>> {
  const map = new Map<number, { name: string; matricule: string }>();
  try {
    const { items } = await getStudents();
    for (const s of items) {
      map.set(s.id, { name: s.username, matricule: s.matricule || 'N/A' });
    }
  } catch {
    // liste étudiants réservée aux rôles autorisés
  }
  return map;
}

export function studentLabel(
  studentId: number,
  cache: Map<number, { name: string; matricule: string }>,
  fallbackName?: string,
  fallbackMatricule?: string
): { name: string; matricule: string } {
  const cached = cache.get(studentId);
  if (cached) return cached;
  return {
    name: fallbackName || (studentId > 0 ? `Étudiant #${studentId}` : 'Nouvelle demande'),
    matricule: fallbackMatricule || '—',
  };
}
