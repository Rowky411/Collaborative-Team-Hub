import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';

const router = Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const hexColor = body('accentColor')
  .optional()
  .matches(/^#[0-9a-fA-F]{6}$/)
  .withMessage('accentColor must be a 6-digit hex like #6366f1');

router.use(authenticate);

router.post(
  '/',
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 500 }),
  hexColor,
  validate,
  asyncHandler(ctrl.createWorkspace),
);

router.get('/', asyncHandler(ctrl.listWorkspaces));

router.get(
  '/:workspaceId',
  param('workspaceId').isString(),
  validate,
  requireWorkspaceMember(),
  asyncHandler(ctrl.getWorkspace),
);

router.patch(
  '/:workspaceId',
  param('workspaceId').isString(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 500 }),
  hexColor,
  validate,
  requireWorkspaceMember('ADMIN'),
  asyncHandler(ctrl.updateWorkspace),
);

router.delete(
  '/:workspaceId',
  param('workspaceId').isString(),
  validate,
  requireWorkspaceMember('ADMIN'),
  asyncHandler(ctrl.deleteWorkspace),
);

router.get(
  '/:workspaceId/members',
  param('workspaceId').isString(),
  validate,
  requireWorkspaceMember(),
  asyncHandler(ctrl.listMembers),
);

router.post(
  '/:workspaceId/invite',
  param('workspaceId').isString(),
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['ADMIN', 'MEMBER']),
  validate,
  requireWorkspaceMember('ADMIN'),
  asyncHandler(ctrl.inviteMember),
);

router.patch(
  '/:workspaceId/members/:userId',
  param('workspaceId').isString(),
  param('userId').isString(),
  body('role').isIn(['ADMIN', 'MEMBER']),
  validate,
  requireWorkspaceMember('ADMIN'),
  asyncHandler(ctrl.updateMemberRole),
);

router.delete(
  '/:workspaceId/members/:userId',
  param('workspaceId').isString(),
  param('userId').isString(),
  validate,
  requireWorkspaceMember(),
  asyncHandler(ctrl.removeMember),
);

export default router;
