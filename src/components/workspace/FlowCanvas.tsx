'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow, Background, BackgroundVariant, Controls, MiniMap, Panel,
  ConnectionMode, useNodesState, useEdgesState,
  type Node, type Edge, type Connection, type NodeTypes, type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link2, Unlink, X } from 'lucide-react';

import type { ClusterTopology, TopologyVM } from '@/lib/apiClient';
import { VMFlowNode } from './VMFlowNode';
import { RouterNode } from './RouterNode';
import { GPUNode } from './GPUNode';
import type { VMNodeData } from './types';
import { useState } from 'react';

const nodeTypes: NodeTypes = { vm: VMFlowNode, router: RouterNode, gpu: GPUNode };
// Vert pour les liens d'accès GPU (dérivés, pointillés, non supprimables).
const GPU_EDGE_COLOR = '#22c55e';
const POS_KEY = 'gandal-flow-positions';

interface Props {
  topology: ClusterTopology;
  onOpen: (vm: TopologyVM) => void;
  onToggleInternet: (vm: TopologyVM) => void;
  onLink: (a: number, b: number) => void;
  onUnlink: (a: number, b: number) => void;
  onLinkGroup: (vmids: number[], enable: boolean) => void;
  busyVmid?: number | null;
  theme?: 'light' | 'dark';
  highlightVmids?: Set<number>;
  dimVmids?: Set<number>;
}

// ── Positions persistées (localStorage) — la toile est libre, on retient où l'user place ──
function loadPositions(): Record<string, { x: number; y: number }> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}'); } catch { return {}; }
}
function savePositions(p: Record<string, { x: number; y: number }>) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/** Position initiale organique (grille lâche) pour un nœud encore jamais placé. */
function autoPos(index: number): { x: number; y: number } {
  const perRow = 4;
  return { x: 80 + (index % perRow) * 280, y: 220 + Math.floor(index / perRow) * 230 };
}

