import { prisma } from './prisma';

/**
 * Gets the effective business owner ID for a user
 * If the user is a staff member (has businessId), returns their owner's ID
 * Otherwise returns their own ID (they are the owner)
 */
export async function getBusinessOwnerId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { businessId: true },
  });

  // If user has a businessId, they're a staff member - return the owner's ID
  // Otherwise, they're the owner - return their own ID
  return user?.businessId || userId;
}

/**
 * Checks if a user is a staff member (has a businessId)
 */
export async function isStaffMember(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { businessId: true },
  });

  return !!user?.businessId;
}
