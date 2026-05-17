import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'investor' | 'brand_owner' | 'admin';
  isLoggedIn: boolean;
  isDemo?: boolean;
  is_verified?: boolean;
  isSubscribed?: boolean;
  state?: string;
  district?: string;
  location?: string;
  investment_range?: string;
  isExistingBusiness?: boolean;
  interestType?: string;
  expansionGoal?: string;
  interestedCategories?: string[];
  lastActive?: string;
  responseCount?: number;
  totalResponseTime?: number;
  photoURL?: string;
  bio?: string;
  brandName?: string;
  outletCount?: string;
  opportunityType?: string;
  // Account lockout fields
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  // Google OAuth
  googleId?: string;
  authProvider?: 'local' | 'google';
  admin_actions?: { action: string; timestamp: string; adminName: string; description: string; changes?: any }[];
  verification_docs?: { type: string; url: string; status: 'pending' | 'verified' | 'rejected'; uploadedAt: string; rejectionReason?: string }[];
  createdAt: string;
  updatedAt?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementFailedAttempts(): Promise<void>;
  resetFailedAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['investor', 'brand_owner', 'admin'], default: 'investor' },
  isLoggedIn: { type: Boolean, default: false },
  isDemo: Boolean,
  is_verified: { type: Boolean, default: false },
  isSubscribed: Boolean,
  state: String,
  district: String,
  location: String,
  investment_range: String,
  isExistingBusiness: Boolean,
  interestType: String,
  expansionGoal: String,
  interestedCategories: [String],
  lastActive: String,
  responseCount: { type: Number, default: 0 },
  totalResponseTime: { type: Number, default: 0 },
  photoURL: String,
  bio: String,
  brandName: String,
  outletCount: String,
  opportunityType: String,
  // Account lockout
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  // Google OAuth
  googleId: String,
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  admin_actions: [{ action: String, timestamp: String, adminName: String, description: String, changes: Schema.Types.Mixed }],
  verification_docs: [{
    type: { type: String },
    url: String,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: String,
    rejectionReason: String
  }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Returns true if account is currently locked
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Increment failed login attempts; lock account after MAX_FAILED_ATTEMPTS
UserSchema.methods.incrementFailedAttempts = async function (): Promise<void> {
  // If lock has expired, reset first
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
    if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
  }
  await this.save();
};

// Reset failed attempts on successful login
UserSchema.methods.resetFailedAttempts = async function (): Promise<void> {
  if (this.failedLoginAttempts !== 0 || this.lockUntil !== null) {
    this.failedLoginAttempts = 0;
    this.lockUntil = null;
    await this.save();
  }
};

export default mongoose.model<IUser>('User', UserSchema);
