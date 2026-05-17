import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Callback from '../models/Callback';

const toClient = (doc: any) => ({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });

// POST /api/callbacks
export const createCallback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const cb = await Callback.create({
      ...req.body,
      userId: user?._id.toString() || req.body.userId,
      userEmail: user?.email || req.body.userEmail,
      status: 'pending'
    });
    res.status(201).json({ callback: toClient(cb) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/callbacks/:id
export const updateCallback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cb = await Callback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cb) {
      res.status(404).json({ error: 'Callback not found' });
      return;
    }
    res.json({ callback: toClient(cb) });
  } catch (error) {
    next(error);
  }
};

// GET /api/callbacks
export const getCallbacks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};
    if (user.role === 'brand_owner') query.brandOwnerUid = user._id.toString();
    // admin sees all
    const callbacks = await Callback.find(query).sort({ requestedAt: -1 });
    res.json({ callbacks: callbacks.map(toClient) });
  } catch (error) {
    next(error);
  }
};
