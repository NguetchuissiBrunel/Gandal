import { apiClient, type TeacherRead, type VMRead } from '@/lib/apiClient';
import { isAdminTeacher } from '@/lib/authUtils';

type RequestItem = {
  type?: string;
  teacher_id?: number;
  student_id?: number;
  status?: string;
  vm_id?: number;
};

/** IDs étudiants liés aux requêtes de cet enseignant. */
export function collectStudentIdsForTeacher(
  requests: RequestItem[],
  teacherId: number,
  seeAll: boolean,
): Set<number> {
  const ids = new Set<number>();
  for (const r of requests) {
    if (!seeAll && r.teacher_id !== teacherId) continue;
    if (typeof r.student_id === 'number') ids.add(r.student_id);
  }
  return ids;
}

/**
 * GET /vms est réservé admin — les enseignants reçoivent 403.
 * On charge les VMs connues via vm_id des requêtes (suppression / détail).
 */
export async function loadVmsForTeacherDashboard(
  me: TeacherRead,
  requests: RequestItem[],
): Promise<VMRead[]> {
  if (isAdminTeacher(me)) {
    const { items } = await apiClient.getVms({ size: 100 });
    return items;
  }

  const vmIds = new Set<number>();
  for (const r of requests) {
    if (r.teacher_id !== me.id) continue;
    if (r.type === 'r_delete_vm' && typeof r.vm_id === 'number') {
      vmIds.add(r.vm_id);
    }
  }

  if (vmIds.size === 0) return [];

  const loaded = await Promise.all(
    [...vmIds].map((id) => apiClient.getVm(id).catch(() => null)),
  );
  return loaded.filter((v): v is VMRead => v != null);
}
