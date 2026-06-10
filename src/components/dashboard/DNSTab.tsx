'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Globe, Plus, Trash2, Edit2, Check, X, Loader2, Eye } from 'lucide-react';
import EntityDetailModal from '@/components/dashboard/EntityDetailModal';
import Screw3D from '@/components/Screw3D';
import FeedbackBanner from '@/components/ui/FeedbackBanner';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { apiClient, type DNSEntryRead } from '@/lib/apiClient';
import { useFeedback } from '@/contexts/FeedbackContext';
import { getApiErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 10;

export interface DNSTabVm {
  id: string;
  name: string;
  ip?: string;
}

interface DNSTabProps {
  vms?: DNSTabVm[];
  /** `all` = GET /dns (admin) ; `by-vm` = GET /dns/vms/{id} pour chaque VM */
  listMode?: 'all' | 'by-vm';
}

function vmNameById(vms: DNSTabVm[], vmId: number): string {
  return vms.find((v) => parseInt(v.id, 10) === vmId)?.name ?? `VM #${vmId}`;
}

function entryStatus(entry: DNSEntryRead): 'active' | 'pending' | 'error' {
  if (entry.ip_address) return 'active';
  return 'pending';
}

export default function DNSTab({ vms = [], listMode = 'by-vm' }: DNSTabProps) {
  const { confirm } = useFeedback();

  const vmKey = useMemo(
    () => vms.map((v) => `${v.id}:${v.name}:${v.ip ?? ''}`).join('|'),
    [vms],
  );
  const vmSnapshot = useMemo(
    () => vms.map((v) => ({ id: v.id, name: v.name, ip: v.ip })),
    [vmKey],
  );

  const [allRecords, setAllRecords] = useState<DNSEntryRead[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [vmOptions, setVmOptions] = useState<DNSTabVm[]>(vmSnapshot);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DNSEntryRead | null>(null);
  const [editHostname, setEditHostname] = useState('');
  const [detailDnsId, setDetailDnsId] = useState<number | null>(null);

  const [formHostname, setFormHostname] = useState('');
  const [formVmId, setFormVmId] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (listMode === 'all') {
        const [dnsData, vmsData] = await Promise.all([
          apiClient.getDnsEntries({ page, size: PAGE_SIZE }),
          apiClient.getVms({ size: 100 }).catch(() => ({ items: [], total: 0 })),
        ]);
        setAllRecords(dnsData.items);
        setServerTotal(dnsData.total);
        setVmOptions(
          vmSnapshot.length > 0
            ? vmSnapshot
            : (vmsData.items || []).map((vm) => ({
                id: String(vm.id),
                name: vm.node || `vm-${vm.id}`,
                ip: vm.ip_address || undefined,
              })),
        );
      } else {
        if (vmSnapshot.length === 0) {
          setAllRecords([]);
          setServerTotal(0);
          setVmOptions([]);
          setError('');
          return;
        }
        const results = await Promise.all(
          vmSnapshot.map((v) =>
            apiClient.getDnsForVm(parseInt(v.id, 10), { size: 100 }).catch(() => ({
              items: [],
              total: 0,
            })),
          ),
        );
        const byId = new Map<number, DNSEntryRead>();
        results.flatMap((r) => r.items).forEach((e) => byId.set(e.id, e));
        const merged = Array.from(byId.values());
        setAllRecords(merged);
        setServerTotal(merged.length);
        setVmOptions(vmSnapshot);
        setError('');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Impossible de charger les entrées DNS.'));
      setAllRecords([]);
      setServerTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listMode, vmSnapshot, page]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setPage(1);
  }, [listMode, vmKey]);

  const total = listMode === 'all' ? serverTotal : allRecords.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const visibleRecords = useMemo(() => {
    if (listMode === 'all') return allRecords;
    const start = (safePage - 1) * PAGE_SIZE;
    return allRecords.slice(start, start + PAGE_SIZE);
  }, [allRecords, listMode, safePage]);

  const activeCount = allRecords.filter((r) => entryStatus(r) === 'active').length;
  const pendingCount = allRecords.filter((r) => entryStatus(r) === 'pending').length;

  const handleCreate = async () => {
    setError('');
    const vmId = parseInt(formVmId, 10);
    const hostname = formHostname.trim();
    if (!hostname || !vmId) {
      setError('Nom d\'hôte (FQDN) et VM sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.createDnsEntry({ hostname, vm_id: vmId });
      setFormHostname('');
      setFormVmId('');
      setShowCreateModal(false);
      setPage(1);
      await loadRecords();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Création impossible.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    const hostname = editHostname.trim();
    if (!hostname) {
      setError('Le nom d\'hôte ne peut pas être vide.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.updateDnsEntry(editingEntry.id, { hostname });
      setEditingEntry(null);
      setEditHostname('');
      await loadRecords();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Mise à jour impossible.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Supprimer l\'enregistrement DNS',
      message: 'Cette entrée sera retirée définitivement.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    setError('');
    try {
      await apiClient.deleteDnsEntry(id);
      const nextTotal = total - 1;
      const nextPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      if (page > nextPages) setPage(nextPages);
      await loadRecords();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Suppression impossible.'));
    }
  };

  const startEdit = (entry: DNSEntryRead) => {
    setEditingEntry(entry);
    setEditHostname(entry.hostname);
    setError('');
  };

  const getStatusColor = (status: ReturnType<typeof entryStatus>) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  const getStatusLabel = (status: ReturnType<typeof entryStatus>) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'error':
        return 'Erreur';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <Screw3D className="top-2 left-2 rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[45deg]" />
        <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
        <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
              <Globe className="w-7 h-7 text-blue-600" />
              Gestion DNS
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Entrées DNS liées à vos VMs (FQDN → adresse IP automatique)
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setShowCreateModal(true);
            }}
            disabled={vmOptions.length === 0 && listMode !== 'all'}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel enregistrement
          </button>
        </div>
      </div>

      <FeedbackBanner error={error} onDismissError={() => setError('')} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total DNS</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Actifs{listMode === 'all' ? ' (page)' : ''}
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            En attente{listMode === 'all' ? ' (page)' : ''}
          </p>
          <p className="text-2xl font-black text-yellow-600 mt-1">{pendingCount}</p>
        </div>
      </div>

      <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <Screw3D className="top-2 left-2 rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[45deg]" />
        <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
        <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4">
          Enregistrements DNS
        </h3>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500">Chargement…</p>
          </div>
        ) : total === 0 ? (
          <EmptyState
            icon={Globe}
            title="Aucun enregistrement DNS"
            description={
              vmOptions.length === 0
                ? 'Créez d\'abord une VM, puis associez un nom de domaine.'
                : 'Créez votre premier enregistrement (hostname + VM).'
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {visibleRecords.map((record) => {
                const status = entryStatus(record);
                return (
                  <div
                    key={record.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {record.hostname}
                          </h4>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <p>
                            <span className="font-bold">IP :</span>{' '}
                            {record.ip_address || '— (en propagation)'}
                          </p>
                          <p>
                            <span className="font-bold">VM :</span>{' '}
                            {vmNameById(vmOptions, record.vm_id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailDnsId(record.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200"
                          title="Détail API"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(record)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                          title="Modifier le hostname"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-slate-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border-2 border-black rounded-2xl p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 mb-4">
              Nouvel enregistrement DNS
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 font-medium">
              FQDN valide, ex. <code className="font-mono">api.projet.dc.enspy.cm</code> — un hostname
              par VM.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Machine virtuelle *
                </label>
                <select
                  value={formVmId}
                  onChange={(e) => setFormVmId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm"
                >
                  <option value="">— Choisir une VM —</option>
                  {vmOptions.map((vm) => (
                    <option key={vm.id} value={vm.id}>
                      {vm.name}
                      {vm.ip ? ` (${vm.ip})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Nom d&apos;hôte (FQDN) *
                </label>
                <input
                  type="text"
                  value={formHostname}
                  onChange={(e) => setFormHostname(e.target.value)}
                  placeholder="mon-projet.dc.enspy.cm"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl border-2 border-black disabled:opacity-50"
              >
                {submitting ? 'Création…' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-white text-slate-700 text-xs font-bold uppercase rounded-xl border-2 border-slate-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {detailDnsId != null && (
        <EntityDetailModal kind="dns" id={detailDnsId} onClose={() => setDetailDnsId(null)} />
      )}

      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border-2 border-black rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase text-slate-900 mb-4">Modifier le hostname</h3>
            <input
              type="text"
              value={editHostname}
              onChange={(e) => setEditHostname(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-mono mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleUpdate}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-white border-2 border-slate-300 text-xs font-bold uppercase rounded-xl"
              >
                <X className="w-4 h-4" /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
