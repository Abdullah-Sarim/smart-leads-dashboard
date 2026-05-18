import { Response } from 'express';
import { body, query as queryValidator } from 'express-validator';
import { leadService } from '../services/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest, validate } from '../middleware/index.js';
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

export class LeadController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, status, source } = req.body;
      const lead = await leadService.createLead({ name, email, status, source }, req.user!.userId);
      sendSuccess(res, lead, 201, undefined, 'Lead created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create lead';
      sendError(res, 400, message);
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
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
      sendSuccess(res, result.leads, 200, result.meta);
    } catch (error) {
      sendError(res, 500, 'Failed to fetch leads');
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const lead = await leadService.getLeadById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );

      if (!lead) {
        sendError(res, 404, 'Lead not found');
        return;
      }

      sendSuccess(res, lead);
    } catch (error) {
      sendError(res, 500, 'Failed to fetch lead');
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, status, source } = req.body;
      const lead = await leadService.updateLead(
        req.params.id,
        { name, email, status, source },
        req.user!.userId,
        req.user!.role
      );

      if (!lead) {
        sendError(res, 404, 'Lead not found or access denied');
        return;
      }

      sendSuccess(res, lead, 200, undefined, 'Lead updated successfully');
    } catch (error) {
      sendError(res, 500, 'Failed to update lead');
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const deleted = await leadService.deleteLead(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );

      if (!deleted) {
        sendError(res, 404, 'Lead not found or access denied');
        return;
      }

      sendSuccess(res, null, 200, undefined, 'Lead deleted successfully');
    } catch (error) {
      sendError(res, 500, 'Failed to delete lead');
    }
  }

  async exportCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
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

      const csv = csvHeaders + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      sendError(res, 500, 'Failed to export leads');
    }
  }
}

export const leadController = new LeadController();