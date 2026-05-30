'use client';

import { useState } from 'react';
import { Globe, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';
import Screw3D from '@/components/Screw3D';

interface DNSRecord {
  id: string;
  hostname: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  value: string;
  ttl: number;
  status: 'active' | 'pending' | 'error';
  createdAt: string;
  vmName?: string;
}

interface DNSTabProps {
  vms?: Array<{ id: string; name: string; ip: string }>;
  onCreateRecord?: (record: Omit<DNSRecord, 'id' | 'status' | 'createdAt'>) => void;
  onDeleteRecord?: (id: string) => void;
  onUpdateRecord?: (id: string, updates: Partial<DNSRecord>) => void;
}

const INITIAL_DNS_RECORDS: DNSRecord[] = [
  {
    id: 'dns-1',
    hostname: 'gandal-sma.enspy.local',
    type: 'A',
    value: '192.168.10.15',
    ttl: 3600,
    status: 'active',
    createdAt: '20 Mai 2026',
    vmName: 'gandal-ubuntu-srv'
  },
  {
    id: 'dns-2',
    hostname: 'library.enspy.local',
    type: 'A',
    value: '192.168.10.22',
    ttl: 3600,
    status: 'active',
    createdAt: '22 Mai 2026',
    vmName: 'enspy-web-portal'
  },
  {
    id: 'dns-3',
    hostname: 'traffic-ai.enspy.local',
    type: 'A',
    value: '192.168.10.35',
    ttl: 7200,
    status: 'active',
    createdAt: '25 Mai 2026',
    vmName: 'traffic-control-ai'
  }
];

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'] as const;

export default function DNSTab({ vms = [], onCreateRecord, onDeleteRecord, onUpdateRecord }: DNSTabProps) {
  const [records, setRecords] = useState<DNSRecord[]>(INITIAL_DNS_RECORDS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    hostname: '',
    type: 'A' as DNSRecord['type'],
    value: '',
    ttl: 3600,
    vmName: ''
  });

  const handleCreate = () => {
    if (!formData.hostname || !formData.value) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newRecord: DNSRecord = {
      id: `dns-${Date.now()}`,
      hostname: formData.hostname,
      type: formData.type,
      value: formData.value,
      ttl: formData.ttl,
      status: 'pending',
      createdAt: "Aujourd'hui",
      vmName: formData.vmName || undefined
    };

    setRecords(prev => [newRecord, ...prev]);
    
    if (onCreateRecord) {
      onCreateRecord({
        hostname: formData.hostname,
        type: formData.type,
        value: formData.value,
        ttl: formData.ttl,
        vmName: formData.vmName || undefined
      });
    }

    // Simulate activation
    setTimeout(() => {
      setRecords(prev => prev.map(r => 
        r.id === newRecord.id ? { ...r, status: 'active' } : r
      ));
    }, 2000);

    setFormData({ hostname: '', type: 'A', value: '', ttl: 3600, vmName: '' });
    setShowCreateModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement DNS ?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (onDeleteRecord) onDeleteRecord(id);
    }
  };

  const handleVMSelect = (vmName: string) => {
    const selectedVm = vms.find(v => v.name === vmName);
    if (selectedVm) {
      setFormData(prev => ({
        ...prev,
        vmName: selectedVm.name,
        value: selectedVm.ip,
        hostname: prev.hostname || `${selectedVm.name}.enspy.local`
      }));
    }
  };

  const getStatusColor = (status: DNSRecord['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  const getStatusLabel = (status: DNSRecord['status']) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'error': return 'Erreur';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              Configurez et gérez les enregistrements DNS pour vos machines virtuelles
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel enregistrement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total DNS</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{records.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actifs</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {records.filter(r => r.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">En attente</p>
              <p className="text-2xl font-black text-yellow-600 mt-1">
                {records.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* DNS Records List */}
      <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <Screw3D className="top-2 left-2 rotate-12" />
        <Screw3D className="top-2 right-2 rotate-[45deg]" />
        <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
        <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4">
          Enregistrements DNS
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">Aucun enregistrement DNS configuré</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre premier enregistrement DNS</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900 truncate">{record.hostname}</h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {record.type}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Valeur:</span> {record.value}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-bold">TTL:</span> {record.ttl}s
                        {record.vmName && (
                          <span className="ml-3">
                            <span className="font-bold">VM:</span> {record.vmName}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">Créé le {record.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-all duration-200"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border-2 border-black rounded-2xl p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Screw3D className="top-2 left-2 rotate-12" />
            <Screw3D className="top-2 right-2 rotate-[45deg]" />
            <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
            <Screw3D className="bottom-2 right-2 rotate-[110deg]" />

            <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 mb-4">
              Nouvel enregistrement DNS
            </h3>

            <div className="space-y-4">
              {vms.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Sélectionner une VM (optionnel)
                  </label>
                  <select
                    value={formData.vmName}
                    onChange={(e) => handleVMSelect(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Sélectionner une VM --</option>
                    {vms.map((vm) => (
                      <option key={vm.id} value={vm.name}>
                        {vm.name} ({vm.ip})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Nom d'hôte *
                </label>
                <input
                  type="text"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  placeholder="exemple.enspy.local"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DNSRecord['type'] })}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                  >
                    {DNS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    TTL (secondes)
                  </label>
                  <input
                    type="number"
                    value={formData.ttl}
                    onChange={(e) => setFormData({ ...formData, ttl: parseInt(e.target.value) || 3600 })}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Valeur *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="192.168.10.1 ou autre valeur"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ hostname: '', type: 'A', value: '', ttl: 3600, vmName: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-slate-300 transition-all duration-200"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
