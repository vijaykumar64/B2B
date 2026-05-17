import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  token?: string; // raw token, used by logout to revoke it
}

const getAdminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authorized, no token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // verifyToken throws if token is blacklisted or invalid
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Force admin role if email is in the admin list OR role is already admin in DB
    if (getAdminEmails().includes(user.email) || user.role === 'admin') {
      user.role = 'admin';
    }

    req.user = user;
    req.token = token; // pass raw token so logout controller can revoke it
    next();
  } catch (error: any) {
    if (error.message === 'Token has been revoked') {
      res.status(401).json({ error: 'Session expired. Please log in again.', code: 'UNAUTHORIZED' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired', code: 'UNAUTHORIZED' });
    } else {
      res.status(401).json({ error: 'Not authorized, invalid token', code: 'UNAUTHORIZED' });
    }
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (_) {
    // No-op: optional auth, proceed without user
  }
  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to perform this action' });
      return;
    }
    next();
  };
};
