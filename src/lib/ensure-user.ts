import { prisma } from './prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function ensureUserExists(userId: string, email?: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  // If user exists and has email, we're done
  if (existingUser?.email) {
    return existingUser;
  }

  // Get email from Clerk if not provided
  let userEmail = email;
  if (!userEmail) {
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      type ClerkEmail = (typeof clerkUser.emailAddresses)[number];

      const primaryEmail = clerkUser.emailAddresses.find(
        (address: ClerkEmail) => address.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      userEmail =
        primaryEmail ||
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        '';
    } catch (error) {
      console.error('Failed to fetch email from Clerk:', error);
    }
  }

  // Upsert user with email
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: userEmail || existingUser?.email || '',
    },
    create: {
      id: userId,
      email: userEmail || '',
      plan: 'free',
    },
  });

  return user;
}