export default function FlowCanvas({ topology, onOpen, onToggleInternet, onLink, onUnlink, onLinkGroup, busyVmid, theme = 'light', highlightVmids, dimVmids }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedVmids, setSelectedVmids] = useState<number[]>([]);
  const positions = useRef<Record<string, { x: number; y: number }>>(loadPositions());
  const rf = useRef<ReactFlowInstance | null>(null);
  const dark = theme === 'dark';
  // Arêtes noires en clair, claires en sombre (pour rester visibles).
  const edgeColor = dark ? '#cbd5e1' : '#0f172a';

  // Centre/zoome automatiquement sur la/les VM(s) trouvée(s) par la recherche.
  useEffect(() => {
    if (!rf.current || !highlightVmids || highlightVmids.size === 0) return;
    const target = [...highlightVmids].map((v) => ({ id: `vm-${v}` }));
    rf.current.fitView({ nodes: target, duration: 700, padding: 0.55, maxZoom: 1.5 });
  }, [highlightVmids]);

  // Fusionne la topologie dans les nœuds SANS réinitialiser les positions (toile libre).
  useEffect(() => {
    // Pairs réseau par VM : 1 bulle par lien existant (+ 1 bulle libre côté nœud).
    const peersByVmid = new Map<number, number[]>();
    topology.links.forEach((l) => {
      (peersByVmid.get(l.source) ?? peersByVmid.set(l.source, []).get(l.source)!).push(l.target);
      (peersByVmid.get(l.target) ?? peersByVmid.set(l.target, []).get(l.target)!).push(l.source);
    });

    setNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]));
      const next: Node[] = [];

      // Routeur Internet (position libre, persistée) — 1 bulle par VM connectée + 1 libre.
      const rId = 'router';
      const inetPeers = topology.vms.filter((v) => v.internet).map((v) => v.vmid);
      next.push({
        id: rId, type: 'router',
        position: positions.current[rId] ?? prevById.get(rId)?.position ?? { x: 80 + 1.5 * 280, y: 40 },
        data: { inetPeers }, draggable: true,
      });

      // Pool GPU (en bas) — accès DÉRIVÉ : VMs allumées avec un budget VRAM > 0.
      // Le nœud n'apparaît que s'il existe au moins une telle VM.
      const gId = 'gpu';
      const gpuPeers = topology.vms.filter((v) => v.vram_mib > 0 && v.status === 'up').map((v) => v.vmid);
      if (gpuPeers.length > 0) {
        const vramTotalGb = Math.round(
          topology.vms.filter((v) => v.vram_mib > 0 && v.status === 'up')
            .reduce((s, v) => s + v.vram_mib, 0) / 1024);
        next.push({
          id: gId, type: 'gpu',
          position: positions.current[gId] ?? prevById.get(gId)?.position ?? { x: 80 + 1.5 * 280, y: 220 + Math.ceil(topology.vms.length / 4) * 230 + 80 },
          data: { gpuPeers, vramTotalGb }, draggable: true,
        });
      }

      topology.vms.forEach((vm, i) => {
        const id = `vm-${vm.vmid}`;
        const pos = positions.current[id] ?? prevById.get(id)?.position ?? autoPos(i);
        next.push({
          id, type: 'vm', position: pos,
          hidden: dimVmids?.has(vm.vmid),   // filtre canvas → vraiment masquée (position conservée)
          data: { vm, onOpen, onToggleInternet, busy: busyVmid === vm.vmid,
            highlight: highlightVmids?.has(vm.vmid), peers: peersByVmid.get(vm.vmid) ?? [] } as VMNodeData,
        });
      });
      return next;
    });

    // Arêtes (reconstruites à chaque refresh — elles suivent l'état réseau réel)
    const e: Edge[] = [];
    topology.vms.forEach((vm) => {
      if (vm.internet) {
        e.push({
          id: `inet-${vm.vmid}`, source: `vm-${vm.vmid}`, sourceHandle: 'inet',
          target: 'router', targetHandle: `inet-${vm.vmid}`,
          animated: true, type: 'default', style: { stroke: edgeColor, strokeWidth: 3.5 },
          hidden: dimVmids?.has(vm.vmid),
        });
      }
    });
    topology.links.forEach((l) => {
      e.push({
        id: `link-${l.source}-${l.target}`, source: `vm-${l.source}`, sourceHandle: `net-${l.target}`,
        target: `vm-${l.target}`, targetHandle: `net-${l.source}`, type: 'default',
        label: l.group_name ?? undefined, style: { stroke: edgeColor, strokeWidth: 3.5 },
        labelStyle: { fill: edgeColor, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: dark ? '#1e293b' : '#e2e8f0', fillOpacity: 0.95 }, labelBgPadding: [6, 3] as [number, number], labelBgBorderRadius: 6,
        hidden: dimVmids?.has(l.source) || dimVmids?.has(l.target),
      });
    });
    // Liens d'accès GPU : VERT + POINTILLÉS, animés. Dérivés (VRAM>0 + allumée),
    // donc NON supprimables (deletable:false) — ils disparaissent quand la VM s'éteint.
    topology.vms.forEach((vm) => {
      if (vm.vram_mib > 0 && vm.status === 'up') {
        e.push({
          id: `gpu-${vm.vmid}`, source: `vm-${vm.vmid}`, sourceHandle: 'gpu',
          target: 'gpu', targetHandle: `gpu-${vm.vmid}`,
          animated: true, type: 'default', deletable: false, selectable: false, focusable: false,
          style: { stroke: GPU_EDGE_COLOR, strokeWidth: 3, strokeDasharray: '6 4' },
          hidden: dimVmids?.has(vm.vmid),
        });
      }
    });
    setEdges(e);
  }, [topology, onOpen, onToggleInternet, busyVmid, setNodes, setEdges, edgeColor, dark, highlightVmids, dimVmids]);

  // Sauvegarde la position au déplacement.
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    let dirty = false;
    for (const c of changes) {
      if (c.type === 'position' && c.position && !c.dragging) {
        positions.current[c.id] = c.position;
        dirty = true;
      }
    }
    if (dirty) savePositions(positions.current);
  }, [onNodesChange]);

  // Glisser-relier (robuste, mode loose : peu importe le sens). Si l'une des deux
  // extrémités est le routeur → Internet ; sinon lien réseau entre les 2 VMs.
  const onConnect = useCallback((c: Connection) => {
    const ends = [c.source, c.target];
    // L'accès GPU est dérivé (VRAM>0 + allumée), jamais posé à la main → on ignore.
    if (ends.includes('gpu')) return;
    if (ends.includes('router')) {
      const vmEnd = ends.find((x) => x?.startsWith('vm-'));
      if (!vmEnd) return;
      const vm = topology.vms.find((v) => v.vmid === Number(vmEnd.replace('vm-', '')));
      if (vm && !vm.internet) onToggleInternet(vm);
      return;
    }
    if (c.source?.startsWith('vm-') && c.target?.startsWith('vm-')) {
      const a = Number(c.source.replace('vm-', ''));
      const b = Number(c.target.replace('vm-', ''));
      if (a !== b) onLink(a, b);
    }
  }, [topology.vms, onToggleInternet, onLink]);

  // Déconnexion : clic sur une arête (et touche Suppr sur arête sélectionnée).
  const disconnect = useCallback((edge: Edge) => {
    if (edge.id.startsWith('inet-')) {
      const vm = topology.vms.find((v) => v.vmid === Number(edge.id.replace('inet-', '')));
      if (vm && vm.internet) onToggleInternet(vm);
    } else if (edge.id.startsWith('link-')) {
      const [, a, b] = edge.id.split('-');
      onUnlink(Number(a), Number(b));
    }
  }, [topology.vms, onToggleInternet, onUnlink]);

  const onEdgesDelete = useCallback((eds: Edge[]) => { eds.forEach(disconnect); }, [disconnect]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    if (node.type !== 'vm') return;
    const vm = topology.vms.find((v) => v.vmid === Number(node.id.replace('vm-', '')));
    if (vm) onOpen(vm);
  }, [topology.vms, onOpen]);

  // Multi-sélection (Shift+clic ou boîte de sélection) → relier/isoler en groupe (3+ VMs).
  const onSelectionChange = useCallback(({ nodes: sel }: { nodes: Node[] }) => {
    setSelectedVmids(sel.filter((n) => n.type === 'vm').map((n) => Number(n.id.replace('vm-', ''))));
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(160deg,#ffffff_0%,#f4f8ff_60%,#eef4ff_100%)] dark:bg-[linear-gradient(160deg,#0a0a0a_0%,#0c1018_60%,#0a0e16_100%)]">
      {/* Décor géométrique bleu (style landing GANDAL) : cercles pleins, anneaux,
          anneaux pointillés et amas de points — fixés en arrière-plan. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden dark:opacity-40">
        {/* haut-droite : grand cercle plein + anneau interne */}
        <div className="absolute -right-36 -top-36 h-[34rem] w-[34rem] rounded-full bg-blue-600/8 border border-blue-500/20" />
        <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full border-[3px] border-blue-400/20" />
        {/* haut-gauche : anneau géant ténu + petit accent */}
        <div className="absolute -left-24 -top-44 h-[30rem] w-[30rem] rounded-full border border-blue-500/12" />
        <div className="absolute left-[12%] top-24 h-14 w-14 rounded-full bg-blue-500/20" />
        {/* gauche-milieu : cercle flottant + anneau pointillé */}
        <div className="absolute -left-40 top-1/2 h-[26rem] w-[26rem] rounded-full bg-blue-500/8 border border-blue-400/15" />
        <div className="absolute left-[6%] top-1/3 h-72 w-72 rounded-full border-2 border-dashed border-blue-500/15" />
        {/* droite-milieu : accent moyen */}
        <div className="absolute right-[9%] top-[42%] h-24 w-24 rounded-full bg-blue-500/14 border border-blue-400/20" />
        {/* bas-gauche : grand cercle plein */}
        <div className="absolute -left-44 bottom-[-8rem] h-[30rem] w-[30rem] rounded-full bg-blue-500/8" />
        {/* bas-droite : anneau épais */}
        <div className="absolute right-[-4rem] bottom-[-6rem] h-80 w-80 rounded-full border-[6px] border-blue-600/10" />
        {/* amas de points */}
        <div className="absolute left-[28%] top-[18%] h-5 w-5 rounded-full bg-blue-600/35" />
        <div className="absolute left-[30%] top-[21%] h-3 w-3 rounded-full bg-blue-400/45" />
        <div className="absolute left-[26%] top-[22%] h-4 w-4 rounded-full bg-blue-500/30" />
        <div className="absolute right-[24%] bottom-[20%] h-4 w-4 rounded-full bg-blue-500/30" />
        <div className="absolute right-[22%] bottom-[23%] h-2.5 w-2.5 rounded-full bg-blue-600/40" />
      </div>

      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange}
        onInit={(inst) => { rf.current = inst; }}
        onConnect={onConnect} onEdgeClick={(_, e) => disconnect(e)} onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick} onSelectionChange={onSelectionChange}
        connectionMode={ConnectionMode.Loose} connectionRadius={90}
        fitView fitViewOptions={{ padding: 0.3 }} minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'default', style: { stroke: edgeColor, strokeWidth: 3.5 } }}
        connectionLineStyle={{ stroke: edgeColor, strokeWidth: 3.5 }}
        edgesFocusable deleteKeyCode={['Backspace', 'Delete']}
        style={{ background: 'transparent' }}
      >
        {selectedVmids.length >= 2 && (
          <Panel position="top-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-[#2a2a2a] dark:bg-[#141414]">
              <span className="text-[12px] text-slate-500">{selectedVmids.length} VMs sélectionnées</span>
              <button onClick={() => onLinkGroup(selectedVmids, true)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-cyan-500">
                <Link2 size={13} /> Relier en réseau
              </button>
              <button onClick={() => onLinkGroup(selectedVmids, false)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 dark:border-[#2a2a2a] dark:text-slate-300 dark:hover:bg-[#1c1c1c]">
                <Unlink size={13} /> Isoler
              </button>
            </div>
          </Panel>
        )}
        {/* Quadrillage discret en tons bleus */}
        <Background id="grid" variant={BackgroundVariant.Lines} gap={40} size={1} color={dark ? "rgba(148,163,184,0.10)" : "rgba(37,99,235,0.06)"} />
        <Background id="dots" variant={BackgroundVariant.Dots} gap={40} size={2} color={dark ? "rgba(148,163,184,0.25)" : "rgba(37,99,235,0.18)"} offset={20} />
        <MiniMap pannable zoomable maskColor={dark ? 'rgba(0,0,0,0.5)' : 'rgba(37,99,235,0.08)'}
          nodeColor={(n) => (n.type === 'router' ? '#0ea5e9' : n.type === 'gpu' ? '#22c55e' : '#2563eb')}
          className="!rounded-xl !shadow-sm !backdrop-blur !bg-white/80 !border !border-blue-200/70 dark:!bg-[#141414]/90 dark:!border-[#2a2a2a]" />
        <Controls className="!rounded-xl !shadow-sm !bg-white !border !border-slate-200 [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!text-slate-500 [&>button:hover]:!bg-slate-50 dark:!bg-[#141414] dark:!border-[#2a2a2a] dark:[&>button]:!bg-[#1c1c1c] dark:[&>button]:!border-[#2a2a2a] dark:[&>button]:!text-slate-400 dark:[&>button:hover]:!bg-[#2a2a2a]" />
      </ReactFlow>
    </div>
  );
}
