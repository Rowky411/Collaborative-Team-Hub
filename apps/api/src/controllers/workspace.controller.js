import { prisma } from '../lib/prisma.js';
import { badRequest, notFound, conflict } from '../lib/errors.js';
import { getIo } from '../lib/io.js';

const memberSelect = {
  role: true,
  joinedAt: true,
  user: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
};

const flattenMember = (m) => ({
  userId: m.user.id,
  name: m.user.name,
  email: m.user.email,
  avatarUrl: m.user.avatarUrl,
  role: m.role,
  joinedAt: m.joinedAt,
});

export async function createWorkspace(req, res) {
  const { name, description, accentColor } = req.body;
  const workspace = await prisma.workspace.create({
    data: {
      name,
      description: description || null,
      accentColor: accentColor || '#6366f1',
      members: {
        create: { userId: req.user.id, role: 'ADMIN' },
      },
    },
    include: { _count: { select: { members: true } } },
  });
  res.status(201).json({
    data: {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        accentColor: workspace.accentColor,
        createdAt: workspace.createdAt,
        memberCount: workspace._count.members,
        role: 'ADMIN',
      },
    },
  });
}

export async function listWorkspaces(req, res) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: req.user.id },
    include: {
      workspace: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    description: m.workspace.description,
    accentColor: m.workspace.accentColor,
    createdAt: m.workspace.createdAt,
    memberCount: m.workspace._count.members,
    role: m.role,
  }));

  res.json({ data: workspaces });
}

export async function getWorkspace(req, res) {
  const { workspaceId } = req.params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        select: memberSelect,
        orderBy: { joinedAt: 'asc' },
      },
    },
  });
  if (!workspace) throw notFound('Workspace not found');

  res.json({
    data: {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        accentColor: workspace.accentColor,
        createdAt: workspace.createdAt,
        role: req.workspaceMember.role,
        members: workspace.members.map(flattenMember),
      },
    },
  });
}

export async function updateWorkspace(req, res) {
  const { workspaceId } = req.params;
  const { name, description, accentColor } = req.body;
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(accentColor !== undefined && { accentColor }),
    },
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('workspace:updated', { workspace });

  res.json({ data: { workspace } });
}

export async function deleteWorkspace(req, res) {
  const { workspaceId } = req.params;
  await prisma.workspace.delete({ where: { id: workspaceId } });
  res.status(204).end();
}

export async function listMembers(req, res) {
  const { workspaceId } = req.params;
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: memberSelect,
    orderBy: { joinedAt: 'asc' },
  });
  res.json({ data: members.map(flattenMember) });
}

export async function inviteMember(req, res) {
  const { workspaceId } = req.params;
  const { email, role = 'MEMBER' } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // No invitation table yet (assumption A1) — surface a clear error.
    throw badRequest('No registered user with that email. Pending invites not implemented yet.');
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });
  if (existing) throw conflict('User is already a member');

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: user.id, role },
    select: memberSelect,
  });

  const flat = flattenMember(member);
  getIo()?.to(`workspace:${workspaceId}`).emit('workspace:member_added', { member: flat });

  // Notify invited user's personal room so their workspace list updates in real-time
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { _count: { select: { members: true } } },
  });
  if (workspace) {
    getIo()?.to(`user:${user.id}`).emit('workspace:invited', {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        accentColor: workspace.accentColor,
        createdAt: workspace.createdAt,
        memberCount: workspace._count.members,
        role,
      },
    });
  }

  res.json({ data: { status: 'added', member: flat } });
}

export async function updateMemberRole(req, res) {
  const { workspaceId, userId } = req.params;
  const { role } = req.body;

  if (userId === req.user.id) {
    // Prevent demoting the last admin via self-edit.
    const adminCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: 'ADMIN' },
    });
    if (role !== 'ADMIN' && adminCount <= 1) {
      throw badRequest('Cannot demote the last admin');
    }
  }

  const member = await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId } },
    data: { role },
    select: memberSelect,
  });

  res.json({ data: { member: flattenMember(member) } });
}

export async function removeMember(req, res) {
  const { workspaceId, userId } = req.params;
  const isSelf = userId === req.user.id;

  if (!isSelf && req.workspaceMember.role !== 'ADMIN') {
    throw badRequest('Only admins can remove other members');
  }

  const target = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!target) throw notFound('Member not found');

  if (target.role === 'ADMIN') {
    const adminCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: 'ADMIN' },
    });
    if (adminCount <= 1) throw badRequest('Cannot remove the last admin');
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  getIo()?.to(`workspace:${workspaceId}`).emit('workspace:member_removed', { userId });

  res.status(204).end();
}
