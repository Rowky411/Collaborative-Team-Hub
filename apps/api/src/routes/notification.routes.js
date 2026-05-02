import { Router } from 'express';
import { param } from 'express-validator';
import * as ctrl from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);

router.get('/', asyncHandler(ctrl.listNotifications));
router.patch('/read-all', asyncHandler(ctrl.markAllRead));
router.patch(
  '/:notificationId/read',
  param('notificationId').isString(),
  validate,
  asyncHandler(ctrl.markRead),
);

export default router;
