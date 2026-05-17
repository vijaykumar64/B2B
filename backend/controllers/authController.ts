import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { revokeToken, verifyRefreshToken } from '../config/jwt';
import { issueTokens, formatUser, getAdminEmails } from '../services/authService';
import { AppError } from '../utils/AppError';

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// ─── POST /api/auth/register ────────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body is already validated and coerced by Zod middleware
    const { phone, name, role, investment_range, isExistingBusiness, expansionGoal, interestType,
      interestedCategories, state, district, brandName, outletCount } = req.body;

    const normalizedPhone = phone.replace(/\s+/g, '');
    const email = `${normalizedPhone}@visionaryowners.com`;
    const password = `Visionary@${normalizedPhone}`;

    let user = await User.findOne({ email });
    if (user) {
      // Already registered — log them in
      await user.resetFailedAttempts();
      const tokens = await issueTokens(user._id.toString());
      res.json({ ...tokens, user: formatUser(user) });
      return;
    }

    user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      password,
      role: role || 'investor',
      authProvider: 'local',
      investment_range: role === 'investor' ? investment_range : undefined,
      isExistingBusiness: role === 'investor' ? isExistingBusiness : undefined,
      interestType: role === 'investor' ? interestType : undefined,
      interestedCategories: role === 'investor' ? (interestedCategories || []) : [],
      state: role === 'investor' ? state : undefined,
      district: role === 'investor' ? district : undefined,
      location: role === 'investor' && state && district ? `${district}, ${state}` : undefined,
      brandName: role === 'brand_owner' ? brandName : undefined,
      outletCount: role === 'brand_owner' ? outletCount : undefined,
      opportunityType: role === 'brand_owner' ? 'brand' : undefined,
    });

    const tokens = await issueTokens(user._id.toString());
    res.status(201).json({ ...tokens, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login (phone-based) ─────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;
    const normalizedPhone = phone.replace(/\s+/g, '');
    const email = `${normalizedPhone}@visionaryowners.com`;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'Account not found. Please register first.', code: 'NOT_FOUND' });
      return;
    }

    await user.resetFailedAttempts();
    const tokens = await issueTokens(user._id.toString());
    res.json({ ...tokens, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/email-login (admin / email+password) ────────────────────
export const emailLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ error: 'No account found with this email', code: 'NOT_FOUND' });
      return;
    }

    if (user.isLocked()) {
      const minutesLeft = Math.ceil(((user.lockUntil as Date).getTime() - Date.now()) / 60000);
      throw new AppError(
        `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
        423,
        'ACCOUNT_LOCKED' as any
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementFailedAttempts();
      const attemptsLeft = 5 - (user.failedLoginAttempts || 0);
      res.status(401).json({
        error: attemptsLeft > 0
          ? `Incorrect password. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Account locked for 15 minutes due to too many failed attempts.',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    await user.resetFailedAttempts();
    const tokens = await issueTokens(user._id.toString());
    res.json({ ...tokens, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/google ───────────────────────────────────────────────────
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { credential, role } = req.body;

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: 'Google OAuth is not configured on this server', code: 'INTERNAL_ERROR' });
      return;
    }

    let payload: any;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      res.status(401).json({ error: 'Invalid Google token. Please try again.', code: 'UNAUTHORIZED' });
      return;
    }

    if (!payload?.email) {
      res.status(400).json({ error: 'Could not retrieve email from Google account', code: 'VALIDATION_ERROR' });
      return;
    }

    const { email, name, picture: photoURL, sub: googleId } = payload;
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (photoURL && !user.photoURL) user.photoURL = photoURL;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || 'User',
        email,
        googleId,
        photoURL,
        role: role || 'investor',
        authProvider: 'google',
        is_verified: true,
      });
    }

    await user.resetFailedAttempts();
    const tokens = await issueTokens(user._id.toString());
    res.json({ ...tokens, user: formatUser(user) });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body; // pre-validated by Zod middleware

    let decoded: { id: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' });
      return;
    }

    // Verify the token exists in DB (handles manual revocation, server restart scenarios)
    const stored = await RefreshToken.findOne({ token: refreshToken, userId: decoded.id });
    if (!stored) {
      res.status(401).json({ error: 'Refresh token has been revoked', code: 'UNAUTHORIZED' });
      return;
    }

    // Rotate: issueTokens deletes old token and creates a new pair
    const tokens = await issueTokens(decoded.id);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      revokeToken(token); // blacklist the access token
    }

    // Also delete the refresh token if provided
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' });
      return;
    }
    res.json({ user: formatUser(req.user) });
  } catch (error) {
    next(error);
  }
};
