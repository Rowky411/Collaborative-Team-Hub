import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from './env.js';
import { prisma } from './prisma.js';

const REFRESH_TTL_DAYS = 7;

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
  return { token, expiresAt };
}

export async function rotateRefreshToken(oldToken) {
  const existing = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!existing) return null;
  if (existing.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: existing.id } }).catch(() => {});
    return null;
  }
  await prisma.refreshToken.delete({ where: { id: existing.id } });
  const fresh = await issueRefreshToken(existing.userId);
  return { userId: existing.userId, ...fresh };
}

export async function revokeRefreshToken(token) {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function revokeAllForUser(userId) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
