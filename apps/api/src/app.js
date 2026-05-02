import express from 'express';
import path from 'node:path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './lib/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import goalRoutes from './routes/goal.routes.js';
import actionItemRoutes from './routes/actionItem.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import uploadRoutes from './routes/upload.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ data: { status: 'ok', uptime: process.uptime() } });
  });

  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), 'uploads'), { maxAge: '7d' }),
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/workspaces/:workspaceId/goals', goalRoutes);
  app.use('/api/workspaces/:workspaceId/action-items', actionItemRoutes);
  app.use('/api/workspaces/:workspaceId/announcements', announcementRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/workspaces/:workspaceId/analytics', analyticsRoutes);
  app.use('/api/workspaces/:workspaceId/audit-log', auditLogRoutes);
  app.use('/api/upload', uploadRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
