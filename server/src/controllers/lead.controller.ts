import { body, query as queryValidator } from 'express-validator';
import { leadService } from '../services/index.js';
import { AuthRequest, validate } from '../middleware/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { LeadStatus, LeadSource, QueryParams } from '../types/index.js';

export const leadValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Lead name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('status')
      .optional()
      .isIn(Object.values(LeadStatus)).withMessage('Invalid status'),
    body('source')
      .optional()
      .isIn(Object.values(LeadSource)).withMessage('Invalid source'),
    validate,
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('status')
      .optional()
      .isIn(Object.values(LeadStatus)).withMessage('Invalid status'),
    body('source')
      .optional()
      .isIn(Object.values(LeadSource)).withMessage('Invalid source'),
    validate,
  ],
  query: [
    queryValidator('page').optional().isInt({ min: 1 }).toInt(),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    queryValidator('search').optional().trim(),
    queryValidator('status').optional().isIn(Object.values(LeadStatus)),
    queryValidator('source').optional().isIn(Object.values(LeadSource)),
    queryValidator('sortBy').optional().isIn(['createdAt']),
    queryValidator('order').optional().isIn(['asc', 'desc']),
    validate,
  ],
};

export const LeadController = {
  create: catchAsync(async (req: AuthRequest, res) => {
    const { name, email, status, source } = req.body;
    const lead = await leadService.createLead({ name, email, status, source }, req.user!.userId);
    ApiResponse.sendSuccess(res, lead, 201, 'Lead created successfully');
  }),

  getAll: catchAsync(async (req: AuthRequest, res) => {
    const params: QueryParams = {
      page: req.query.page as unknown as number,
      limit: req.query.limit as unknown as number,
      search: req.query.search as string,
      status: req.query.status as LeadStatus,
      source: req.query.source as LeadSource,
      sortBy: req.query.sortBy as 'createdAt',
      order: req.query.order as 'asc' | 'desc',
    };

    const result = await leadService.getLeads(params, req.user!.userId, req.user!.role);
    ApiResponse.sendSuccess(res, result.leads, 200, undefined, result.meta);
  }),

  getById: catchAsync(async (req: AuthRequest, res) => {
    const lead = await leadService.getLeadById(req.params.id, req.user!.userId, req.user!.role);
    if (!lead) {
      throw ApiError.notFound('Lead not found');
    }
    ApiResponse.sendSuccess(res, lead);
  }),

  update: catchAsync(async (req: AuthRequest, res) => {
    const { name, email, status, source } = req.body;
    const lead = await leadService.updateLead(req.params.id, { name, email, status, source }, req.user!.userId, req.user!.role);
    if (!lead) {
      throw ApiError.notFound('Lead not found or access denied');
    }
    ApiResponse.sendSuccess(res, lead, 200, 'Lead updated successfully');
  }),

  delete: catchAsync(async (req: AuthRequest, res) => {
    const deleted = await leadService.deleteLead(req.params.id, req.user!.userId, req.user!.role);
    if (!deleted) {
      throw ApiError.notFound('Lead not found or access denied');
    }
    ApiResponse.sendSuccess(res, null, 200, 'Lead deleted successfully');
  }),

  exportCSV: catchAsync(async (req: AuthRequest, res) => {
    const params: QueryParams = {
      search: req.query.search as string,
      status: req.query.status as LeadStatus,
      source: req.query.source as LeadSource,
      sortBy: req.query.sortBy as 'createdAt',
      order: req.query.order as 'asc' | 'desc',
    };

    const leads = await leadService.exportLeads(params, req.user!.userId, req.user!.role);

    const csvHeaders = 'Name,Email,Status,Source,Created At\n';
    const csvRows = leads.map((lead) =>
      `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${lead.createdAt.toISOString()}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
    res.send(csvHeaders + csvRows);
  }),
};

export const leadController = LeadController;