import { prisma } from '../lib/prisma.js';
import { notFound, forbidden } from '../lib/errors.js';
import { getIo } from '../lib/io.js';
import { log } from '../lib/auditLog.js';

const goalSelect = {
  id: true,
  workspaceId: true,
  ownerId: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { milestones: true } },
};

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function createGoal(req, res) {
  const { workspaceId } = req.params;
  const { title, description, ownerId, dueDate, status } = req.body;

  const goal = await prisma.goal.create({
    data: {
      workspaceId,
      ownerId: ownerId || req.user.id,
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'NOT_STARTED',
    },
    select: {
      ...goalSelect,
      milestones: { select: { id: true, title: true, progress: true, dueDate: true } },
    },
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('goal:created', { goal });
  await log({ workspaceId, actorId: req.user.id, action: 'goal.created', entityType: 'Goal', entityId: goal.id });

  res.status(201).json({ data: { goal } });
}

export async function listGoals(req, res) {
  const { workspaceId } = req.params;
  const { status, ownerId, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    workspaceId,
    ...(status && { status }),
    ...(ownerId && { ownerId }),
  };

  const [goals, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      select: {
        ...goalSelect,
        milestones: { select: { id: true, progress: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.goal.count({ where }),
  ]);

  res.json({ data: goals, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

export async function getGoal(req, res) {
  const { workspaceId, goalId } = req.params;
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
    select: {
      ...goalSelect,
      milestones: { select: { id: true, title: true, progress: true, dueDate: true }, orderBy: { createdAt: 'asc' } },
      updates: {
        select: { id: true, body: true, createdAt: true, author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!goal) throw notFound('Goal not found');
  res.json({ data: { goal } });
}

export async function updateGoal(req, res) {
  const { workspaceId, goalId } = req.params;
  const existing = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
  if (!existing) throw notFound('Goal not found');

  const { title, description, ownerId, dueDate, status } = req.body;
  const diff = {};
  if (title !== undefined && title !== existing.title) diff.title = { before: existing.title, after: title };
  if (status !== undefined && status !== existing.status) diff.status = { before: existing.status, after: status };

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(ownerId !== undefined && { ownerId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(status !== undefined && { status }),
    },
    select: {
      ...goalSelect,
      milestones: { select: { id: true, title: true, progress: true, dueDate: true } },
    },
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('goal:updated', { goal });
  await log({ workspaceId, actorId: req.user.id, action: 'goal.updated', entityType: 'Goal', entityId: goalId, diff });

  res.json({ data: { goal } });
}

export async function deleteGoal(req, res) {
  const { workspaceId, goalId } = req.params;
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');
  const existing = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
  if (!existing) throw notFound('Goal not found');

  await prisma.goal.delete({ where: { id: goalId } });
  await log({ workspaceId, actorId: req.user.id, action: 'goal.deleted', entityType: 'Goal', entityId: goalId });
  getIo()?.to(`workspace:${workspaceId}`).emit('goal:deleted', { goalId });

  res.status(204).end();
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function createMilestone(req, res) {
  const { workspaceId, goalId } = req.params;
  const goal = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
  if (!goal) throw notFound('Goal not found');

  const { title, progress = 0, dueDate } = req.body;
  const milestone = await prisma.milestone.create({
    data: { goalId, title, progress, dueDate: dueDate ? new Date(dueDate) : null },
  });

  await log({ workspaceId, actorId: req.user.id, action: 'milestone.created', entityType: 'Milestone', entityId: milestone.id });
  const updatedGoal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { ...goalSelect, milestones: { select: { id: true, title: true, progress: true, dueDate: true } } },
  });
  getIo()?.to(`workspace:${workspaceId}`).emit('goal:updated', { goal: updatedGoal });

  res.status(201).json({ data: { milestone } });
}

export async function updateMilestone(req, res) {
  const { workspaceId, goalId, milestoneId } = req.params;
  const { title, progress, dueDate } = req.body;

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...(title !== undefined && { title }),
      ...(progress !== undefined && { progress }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
  });

  await log({ workspaceId, actorId: req.user.id, action: 'milestone.updated', entityType: 'Milestone', entityId: milestoneId });
  const updatedGoal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { ...goalSelect, milestones: { select: { id: true, title: true, progress: true, dueDate: true } } },
  });
  getIo()?.to(`workspace:${workspaceId}`).emit('goal:updated', { goal: updatedGoal });

  res.json({ data: { milestone } });
}

export async function deleteMilestone(req, res) {
  const { workspaceId, goalId, milestoneId } = req.params;
  await prisma.milestone.delete({ where: { id: milestoneId } });
  const updatedGoal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { ...goalSelect, milestones: { select: { id: true, title: true, progress: true, dueDate: true } } },
  });
  getIo()?.to(`workspace:${workspaceId}`).emit('goal:updated', { goal: updatedGoal });
  res.status(204).end();
}

// ─── Goal Updates ─────────────────────────────────────────────────────────────

export async function createGoalUpdate(req, res) {
  const { workspaceId, goalId } = req.params;
  const goal = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
  if (!goal) throw notFound('Goal not found');

  const update = await prisma.goalUpdate.create({
    data: { goalId, authorId: req.user.id, body: req.body.body },
    select: {
      id: true, body: true, createdAt: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('goal:update_posted', { update: { ...update, goalId } });
  res.status(201).json({ data: { update } });
}

export async function listGoalUpdates(req, res) {
  const { workspaceId, goalId } = req.params;
  const goal = await prisma.goal.findFirst({ where: { id: goalId, workspaceId } });
  if (!goal) throw notFound('Goal not found');

  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [updates, total] = await Promise.all([
    prisma.goalUpdate.findMany({
      where: { goalId },
      select: {
        id: true, body: true, createdAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.goalUpdate.count({ where: { goalId } }),
  ]);

  res.json({ data: updates, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}
