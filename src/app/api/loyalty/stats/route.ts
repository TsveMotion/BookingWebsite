import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Upgrade to Pro or Business to access loyalty features' }, { status: 403 });
    }

    // Get total clients
    const totalClients = await prisma.client.count({
      where: { userId },
    });

    // Get active clients (clients who have booked in the last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activeClients = await prisma.client.count({
      where: {
        userId,
        bookings: {
          some: {
            createdAt: {
              gte: ninetyDaysAgo,
            },
          },
        },
      },
    });

    // Calculate retention rate
    const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

    // Get total points issued
    const pointsData = await prisma.loyaltyPoints.aggregate({
      where: { userId },
      _sum: {
        totalEarned: true,
      },
    });

    const totalPointsIssued = pointsData._sum.totalEarned || 0;

    // Get top 5 clients by loyalty points
    const topClients = await prisma.loyaltyPoints.findMany({
      where: { userId },
      orderBy: { points: 'desc' },
      take: 5,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedTopClients = topClients.map((lp) => ({
      id: lp.client.id,
      name: lp.client.name,
      email: lp.client.email,
      points: lp.points,
      totalEarned: lp.totalEarned,
    }));

    return NextResponse.json({
      totalClients,
      activeClients,
      retentionRate,
      totalPointsIssued,
      topClients: formattedTopClients,
    });
  } catch (error) {
    console.error('Error fetching loyalty stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty stats' },
      { status: 500 }
    );
  }
}
