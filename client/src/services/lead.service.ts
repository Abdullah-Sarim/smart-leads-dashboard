import api from './api';
import type { ApiResponse, Lead, LeadStatus, LeadSource, PaginationMeta, QueryParams } from '../types';

export interface LeadsResponse {
  leads: Lead[];
  meta: PaginationMeta;
}

export const leadService = {
  async getLeads(params: QueryParams): Promise<LeadsResponse> {
    const res = await api.get<ApiResponse<Lead[]> & { meta: PaginationMeta }>('/leads', { params });
    return { leads: res.data.data, meta: res.data.meta! };
  },
  async createLead(data: { name: string; email: string; status?: LeadStatus; source?: LeadSource }): Promise<Lead> {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data;
  },
  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data;
  },
  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  },
  async exportCSV(params: QueryParams): Promise<Blob> {
    const res = await api.get('/leads/export', { params, responseType: 'blob' });
    return res.data;
  },
};