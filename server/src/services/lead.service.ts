import mongoose, { FilterQuery } from 'mongoose';
import { Lead, ILeadDocument } from '../models/index.js';
import { LeadStatus, LeadSource } from '../types/index.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
}

export interface GetLeadsResult {
  leads: ILeadDocument[];
  meta: PaginationMeta;
}

export class LeadService {
  async createLead(data: { name: string; email: string; status?: LeadStatus; source?: LeadSource }, userId: string): Promise<ILeadDocument> {
    const lead = await Lead.create({
      name: data.name,
      email: data.email,
      status: data.status || LeadStatus.New,
      source: data.source || LeadSource.Website,
      createdBy: userId,
    });
    return lead;
  }

  async getLeadById(id: string): Promise<ILeadDocument | null> {
    return Lead.findById(id);
  }

  async updateLead(id: string, data: { name?: string; email?: string; status?: LeadStatus; source?: LeadSource }): Promise<ILeadDocument | null> {
    return Lead.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteLead(id: string): Promise<boolean> {
    const lead = await Lead.findByIdAndDelete(id);
    return !!lead;
  }

  async exportLeads(filters: LeadFilters, sort: 'latest' | 'oldest' = 'latest'): Promise<ILeadDocument[]> {
    const query: FilterQuery<ILeadDocument> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'latest' ? -1 : 1;
    return Lead.find(query).sort({ createdAt: sortOrder }).populate('createdBy', '_id name');
  }

  async getLeads(filters: LeadFilters, page = 1, limit = 10, sort: 'latest' | 'oldest' = 'latest'): Promise<GetLeadsResult> {
    const query: FilterQuery<ILeadDocument> = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'latest' ? -1 : 1;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: sortOrder }).skip(skip).limit(limit).populate('createdBy', '_id name'),
      Lead.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { leads, meta };
  }
}

export const leadService = new LeadService();