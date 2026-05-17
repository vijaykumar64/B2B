import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Application from '../models/Application';
import Notification from '../models/Notification';

const toClient = (doc: any) => ({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });

const emitApplicationsUpdate = async (io: any, userId: string, role: string) => {
  if (!io) return;
  let apps;
  if (role === 'admin') {
    apps = await Application.find().sort({ dateApplied: -1 });
  } else if (role === 'brand_owner') {
    apps = await Application.find({ owner_uid: userId }).sort({ dateApplied: -1 });
  } else {
    apps = await Application.find({ userId }).sort({ dateApplied: -1 });
  }
  io.to(`user:${userId}`).emit('applications:sync', apps.map(toClient));
};

// GET /api/applications
export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};

    if (user.role === 'admin') {
      // all
    } else if (user.role === 'brand_owner') {
      query.owner_uid = user._id.toString();
    } else {
      query.userId = user._id.toString();
    }

    const apps = await Application.find(query).sort({ dateApplied: -1 });
    res.json({ applications: apps.map(toClient) });
  } catch (error) {
    next(error);
  }
};

// POST /api/applications
export const createApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const app = await Application.create({
      ...req.body,
      userId: user._id.toString(),
      userName: req.body.userName || user.name,
      userEmail: req.body.userEmail || user.email,
      userPhone: req.body.userPhone || user.phone,
      dateApplied: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    });

    // Notify brand owner
    const io = (req as any).io;
    if (req.body.owner_uid) {
      const notif = await Notification.create({
        userId: req.body.owner_uid,
        title: req.body.notifyTitle || 'New Application',
        message: req.body.notifyMessage || `${user.name} applied.`,
        type: 'application',
        read: false,
        actionRequired: true,
        link: 'leads'
      });
      if (io) io.to(`user:${req.body.owner_uid}`).emit('notifications:new', { id: notif._id.toString(), ...notif.toObject() });
    }

    // Emit updated list to relevant users
    if (io) {
      await emitApplicationsUpdate(io, user._id.toString(), user.role);
      if (req.body.owner_uid) await emitApplicationsUpdate(io, req.body.owner_uid, 'brand_owner');
    }

    res.status(201).json({ application: toClient(app) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id
export const updateApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    req.body.lastUpdate = new Date().toISOString();
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Emit to owner and user
    const io = (req as any).io;
    if (io) {
      await emitApplicationsUpdate(io, app.userId, 'investor');
      if (app.owner_uid) await emitApplicationsUpdate(io, app.owner_uid, 'brand_owner');
    }

    res.json({ application: toClient(app) });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/check?userId=&opportunityId=
export const checkApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, opportunityId } = req.query;
    const existing = await Application.findOne({ userId: userId as string, opportunityId: opportunityId as string });
    res.json({ exists: !!existing, application: existing ? toClient(existing) : null });
  } catch (error) {
    next(error);
  }
};
