'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Screw3D from '@/components/Screw3D';
import type { Publication, ShowToastFn } from './types';

interface InstantiationTabProps {
  showToast: ShowToastFn;
  onVmCreated: (pub: Publication) => void;
  teacherName: string; // pour les logs et les auteurs dans la publication créée
}

export default function InstantiationTab({ showToast, onVmCreated, teacherName }: InstantiationTabProps) {
  // Formulaire
  const [vmName, setVmName] = useState('');
  const [cpu, setCpu] = useState('2');
  const [ram, setRam] = useState('4');
  const [storage, setStorage] = useState('80');
  const [os, setOs] = useState('Ubuntu Server 24.04 LTS');
  const [vlan, setVlan] = useState('VLAN 101 (Isolated)');

  // Simulateur de déploiement SMA
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vmName.trim()) { showToast('Veuillez spécifier un nom de machine virtuelle.', 'danger'); return; }
    setIsDeploying(true);
    setStep(1);
    setLogs([]);
  };

  useEffect(() => {
    if (!isDeploying) return;

    const sequence = [
      `[AM] ✉ Message FIPA-ACL reçu. Requête: CREATE_VM. ResourceSpec: vCPUs=${cpu}, RAM=${ram}Go, Storage=${storage}Go, OS="${os}".`,
      `[AM] Analyse de la charge du cluster. Transmission à l'Agent de Supervision (AS)...`,
      `[AS] Nœud "enspy-node-02" détecté (CPU: 22%, RAM dispos: 64Go). Réponse FIPA-ACL → AM: AGREE.`,
      `[AM] Ordre transmis à l'Agent de Déploiement (AD): REQUEST "instantiate_vm" sur "enspy-node-02".`,
      `[AD] 🖥️ Connexion à l'API Proxmox VE sur le Nœud 02...`,
      `[AD] Allocation confirmée. VM ID: 104. Création du disque virtuel ${storage}Go...`,
      `[AD] Clonage du template OS "${os}"... [||||||||||..........] 50%`,
      `[AD] Clonage terminé. Provisionnement de l'adresse IP dans la plage GANDAL...`,
      `[AD] Configuration réseau appliquée: "${vlan}". Isolation réseau activée.`,
      `[AD] Démarrage VM ID 104... Status: RUNNING. IP locale: 20.20.20.19.`,
      `[AS] VM ID 104 opérationnelle. Monitoring branché sur Prometheus.`,
      `[AM] Déploiement terminé de "${vmName}". Rapport envoyé. Code FIPA: INFORM.`,
    ];

    if (step > 0 && step <= sequence.length) {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${sequence[step - 1]}`]);
        setStep((s) => s + 1);
      }, 900);
      return () => clearTimeout(t);
    }

    if (step > sequence.length) {
      setIsDeploying(false);
      showToast(`VM "${vmName}" déployée (IP: 20.20.20.19) !`, 'success');
      onVmCreated({
        id: `pub-${Date.now()}`,
        title: `VM Directe — ${vmName}`,
        category: 'Infrastructure',
        authors: `${teacherName} (Direct)`,
        desc: `VM instanciée par la console de supervision. OS : ${os}.`,
        git: 'https://github.com/enspy-gi27',
        status: 'En ligne',
        ip: '20.20.20.19',
        vms: vmName,
        specs: `${cpu} vCPUs / ${ram} Go RAM / ${storage} Go HDD`,
        tags: [os.split(' ')[0], 'Direct Instantiation'],
        grade: '',
        approvedBy: teacherName,
        date: "Aujourd'hui",
      });
      setVmName('');
    }
  }, [isDeploying, step]);

  const reset = () => { setLogs([]); setStep(0); };

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <Screw3D className="top-2 left-2 -rotate-12" />
      <Screw3D className="top-2 right-2 rotate-[70deg]" />
      <Screw3D className="bottom-2 left-2 -rotate-[60deg]" />
      <Screw3D className="bottom-2 right-2 rotate-[120deg]" />

      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Console d'Instanciation Directe</h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">DÉPLOIEMENT FORCÉ DE MACHINES VIRTUELLES SUR PROXMOX PAR ORCHESTRATION SMA</p>
      </div>

      {!isDeploying && logs.length === 0 ? (
        /* ── FORMULAIRE ── */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom VM */}
            <Field label="Nom de la VM (DNS ID)">
              <input
                type="text" required placeholder="ex. library-prod-vm"
                value={vmName} onChange={(e) => setVmName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold font-mono"
              />
            </Field>

            {/* OS */}
            <Field label="Image Système OS">
              <select value={os} onChange={(e) => setOs(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                <option>Ubuntu Server 24.04 LTS</option>
                <option>Debian 12 Bookworm</option>
                <option>Alpine Linux 3.20 (Minimal)</option>
              </select>
            </Field>

            {/* CPU */}
            <Field label="Cœurs vCPUs">
              <select value={cpu} onChange={(e) => setCpu(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                {['1', '2', '4', '8'].map((c) => <option key={c} value={c}>{c} Cœur{Number(c) > 1 ? 's' : ''}</option>)}
              </select>
            </Field>

            {/* RAM */}
            <Field label="Mémoire vive RAM">
              <select value={ram} onChange={(e) => setRam(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                {['1', '2', '4', '8', '16', '32'].map((r) => <option key={r} value={r}>{r} Go</option>)}
              </select>
            </Field>

            {/* Storage */}
            <Field label="Espace Disque (HDD/SSD)">
              <div className="relative flex items-center">
                <input type="number" min="10" max="500" required value={storage} onChange={(e) => setStorage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-blue-600 text-sm font-semibold font-mono" />
                <span className="absolute right-4 text-xs font-bold text-slate-400">Go</span>
              </div>
            </Field>

            {/* VLAN */}
            <Field label="Réseau & Isolation">
              <select value={vlan} onChange={(e) => setVlan(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                <option value="VLAN 101 (Isolated)">VLAN 101 (Étudiants Isolés)</option>
                <option value="VLAN 102 (Public Access)">VLAN 102 (Accès public restreint)</option>
                <option value="VLAN 103 (Administration)">VLAN 103 (Supervision Réseau)</option>
              </select>
            </Field>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md">
            <Play className="w-4 h-4 fill-white" />
            Lancer l'instanciation de la VM
          </button>
        </form>
      ) : (
        /* ── TERMINAL DE LOGS ── */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${isDeploying ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                {isDeploying ? 'Déploiement SMA en cours...' : 'Instanciation Terminée ✓'}
              </h3>
            </div>
            {!isDeploying && (
              <button onClick={reset} className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <RotateCcw className="w-3 h-3" /> Nouvelle VM
              </button>
            )}
          </div>

          {/* Console */}
          <div className="bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl p-6 overflow-y-auto max-h-[350px] space-y-2 select-text">
            {logs.map((log, i) => (
              <p key={i} className="leading-relaxed border-l-2 border-emerald-500/30 pl-3 py-0.5">{log}</p>
            ))}
            {isDeploying && <p className="pl-3 text-slate-400 animate-pulse">· · · Agent de Déploiement actif · · ·</p>}
          </div>

          {/* Résumé specs */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">Nom VM</span>{vmName || 'gandal-direct'}</p>
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">Image OS</span>{os}</p>
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">Specs</span>{cpu} Cœurs / {ram} Go RAM</p>
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">Réseau</span>{vlan.split(' ')[0]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Sous-composant label/content générique
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-600 block uppercase">{label}</label>
      {children}
    </div>
  );
}
