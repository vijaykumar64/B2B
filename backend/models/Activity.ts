import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  type: string;
  opportunityId?: string;
  opportunityName?: string;
  owner_uid?: string;
  metadata?: any;
  interestScore?: number;
  referralCode?: string;
  duration?: number;
  timestamp: string;
}

const ActivitySchema = new Schema<IActivity>({
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  userPhone: String,
  type: String,
  opportunityId: String,
  opportunityName: String,
  owner_uid: String,
  metadata: Schema.Types.Mixed,
  interestScore: Number,
  referralCode: String,
  duration: Number,
  timestamp: { type: String, default: () => new Date().toISOString() }
});

ActivitySchema.index({ userId: 1, opportunityId: 1 });
ActivitySchema.index({ timestamp: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
