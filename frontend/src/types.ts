export type OpportunityType = 'brand' | 'dealership' | 'distribution';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  brand_name?: string | null;
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
  gst_status?: 'pending' | 'approved' | 'rejected';
  gst_certificate_url?: string;
  response_time_score?: number;
  status?: 'draft' | 'submitted' | 'verified' | 'published' | 'pending';
  locationsLookingFor?: string[];
  businessModel?: string;
  unitPhotos?: string[];
  customQuestions?: any[];
  successStories?: any[];
  verifications?: any;
  trustScore?: number;
  tierTarget?: string;
  marketHotness?: 'high' | 'medium' | 'low';
  supportDetails?: string;
  tags?: string[];
  createdAt?: string;
  presenceCount?: string;
  targetLocations?: string;
  margins?: string;
  territoryVacant?: boolean;
  
  // Franchise (Brand) - Operational View
  franchiseFee?: string;
  setupCost?: string;
  monthlyRoyalty?: string;
  trainingDays?: number;
  trainingFor?: string;
  marketingSupport?: string;
  sopManualGiven?: boolean;
  breakEvenMonths?: number;

  // Dealership - Sales View
  heroProducts?: { name: string; image: string }[];
  marginPerUnitRange?: string;
  performanceBonusDetails?: string;
  afterSalesServiceDetails?: string;
  showroomLayoutReq?: string;

  // Distributor - Network View
  territoryDefinition?: string;
  existingRetailerCount?: number;
  stockArrivalFrequency?: string;
  creditPeriodDays?: number;
  deliveryVansRequired?: number;
  warehouseSqFt?: number;
}

export interface SuccessStory {
  id: string;
  investorName: string;
  investorPhoto: string;
  story: string;
  state: string;
  district: string;
  date: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityName: string;
  type: OpportunityType;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  status: 'viewed' | 'pending' | 'reviewed' | 'agreement' | 'setup' | 'completed' | 'rejected';
  dateApplied: string;
  lastUpdate: string;
  notes?: string;
  followUps?: { 
    date: string; 
    note: string; 
    reminderDate?: string; 
    completed?: boolean;
    createdBy?: 'brand' | 'system';
  }[];
  documents?: { name: string; status: 'pending' | 'verified' | 'rejected' }[];
  isAuthorized?: boolean;
  responses?: { questionId: string; question: string; answer: string }[];
  setupPhoto?: string;
  isManualEntry?: boolean;
  referralCode?: string;
  owner_uid?: string;
}

export interface ConsultingService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'investor' | 'brand_owner' | 'admin';
  isLoggedIn: boolean;
  isDemo?: boolean;
  is_verified?: boolean;
  isSubscribed?: boolean;
  location?: any;
  state?: string;
  district?: string;
  investment_range?: string;
  isExistingBusiness?: boolean;
  interestType?: string;
  expansionGoal?: string;
  interestedCategories?: string[];
  lastActive?: string;
  responseCount?: number;
  totalResponseTime?: number; // In milliseconds
  photoURL?: string;
  bio?: string;
  admin_actions?: {
    action: string;
    timestamp: string;
    adminName: string;
    description: string;
    changes?: any;
  }[];
  verification_docs?: {
    type: string;
    url: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
    rejectionReason?: string;
  }[];
}

export interface ChatRoom {
  id: string;
  investor_uid: string;
  investorName: string;
  brand_uid: string;
  brandName: string;
  opportunityId: string;
  opportunityName: string;
  message_history?: string[];
  lead_quality_score?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: Record<string, number>;
  status: 'active' | 'archived' | 'new';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'meeting_invite';
  timestamp: string;
  meetingDetails?: {
    type: 'phone_call' | 'site_visit';
    date: string;
    time: string;
    location: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  type: 'view_details' | 'apply' | 'search' | 'shortlist' | 'unshortlist' | 'interested' | 'view_duration';
  opportunityId?: string;
  opportunityName?: string;
  timestamp: string;
  metadata?: any;
  interestScore?: number; // Calculated score based on behavior
  referralCode?: string;
  duration?: number; // Time spent in seconds
  owner_uid?: string;
}

export interface FieldAgentRequest {
  id: string;
  opportunityId: string;
  opportunityName: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'assigned' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface PlatformConfig {
  id: string;
  influencerLeadPrice: number;
  influencerConversionBonus: number;
  salesTeamCommission: number;
  fieldAgentVisitPrice: number;
  lastUpdated: string;
}

export interface Influencer {
  id: string;
  name: string;
  code: string;
  email: string;
  totalLeads: number;
  totalConversions: number;
  earnings: number;
  paymentStatus: 'pending' | 'paid';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'application' | 'system' | 'update';
  link?: string;
  read: boolean;
  timestamp?: string;
  actionRequired?: boolean;
}

export interface BrandSupportTicket {
  id: string;
  owner_uid: string;
  brandName: string;
  type: 'query' | 'suggestion' | 'complaint' | 'technical';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CallbackRequest {
  id: string;
  userId: string;
  userEmail: string;
  userPhone?: string;
  userName: string;
  opportunityId: string;
  brandName: string;
  brandOwnerUid: string;
  status: 'pending' | 'completed' | 'cancelled';
  requestedAt: any;
  type: string;
  notes?: string;
}
