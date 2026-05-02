import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw) => bcrypt.hash(pw, 10);

  // ── Users ────────────────────────────────────────────────────────────────────

  const [demo, alice, bob, carol] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@team-hub.dev' },
      update: { name: 'Demo User' },
      create: { email: 'demo@team-hub.dev', name: 'Demo User', passwordHash: await hash('demopassword') },
    }),
    prisma.user.upsert({
      where: { email: 'alice@team-hub.dev' },
      update: { name: 'Alice Chen' },
      create: { email: 'alice@team-hub.dev', name: 'Alice Chen', passwordHash: await hash('demopassword') },
    }),
    prisma.user.upsert({
      where: { email: 'bob@team-hub.dev' },
      update: { name: 'Bob Martinez' },
      create: { email: 'bob@team-hub.dev', name: 'Bob Martinez', passwordHash: await hash('demopassword') },
    }),
    prisma.user.upsert({
      where: { email: 'carol@team-hub.dev' },
      update: { name: 'Carol Singh' },
      create: { email: 'carol@team-hub.dev', name: 'Carol Singh', passwordHash: await hash('demopassword') },
    }),
  ]);

  // ── Workspace 1 — Product Team ────────────────────────────────────────────

  const ws1 = await prisma.workspace.upsert({
    where: { id: 'seed-workspace-1' },
    update: { name: 'Product Team' },
    create: {
      id: 'seed-workspace-1',
      name: 'Product Team',
      description: 'Main product workspace — roadmap, goals, and delivery tracking',
      accentColor: '#6366f1',
    },
  });

  for (const [userId, role] of [[demo.id, 'ADMIN'], [alice.id, 'ADMIN'], [bob.id, 'MEMBER'], [carol.id, 'MEMBER']]) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: ws1.id, userId } },
      update: { role },
      create: { workspaceId: ws1.id, userId, role },
    });
  }

  // ── Workspace 2 — Marketing ───────────────────────────────────────────────

  const ws2 = await prisma.workspace.upsert({
    where: { id: 'seed-workspace-2' },
    update: { name: 'Marketing' },
    create: {
      id: 'seed-workspace-2',
      name: 'Marketing',
      description: 'Q2 campaigns, brand, and growth initiatives',
      accentColor: '#10b981',
    },
  });

  for (const [userId, role] of [[alice.id, 'ADMIN'], [carol.id, 'MEMBER'], [demo.id, 'MEMBER']]) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: ws2.id, userId } },
      update: { role },
      create: { workspaceId: ws2.id, userId, role },
    });
  }

  // ── Goals (ws1) ───────────────────────────────────────────────────────────

  const goals = await Promise.all([
    prisma.goal.upsert({
      where: { id: 'seed-goal-1' },
      update: {},
      create: {
        id: 'seed-goal-1',
        workspaceId: ws1.id,
        ownerId: demo.id,
        title: 'Q2 Product Launch',
        description: 'Ship v2.0 with all planned features by end of quarter.',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-06-30'),
      },
    }),
    prisma.goal.upsert({
      where: { id: 'seed-goal-2' },
      update: {},
      create: {
        id: 'seed-goal-2',
        workspaceId: ws1.id,
        ownerId: alice.id,
        title: 'Improve Onboarding Flow',
        description: 'Reduce time-to-first-value from 10 min to under 3 min.',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-05-31'),
      },
    }),
    prisma.goal.upsert({
      where: { id: 'seed-goal-3' },
      update: {},
      create: {
        id: 'seed-goal-3',
        workspaceId: ws1.id,
        ownerId: bob.id,
        title: 'Infrastructure Migration',
        description: 'Move all services to Railway with zero downtime.',
        status: 'COMPLETED',
        dueDate: new Date('2026-05-01'),
      },
    }),
    prisma.goal.upsert({
      where: { id: 'seed-goal-4' },
      update: {},
      create: {
        id: 'seed-goal-4',
        workspaceId: ws1.id,
        ownerId: carol.id,
        title: 'Hire 2 Engineers',
        description: 'Fill backend and frontend engineering roles.',
        status: 'NOT_STARTED',
        dueDate: new Date('2026-07-15'),
      },
    }),
    prisma.goal.upsert({
      where: { id: 'seed-goal-5' },
      update: {},
      create: {
        id: 'seed-goal-5',
        workspaceId: ws2.id,
        ownerId: alice.id,
        title: 'Q2 Brand Campaign',
        description: 'Launch awareness push across social, email, and paid channels.',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-06-15'),
      },
    }),
  ]);

  // ── Milestones ────────────────────────────────────────────────────────────

  const milestoneData = [
    { goalId: goals[0].id, title: 'Feature freeze',       progress: 100, dueDate: new Date('2026-06-01') },
    { goalId: goals[0].id, title: 'Beta release',         progress: 60,  dueDate: new Date('2026-06-15') },
    { goalId: goals[0].id, title: 'Public launch',        progress: 0,   dueDate: new Date('2026-06-30') },
    { goalId: goals[1].id, title: 'User research done',   progress: 100, dueDate: new Date('2026-05-05') },
    { goalId: goals[1].id, title: 'New flow implemented', progress: 45,  dueDate: new Date('2026-05-20') },
    { goalId: goals[2].id, title: 'DB migrated',          progress: 100, dueDate: new Date('2026-04-20') },
    { goalId: goals[2].id, title: 'API deployed',         progress: 100, dueDate: new Date('2026-04-28') },
    { goalId: goals[4].id, title: 'Creative assets done', progress: 80,  dueDate: new Date('2026-05-25') },
    { goalId: goals[4].id, title: 'Ad campaign live',     progress: 20,  dueDate: new Date('2026-06-01') },
  ];

  for (let i = 0; i < milestoneData.length; i++) {
    const m = milestoneData[i];
    await prisma.milestone.upsert({
      where: { id: `seed-milestone-${i + 1}` },
      update: { progress: m.progress },
      create: { id: `seed-milestone-${i + 1}`, ...m },
    });
  }

  // ── Action Items ──────────────────────────────────────────────────────────

  const itemData = [
    { title: 'Set up CI/CD pipeline',         status: 'DONE',        priority: 'HIGH',   assigneeId: bob.id,   goalId: goals[2].id, position: 0 },
    { title: 'Write API documentation',       status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: demo.id,  goalId: goals[0].id, position: 0 },
    { title: 'Design new onboarding screens', status: 'IN_PROGRESS', priority: 'HIGH',   assigneeId: alice.id, goalId: goals[1].id, position: 1 },
    { title: 'Fix authentication edge cases', status: 'TODO',        priority: 'URGENT', assigneeId: demo.id,  goalId: null,        position: 0, dueDate: new Date('2026-05-10') },
    { title: 'Conduct user interviews (x5)',  status: 'DONE',        priority: 'HIGH',   assigneeId: alice.id, goalId: goals[1].id, position: 2 },
    { title: 'Update landing page copy',      status: 'TODO',        priority: 'LOW',    assigneeId: carol.id, goalId: null,        position: 1 },
    { title: 'Performance audit — API p95',   status: 'IN_REVIEW',   priority: 'HIGH',   assigneeId: bob.id,   goalId: goals[0].id, position: 0 },
    { title: 'Implement dark mode toggle',    status: 'TODO',        priority: 'LOW',    assigneeId: null,     goalId: null,        position: 2 },
    { title: 'Set up error monitoring',       status: 'DONE',        priority: 'MEDIUM', assigneeId: bob.id,   goalId: goals[2].id, position: 1 },
    { title: 'Draft job descriptions',        status: 'TODO',        priority: 'MEDIUM', assigneeId: carol.id, goalId: goals[3].id, position: 0 },
  ];

  for (let i = 0; i < itemData.length; i++) {
    const item = itemData[i];
    await prisma.actionItem.upsert({
      where: { id: `seed-item-${i + 1}` },
      update: { status: item.status },
      create: {
        id: `seed-item-${i + 1}`,
        workspaceId: ws1.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        assigneeId: item.assigneeId ?? null,
        goalId: item.goalId ?? null,
        position: item.position,
        dueDate: item.dueDate ?? null,
      },
    });
  }

  // ── Announcements (ws1) ───────────────────────────────────────────────────

  const announcementData = [
    {
      id: 'seed-ann-1',
      authorId: demo.id,
      title: '🚀 v2.0 Beta is live!',
      body: 'The beta is now open to internal testers. Please report any issues in the #bugs channel. Known limitation: file uploads over 8MB may time out on slower connections.',
      isPinned: true,
    },
    {
      id: 'seed-ann-2',
      authorId: alice.id,
      title: 'New onboarding flow — feedback needed',
      body: "We've shipped the redesigned onboarding flow to 10% of new signups. Early data looks promising — conversion up 18%. Drop your feedback below!",
      isPinned: false,
    },
    {
      id: 'seed-ann-3',
      authorId: bob.id,
      title: 'Infrastructure migration complete ✅',
      body: 'All services are now running on Railway. Average API response time improved by 40ms. Uptime SLA is now 99.9%. No action needed from the team.',
      isPinned: false,
    },
  ];

  for (const ann of announcementData) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: { isPinned: ann.isPinned },
      create: { workspaceId: ws1.id, ...ann },
    });
  }

  // ── Reactions on first announcement ──────────────────────────────────────

  const reactPairs = [
    [alice.id, '🎉'], [bob.id, '🎉'], [carol.id, '🚀'], [demo.id, '👍'],
  ];
  for (const [userId, emoji] of reactPairs) {
    await prisma.reaction.upsert({
      where: { userId_announcementId_emoji: { userId, announcementId: 'seed-ann-1', emoji } },
      update: {},
      create: { userId, announcementId: 'seed-ann-1', emoji },
    });
  }

  // ── Comments on second announcement ──────────────────────────────────────

  await prisma.comment.upsert({
    where: { id: 'seed-comment-1' },
    update: {},
    create: {
      id: 'seed-comment-1',
      announcementId: 'seed-ann-2',
      authorId: bob.id,
      body: 'The new progress bar on step 3 is a great touch. Users were definitely confused before.',
    },
  });
  await prisma.comment.upsert({
    where: { id: 'seed-comment-2' },
    update: {},
    create: {
      id: 'seed-comment-2',
      announcementId: 'seed-ann-2',
      authorId: carol.id,
      body: 'Can we also add a skip option? Some power users just want to get into the app.',
    },
  });

  // ── Goal updates ──────────────────────────────────────────────────────────

  await prisma.goalUpdate.upsert({
    where: { id: 'seed-gu-1' },
    update: {},
    create: {
      id: 'seed-gu-1',
      goalId: goals[0].id,
      authorId: demo.id,
      body: 'Feature freeze hit on schedule. Beta builds going out to testers tomorrow.',
    },
  });
  await prisma.goalUpdate.upsert({
    where: { id: 'seed-gu-2' },
    update: {},
    create: {
      id: 'seed-gu-2',
      goalId: goals[1].id,
      authorId: alice.id,
      body: 'User research complete. Key finding: step 2 (team invite) is the biggest drop-off point.',
    },
  });

  console.log('\nSeed complete ✓');
  console.log('  Workspaces : Product Team · Marketing');
  console.log('  Users      : demo@team-hub.dev · alice@team-hub.dev · bob@team-hub.dev · carol@team-hub.dev');
  console.log('  Password   : demopassword (all accounts)');
  console.log('  Goals      : 5  |  Action Items: 10  |  Announcements: 3');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
