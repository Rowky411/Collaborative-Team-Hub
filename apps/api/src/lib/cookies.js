import { env } from './env.js';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const baseOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
  path: '/',
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('access_token', accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE_MS });
  res.cookie('refresh_token', refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/api/auth',
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('access_token', { ...baseOptions });
  res.clearCookie('refresh_token', { ...baseOptions, path: '/api/auth' });
}
