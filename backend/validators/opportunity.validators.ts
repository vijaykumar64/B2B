import { z } from 'zod';

export const createOpportunitySchema = z.object({
  type: z.enum(['brand', 'dealership', 'distribution']),
  category: z.string().min(1, 'Category is required').max(100).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000).trim(),
  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  brand_name: z.string().max(100).trim().optional(),
  location: z.string().max(200).trim().optional(),
  investment_range: z.string().max(50).optional(),
  minInvestment: z.number().min(0).optional(),
  maxInvestment: z.number().min(0).optional(),
  roi: z.string().max(50).optional(),
  roiMonths: z.number().int().min(0).max(240).optional(),
  breakEvenMonths: z.number().int().min(0).max(240).optional(),
  franchiseFee: z.number().min(0).optional(),
  setupCost: z.number().min(0).optional(),
  monthlyRoyalty: z.number().min(0).max(100).optional(),
  employees_req: z.string().max(50).optional(),
  space_req: z.string().max(100).optional(),
  businessModel: z.string().max(100).optional(),
  trustScore: z.number().min(0).max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customQuestions: z.array(z.object({
    question: z.string().max(500),
    required: z.boolean().optional(),
  })).max(10).optional(),
  locationsLookingFor: z.array(z.string().max(100)).max(50).optional(),
}).refine(
  (data) => !data.minInvestment || !data.maxInvestment || data.minInvestment <= data.maxInvestment,
  { message: 'minInvestment must be less than or equal to maxInvestment', path: ['minInvestment'] }
);

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const opportunityPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['brand', 'dealership', 'distribution']).optional(),
});
