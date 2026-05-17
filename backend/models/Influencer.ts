import mongoose, { Schema, Document } from 'mongoose';

export interface IInfluencer extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  email: string;
  totalLeads: number;
  totalConversions: number;
  earnings: number;
  paymentStatus: 'pending' | 'paid';
}

const InfluencerSchema = new Schema<IInfluencer>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  totalLeads: { type: Number, default: 0 },
  totalConversions: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});

export default mongoose.model<IInfluencer>('Influencer', InfluencerSchema);
