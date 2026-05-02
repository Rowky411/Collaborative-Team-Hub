import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from '../controllers/announcement.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { requireWorkspaceMember } from '../middleware/workspace.js';

const router = Router({ mergeParams: true });
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);
router.use(requireWorkspaceMember());

// Announcements CRUD
router.post(
  '/',
  body('title').isString().trim().isLength({ min: 1, max: 200 }),
  body('body').isString().isLength({ min: 1 }),
  body('isPinned').optional().isBoolean(),
  validate,
  asyncHandler(ctrl.createAnnouncement),
);

router.get(
  '/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  asyncHandler(ctrl.listAnnouncements),
);

router.get(
  '/:announcementId',
  param('announcementId').isString(),
  validate,
  asyncHandler(ctrl.getAnnouncement),
);

router.patch(
  '/:announcementId',
  param('announcementId').isString(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('body').optional().isString().isLength({ min: 1 }),
  body('isPinned').optional().isBoolean(),
  validate,
  asyncHandler(ctrl.updateAnnouncement),
);

router.delete(
  '/:announcementId',
  param('announcementId').isString(),
  validate,
  asyncHandler(ctrl.deleteAnnouncement),
);

// Reactions
router.post(
  '/:announcementId/reactions',
  param('announcementId').isString(),
  body('emoji').isString().isLength({ min: 1, max: 10 }),
  validate,
  asyncHandler(ctrl.toggleAnnouncementReaction),
);

// Comments
router.post(
  '/:announcementId/comments',
  param('announcementId').isString(),
  body('body').isString().trim().isLength({ min: 1, max: 1000 }),
  body('mentionedUserIds').optional().isArray(),
  body('mentionedUserIds.*').optional().isString(),
  validate,
  asyncHandler(ctrl.createComment),
);

router.get(
  '/:announcementId/comments',
  param('announcementId').isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  asyncHandler(ctrl.listComments),
);

// Comment reactions
router.post(
  '/:announcementId/comments/:commentId/reactions',
  param('announcementId').isString(),
  param('commentId').isString(),
  body('emoji').isString().isLength({ min: 1, max: 10 }),
  validate,
  asyncHandler(ctrl.toggleCommentReaction),
);

export default router;
