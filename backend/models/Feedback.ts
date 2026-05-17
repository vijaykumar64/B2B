import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  type: 'complaint' | 'suggestion' | 'bug' | 'other';
  subject: string;
  message: string;
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  userRole: String,
  type: { type: String, enum: ['complaint', 'suggestion', 'bug', 'other'], required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewing', 'resolved'], default: 'open' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
