import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    // Total clients
    const totalClients = await prisma.client.count({
      where: { userId: ownerId },
    });

    // Active this month (had bookings in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeThisMonth = await prisma.client.count({
      where: {
        userId: ownerId,
        bookings: {
          some: {
            startTime: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Total bookings across all clients
    const totalBookings = await prisma.booking.count({
      where: { userId: ownerId },
    });

    // Retention rate (clients who returned within 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const clientsWithRecentBookings = await prisma.client.findMany({
      where: {
        userId: ownerId,
        bookings: {
          some: {
            startTime: {
              gte: sixtyDaysAgo,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const returningClients = clientsWithRecentBookings.filter(
      (c) => c._count.bookings > 1
    ).length;

    const retentionRate =
      clientsWithRecentBookings.length > 0
        ? Math.round((returningClients / clientsWithRecentBookings.length) * 100)
        : 0;

    return NextResponse.json({
      totalClients,
      activeThisMonth,
      totalBookings,
      retentionRate,
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client stats' },
      { status: 500 }
    );
  }
}
