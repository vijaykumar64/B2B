import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Feedback from '../models/Feedback';

// POST /api/feedback
export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!req.body.subject || !req.body.message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    const fb = await Feedback.create({
      ...req.body,
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userRole: user.role
    });
    res.status(201).json({ feedback: { id: fb._id.toString(), ...fb.toObject() } });
  } catch (error) {
    next(error);
  }
};

// GET /api/feedback (admin)
export const getAllFeedback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedback: feedback.map(f => ({ id: f._id.toString(), ...f.toObject() })) });
  } catch (error) {
    next(error);
  }
};
