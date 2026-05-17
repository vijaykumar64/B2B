import { signToken, signRefreshToken } from '../config/jwt';
import RefreshToken from '../models/RefreshToken';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const getAdminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'singeakash2020@gmail.com')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

export const formatUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: getAdminEmails().includes(user.email) || user.role === 'admin' ? 'admin' : user.role,
  isLoggedIn: true,
  is_verified: user.is_verified,
  isSubscribed: user.isSubscribed,
  state: user.state,
  district: user.district,
  location: user.location,
  investment_range: user.investment_range,
  isExistingBusiness: user.isExistingBusiness,
  interestType: user.interestType,
  expansionGoal: user.expansionGoal,
  interestedCategories: user.interestedCategories,
  lastActive: user.lastActive,
  responseCount: user.responseCount,
  totalResponseTime: user.totalResponseTime,
  photoURL: user.photoURL,
  bio: user.bio,
  brandName: user.brandName,
  outletCount: user.outletCount,
  opportunityType: user.opportunityType,
  authProvider: user.authProvider,
  verification_docs: user.verification_docs,
  admin_actions: user.admin_actions,
  createdAt: user.createdAt,
});

/**
 * Issues a new access + refresh token pair.
 * Deletes any existing refresh tokens for the user (single-session policy).
 * Saves the new refresh token to MongoDB for durable rotation.
 */
export const issueTokens = async (userId: string): Promise<{ token: string; refreshToken: string }> => {
  const token = signToken(userId);
  const refreshToken = signRefreshToken(userId);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  // Single-session: remove old refresh tokens before creating the new one
  await RefreshToken.deleteMany({ userId });
  await RefreshToken.create({ token: refreshToken, userId, expiresAt });

  return { token, refreshToken };
};
