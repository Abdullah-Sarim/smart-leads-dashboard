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
};

export const leadController = LeadController;