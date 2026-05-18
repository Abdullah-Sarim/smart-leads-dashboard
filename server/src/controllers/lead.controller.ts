import { leadService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { LeadStatus, LeadSource } from '../types/index.js';

export const LeadController = {
  create: catchAsync(async (req: AuthRequest, res) => {
    const { name, email, status, source } = req.body;
    const lead = await leadService.createLead({ name, email, status, source }, req.user!.userId);
    ApiResponse.sendSuccess(res, lead, 201, 'Lead created successfully');
  }),

  getAll: catchAsync(async (req: AuthRequest, res) => {
    const { status, source, search, sort, page } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
      sort?: 'latest' | 'oldest';
      page?: number;
    };

    const result = await leadService.getLeads(
      { status, source, search },
      page || 1,
      10,
      sort || 'latest'
    );

    ApiResponse.sendSuccess(res, result.leads, 200, undefined, result.meta);
  }),

  getById: catchAsync(async (req: AuthRequest, res) => {
    const lead = await leadService.getLeadById(req.params.id);
    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }
    ApiResponse.sendSuccess(res, lead);
  }),

  update: catchAsync(async (req: AuthRequest, res) => {
    const lead = await leadService.updateLead(req.params.id, req.body);
    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }
    ApiResponse.sendSuccess(res, lead, 200, 'Lead updated successfully');
  }),

  delete: catchAsync(async (req: AuthRequest, res) => {
    const deleted = await leadService.deleteLead(req.params.id);
    if (!deleted) {
      throw ApiError.notFound('Lead not found');
    }
    ApiResponse.sendSuccess(res, null, 200, 'Lead deleted successfully');
  }),

  exportCSV: catchAsync(async (req: AuthRequest, res) => {
    const { status, source, search, sort } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
      sort?: 'latest' | 'oldest';
    };

    const leads = await leadService.exportLeads({ status, source, search }, sort || 'latest');

    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const headers = 'Name,Email,Status,Source,Created At';
    const rows = leads.map((lead) =>
      [escapeCSV(lead.name), escapeCSV(lead.email), escapeCSV(lead.status), escapeCSV(lead.source), escapeCSV(new Date(lead.createdAt).toISOString())].join(',')
    );

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  }),

  getStats: catchAsync(async (_req: AuthRequest, res) => {
    const stats = await leadService.getStats();
    ApiResponse.sendSuccess(res, stats);
  }),
};

export const leadController = LeadController;