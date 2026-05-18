import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../features/leads/leads.api';
import { LeadQueryParams, Lead, LeadFormValues } from '../../features/leads/leads.types';

export const leadKeys = {
  all: ['leads'] as const,
  list: (filters: LeadQueryParams) => [...leadKeys.all, 'list', filters] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
  stats: () => [...leadKeys.all, 'stats'] as const,
  assigned: (page: number) => [...leadKeys.all, 'assigned', page] as const,
};

export function useLeads(filters: LeadQueryParams) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadsApi.getLeads(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getLeadById(id),
    enabled: Boolean(id),
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: () => leadsApi.getStats(),
    staleTime: 60_000,
  });
}

export function useAssignedLeads(page: number) {
  return useQuery({
    queryKey: leadKeys.assigned(page),
    queryFn: () => leadsApi.getAssignedLeads(page),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadFormValues) => leadsApi.createLead(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormValues> }) => leadsApi.updateLead(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string | null }) => leadsApi.assignLead(id, assignedTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}