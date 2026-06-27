'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { ClusterTopology, TopologyVM } from '@/lib/apiClient';
import { VMNode } from './VMNode';
import { InternetNode } from './InternetNode';
import { HostNode } from './HostNode';
import type { VMNodeData } from './types';

const nodeTypes: NodeTypes = { vm: VMNode, internet: InternetNode, host: HostNode };

const COL_W = 270;
const COL_GAP = 110;
const VM_H = 188;
const TOP_PAD = 190;

interface Props {
  topology: ClusterTopology;
  onToggleInternet: (vm: TopologyVM) => void;
  onLink: (a: number, b: number) => void;
  onUnlink: (a: number, b: number) => void;
  onLifecycle?: (vm: TopologyVM, action: 'start' | 'stop') => void;
  onSelectVm?: (vm: TopologyVM) => void;
  busyVmid?: number | null;
}

/** Construit nœuds + arêtes React Flow à partir de la topologie cluster. */
function build(
  topology: ClusterTopology,
  handlers: Pick<Props, 'onToggleInternet' | 'onLifecycle' | 'busyVmid'>,
): { nodes: Node[]; edges: Edge[] } {
  const hosts = topology.hosts.length
    ? topology.hosts
    : Array.from(new Set(topology.vms.map((v) => v.node).filter(Boolean) as string[]));
  const byHost = new Map<string, TopologyVM[]>();
  hosts.forEach((h) => byHost.set(h, []));
  topology.vms.forEach((vm) => {
    const h = vm.node ?? hosts[0] ?? 'inconnu';
    if (!byHost.has(h)) byHost.set(h, []);
    byHost.get(h)!.push(vm);
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const maxRows = Math.max(1, ...Array.from(byHost.values(), (v) => v.length));
  const totalW = byHost.size * COL_W + (byHost.size - 1) * COL_GAP;

  // Nœud Internet centré en haut
  nodes.push({
    id: 'internet',
    type: 'internet',
    position: { x: totalW / 2 - 70, y: 0 },
    data: {},
    draggable: false,
    selectable: false,
  });

  const laneHeight = maxRows * VM_H + 80;
  let col = 0;
  for (const [host, vms] of byHost) {
    const colX = col * (COL_W + COL_GAP);
    // Lane-hôte (conteneur de fond, façon « rack »)
    nodes.push({
      id: `host-${host}`,
      type: 'host',
      position: { x: colX - 24, y: TOP_PAD - 56 },
      data: { host, count: vms.length },
      draggable: false,
      selectable: false,
      zIndex: -1,
      style: { width: COL_W + 28, height: laneHeight },
    });
    vms.forEach((vm, i) => {
      const id = `vm-${vm.vmid}`;
      nodes.push({
        id,
        type: 'vm',
        position: { x: colX, y: TOP_PAD + i * VM_H },
        data: {
          vm,
          onToggleInternet: handlers.onToggleInternet,
          onLifecycle: handlers.onLifecycle,
          busy: handlers.busyVmid === vm.vmid,
        } as VMNodeData,
      });
      // Arête uplink Internet (animée, dégradé cyan→bleu)
      if (vm.internet) {
        edges.push({
          id: `inet-${vm.vmid}`,
          source: id,
          sourceHandle: 'inet',
          target: 'internet',
          targetHandle: undefined,
          animated: true,
          type: 'smoothstep',
          style: { stroke: '#38bdf8', strokeWidth: 2.5, opacity: 0.9 },
        });
      }
    });
    col += 1;
  }

  // Arêtes liens réseau VM↔VM (cyan, étiquette de groupe)
  topology.links.forEach((l) => {
    edges.push({
      id: `link-${l.source}-${l.target}`,
      source: `vm-${l.source}`,
      sourceHandle: 'net-out',
      target: `vm-${l.target}`,
      targetHandle: 'net-in',
      label: l.group_name ?? undefined,
      type: 'smoothstep',
      style: { stroke: '#22d3ee', strokeWidth: 2 },
      labelStyle: { fill: '#a5f3fc', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#0e1726', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
    });
  });

  return { nodes, edges };
}

export default function TopologyCanvas({
  topology, onToggleInternet, onLink, onUnlink, onLifecycle, onSelectVm, busyVmid,
}: Props) {
  const { nodes: builtNodes, edges: builtEdges } = useMemo(
    () => build(topology, { onToggleInternet, onLifecycle, busyVmid }),
    [topology, onToggleInternet, onLifecycle, busyVmid],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  useEffect(() => setNodes(builtNodes), [builtNodes, setNodes]);
  useEffect(() => setEdges(builtEdges), [builtEdges, setEdges]);

  // Glisser-relier : VM→Internet = accès internet ; VM→VM = lien réseau.
  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source) return;
      const srcVmid = Number(c.source.replace('vm-', ''));
      if (c.target === 'internet') {
        const vm = topology.vms.find((v) => v.vmid === srcVmid);
        if (vm && !vm.internet) onToggleInternet(vm);
        return;
      }
      if (c.target?.startsWith('vm-')) {
        const dstVmid = Number(c.target.replace('vm-', ''));
        if (srcVmid !== dstVmid) onLink(srcVmid, dstVmid);
      }
    },
    [topology.vms, onToggleInternet, onLink],
  );

  // Clic sur une arête = proposition de déconnexion.
  const onEdgeClick = useCallback(
    (_: unknown, edge: Edge) => {
      if (edge.id.startsWith('inet-')) {
        const vmid = Number(edge.id.replace('inet-', ''));
        const vm = topology.vms.find((v) => v.vmid === vmid);
        if (vm && vm.internet) onToggleInternet(vm);
      } else if (edge.id.startsWith('link-')) {
        const [, a, b] = edge.id.split('-');
        onUnlink(Number(a), Number(b));
      }
    },
    [topology.vms, onToggleInternet, onUnlink],
  );

  // Clic sur un nœud VM = ouvrir le panneau de gestion complet.
  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (node.type !== 'vm') return;
      const vmid = Number(node.id.replace('vm-', ''));
      const vm = topology.vms.find((v) => v.vmid === vmid);
      if (vm && onSelectVm) onSelectVm(vm);
    },
    [topology.vms, onSelectVm],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        minZoom={0.2}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1e293b" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => (n.type === 'internet' ? '#38bdf8' : n.type === 'host' ? '#334155' : '#0ea5e9')}
          maskColor="rgba(2,6,23,0.7)"
          className="!bg-slate-900/80 !rounded-xl"
        />
        <Controls className="!bg-slate-900/80 !border-slate-700 !rounded-xl [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300" />
      </ReactFlow>
    </div>
  );
}
