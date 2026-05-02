import { prisma } from './prisma.js';

export async function log({ workspaceId, actorId, action, entityType, entityId, diff }) {
  try {
    await prisma.auditLog.create({
      data: { workspaceId, actorId, action, entityType, entityId, diff: diff ?? undefined },
    });
  } catch (_err) {
    // never break the main operation
  }
}
