import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
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

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: String,
  text: { type: String, required: true },
  type: { type: String, enum: ['text', 'meeting_invite'], default: 'text' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  meetingDetails: {
    type: { type: String, enum: ['phone_call', 'site_visit'] },
    date: String,
    time: String,
    location: String,
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }
});

MessageSchema.index({ chatId: 1, timestamp: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
