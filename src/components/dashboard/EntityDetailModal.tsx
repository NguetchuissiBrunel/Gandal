'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import {
  apiClient,
  type StudentRead,
  type TeacherRead,
  type VMRead,
  type PublicationRead,
  type DNSEntryRead,
  type RCreateVMRead,
  type RDeleteVMRead,
  type RAccountRead,
} from '@/lib/apiClient';

export type EntityDetailKind =
  | 'student'
  | 'teacher'
  | 'vm'
  | 'request'
  | 'publication'
  | 'dns';

const KIND_LABELS: Record<EntityDetailKind, string> = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  vm: 'Machine virtuelle',
  request: 'Requête',
  publication: 'Publication',
  dns: 'Entrée DNS',
};

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  username: "Nom d'utilisateur",
  email: 'E-mail',
  matricule: 'Matricule',
  level: 'Niveau',
  departement: 'Département',
  role: 'Rôle',
  type: 'Type',
  status: 'Statut',
  nom: 'Nom',
  description: 'Description',
  lien: 'Lien',
  photo: 'Photo',
  user_id: 'Utilisateur',
  hostname: 'Hostname',
  vm_id: 'VM',
  ip_address: 'Adresse IP',
  object: 'Objet',
  content: 'Contenu',
  justification: 'Justification',
  organisation: 'Organisation',
  teacher_id: 'Enseignant',
  student_id: 'Étudiant',
  size_rom: 'Disque (Go)',
  size_ram: 'RAM (Go)',
  n_cpu: 'CPU',
  iso: 'OS / ISO',
  node: 'Nom nœud',
  iso_image: 'Image / projet',
  ip_address_vm: 'IP',
  date_stop_at: 'Arrêt le',
  ssh_public_key: 'Clé SSH publique',
  id_proxmox: 'ID Proxmox',
  feedback: 'Retour admin',
  size_rom_req: 'ROM demandée',
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function rowsFromData(data: Record<string, unknown>): { key: string; label: string; value: string }[] {
  return Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({
      key,
      label: FIELD_LABELS[key] || key.replace(/_/g, ' '),
      value: formatValue(key, value),
    }));
}

interface EntityDetailModalProps {
  kind: EntityDetailKind;
  id: number | null;
  onClose: () => void;
}

export default function EntityDetailModal({ kind, id, onClose }: EntityDetailModalProps) {
  const [rows, setRows] = useState<{ key: string; label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id == null) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        let data: Record<string, unknown>;
        switch (kind) {
          case 'student':
            data = (await apiClient.getStudent(id)) as StudentRead;
            break;
          case 'teacher':
            data = (await apiClient.getTeacher(id)) as TeacherRead;
            break;
          case 'vm':
            data = (await apiClient.getVm(id)) as VMRead;
            break;
          case 'request':
            data = (await apiClient.getRequest(id)) as
              | RCreateVMRead
              | RDeleteVMRead
              | RAccountRead;
            break;
          case 'publication':
            data = (await apiClient.getPublication(id)) as PublicationRead;
            break;
          case 'dns':
            data = (await apiClient.getDnsEntry(id)) as DNSEntryRead;
            break;
          default:
            throw new Error('Type inconnu');
        }
        if (!cancelled) {
          setRows(rowsFromData(data as Record<string, unknown>));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Chargement impossible');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  if (id == null) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
            {KIND_LABELS[kind]} #{id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center py-10 gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Chargement depuis l&apos;API…</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {!loading && !error && (
            <dl className="space-y-3">
              {rows.map(({ key, label, value }) => (
                <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <dt className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</dt>
                  <dd className="text-xs font-bold text-slate-800 mt-1 break-all whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
