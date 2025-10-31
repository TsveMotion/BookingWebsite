import { prisma } from './prisma';

export async function ensureUserExists(userId: string, email?: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: email || '',
      plan: 'free',
    },
  });
}
