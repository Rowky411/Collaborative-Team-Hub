import { Router } from 'express';
import { query } from 'express-validator';
import * as ctrl from '../controllers/auditLog.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';

const router = Router({ mergeParams: true });
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.use(requireWorkspaceMember());

const commonFilters = [
  query('entityType').optional().isString(),
  query('actorId').optional().isString(),
  query('from').optional().isDate(),
  query('to').optional().isDate(),
];

router.get(
  '/',
  ...commonFilters,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  validate,
  asyncHandler(ctrl.listAuditLog),
);

router.get(
  '/export',
  ...commonFilters,
  validate,
  asyncHandler(ctrl.exportAuditLogCsv),
);

export default router;
