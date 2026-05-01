import { validationResult } from 'express-validator';
import { badRequest } from '../lib/errors.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(badRequest('Validation failed', details));
}
