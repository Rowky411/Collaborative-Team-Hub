import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';
import { forbidden } from '../lib/errors.js';

const router = Router({ mergeParams: true });
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.use(requireWorkspaceMember());

router.get('/summary', asyncHandler(ctrl.getSummary));
router.get('/goal-completion', asyncHandler(ctrl.getGoalCompletion));
router.get('/export', asyncHandler((req, res) => {
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');
  return ctrl.exportCsv(req, res);
}));

export default router;
