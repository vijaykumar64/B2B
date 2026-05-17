import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

// GET /api/users/:id
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }
    res.json({ user: { id: user._id.toString(), ...user.toObject() } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestingUser = req.user;
    if (!requestingUser) {
      res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' });
      return;
    }

    if (requestingUser._id.toString() !== req.params.id && requestingUser.role !== 'admin') {
      res.status(403).json({ error: 'Cannot update another user', code: 'FORBIDDEN' });
      return;
    }

    const disallowedFields = ['password', 'email', 'role', '_id'];
    disallowedFields.forEach((f) => delete req.body[f]);

    req.body.updatedAt = new Date().toISOString();

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }

    const io = (req as any).io;
    if (io) io.to(`user:${req.params.id}`).emit('user:updated', { id: user._id.toString(), ...user.toObject() });

    res.json({ user: { id: user._id.toString(), ...user.toObject() } });
  } catch (error) {
    next(error);
  }
};

// GET /api/users  (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    res.json({
      users: users.map((u: any) => ({ id: u._id.toString(), ...u, _id: undefined })),
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
