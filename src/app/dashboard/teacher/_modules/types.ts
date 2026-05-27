// ── Types partagés du Dashboard Enseignant (GANDAL) ──

export interface TeacherProfile {
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface AccountRequest {
  id: string; // for internal tracking
  nom: string;
  email: string;
  matricule: string;
  organisation: string;
  justification: string;
  statut: 'pending' | 'validated' | 'rejected';
}

export interface VmRequest {
  id: string; // for internal tracking
  objet: string;
  contenu: string;
  size_RAM: number; // en Go
  size_ROM: number; // en Go
  OS: string;
  Demandeur: string; // Nom ou matricule
  statut: 'pending' | 'validated' | 'rejected';
}

export interface Publication {
  id: string; // for internal tracking
  nom: string;
  lien: string;
  description: string;
  photo: string; // url ou base64
  status: 'draft' | 'published' | 'archived';
}

export type ToastType = 'success' | 'danger' | 'info';
export type ShowToastFn = (message: string, type?: ToastType) => void;
