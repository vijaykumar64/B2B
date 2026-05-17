import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Invalid phone number format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  role: z.enum(['investor', 'brand_owner']).default('investor'),
  investment_range: z.string().max(50).optional(),
  isExistingBusiness: z.boolean().optional(),
  expansionGoal: z.string().max(200).trim().optional(),
  interestType: z.string().max(50).trim().optional(),
  interestedCategories: z.array(z.string().max(50)).max(10).optional(),
  state: z.string().max(50).trim().optional(),
  district: z.string().max(50).trim().optional(),
  brandName: z.string().max(100).trim().optional(),
  outletCount: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number is required').max(15).trim(),
});

export const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required').max(128),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
  role: z.enum(['investor', 'brand_owner']).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
