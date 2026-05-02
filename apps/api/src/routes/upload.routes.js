import { Router } from 'express';
import { uploadAny } from '../lib/upload.js';
import { authenticate } from '../middleware/authenticate.js';
import * as ctrl from '../controllers/upload.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
router.post('/', authenticate, uploadAny.single('file'), asyncHandler(ctrl.uploadFile));
export default router;
