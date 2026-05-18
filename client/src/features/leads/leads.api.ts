import { api } from '../../lib';
import type {
  Lead,
  LeadFormValues,
  LeadQueryParams,
  ApiResponse,
  PaginationMeta,
  LeadStats,
} from './leads.types';

export const leadsApi = {
  getLeads: async (params: LeadQueryParams): Promise<{ leads: Lead[]; meta: PaginationMeta }> => {
    const res = await api.get<ApiResponse<Lead[]> & { meta: PaginationMeta }>('/leads', { params });
    return { leads: res.data.data, meta: res.data.meta! };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return res.data.data;
  },

  createLead: async (data: LeadFormValues): Promise<Lead> => {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    return res.data.data;
  },

  updateLead: async (id: string, data: Partial<LeadFormValues>): Promise<Lead> => {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    return res.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  exportLeadsCsv: async (params: LeadQueryParams): Promise<void> => {
    const res = await api.get('/leads/export/csv', { params, responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  getStats: async (): Promise<LeadStats> => {
    const res = await api.get<ApiResponse<LeadStats>>('/leads/stats');
    return res.data.data;
  },
};