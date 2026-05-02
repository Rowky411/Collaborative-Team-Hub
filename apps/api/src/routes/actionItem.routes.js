import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from '../controllers/actionItem.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';

const router = Router({ mergeParams: true });

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.use(requireWorkspaceMember());

// Batch reorder — must come BEFORE /:itemId routes to avoid collision
router.patch(
  '/reorder',
  body('items').isArray({ min: 1 }),
  body('items.*.id').isString(),
  body('items.*.status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  body('items.*.position').optional().isInt({ min: 0 }),
  validate,
  asyncHandler(ctrl.reorderActionItems),
);

// Create
router.post(
  '/',
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('assigneeId').optional({ nullable: true }).isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('goalId').optional({ nullable: true }).isString(),
  validate,
  asyncHandler(ctrl.createActionItem),
);

// List
router.get(
  '/',
  query('assigneeId').optional().isString(),
  query('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  query('goalId').optional().isString(),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  asyncHandler(ctrl.listActionItems),
);

// Update
router.patch(
  '/:itemId',
  param('itemId').isString(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('assigneeId').optional({ nullable: true }).isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('goalId').optional({ nullable: true }).isString(),
  body('position').optional().isInt({ min: 0 }),
  validate,
  asyncHandler(ctrl.updateActionItem),
);

// Delete
router.delete(
  '/:itemId',
  param('itemId').isString(),
  validate,
  asyncHandler(ctrl.deleteActionItem),
);

export default router;
