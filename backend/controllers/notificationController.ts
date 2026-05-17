import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

const toClient = (doc: any) => ({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const notifs = await Notification.find({ userId: user._id.toString() })
      .sort({ timestamp: -1 })
      .limit(30);
    res.json({ notifications: notifs.map(toClient) });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications
export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notif = await Notification.create({ ...req.body, read: false });
    const io = (req as any).io;
    if (io) io.to(`user:${req.body.userId}`).emit('notifications:new', toClient(notif));
    res.status(201).json({ notification: toClient(notif) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id
export const markRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notif) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ notification: toClient(notif) });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/mark-all-read
export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    await Notification.updateMany({ userId: user._id.toString(), read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
