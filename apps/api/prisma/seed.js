import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demopassword', 10);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@team-hub.dev' },
    update: { name: 'Demo User', passwordHash },
    create: {
      email: 'demo@team-hub.dev',
      name: 'Demo User',
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'seed-workspace-1' },
    update: { name: 'Demo Workspace' },
    create: {
      id: 'seed-workspace-1',
      name: 'Demo Workspace',
      description: 'A starter workspace for the demo account',
      accentColor: '#6366f1',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: demo.id },
    },
    update: { role: 'ADMIN' },
    create: {
      workspaceId: workspace.id,
      userId: demo.id,
      role: 'ADMIN',
    },
  });

  console.log('Seed complete:');
  console.log(`  user:      ${demo.email} / demopassword`);
  console.log(`  workspace: ${workspace.name} (${workspace.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
