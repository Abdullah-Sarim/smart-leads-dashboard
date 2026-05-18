import mongoose, { Schema, Document } from 'mongoose';
import { ILead, LeadStatus, LeadSource } from '../types/index.js';

export interface ILeadDocument extends Omit<ILead, '_id'>, Document {}

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(LeadStatus),
        message: 'Invalid status value',
      },
      default: LeadStatus.New,
    },
    source: {
      type: String,
      enum: {
        values: Object.values(LeadSource),
        message: 'Invalid source value',
      },
      default: LeadSource.Website,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ name: 'text', email: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ createdBy: 1 });

export const Lead = mongoose.model<ILeadDocument>('Lead', leadSchema);