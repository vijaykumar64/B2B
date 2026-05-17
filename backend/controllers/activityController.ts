import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Activity from '../models/Activity';

// POST /api/activities
export const trackActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    await Activity.create({
      ...req.body,
      userId: user._id.toString(),
      userName: req.body.userName || user.name,
      userEmail: req.body.userEmail || user.email,
      userPhone: req.body.userPhone || user.phone,
      timestamp: new Date().toISOString(),
    });
    res.status(201).json({ message: 'Activity tracked' });
  } catch (error) {
    next(error);
  }
};

// GET /api/activities (admin only)
export const getActivities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(),
    ]);

    res.json({
      activities: activities.map((a: any) => ({ id: a._id.toString(), ...a, _id: undefined })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
