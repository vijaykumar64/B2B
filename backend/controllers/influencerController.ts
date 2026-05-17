import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Influencer from '../models/Influencer';

// GET /api/influencers (admin only)
export const getInfluencers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const influencers = await Influencer.find();
    res.json({ influencers: influencers.map(i => ({ id: i._id.toString(), ...i.toObject() })) });
  } catch (error) {
    next(error);
  }
};
