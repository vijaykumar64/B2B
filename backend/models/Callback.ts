import mongoose, { Schema, Document } from 'mongoose';

export interface ICallback extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  userEmail: string;
  userPhone?: string;
  userName: string;
  opportunityId?: string;
  brandName?: string;
  brandOwnerUid?: string;
  status: 'pending' | 'completed' | 'cancelled';
  requestedAt: string;
  type: string;
  notes?: string;
  verified?: boolean;
  otp_verified_at?: string;
  budget?: string;
  preferredTime?: string;
  message?: string;
  city?: string;
  authorised_phone?: string;
}

const CallbackSchema = new Schema<ICallback>({
  userId: String,
  userEmail: String,
  userPhone: String,
  userName: String,
  opportunityId: String,
  brandName: String,
  brandOwnerUid: String,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  requestedAt: { type: String, default: () => new Date().toISOString() },
  type: String,
  notes: String,
  verified: Boolean,
  otp_verified_at: String,
  budget: String,
  preferredTime: String,
  message: String,
  city: String,
  authorised_phone: String
});

CallbackSchema.index({ brandOwnerUid: 1, requestedAt: -1 });

export default mongoose.model<ICallback>('Callback', CallbackSchema);
