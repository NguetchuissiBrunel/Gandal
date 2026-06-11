/** Nom affiché d'une VM (titre de la requête), pas le nœud Proxmox. */
export function vmDisplayName(vm: {
  name?: string | null;
  id: number | string;
}): string {
  const label = vm.name?.trim();
  return label || `vm-${vm.id}`;
}

/** Libellé Proxmox : VMID + nœud hyperviseur. */
export function vmProxmoxLabel(vm: {
  id_proxmox?: number | null;
  node?: string | null;
}): string {
  if (vm.id_proxmox == null) return '—';
  return vm.node ? `${vm.id_proxmox} (${vm.node})` : String(vm.id_proxmox);
}
