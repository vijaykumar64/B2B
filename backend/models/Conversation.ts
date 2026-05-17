import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
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
  status: string;
}

const ConversationSchema = new Schema<IConversation>({
  investor_uid: { type: String, required: true },
  investorName: String,
  brand_uid: { type: String, required: true },
  brandName: String,
  opportunityId: { type: String, required: true },
  opportunityName: String,
  message_history: [String],
  lead_quality_score: String,
  lastMessage: String,
  lastMessageTimestamp: String,
  unreadCount: { type: Map, of: Number, default: {} },
  status: { type: String, enum: ['active', 'archived', 'new'], default: 'new' }
});

ConversationSchema.index({ investor_uid: 1, lastMessageTimestamp: -1 });
ConversationSchema.index({ brand_uid: 1, lastMessageTimestamp: -1 });
ConversationSchema.index({ investor_uid: 1, brand_uid: 1, opportunityId: 1 }, { unique: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
