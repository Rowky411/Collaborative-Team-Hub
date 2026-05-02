import { prisma } from '../lib/prisma.js';
import { notFound, forbidden, badRequest } from '../lib/errors.js';
import { getIo } from '../lib/io.js';
import { log } from '../lib/auditLog.js';

const itemSelect = {
  id: true,
  workspaceId: true,
  goalId: true,
  assigneeId: true,
  title: true,
  description: true,
  attachments: true,
  priority: true,
  status: true,
  dueDate: true,
  position: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  goal: { select: { id: true, title: true } },
};

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createActionItem(req, res) {
  const { workspaceId } = req.params;
  const { title, description, attachments, assigneeId, priority, status, dueDate, goalId } = req.body;

  // Validate assignee belongs to this workspace
  if (assigneeId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: assigneeId } },
    });
    if (!member) throw badRequest('Assignee is not a member of this workspace');
  }

  // Validate goal belongs to this workspace
  if (goalId) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
    if (!goal) throw badRequest('Goal does not belong to this workspace');
  }

  // Position at end of its status column
  const maxPos = await prisma.actionItem.aggregate({
    where: { workspaceId, status: status || 'TODO' },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  const item = await prisma.actionItem.create({
    data: {
      workspaceId,
      title,
      description: description || null,
      attachments: attachments || null,
      assigneeId: assigneeId || null,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      goalId: goalId || null,
      position,
    },
    select: itemSelect,
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('actionItem:created', { actionItem: item });
  await log({
    workspaceId,
    actorId: req.user.id,
    action: 'actionItem.created',
    entityType: 'ActionItem',
    entityId: item.id,
  });

  res.status(201).json({ data: { actionItem: item } });
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listActionItems(req, res) {
  const { workspaceId } = req.params;
  const { assigneeId, status, goalId, priority, page = '1', limit = '50' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Default scope: current user's items unless assigneeId=all or specific userId
  let assigneeFilter;
  if (assigneeId === 'all') {
    assigneeFilter = undefined; // no filter
  } else if (assigneeId) {
    assigneeFilter = assigneeId;
  } else {
    assigneeFilter = req.user.id; // default "my items"
  }

  const where = {
    workspaceId,
    ...(assigneeFilter !== undefined && { assigneeId: assigneeFilter }),
    ...(status && { status }),
    ...(goalId && { goalId }),
    ...(priority && { priority }),
  };

  const [items, total] = await Promise.all([
    prisma.actionItem.findMany({
      where,
      select: itemSelect,
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: parseInt(limit),
    }),
    prisma.actionItem.count({ where }),
  ]);

  res.json({ data: items, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateActionItem(req, res) {
  const { workspaceId, itemId } = req.params;
  const existing = await prisma.actionItem.findFirst({ where: { id: itemId, workspaceId } });
  if (!existing) throw notFound('Action item not found');

  // Only assignee or admin can update
  const isAdmin = req.workspaceMember.role === 'ADMIN';
  const isAssignee = existing.assigneeId === req.user.id;
  const isCreator = existing.assigneeId === null; // unassigned — any member may update
  if (!isAdmin && !isAssignee && !isCreator) {
    throw forbidden('Only the assignee or an Admin can update this item');
  }

  const { title, description, attachments, assigneeId, priority, status, dueDate, goalId, position } = req.body;

  const diff = {};
  if (status !== undefined && status !== existing.status)
    diff.status = { before: existing.status, after: status };
  if (priority !== undefined && priority !== existing.priority)
    diff.priority = { before: existing.priority, after: priority };

  const updated = await prisma.actionItem.update({
    where: { id: itemId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(attachments !== undefined && { attachments: attachments || null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(goalId !== undefined && { goalId: goalId || null }),
      ...(position !== undefined && { position }),
    },
    select: itemSelect,
  });

  // Emit specific event when status changed
  if (status !== undefined && status !== existing.status) {
    getIo()
      ?.to(`workspace:${workspaceId}`)
      .emit('actionItem:statusChanged', { id: updated.id, status: updated.status, position: updated.position });
  } else {
    getIo()
      ?.to(`workspace:${workspaceId}`)
      .emit('actionItem:updated', { actionItem: updated });
  }

  await log({
    workspaceId,
    actorId: req.user.id,
    action: 'actionItem.updated',
    entityType: 'ActionItem',
    entityId: itemId,
    diff,
  });

  res.json({ data: { actionItem: updated } });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteActionItem(req, res) {
  const { workspaceId, itemId } = req.params;
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');

  const existing = await prisma.actionItem.findFirst({ where: { id: itemId, workspaceId } });
  if (!existing) throw notFound('Action item not found');

  await prisma.actionItem.delete({ where: { id: itemId } });

  getIo()?.to(`workspace:${workspaceId}`).emit('actionItem:deleted', { id: itemId });
  await log({
    workspaceId,
    actorId: req.user.id,
    action: 'actionItem.deleted',
    entityType: 'ActionItem',
    entityId: itemId,
  });

  res.status(204).end();
}

// ─── Batch reorder ────────────────────────────────────────────────────────────

export async function reorderActionItems(req, res) {
  const { workspaceId } = req.params;
  const { items } = req.body; // [{ id, status, position }]

  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('items must be a non-empty array');
  }

  // Run all updates in a transaction
  await prisma.$transaction(
    items.map(({ id, status, position }) =>
      prisma.actionItem.updateMany({
        where: { id, workspaceId },
        data: {
          ...(status !== undefined && { status }),
          ...(position !== undefined && { position }),
        },
      }),
    ),
  );

  res.json({ data: { ok: true } });
}
