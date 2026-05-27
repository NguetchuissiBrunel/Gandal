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
  // Formulaire - champs conformes au diagramme de classe VM
  const [size_RAM, setSize_RAM] = useState('4');
  const [size_ROM, setSize_ROM] = useState('80');
  const [N_CPU, setN_CPU] = useState('2');
  const [ISO_image, setISO_image] = useState('Ubuntu Server 24.04 LTS');
  const [mode, setMode] = useState('Isolé');
  const [SSH_Public_Key, setSSH_Public_Key] = useState('');

  // Simulateur de déploiement SMA
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setStep(1);
    setLogs([]);
  };

  useEffect(() => {
    if (!isDeploying) return;

    const sequence = [
      `[AM] ✉ Message FIPA-ACL reçu. Requête: CREATE_VM. ResourceSpec: N_CPU=${N_CPU}, size_RAM=${size_RAM}Go, size_ROM=${size_ROM}Go, ISO_image="${ISO_image}", mode=${mode}.`,
      `[AM] Analyse de la charge du cluster. Transmission à l'Agent de Supervision (AS)...`,
      `[AS] Nœud "enspy-node-02" détecté (CPU: 22%, RAM dispos: 64Go). Réponse FIPA-ACL → AM: AGREE.`,
      `[AM] Ordre transmis à l'Agent de Déploiement (AD): REQUEST "instantiate_vm" sur "enspy-node-02".`,
      `[AD] 🖥️ Connexion à l'API Proxmox VE sur le Nœud 02...`,
      `[AD] Allocation confirmée. VM ID: 104. Création du disque virtuel ${size_ROM}Go...`,
      `[AD] Clonage du template ISO "${ISO_image}"... [||||||||||..........] 50%`,
      `[AD] Clonage terminé. Provisionnement de l'adresse IP dans la plage GANDAL...`,
      `[AD] Mode réseau appliqué: "${mode}". SSH_Public_Key enregistrée.`,
      `[AD] Démarrage VM ID 104... status: RUNNING. ipAddress: 20.20.20.19.`,
      `[AS] VM ID 104 opérationnelle. Monitoring branché sur Prometheus.`,
      `[AM] Déploiement terminé. Rapport envoyé à l'enseignant ${teacherName}. Code FIPA: INFORM.`,
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
      showToast(`VM déployée (IP: 20.20.20.19, ISO: ${ISO_image}) !`, 'success');
      onVmCreated({
        id: `pub-${Date.now()}`,
        nom: `VM Directe — ${ISO_image} (${N_CPU} CPU / ${size_RAM}Go RAM)`,
        lien: 'https://github.com/enspy-gi27',
        description: `VM instanciée par ${teacherName}. ISO: ${ISO_image}, size_RAM: ${size_RAM}Go, size_ROM: ${size_ROM}Go, N_CPU: ${N_CPU}, mode: ${mode}.`,
        photo: '',
        status: 'published',
      });
    }
  }, [isDeploying, step]);

  const reset = () => { setLogs([]); setStep(0); };

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-8 pb-14 space-y-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <Screw3D className="top-2 left-2 -rotate-12" />
      <Screw3D className="top-2 right-2 rotate-[60deg]" />
      <Screw3D className="bottom-[-1.5rem] left-2 -rotate-45" />
      <Screw3D className="bottom-[-1.5rem] right-2 -rotate-[45deg]" />

      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-black tracking-tight uppercase leading-none">Console d'Instanciation Directe</h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">DÉPLOIEMENT FORCÉ DE MACHINES VIRTUELLES SUR PROXMOX PAR ORCHESTRATION SMA</p>
      </div>

      {!isDeploying && logs.length === 0 ? (
        /* ── FORMULAIRE ── */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ISO_image */}
            <Field label="ISO_image (Système OS)">
              <select value={ISO_image} onChange={(e) => setISO_image(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                <option>Ubuntu Server 24.04 LTS</option>
                <option>Debian 12 Bookworm</option>
                <option>Alpine Linux 3.20 (Minimal)</option>
              </select>
            </Field>

            {/* N_CPU */}
            <Field label="N_CPU (Cœurs vCPU)">
              <select value={N_CPU} onChange={(e) => setN_CPU(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                {['1', '2', '4', '8'].map((c) => <option key={c} value={c}>{c} Cœur{Number(c) > 1 ? 's' : ''}</option>)}
              </select>
            </Field>

            {/* size_RAM */}
            <Field label="size_RAM (Mémoire vive)">
              <select value={size_RAM} onChange={(e) => setSize_RAM(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                {['1', '2', '4', '8', '16', '32'].map((r) => <option key={r} value={r}>{r} Go</option>)}
              </select>
            </Field>

            {/* size_ROM */}
            <Field label="size_ROM (Espace Disque)">
              <div className="relative flex items-center">
                <input type="number" min="10" max="500" required value={size_ROM} onChange={(e) => setSize_ROM(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-blue-600 text-sm font-semibold font-mono" />
                <span className="absolute right-4 text-xs font-bold text-slate-400">Go</span>
              </div>
            </Field>

            {/* mode */}
            <Field label="mode (Réseau & Isolation)">
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 text-sm font-semibold cursor-pointer">
                <option value="Isolé">Isolé (Étudiants)</option>
                <option value="Public restreint">Public restreint</option>
                <option value="Administration">Administration</option>
              </select>
            </Field>

            {/* SSH_Public_Key */}
            <Field label="SSH_Public_Key (optionnel)">
              <input
                type="text" placeholder="ssh-rsa AAAA..."
                value={SSH_Public_Key} onChange={(e) => setSSH_Public_Key(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold font-mono"
              />
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
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">ISO_image</span>{ISO_image}</p>
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">N_CPU / size_RAM</span>{N_CPU} Cœurs / {size_RAM} Go</p>
            <p><span className="text-slate-400 block font-bold text-[9px] uppercase">size_ROM / mode</span>{size_ROM} Go · {mode}</p>
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
