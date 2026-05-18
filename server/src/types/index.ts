export enum UserRole {
  Admin = 'Admin',
  SalesUser = 'Sales User',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Lost = 'Lost',
}

export enum LeadSource {
  Website = 'Website',
  Instagram = 'Instagram',
  Referral = 'Referral',
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  sortBy?: 'createdAt';
  order?: 'asc' | 'desc';
}