/**
 * Input validation helpers using Zod
 */

import { z } from 'zod';

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['client', 'sabi', 'admin']).default('client'),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Payment schemas
export const PaymentInitSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  amount: z.number().int('Amount must be a whole number').min(500).max(500000),
});

export const PaymentVerifySchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
});

// Job schemas
export const CreateJobSchema = z.object({
  sabiId: z.string().uuid('Invalid Sabi ID'),
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().optional().default(''),
  price: z.number().int().min(0).optional().default(0),
  scheduledDate: z.string().datetime().optional(),
});

export const UpdateJobSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0).optional(),
  scheduledDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'accepted', 'completed', 'cancelled']).optional(),
});

// Review schema
export const CreateReviewSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().default(''),
});

// File upload schema
export const FileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'File size must be less than 5MB',
  }),
  filetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
