import { z } from 'zod';
import { LeadStatus, LeadSource } from '../../types/index.js';

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email format'),
  status: z.enum([LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Lost]).optional(),
  source: z.enum([LeadSource.Website, LeadSource.Instagram, LeadSource.Referral]).optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().trim().email('Invalid email format').optional(),
  status: z.enum([LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Lost]).optional(),
  source: z.enum([LeadSource.Website, LeadSource.Instagram, LeadSource.Referral]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required for update',
});

export const leadIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID'),
});

export const leadQuerySchema = z.object({
  status: z.enum([LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified, LeadStatus.Lost]).optional(),
  source: z.enum([LeadSource.Website, LeadSource.Instagram, LeadSource.Referral]).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(['latest', 'oldest']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive('Page must be a positive integer')).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;