import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from '../controllers/goal.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';

const router = Router({ mergeParams: true });

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.use(requireWorkspaceMember());

// Goals
router.post(
  '/',
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('ownerId').optional().isString(),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  validate,
  asyncHandler(ctrl.createGoal),
);

router.get(
  '/',
  query('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  query('ownerId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  asyncHandler(ctrl.listGoals),
);

router.get('/:goalId', param('goalId').isString(), validate, asyncHandler(ctrl.getGoal));

router.patch(
  '/:goalId',
  param('goalId').isString(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('ownerId').optional().isString(),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('status').optional().isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  validate,
  asyncHandler(ctrl.updateGoal),
);

router.delete('/:goalId', param('goalId').isString(), validate, asyncHandler(ctrl.deleteGoal));

// Milestones
router.post(
  '/:goalId/milestones',
  param('goalId').isString(),
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  validate,
  asyncHandler(ctrl.createMilestone),
);

router.patch(
  '/:goalId/milestones/:milestoneId',
  param('goalId').isString(),
  param('milestoneId').isString(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  validate,
  asyncHandler(ctrl.updateMilestone),
);

router.delete(
  '/:goalId/milestones/:milestoneId',
  param('goalId').isString(),
  param('milestoneId').isString(),
  validate,
  asyncHandler(ctrl.deleteMilestone),
);

// Goal Updates
router.post(
  '/:goalId/updates',
  param('goalId').isString(),
  body('body').isString().trim().isLength({ min: 1, max: 2000 }),
  validate,
  asyncHandler(ctrl.createGoalUpdate),
);

router.get(
  '/:goalId/updates',
  param('goalId').isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  asyncHandler(ctrl.listGoalUpdates),
);

export default router;
