import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { badRequest, conflict, unauthorized, notFound } from '../lib/errors.js';
import { storeAvatar } from '../lib/upload.js';
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../lib/tokens.js';
import { setAuthCookies, clearAuthCookies } from '../lib/cookies.js';

const safeUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
});

export async function register(req, res) {
  const { email, name, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const access = signAccessToken(user);
  const { token: refresh } = await issueRefreshToken(user.id);
  setAuthCookies(res, { accessToken: access, refreshToken: refresh });

  res.status(201).json({ data: { user: safeUser(user), accessToken: access } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid credentials');

  const access = signAccessToken(user);
  const { token: refresh } = await issueRefreshToken(user.id);
  setAuthCookies(res, { accessToken: access, refreshToken: refresh });

  res.json({ data: { user: safeUser(user), accessToken: access } });
}

export async function refresh(req, res) {
  const oldToken = req.cookies?.refresh_token;
  if (!oldToken) throw unauthorized('Missing refresh token');

  const rotated = await rotateRefreshToken(oldToken);
  if (!rotated) {
    clearAuthCookies(res);
    throw unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
  if (!user) {
    clearAuthCookies(res);
    throw unauthorized('User no longer exists');
  }

  const access = signAccessToken(user);
  setAuthCookies(res, { accessToken: access, refreshToken: rotated.token });

  res.json({ data: { user: safeUser(user), accessToken: access } });
}

export async function logout(req, res) {
  const token = req.cookies?.refresh_token;
  await revokeRefreshToken(token);
  clearAuthCookies(res);
  res.json({ data: { ok: true } });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw notFound('User not found');
  res.json({ data: { user: safeUser(user) } });
}

export async function updateProfile(req, res) {
  const { name, avatarUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });
  res.json({ data: { user: safeUser(updated) } });
}

export async function uploadAvatar(req, res) {
  if (!req.file) throw badRequest('No file uploaded');
  const url = await storeAvatar(req.file, req.user.id);
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl: url },
  });
  res.json({ data: { user: safeUser(updated) } });
}
