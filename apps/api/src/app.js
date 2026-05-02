import express from 'express';
import path from 'node:path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './lib/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
