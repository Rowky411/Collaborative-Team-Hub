import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { env } from './lib/env.js';
import { createApp } from './app.js';

const app = createApp();
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: env.WEB_ORIGIN, credentials: true },
});

io.on('connection', (socket) => {
  socket.on('workspace:join', (workspaceId) => {
    if (typeof workspaceId === 'string') socket.join(`workspace:${workspaceId}`);
  });
  socket.on('workspace:leave', (workspaceId) => {
    if (typeof workspaceId === 'string') socket.leave(`workspace:${workspaceId}`);
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
  console.log(`[api] WEB_ORIGIN=${env.WEB_ORIGIN}`);
});

export { io };
