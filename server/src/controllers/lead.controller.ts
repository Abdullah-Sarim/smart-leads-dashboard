import { leadService } from '../services/index.js';
import { AuthRequest } from '../middleware/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const LeadController = {
  create: catchAsync(async (req: AuthRequest, res) => {
    const { name, email, status, source } = req.body;
    const lead = await leadService.createLead({ name, email, status, source }, req.user!.userId);
    ApiResponse.sendSuccess(res, lead, 201, 'Lead created successfully');
  }),

  getAll: catchAsync(async (req: AuthRequest, res) => {
    const { status, source, search, sort, page } = req.query as { status?: string; source?: string; search?: string; sort?: 'latest' | 'oldest'; page?: string };

    const result = await leadService.getLeads(
      { status: status as undefined, source: source as undefined, search },
      page ? Number(page) : 1,
      10,
      sort || 'latest'
    );

    ApiResponse.sendSuccess(res, result.leads, 200, undefined, result.meta);
  }),
};

export const leadController = LeadController;