import { prisma } from '../lib/prisma.js';

export async function listNotifications(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  res.json({ data: notifications, meta: { unreadCount } });
}

export async function markRead(req, res) {
  const { notificationId } = req.params;
  const notification = await prisma.notification.updateMany({
    where: { id: notificationId, userId: req.user.id },
    data: { isRead: true },
  });
  res.json({ data: { ok: true } });
}

export async function markAllRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ data: { ok: true } });
}
