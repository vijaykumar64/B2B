import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'application' | 'system' | 'update';
  link?: string;
  read: boolean;
  timestamp: string;
  actionRequired?: boolean;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['reminder', 'application', 'system', 'update'], default: 'system' },
  link: String,
  read: { type: Boolean, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() },
  actionRequired: Boolean
});

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ timestamp: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
