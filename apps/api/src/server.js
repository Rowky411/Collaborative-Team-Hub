import http from 'node:http';
import { parse as parseCookie } from 'cookie';
import { Server as SocketServer } from 'socket.io';
import { env } from './lib/env.js';
import { createApp } from './app.js';
import { verifyAccessToken } from './lib/tokens.js';
import { setIo } from './lib/io.js';

const app = createApp();
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: env.WEB_ORIGIN, credentials: true },
});
setIo(io);

// Tracks how many sockets each user has open in each workspace.
// Used to emit presence:online only on first join, presence:offline only on last leave.
// Map<workspaceId, Map<userId, socketCount>>
const presence = new Map();

function bumpPresence(workspaceId, userId, delta) {
  let perWs = presence.get(workspaceId);
  if (!perWs) {
    perWs = new Map();
    presence.set(workspaceId, perWs);
  }
  const next = (perWs.get(userId) || 0) + delta;
  if (next <= 0) {
    perWs.delete(userId);
    if (perWs.size === 0) presence.delete(workspaceId);
    return 0;
  }
  perWs.set(userId, next);
  return next;
}

io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || '';
    const cookies = parseCookie(raw);
    const token = cookies.access_token;
    if (!token) return next(new Error('UNAUTHORIZED'));
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.sub;
    socket.data.email = payload.email;
    socket.data.name = payload.name;
    socket.join(`user:${payload.sub}`);
    next();
  } catch (_err) {
    next(new Error('UNAUTHORIZED'));
  }
});

io.on('connection', (socket) => {
  socket.data.workspaceIds = new Set();

  socket.on('workspace:join', (workspaceId) => {
    if (typeof workspaceId !== 'string') return;
    if (socket.data.workspaceIds.has(workspaceId)) return;
    socket.data.workspaceIds.add(workspaceId);
    socket.join(`workspace:${workspaceId}`);

    const count = bumpPresence(workspaceId, socket.data.userId, 1);
    if (count === 1) {
      socket
        .to(`workspace:${workspaceId}`)
        .emit('presence:online', { userId: socket.data.userId, workspaceId });
    }

    const onlineUserIds = Array.from(presence.get(workspaceId)?.keys() || []);
    socket.emit('presence:snapshot', { workspaceId, onlineUserIds });
  });

  socket.on('workspace:leave', (workspaceId) => {
    if (typeof workspaceId !== 'string') return;
    if (!socket.data.workspaceIds.has(workspaceId)) return;
    socket.data.workspaceIds.delete(workspaceId);
    socket.leave(`workspace:${workspaceId}`);

    const count = bumpPresence(workspaceId, socket.data.userId, -1);
    if (count === 0) {
      socket
        .to(`workspace:${workspaceId}`)
        .emit('presence:offline', { userId: socket.data.userId, workspaceId });
    }
  });

  socket.on('disconnect', () => {
    for (const workspaceId of socket.data.workspaceIds) {
      const count = bumpPresence(workspaceId, socket.data.userId, -1);
      if (count === 0) {
        io
          .to(`workspace:${workspaceId}`)
          .emit('presence:offline', { userId: socket.data.userId, workspaceId });
      }
    }
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
  console.log(`[api] WEB_ORIGIN=${env.WEB_ORIGIN}`);
});

export { io };
