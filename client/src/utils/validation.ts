import { useMemo } from 'react';
import type { LeadStatus, LeadSource } from '../types';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationSchema {
  [key: string]: ValidationRules[];
}

export const useValidation = (
  values: Record<string, string>,
  schema: ValidationSchema
) => {
  const errors = useMemo(() => {
    const result: Record<string, string> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = values[field] || '';

      for (const rule of rules) {
        if (rule.required && !value.trim()) {
          result[field] = rule.message;
          break;
        }
        if (rule.minLength && value.length < rule.minLength) {
          result[field] = rule.message;
          break;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          result[field] = rule.message;
          break;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          result[field] = rule.message;
          break;
        }
      }
    }

    return result;
  }, [values, schema]);

  const isValid = Object.keys(errors).length === 0;

  return { errors, isValid };
};

export const leadFormSchema: ValidationSchema = {
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, maxLength: 100, message: 'Name must be 2-100 characters' },
  ],
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
  ],
};

export const loginSchema: ValidationSchema = {
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters' },
  ],
};

export const registerSchema: ValidationSchema = {
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, maxLength: 50, message: 'Name must be 2-50 characters' },
  ],
  email: [
    { required: true, message: 'Email is required' },
    { pattern: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters' },
  ],
};

export const statusColors: Record<LeadStatus, string> = {
  [LeadStatus.New]: 'bg-blue-100 text-blue-700',
  [LeadStatus.Contacted]: 'bg-yellow-100 text-yellow-700',
  [LeadStatus.Qualified]: 'bg-green-100 text-green-700',
  [LeadStatus.Lost]: 'bg-red-100 text-red-700',
};

export const sourceColors: Record<LeadSource, string> = {
  [LeadSource.Website]: 'bg-gray-100 text-gray-700',
  [LeadSource.Instagram]: 'bg-pink-100 text-pink-700',
  [LeadSource.Referral]: 'bg-purple-100 text-purple-700',
};