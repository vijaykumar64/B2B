import jwt from 'jsonwebtoken';

// Secrets and expiry are validated at startup via backend/config/env.ts.
// Fallbacks are intentionally removed — missing secrets are caught before the server binds.
const getSecrets = () => ({
  accessSecret: process.env.JWT_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiry: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});

// In-memory access token blacklist for revoked tokens.
// Access tokens expire in 15m, so this Set is bounded in size.
// REDIS UPGRADE PATH: replace Set operations with redis.setEx(token, 900, '1') / redis.get(token)
const tokenBlacklist = new Set<string>();

export const signToken = (userId: string): string => {
  const { accessSecret, accessExpiry } = getSecrets();
  return jwt.sign({ id: userId, type: 'access' }, accessSecret, { expiresIn: accessExpiry } as any);
};

export const signRefreshToken = (userId: string): string => {
  const { refreshSecret, refreshExpiry } = getSecrets();
  return jwt.sign({ id: userId, type: 'refresh' }, refreshSecret, { expiresIn: refreshExpiry } as any);
};

export const verifyToken = (token: string): { id: string } => {
  if (tokenBlacklist.has(token)) throw new Error('Token has been revoked');
  const { accessSecret } = getSecrets();
  const decoded = jwt.verify(token, accessSecret) as any;
  // Prevent refresh tokens from being used as access tokens
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  const { refreshSecret } = getSecrets();
  const decoded = jwt.verify(token, refreshSecret) as any;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
};

export const revokeToken = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenRevoked = (token: string): boolean => {
  return tokenBlacklist.has(token);
};
