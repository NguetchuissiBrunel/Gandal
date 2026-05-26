// ── Types partagés du Dashboard Enseignant (GANDAL) ──

export interface TeacherProfile {
  firstName: string;
  lastName: string;
  title: string;
  role: string;
  department: string;
  email: string;
  bureau: string;
  cluster: string;
  specialty: string;
}

export interface AccountRequest {
  id: string;
  name: string;
  matricule: string;
  level: string;
  department: string;
  email: string;
  date: string;
  reason: string;
}

export interface VmRequest {
  id: string;
  studentName: string;
  matricule: string;
  projectName: string;
  vcpu: number;
  ram: number;
  storage: number;
  os: string;
  networkVlan: string;
  purpose: string;
  date: string;
}

export interface Publication {
  id: string;
  title: string;
  category: string;
  authors: string;
  desc: string;
  git: string;
  status: string;
  ip: string;
  vms: string;
  specs: string;
  tags: string[];
  grade: string;
  approvedBy: string;
  date: string;
}

export type ToastType = 'success' | 'danger' | 'info';
export type ShowToastFn = (message: string, type?: ToastType) => void;
