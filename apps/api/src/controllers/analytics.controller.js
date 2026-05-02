import { prisma } from '../lib/prisma.js';

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isoWeekLabel(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function escapeCsv(v) {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function toCsvRow(fields) {
  return fields.map(escapeCsv).join(',');
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export async function getSummary(req, res) {
  const { workspaceId } = req.params;

  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalGoals,
    completedThisWeek,
    overdueCount,
    totalActionItems,
    actionItemsCompletedThisWeek,
    activeActors,
  ] = await Promise.all([
    prisma.goal.count({ where: { workspaceId } }),
    prisma.goal.count({
      where: { workspaceId, status: 'COMPLETED', updatedAt: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.goal.count({
      where: {
        workspaceId,
        status: { not: 'COMPLETED' },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.actionItem.count({ where: { workspaceId } }),
    prisma.actionItem.count({
      where: { workspaceId, status: 'DONE', updatedAt: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.auditLog.groupBy({
      by: ['actorId'],
      where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  res.json({
    data: {
      totalGoals,
      completedThisWeek,
      overdueCount,
      totalActionItems,
      actionItemsCompletedThisWeek,
      activeMembers: activeActors.length,
    },
  });
}

// ─── Goal completion chart (12 weeks) ────────────────────────────────────────

export async function getGoalCompletion(req, res) {
  const { workspaceId } = req.params;

  const todayWeekStart = getWeekStart(new Date());
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(todayWeekStart);
    start.setUTCDate(start.getUTCDate() - i * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    weeks.push({ start, end });
  }

  const goals = await prisma.goal.findMany({
    where: { workspaceId },
    select: { createdAt: true, status: true, updatedAt: true },
  });

  const data = weeks.map(({ start, end }) => {
    const total = goals.filter((g) => g.createdAt >= start && g.createdAt < end).length;
    const completed = goals.filter(
      (g) => g.status === 'COMPLETED' && g.updatedAt >= start && g.updatedAt < end
    ).length;
    return { week: isoWeekLabel(start), completed, total };
  });

  res.json({ data });
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function exportCsv(req, res) {
  const { workspaceId } = req.params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

  const [goals, milestones, actionItems, announcements] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      select: { id: true, title: true, status: true, dueDate: true, createdAt: true, owner: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.milestone.findMany({
      where: { goal: { workspaceId } },
      select: { id: true, goalId: true, title: true, progress: true, dueDate: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId },
      select: { id: true, title: true, status: true, priority: true, dueDate: true, goalId: true, assignee: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.announcement.findMany({
      where: { workspaceId },
      select: { id: true, title: true, isPinned: true, createdAt: true, author: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const lines = [];

  lines.push(`WORKSPACE EXPORT: ${workspace?.name ?? workspaceId}`);
  lines.push(`Exported: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('GOALS');
  lines.push(toCsvRow(['id', 'title', 'status', 'owner', 'dueDate', 'createdAt']));
  for (const g of goals) {
    lines.push(toCsvRow([g.id, g.title, g.status, g.owner?.name ?? '', g.dueDate?.toISOString() ?? '', g.createdAt.toISOString()]));
  }
  lines.push('');

  lines.push('MILESTONES');
  lines.push(toCsvRow(['id', 'goalId', 'title', 'progress', 'dueDate']));
  for (const m of milestones) {
    lines.push(toCsvRow([m.id, m.goalId, m.title, m.progress, m.dueDate?.toISOString() ?? '']));
  }
  lines.push('');

  lines.push('ACTION ITEMS');
  lines.push(toCsvRow(['id', 'title', 'status', 'priority', 'assignee', 'goalId', 'dueDate']));
  for (const a of actionItems) {
    lines.push(toCsvRow([a.id, a.title, a.status, a.priority, a.assignee?.name ?? '', a.goalId ?? '', a.dueDate?.toISOString() ?? '']));
  }
  lines.push('');

  lines.push('ANNOUNCEMENTS');
  lines.push(toCsvRow(['id', 'title', 'author', 'isPinned', 'createdAt']));
  for (const ann of announcements) {
    lines.push(toCsvRow([ann.id, ann.title, ann.author?.name ?? '', ann.isPinned, ann.createdAt.toISOString()]));
  }

  const csv = lines.join('\n');
  const date = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="workspace-export-${date}.csv"`);
  res.send(csv);
}
