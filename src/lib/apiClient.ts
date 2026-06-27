import { components } from './api';
import { syncAuthCookie } from './authCookie';

// API on-premise (GANDAL-API). Comme le front et l'API sont TOUJOURS co-localisés
// (même hôte), on déduit l'URL de l'API depuis l'adresse du navigateur → fonctionne
// quel que soit le point d'accès (IP, nom DNS…), sans dépendre d'une URL figée au build.
// NEXT_PUBLIC_API_BASE reste un override explicite pour les cas inhabituels.
function resolveApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return 'http://127.0.0.1:8080';
}
const BASE_URL = resolveApiBase();

export const AUTH_CHANGE_EVENT = 'gandal-auth-change';

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}
/** Limite documentée par l'API (query.size ≤ 100). */
const MAX_PAGE_SIZE = 100;

function buildListQuery(params?: { page?: number; size?: number }): string {
  const query = new URLSearchParams();
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.size != null) {
    query.set('size', String(Math.min(Math.max(1, params.size), MAX_PAGE_SIZE)));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export type StudentRead = components['schemas']['StudentRead'];
export type TeacherRead = components['schemas']['TeacherRead'];
export type VMRead = components['schemas']['VMRead'];
export type RCreateVMRead = components['schemas']['RCreateVMRead'];
export type RDeleteVMRead = components['schemas']['RDeleteVMRead'];
export type RAccountRead = components['schemas']['RAccountRead'];
export type PublicationRead = components['schemas']['PublicationRead'];
export type AdminCreate = components['schemas']['AdminCreate'];
export type DNSEntryRead = components['schemas']['DNSEntryRead'];
export type DNSEntryCreate = components['schemas']['DNSEntryCreate'];
export type DNSEntryUpdate = components['schemas']['DNSEntryUpdate'];

// --- Cluster / topologie (API on-premise Omega) ---
export interface TopologyVM {
  vmid: number;
  name: string | null;
  node: string | null;
  status: 'up' | 'stopped' | 'waiting';
  ip: string | null;
  internet: boolean;
  maxcpu: number | null;
  maxmem: number | null;
  vram_mib: number;
  owner_id: number | null;
  owner_name: string | null;
}

export interface TopologyLink {
  source: number;
  target: number;
  group_name: string | null;
}

export interface ClusterTopology {
  hosts: string[];
  vms: TopologyVM[];
  links: TopologyLink[];
}

export interface DistributionNode {
  node: string;
  current: number;
  quota: number;
  target: number;
}

export interface GpuNode {
  node: string;
  available: boolean;
  gpu?: string;
  mem_used_mib?: number;
  mem_total_mib?: number;
  util_pct?: number;
  temp_c?: number;
}

export interface MigrationEntry {
  vmid: string | null;
  node_from: string | null;
  status: string;
  starttime: number | null;
  endtime: number | null;
  user: string | null;
}


class ApiClient {
  private get token(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gandal_token');
    }
    return null;
  }

  private set token(value: string | null) {
    if (typeof window !== 'undefined') {
      if (value) {
        localStorage.setItem('gandal_token', value);
      } else {
        localStorage.removeItem('gandal_token');
      }
      syncAuthCookie(value);
    }
  }

  setToken(value: string) {
    this.token = value;
    notifyAuthChange();
  }

  clearToken() {
    this.token = null;
    notifyAuthChange();
  }

  getToken(): string | null {
    const t = this.token;
    if (t && typeof window !== 'undefined') {
      syncAuthCookie(t);
    }
    return t;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
        if (typeof errorMsg !== 'string' && Array.isArray(errorMsg)) {
          // Handle FastAPI detail validation errors
          errorMsg = (errorMsg as any[]).map((err: any) => `${err.loc?.join('.') || ''}: ${err.msg}`).join(', ');
        }
      } catch (_) {
        // use fallback string
      }
      throw new Error(errorMsg);
    }

    // handle empty response or 204
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Auth ---
  async login(requestData: components['schemas']['LoginRequest']): Promise<components['schemas']['TokenResponse']> {
    const data = await this.request<components['schemas']['TokenResponse']>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe(): Promise<StudentRead | TeacherRead> {
    return this.request<StudentRead | TeacherRead>('/api/v1/auth/me');
  }

  /**
   * Crée un compte administrateur (bootstrap).
   * Requiert la clé secrète SUPERADMIN_SECRET_KEY configurée côté backend.
   * Ne nécessite PAS d'authentification préalable.
   */
  async registerAdmin(data: AdminCreate): Promise<TeacherRead> {
    return this.request<TeacherRead>('/api/v1/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Users / Students ---
  async signupStudent(studentData: components['schemas']['StudentCreate']): Promise<StudentRead> {
    return this.request<StudentRead>('/api/v1/users/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async getStudents(params?: { page?: number; size?: number }): Promise<{ items: StudentRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_StudentRead_']>(
      `/api/v1/users/students${buildListQuery(params)}`,
    );
    return { items: response.items || [], total: response.total || 0 };
  }

  async getStudent(id: number): Promise<StudentRead> {
    return this.request<StudentRead>(`/api/v1/users/students/${id}`);
  }

  async updateStudent(id: number, data: components['schemas']['StudentUpdate']): Promise<StudentRead> {
    return this.request<StudentRead>(`/api/v1/users/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: number): Promise<void> {
    await this.request<void>(`/api/v1/users/students/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Users / Teachers ---
  async signupTeacher(teacherData: components['schemas']['TeacherCreate']): Promise<TeacherRead> {
    return this.request<TeacherRead>('/api/v1/users/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async getTeachers(params?: { page?: number; size?: number }): Promise<{ items: TeacherRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_TeacherRead_']>(
      `/api/v1/users/teachers${buildListQuery(params)}`,
    );
    return { items: response.items || [], total: response.total || 0 };
  }

  async getTeacher(id: number): Promise<TeacherRead> {
    return this.request<TeacherRead>(`/api/v1/users/teachers/${id}`);
  }

  async updateTeacher(id: number, data: components['schemas']['TeacherUpdate']): Promise<TeacherRead> {
    return this.request<TeacherRead>(`/api/v1/users/teachers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeacher(id: number): Promise<void> {
    await this.request<void>(`/api/v1/users/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  // --- VMs ---
  async getVms(params?: { page?: number; size?: number }): Promise<{ items: VMRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_VMRead_']>(
      `/api/v1/vms${buildListQuery(params)}`,
    );
    return { items: response.items || [], total: response.total || 0 };
  }

  async getVm(vmId: number): Promise<VMRead> {
    return this.request<VMRead>(`/api/v1/vms/${vmId}`);
  }

  async createVm(vmData: components['schemas']['VMCreate']): Promise<VMRead> {
    return this.request<VMRead>('/api/v1/vms', {
      method: 'POST',
      body: JSON.stringify(vmData),
    });
  }

  async deleteVm(vmId: number): Promise<void> {
    await this.request<void>(`/api/v1/vms/${vmId}`, {
      method: 'DELETE',
    });
  }

  async updateVm(vmId: number, data: components['schemas']['VMUpdate']): Promise<VMRead> {
    return this.request<VMRead>(`/api/v1/vms/${vmId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async startVm(vmId: number): Promise<any> {
    return this.request<any>(`/api/v1/vms/${vmId}/start`, {
      method: 'POST',
    });
  }

  async stopVm(vmId: number): Promise<any> {
    return this.request<any>(`/api/v1/vms/${vmId}/stop`, {
      method: 'POST',
    });
  }

  async pauseVm(vmId: number): Promise<any> {
    return this.request<any>(`/api/v1/vms/${vmId}/pause`, {
      method: 'POST',
    });
  }

  // --- Requests (Requetes) ---
  async getRequests(params?: { page?: number; size?: number }): Promise<{
    items: (RCreateVMRead | RDeleteVMRead | RAccountRead)[];
    total: number;
  }> {
    const response = await this.request<
      components['schemas']['PaginatedResponse_Union_RCreateVMRead__RDeleteVMRead__RAccountRead__']
    >(`/api/v1/requetes${buildListQuery(params)}`);
    return { items: response.items || [], total: response.total || 0 };
  }

  async getRequest(
    requeteId: number,
  ): Promise<RCreateVMRead | RDeleteVMRead | RAccountRead> {
    return this.request<RCreateVMRead | RDeleteVMRead | RAccountRead>(
      `/api/v1/requetes/${requeteId}`,
    );
  }

  async createVmRequest(data: components['schemas']['RCreateVMCreate']): Promise<RCreateVMRead> {
    return this.request<RCreateVMRead>('/api/v1/requetes/create-vm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteVmRequest(data: components['schemas']['RDeleteVMCreate']): Promise<RDeleteVMRead> {
    return this.request<RDeleteVMRead>('/api/v1/requetes/delete-vm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAccountRequest(data: components['schemas']['RAccountCreate']): Promise<RAccountRead> {
    return this.request<RAccountRead>('/api/v1/requetes/account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Demande de nom de domaine : nom_choisi → http vers VM_IP:port (reverse-proxy). */
  async domainRequest(data: {
    object: string; content?: string | null; teacher_id: number;
    vm_id: number; hostname: string; port: number;
  }): Promise<unknown> {
    return this.request<unknown>('/api/v1/requetes/domain', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveRequest(requeteId: number, sshPublicKey: string = ''): Promise<unknown> {
    const body: components['schemas']['ApproveBody'] = { ssh_public_key: sshPublicKey };
    return this.request<unknown>(`/api/v1/requetes/${requeteId}/approve`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async rejectRequest(requeteId: number): Promise<any> {
    return this.request<any>(`/api/v1/requetes/${requeteId}/reject`, {
      method: 'POST',
    });
  }

  // --- Publications ---
  async getPublications(params?: { page?: number; size?: number }): Promise<{
    items: PublicationRead[];
    total: number;
  }> {
    const response = await this.request<components['schemas']['PaginatedResponse_PublicationRead_']>(
      `/api/v1/publications${buildListQuery(params)}`,
    );
    return { items: response.items || [], total: response.total || 0 };
  }

  async getPublication(publicationId: number): Promise<PublicationRead> {
    return this.request<PublicationRead>(`/api/v1/publications/${publicationId}`);
  }

  async getPublicPublications(params?: {
    page?: number;
    size?: number;
  }): Promise<{ items: PublicationRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_PublicationRead_']>(
      `/api/v1/publications/public${buildListQuery(params)}`,
    );
    return { items: response.items || [], total: response.total || 0 };
  }

  async createPublication(data: components['schemas']['PublicationCreate']): Promise<PublicationRead> {
    return this.request<PublicationRead>('/api/v1/publications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePublication(publicationId: number, data: components['schemas']['PublicationUpdate']): Promise<PublicationRead> {
    return this.request<PublicationRead>(`/api/v1/publications/${publicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePublication(publicationId: number): Promise<void> {
    await this.request<void>(`/api/v1/publications/${publicationId}`, {
      method: 'DELETE',
    });
  }

  // --- DNS ---
  async getDnsEntries(params?: { page?: number; size?: number }): Promise<{
    items: DNSEntryRead[];
    total: number;
  }> {
    const response = await this.request<{
      items: DNSEntryRead[];
      total: number;
    }>(`/api/v1/dns${buildListQuery(params)}`);
    return { items: response.items || [], total: response.total || 0 };
  }

  async getDnsEntry(dnsId: number): Promise<DNSEntryRead> {
    return this.request<DNSEntryRead>(`/api/v1/dns/${dnsId}`);
  }

  async getDnsForVm(
    vmId: number,
    params?: { page?: number; size?: number },
  ): Promise<{ items: DNSEntryRead[]; total: number }> {
    const response = await this.request<{
      items: DNSEntryRead[];
      total: number;
    }>(`/api/v1/dns/vms/${vmId}${buildListQuery(params)}`);
    return { items: response.items || [], total: response.total || 0 };
  }

  async createDnsEntry(data: DNSEntryCreate): Promise<DNSEntryRead> {
    return this.request<DNSEntryRead>('/api/v1/dns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDnsEntry(dnsId: number, data: DNSEntryUpdate): Promise<DNSEntryRead> {
    return this.request<DNSEntryRead>(`/api/v1/dns/${dnsId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDnsEntry(dnsId: number): Promise<void> {
    await this.request<void>(`/api/v1/dns/${dnsId}`, {
      method: 'DELETE',
    });
  }

  // --- Health ---
  async health(): Promise<unknown> {
    return this.request<unknown>('/health');
  }

  async ready(): Promise<unknown> {
    return this.request<unknown>('/ready');
  }

  // --- Cluster (topologie, distribution, internet, réseau) ---
  async getTopology(): Promise<ClusterTopology> {
    return this.request<ClusterTopology>('/api/v1/cluster/topology');
  }

  async getDistribution(): Promise<{ nodes: DistributionNode[] }> {
    return this.request<{ nodes: DistributionNode[] }>('/api/v1/cluster/distribution');
  }

  async reconcile(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>('/api/v1/cluster/reconcile', { method: 'POST' });
  }

  async setVmInternet(vmid: number, enable: boolean): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/internet`, {
      method: 'POST',
      body: JSON.stringify({ enable }),
    });
  }

  async networkLink(
    vmIds: number[],
    enable: boolean,
    groupName?: string,
  ): Promise<unknown> {
    return this.request<unknown>('/api/v1/cluster/network/link', {
      method: 'POST',
      body: JSON.stringify({ vm_ids: vmIds, enable, group_name: groupName ?? null }),
    });
  }

  async clusterVmAction(vmid: number, action: 'start' | 'stop'): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/${action}`, { method: 'POST' });
  }

  async deleteClusterVm(vmid: number): Promise<void> {
    await this.request<void>(`/api/v1/cluster/vms/${vmid}`, { method: 'DELETE' });
  }

  async createClusterVm(data: {
    name?: string; vcpu?: number; ram_gb?: number; disk_gb?: number;
    vram_gb?: number; internet?: boolean; autostart?: boolean;
  }): Promise<{ vm_id: number; vmid: number | null; status: string }> {
    return this.request('/api/v1/cluster/vms', {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async reconfigureVm(vmid: number, data: {
    name?: string; vcpu_max?: number; ram_mib?: number; disk_gib?: number; vram_mib?: number;
  }): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/reconfigure`, {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async setVmGpu(vmid: number, vramMib: number): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/gpu`, {
      method: 'POST', body: JSON.stringify({ vram_mib: vramMib }),
    });
  }

  async setVmAutostart(vmid: number, enable: boolean): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/autostart`, {
      method: 'POST', body: JSON.stringify({ enable }),
    });
  }

  async registerVmDns(vmid: number, hostname?: string): Promise<unknown> {
    return this.request<unknown>(`/api/v1/cluster/vms/${vmid}/dns`, {
      method: 'POST', body: JSON.stringify({ hostname: hostname ?? null }),
    });
  }

  async exposeService(vmid: number, data: {
    service_port: number; ext_port?: number; hostname?: string; proto?: string; enable?: boolean;
  }): Promise<{ url: string | null; pfsense: string; ext_port: number; hostname: string | null }> {
    return this.request(`/api/v1/cluster/vms/${vmid}/expose`, {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async addDomain(vmid: number, data: { hostname: string; port: number; enable?: boolean }):
    Promise<{ url: string | null; hostname: string; port: number }> {
    return this.request(`/api/v1/cluster/vms/${vmid}/domain`, {
      method: 'POST', body: JSON.stringify(data),
    });
  }

  async getGpu(): Promise<{ gpus: GpuNode[] }> {
    return this.request<{ gpus: GpuNode[] }>('/api/v1/cluster/gpu');
  }

  async getMigrations(): Promise<{ migrations: MigrationEntry[] }> {
    return this.request<{ migrations: MigrationEntry[] }>('/api/v1/cluster/migrations');
  }
}

export const apiClient = new ApiClient();
