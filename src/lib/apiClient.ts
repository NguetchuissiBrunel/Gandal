import { components } from './api';

const BASE_URL = 'https://gandal-api.onrender.com';

export type StudentRead = components['schemas']['StudentRead'];
export type TeacherRead = components['schemas']['TeacherRead'];
export type VMRead = components['schemas']['VMRead'];
export type RCreateVMRead = components['schemas']['RCreateVMRead'];
export type RDeleteVMRead = components['schemas']['RDeleteVMRead'];
export type RAccountRead = components['schemas']['RAccountRead'];
export type PublicationRead = components['schemas']['PublicationRead'];

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
    }
  }

  setToken(value: string) {
    this.token = value;
  }

  clearToken() {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
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

  // --- Users / Students ---
  async signupStudent(studentData: components['schemas']['StudentCreate']): Promise<StudentRead> {
    return this.request<StudentRead>('/api/v1/users/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async getStudents(): Promise<{ items: StudentRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_StudentRead_']>('/api/v1/users/students');
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

  // --- Users / Teachers ---
  async signupTeacher(teacherData: components['schemas']['TeacherCreate']): Promise<TeacherRead> {
    return this.request<TeacherRead>('/api/v1/users/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async getTeachers(): Promise<{ items: TeacherRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_TeacherRead_']>('/api/v1/users/teachers');
    return { items: response.items || [], total: response.total || 0 };
  }

  async updateTeacher(id: number, data: components['schemas']['TeacherUpdate']): Promise<TeacherRead> {
    return this.request<TeacherRead>(`/api/v1/users/teachers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- VMs ---
  async getVms(): Promise<{ items: VMRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_VMRead_']>('/api/v1/vms');
    return { items: response.items || [], total: response.total || 0 };
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
  async getRequests(): Promise<{ items: (RCreateVMRead | RDeleteVMRead | RAccountRead)[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_Union_RCreateVMRead__RDeleteVMRead__RAccountRead__']>('/api/v1/requetes');
    return { items: response.items || [], total: response.total || 0 };
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

  async approveRequest(requeteId: number, sshPublicKey: string = ''): Promise<any> {
    const body: components['schemas']['ApproveBody'] = { ssh_public_key: sshPublicKey };
    return this.request<any>(`/api/v1/requetes/${requeteId}/approve`, {
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
  async getPublications(): Promise<{ items: PublicationRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_PublicationRead_']>('/api/v1/publications');
    return { items: response.items || [], total: response.total || 0 };
  }

  async getPublicPublications(): Promise<{ items: PublicationRead[]; total: number }> {
    const response = await this.request<components['schemas']['PaginatedResponse_PublicationRead_']>('/api/v1/publications/public');
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
}

export const apiClient = new ApiClient();
