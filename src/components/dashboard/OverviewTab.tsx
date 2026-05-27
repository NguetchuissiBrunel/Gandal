'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Database,
  HardDrive,
  Activity,
  Terminal as TerminalIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface OverviewTabProps {
  studentInfo: {
    username: string;
    matricule: string;
    level: string;
    department: string;
    email: string;
  };
  vms: Array<{
    id: string;
    name: string;
    status: string;
    cpu: number;
    ram: number;
    disk: number;
  }>;
  requests: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
  }>;
  onTabChange: (tab: string) => void;
}

const AGENT_LOGS_TEMPLATES = [
  { agent: 'Agent-Supervision', message: 'Collecte des métriques CPU/RAM sur le nœud physique n°2.', type: 'info' },
  { agent: 'Agent-Maître', message: 'Calcul de la répartition optimale de charge sur le cluster.', type: 'success' },
  { agent: 'Agent-Déploiement', message: 'Vérification de l\'état de santé de la VM gandal-ubuntu-srv.', type: 'info' },
  { agent: 'Agent-Sécurité', message: 'Analyse des ports d\'écoute réseau terminée. Aucun risque détecté.', type: 'success' },
  { agent: 'Agent-Passation', message: 'Audit des livrables de passation pour le Projet SMA : 85% complet.', type: 'warning' },
  { agent: 'Agent-Supervision', message: 'Alerte : Pic de charge temporaire sur le nœud physique n°1.', type: 'warning' },
  { agent: 'Agent-Maître', message: 'Équilibrage automatique des ressources initié.', type: 'info' },
  { agent: 'Agent-Migration', message: 'Migration à chaud de la VM enspy-web-portal vers le nœud 3 terminée avec succès.', type: 'success' },
  { agent: 'Agent-Audit', message: 'Journalisation des dernières actions d\'administration système.', type: 'info' },
];

