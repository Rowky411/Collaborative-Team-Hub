import { prisma } from '../lib/prisma.js';
import { forbidden } from '../lib/errors.js';

function requireAdmin(req) {
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');
}

function buildWhere(workspaceId, query) {
  const { entityType, actorId, from, to } = query;
  return {
    workspaceId,
    ...(entityType && { entityType }),
    ...(actorId && { actorId }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };
}

async function enrichWithActors(logs) {
  const ids = [...new Set(logs.map((l) => l.actorId))];
  if (!ids.length) return logs;
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const map = Object.fromEntries(users.map((u) => [u.id, u]));
  return logs.map((l) => ({ ...l, actor: map[l.actorId] ?? null }));
}

function escapeCsv(v) {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listAuditLog(req, res) {
  requireAdmin(req);
  const { workspaceId } = req.params;
  const { page = '1', limit = '50' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = buildWhere(workspaceId, req.query);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: { id: true, actorId: true, action: true, entityType: true, entityId: true, diff: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  const enriched = await enrichWithActors(logs);
  res.json({ data: enriched, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function exportAuditLogCsv(req, res) {
  requireAdmin(req);
  const { workspaceId } = req.params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const where = buildWhere(workspaceId, req.query);

  const logs = await prisma.auditLog.findMany({
    where,
    select: { id: true, actorId: true, action: true, entityType: true, entityId: true, diff: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  const enriched = await enrichWithActors(logs);

  const { entityType, actorId, from, to } = req.query;
  const filterDesc = [
    entityType && `entityType=${entityType}`,
    actorId && `actorId=${actorId}`,
    from && `from=${from}`,
    to && `to=${to}`,
  ].filter(Boolean).join(', ') || 'none';

  const lines = [
    `AUDIT LOG EXPORT: ${workspace?.name ?? workspaceId}`,
    `Exported: ${new Date().toISOString()}`,
    `Filters: ${filterDesc}`,
    '',
    ['id', 'timestamp', 'actor', 'action', 'entityType', 'entityId'].join(','),
    ...enriched.map((l) =>
      [l.id, l.createdAt.toISOString(), l.actor?.name ?? l.actorId, l.action, l.entityType, l.entityId]
        .map(escapeCsv).join(',')
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="audit-log-${date}.csv"`);
  res.send(lines.join('\n'));
}
