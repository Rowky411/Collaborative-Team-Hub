import { verifyAccessToken } from '../lib/tokens.js';
import { unauthorized } from '../lib/errors.js';

export function authenticate(req, _res, next) {
  const token = req.cookies?.access_token;
  if (!token) return next(unauthorized('Missing access token'));
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (_err) {
    next(unauthorized('Invalid or expired access token'));
  }
}
