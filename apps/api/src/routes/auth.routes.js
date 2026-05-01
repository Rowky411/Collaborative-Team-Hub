import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../lib/upload.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('name').isString().trim().isLength({ min: 1, max: 80 }),
  body('password').isString().isLength({ min: 8, max: 128 }),
  validate,
  asyncHandler(ctrl.register),
);

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 128 }),
  validate,
  asyncHandler(ctrl.login),
);

router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.get('/me', authenticate, asyncHandler(ctrl.me));
router.patch(
  '/profile',
  authenticate,
  body('name').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('avatarUrl').optional().isString().isURL(),
  validate,
  asyncHandler(ctrl.updateProfile),
);

router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  asyncHandler(ctrl.uploadAvatar),
);

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default router;
