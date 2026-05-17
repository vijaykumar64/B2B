import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'brand' | 'dealership' | 'distribution';
  brand_name?: string;
  brand_logo_url?: string;
  logo?: string;
  usp?: string;
  category: string;
  description: string;
  is_verified: boolean;
  image: string;
  location: string;
  investment_range: string;
  minInvestment: number;
  maxInvestment: number;
  employees_req?: string;
  roi?: string;
  space_req?: string;
  roiMonths?: number;
  owner_uid?: string;
  unitsAvailable?: number;
  franchisorProfile?: string;
  gst_status?: string;
  gst_certificate_url?: string;
  response_time_score?: number;
  status?: string;
  locationsLookingFor?: string[];
  businessModel?: string;
  unitPhotos?: string[];
  customQuestions?: any[];
  successStories?: any[];
  verifications?: any;
  trustScore?: number;
  tierTarget?: string;
  marketHotness?: string;
  supportDetails?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  presenceCount?: string;
  targetLocations?: string;
  margins?: string;
  territoryVacant?: boolean;
  franchiseFee?: string;
  setupCost?: string;
  monthlyRoyalty?: string;
  trainingDays?: number;
  trainingFor?: string;
  marketingSupport?: string;
  sopManualGiven?: boolean;
  breakEvenMonths?: number;
  heroProducts?: { name: string; image: string }[];
  marginPerUnitRange?: string;
  performanceBonusDetails?: string;
  afterSalesServiceDetails?: string;
  showroomLayoutReq?: string;
  territoryDefinition?: string;
  existingRetailerCount?: number;
  stockArrivalFrequency?: string;
  creditPeriodDays?: number;
  deliveryVansRequired?: number;
  warehouseSqFt?: number;
}

const OpportunitySchema = new Schema<IOpportunity>({
  type: { type: String, enum: ['brand', 'dealership', 'distribution'], required: true },
  brand_name: String,
  brand_logo_url: String,
  logo: String,
  usp: String,
  category: { type: String, required: true },
  description: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  image: { type: String, required: true },
  location: String,
  investment_range: String,
  minInvestment: { type: Number, default: 0 },
  maxInvestment: { type: Number, default: 0 },
  employees_req: String,
  roi: String,
  space_req: String,
  roiMonths: Number,
  owner_uid: String,
  unitsAvailable: Number,
  franchisorProfile: String,
  gst_status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  gst_certificate_url: String,
  response_time_score: Number,
  status: { type: String, enum: ['draft', 'submitted', 'verified', 'published', 'pending'], default: 'pending' },
  locationsLookingFor: [String],
  businessModel: String,
  unitPhotos: [String],
  customQuestions: [Schema.Types.Mixed],
  successStories: [Schema.Types.Mixed],
  verifications: Schema.Types.Mixed,
  trustScore: Number,
  tierTarget: String,
  marketHotness: { type: String, enum: ['high', 'medium', 'low'] },
  supportDetails: String,
  tags: [String],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String,
  presenceCount: String,
  targetLocations: String,
  margins: String,
  territoryVacant: Boolean,
  franchiseFee: String,
  setupCost: String,
  monthlyRoyalty: String,
  trainingDays: Number,
  trainingFor: String,
  marketingSupport: String,
  sopManualGiven: Boolean,
  breakEvenMonths: Number,
  heroProducts: [{ name: String, image: String }],
  marginPerUnitRange: String,
  performanceBonusDetails: String,
  afterSalesServiceDetails: String,
  showroomLayoutReq: String,
  territoryDefinition: String,
  existingRetailerCount: Number,
  stockArrivalFrequency: String,
  creditPeriodDays: Number,
  deliveryVansRequired: Number,
  warehouseSqFt: Number
});

OpportunitySchema.index({ status: 1, is_verified: 1 });
OpportunitySchema.index({ category: 1, type: 1 });
OpportunitySchema.index({ owner_uid: 1 });

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