export default function OverviewTab({
  studentInfo,
  vms,
  requests,
  publications,
  onTabChange
}: OverviewTabProps) {
  const [agentLogs, setAgentLogs] = useState<Array<{ time: string; agent: string; message: string; type: string }>>([]);

  useEffect(() => {
    const initialLogs = Array.from({ length: 4 }).map((_, i) => {
      const template = AGENT_LOGS_TEMPLATES[Math.floor(Math.random() * AGENT_LOGS_TEMPLATES.length)];
      const d = new Date();
      d.setMinutes(d.getMinutes() - (4 - i) * 3);
      return {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agent: template.agent,
        message: template.message,
        type: template.type
      };
    });
    setAgentLogs(initialLogs);

    const interval = setInterval(() => {
      const template = AGENT_LOGS_TEMPLATES[Math.floor(Math.random() * AGENT_LOGS_TEMPLATES.length)];
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAgentLogs((prev) => [
        ...prev.slice(1),
        { time: timeStr, agent: template.agent, message: template.message, type: template.type }
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const quotaLimits = { vms: 5, cpu: 8, ram: 16, disk: 200 };
  const currentUsage = vms.reduce((acc, vm) => {
    if (vm.status !== 'Arrêtée') {
      acc.cpu += vm.cpu;
      acc.ram += vm.ram;
      acc.disk += vm.disk;
    }
    acc.vms += 1;
    return acc;
  }, { vms: 0, cpu: 0, ram: 0, disk: 0 });

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Greetings Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-200 border border-blue-500/30">
              Session Étudiant active
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              Bonjour, <span className="text-blue-300">{studentInfo.username}</span> !
            </h1>
            <p className="text-gray-300 text-xs md:text-sm font-medium max-w-xl">
              Bienvenue sur votre console GANDAL. Supervisez vos machines virtuelles, gérez vos demandes d'extension de ressources et préparez la passation de vos projets académiques.
            </p>
          </div>

          <div className="flex flex-col text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm self-stretch md:self-auto min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Classe & Promotion</span>
            <span className="text-sm font-bold text-white mt-1">{studentInfo.department}</span>
            <span className="text-xs text-blue-300 font-bold mt-0.5">Niveau {studentInfo.level} • Promotion GI27</span>
            <span className="text-[10px] font-semibold text-gray-400 mt-2">Matricule : {studentInfo.matricule}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid (Quotas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-400">Machines Virtuelles</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{currentUsage.vms}</span>
              <span className="text-xs font-bold text-gray-400">/ {quotaLimits.vms} créées</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.vms / quotaLimits.vms) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-400">Processeurs (vCPUs)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{currentUsage.cpu} Cores</span>
              <span className="text-xs font-bold text-gray-400">/ {quotaLimits.cpu} max</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.cpu / quotaLimits.cpu) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-400">Mémoire (RAM)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{currentUsage.ram} Go</span>
              <span className="text-xs font-bold text-gray-400">/ {quotaLimits.ram} Go max</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.ram / quotaLimits.ram) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-400">Stockage (Disque)</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{currentUsage.disk} Go</span>
              <span className="text-xs font-bold text-gray-400">/ {quotaLimits.disk} Go max</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage.disk / quotaLimits.disk) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Multi-Agent & Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">
                  Système Multi-Agent GANDAL
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Actif
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { name: 'Agent Maître', role: 'Orchestration', status: 'Actif', color: 'bg-emerald-500' },
                { name: 'Agent Supervision', role: 'Mesure', status: 'Actif', color: 'bg-emerald-500' },
                { name: 'Agent Déploiement', role: 'Provisioning', status: 'Actif', color: 'bg-emerald-500' },
                { name: 'Agent Passation', role: 'Audit livrables', status: 'Audit', color: 'bg-amber-500' },
              ].map((ag) => (
                <div key={ag.name} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block truncate">{ag.name}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{ag.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className={`w-2 h-2 rounded-full ${ag.color}`} />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{ag.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 px-1.5">
                <TerminalIcon className="w-4 h-4" />
                <span>Flux de logs des Agents Logiciels (Simulation en temps réel)</span>
              </div>
              <div className="bg-gray-950 text-gray-300 font-mono text-[10px] md:text-xs rounded-2xl p-4 overflow-y-auto h-48 border border-gray-800 shadow-inner flex flex-col gap-2">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start leading-relaxed border-b border-gray-800 pb-1">
                    <span className="text-gray-600 shrink-0 select-none">[{log.time}]</span>
                    <span className={`font-semibold shrink-0 uppercase tracking-wider ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                      {log.agent} :
                    </span>
                    <span className="text-gray-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activities & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
              <Clock className="w-4.5 h-4.5 text-blue-600" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Activités Récentes
              </h2>
            </div>

            <div className="space-y-4 flex-grow">
              {vms.length > 0 ? (
                <div className="space-y-4">
                  {vms.slice(0, 2).map((vm) => (
                    <div key={vm.id} className="flex gap-3 items-start text-xs border-b border-gray-50 pb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Machine <span className="font-bold text-gray-900">{vm.name}</span> active
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Provisionnée avec succès par l'Agent de Déploiement</span>
                      </div>
                    </div>
                  ))}
                  {requests.slice(0, 1).map((req) => (
                    <div key={req.id} className="flex gap-3 items-start text-xs border-b border-gray-50 pb-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Requête : {req.type}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Statut actuel : {req.status} • {req.date}</span>
                      </div>
                    </div>
                  ))}
                  {publications.slice(0, 1).map((pub) => (
                    <div key={pub.id} className="flex gap-3 items-start text-xs pb-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Projet publié : {pub.title}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium">Passation initialisée • {pub.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 font-medium text-xs">
                  Aucune activité récente.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => onTabChange('vms')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all group"
              >
                <span>Accéder à mes machines</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onTabChange('requests')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all group"
              >
                <span>Faire une requête d'extension</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}