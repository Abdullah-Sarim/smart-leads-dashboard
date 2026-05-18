import { Lead, ILeadDocument } from '../models/index.js';
import { LeadStatus, LeadSource, QueryParams, PaginationMeta } from '../types/index.js';

export class LeadService {
  async createLead(
    data: { name: string; email: string; status?: LeadStatus; source?: LeadSource },
    userId: string
  ): Promise<ILeadDocument> {
    return Lead.create({
      ...data,
      createdBy: userId,
    });
  }

  async getLeads(
    params: QueryParams,
    userId: string,
    userRole: string
  ): Promise<{ leads: ILeadDocument[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      sortBy = 'createdAt',
      order = 'desc',
    } = params;

    const query: Record<string, unknown> = {};

    if (userRole !== 'Admin') {
      query.createdBy = userId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Lead.countDocuments(query),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return { leads, meta };
  }

  async getLeadById(id: string, userId: string, userRole: string): Promise<ILeadDocument | null> {
    const lead = await Lead.findById(id);
    if (!lead) return null;

    if (userRole !== 'Admin' && lead.createdBy.toString() !== userId) {
      return null;
    }

    return lead;
  }

  async updateLead(
    id: string,
    data: Partial<{ name: string; email: string; status: LeadStatus; source: LeadSource }>,
    userId: string,
    userRole: string
  ): Promise<ILeadDocument | null> {
    const lead = await this.getLeadById(id, userId, userRole);
    if (!lead) return null;

    Object.assign(lead, data);
    await lead.save();
    return lead;
  }

  async deleteLead(id: string, userId: string, userRole: string): Promise<boolean> {
    const lead = await this.getLeadById(id, userId, userRole);
    if (!lead) return false;

    await Lead.findByIdAndDelete(id);
    return true;
  }

  async exportLeads(
    params: QueryParams,
    userId: string,
    userRole: string
  ): Promise<ILeadDocument[]> {
    const { search, status, source, sortBy = 'createdAt', order = 'desc' } = params;

    const query: Record<string, unknown> = {};

    if (userRole !== 'Admin') {
      query.createdBy = userId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    return Lead.find(query).sort({ [sortBy]: order === 'asc' ? 1 : -1 });
  }
}

export const leadService = new LeadService();