import { prisma } from '../lib/prisma.js';
import { notFound, forbidden, badRequest } from '../lib/errors.js';
import { getIo } from '../lib/io.js';
import { log } from '../lib/auditLog.js';

// ─── Shared selects ──────────────────────────────────────────────────────────

const announcementSelect = {
  id: true,
  workspaceId: true,
  authorId: true,
  title: true,
  body: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { comments: true } },
  reactions: {
    select: { id: true, emoji: true, userId: true },
  },
};

function groupReactions(reactions) {
  return reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
}

// ─── Announcements ───────────────────────────────────────────────────────────

export async function createAnnouncement(req, res) {
  const { workspaceId } = req.params;
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');

  const { title, body, isPinned = false } = req.body;

  let announcement;

  if (isPinned) {
    announcement = await prisma.$transaction(async (tx) => {
      await tx.announcement.updateMany({
        where: { workspaceId, isPinned: true },
        data: { isPinned: false },
      });
      return tx.announcement.create({
        data: { workspaceId, authorId: req.user.id, title, body, isPinned: true },
        select: announcementSelect,
      });
    });
  } else {
    announcement = await prisma.announcement.create({
      data: { workspaceId, authorId: req.user.id, title, body, isPinned: false },
      select: announcementSelect,
    });
  }

  getIo()?.to(`workspace:${workspaceId}`).emit('announcement:created', { announcement });
  await log({ workspaceId, actorId: req.user.id, action: 'announcement.created', entityType: 'Announcement', entityId: announcement.id });

  res.status(201).json({ data: { announcement } });
}

export async function listAnnouncements(req, res) {
  const { workspaceId } = req.params;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where: { workspaceId },
      select: announcementSelect,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: parseInt(limit),
    }),
    prisma.announcement.count({ where: { workspaceId } }),
  ]);

  res.json({ data: announcements, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

export async function getAnnouncement(req, res) {
  const { workspaceId, announcementId } = req.params;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const announcement = await prisma.announcement.findFirst({
    where: { id: announcementId, workspaceId },
    select: {
      ...announcementSelect,
      comments: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          reactions: { select: { id: true, emoji: true, userId: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: parseInt(limit),
      },
    },
  });

  if (!announcement) throw notFound('Announcement not found');
  res.json({ data: { announcement } });
}

export async function updateAnnouncement(req, res) {
  const { workspaceId, announcementId } = req.params;
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');

  const existing = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!existing) throw notFound('Announcement not found');

  const { title, body, isPinned } = req.body;
  const pinChanged = isPinned !== undefined && isPinned !== existing.isPinned;

  let updated;

  if (isPinned === true && !existing.isPinned) {
    updated = await prisma.$transaction(async (tx) => {
      await tx.announcement.updateMany({
        where: { workspaceId, isPinned: true },
        data: { isPinned: false },
      });
      return tx.announcement.update({
        where: { id: announcementId },
        data: {
          ...(title !== undefined && { title }),
          ...(body !== undefined && { body }),
          isPinned: true,
        },
        select: announcementSelect,
      });
    });
  } else {
    updated = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(isPinned !== undefined && { isPinned }),
      },
      select: announcementSelect,
    });
  }

  const eventName = pinChanged && isPinned ? 'announcement:pinned' : 'announcement:updated';
  getIo()?.to(`workspace:${workspaceId}`).emit(eventName, { announcement: updated });

  const action = pinChanged && isPinned ? 'announcement.pinned' : 'announcement.updated';
  await log({ workspaceId, actorId: req.user.id, action, entityType: 'Announcement', entityId: announcementId });

  res.json({ data: { announcement: updated } });
}

export async function deleteAnnouncement(req, res) {
  const { workspaceId, announcementId } = req.params;
  if (req.workspaceMember.role !== 'ADMIN') throw forbidden('Admin role required');

  const existing = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!existing) throw notFound('Announcement not found');

  await prisma.announcement.delete({ where: { id: announcementId } });
  getIo()?.to(`workspace:${workspaceId}`).emit('announcement:deleted', { id: announcementId });

  res.status(204).end();
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export async function toggleAnnouncementReaction(req, res) {
  const { workspaceId, announcementId } = req.params;
  const { emoji } = req.body;

  const existing = await prisma.reaction.findUnique({
    where: { userId_announcementId_emoji: { userId: req.user.id, announcementId, emoji } },
  });

  let action;
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    action = 'removed';
  } else {
    try {
      await prisma.reaction.create({ data: { userId: req.user.id, announcementId, emoji } });
      action = 'added';
    } catch (err) {
      if (err.code === 'P2002') {
        action = 'added'; // already exists — race condition, treat as added
      } else {
        throw err;
      }
    }
  }

  // Recompute counts + fetch full reactions (with userId for client-side "you reacted" state)
  const updatedReactions = await prisma.reaction.findMany({
    where: { announcementId },
    select: { id: true, emoji: true, userId: true },
  });
  const counts = groupReactions(updatedReactions);

  getIo()?.to(`workspace:${workspaceId}`).emit('announcement:reactionUpdated', { announcementId, counts, reactions: updatedReactions });

  res.json({ data: { action, counts, reactions: updatedReactions } });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function createComment(req, res) {
  const { workspaceId, announcementId } = req.params;
  const { body, mentionedUserIds = [] } = req.body;

  const announcement = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!announcement) throw notFound('Announcement not found');

  const comment = await prisma.comment.create({
    data: { announcementId, authorId: req.user.id, body },
    select: {
      id: true, body: true, createdAt: true, updatedAt: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: { select: { id: true, emoji: true, userId: true } },
    },
  });

  // ── @mention notifications ────────────────────────────────────────────────
  if (mentionedUserIds.length > 0) {
    const validMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId, userId: { in: mentionedUserIds } },
      select: { userId: true },
    });

    for (const { userId } of validMembers) {
      if (userId === req.user.id) continue;

      await prisma.mention.create({ data: { commentId: comment.id, userId } }).catch(() => {});

      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'MENTION',
          payload: { announcementId, commentId: comment.id, mentionedBy: req.user.id },
        },
      }).catch(() => null);

      if (notification) {
        getIo()?.to(`user:${userId}`).emit('notification:new', { notification });
      }
    }
  }

  getIo()?.to(`workspace:${workspaceId}`).emit('announcement:commentAdded', { comment: { ...comment, announcementId } });

  res.status(201).json({ data: { comment } });
}

export async function listComments(req, res) {
  const { workspaceId, announcementId } = req.params;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const announcement = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!announcement) throw notFound('Announcement not found');

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { announcementId },
      select: {
        id: true, body: true, createdAt: true, updatedAt: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        reactions: { select: { id: true, emoji: true, userId: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.comment.count({ where: { announcementId } }),
  ]);

  res.json({ data: comments, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
}

// ─── Comment reactions ────────────────────────────────────────────────────────

export async function toggleCommentReaction(req, res) {
  const { workspaceId, announcementId, commentId } = req.params;
  const { emoji } = req.body;

  const existing = await prisma.reaction.findUnique({
    where: { userId_commentId_emoji: { userId: req.user.id, commentId, emoji } },
  });

  let action;
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    action = 'removed';
  } else {
    try {
      await prisma.reaction.create({ data: { userId: req.user.id, commentId, emoji } });
      action = 'added';
    } catch (err) {
      if (err.code === 'P2002') {
        action = 'added';
      } else {
        throw err;
      }
    }
  }

  const reactions = await prisma.reaction.findMany({ where: { commentId }, select: { emoji: true } });
  const counts = groupReactions(reactions);

  res.json({ data: { action, counts } });
}
