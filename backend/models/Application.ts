import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  opportunityId: string;
  opportunityName: string;
  type: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  status: string;
  dateApplied: string;
  lastUpdate: string;
  notes?: string;
  followUps?: { date: string; note: string; reminderDate?: string; completed?: boolean; createdBy?: string }[];
  documents?: { name: string; status: string }[];
  isAuthorized?: boolean;
  responses?: { questionId: string; question: string; answer: string }[];
  setupPhoto?: string;
  isManualEntry?: boolean;
  referralCode?: string;
  owner_uid?: string;
}

const ApplicationSchema = new Schema<IApplication>({
  opportunityId: { type: String, required: true },
  opportunityName: String,
  type: String,
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  userPhone: String,
  status: { type: String, enum: ['viewed', 'pending', 'reviewed', 'agreement', 'setup', 'completed', 'rejected'], default: 'viewed' },
  dateApplied: { type: String, default: () => new Date().toISOString() },
  lastUpdate: { type: String, default: () => new Date().toISOString() },
  notes: String,
  followUps: [{ date: String, note: String, reminderDate: String, completed: Boolean, createdBy: String }],
  documents: [{ name: String, status: String }],
  isAuthorized: Boolean,
  responses: [{ questionId: String, question: String, answer: String }],
  setupPhoto: String,
  isManualEntry: Boolean,
  referralCode: String,
  owner_uid: String
});

ApplicationSchema.index({ userId: 1, opportunityId: 1 });
ApplicationSchema.index({ owner_uid: 1, dateApplied: -1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
