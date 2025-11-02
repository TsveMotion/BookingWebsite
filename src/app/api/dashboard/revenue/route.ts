import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { cacheFetch, cacheKeys } from '@/lib/cache';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    // Use Redis cache with 60 second TTL
    const cacheKey = cacheKeys.dashboard.revenue(ownerId);
    const data = await cacheFetch(
      cacheKey,
      async () => {
        return await fetchRevenueData(ownerId);
      },
      60 // 60 seconds TTL
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

async function fetchRevenueData(userId: string) {
    // Get last 7 days of revenue data
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Fetch revenue for each day
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(sevenDaysAgo);
      dayStart.setDate(sevenDaysAgo.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = await prisma.booking.aggregate({
        where: {
          userId,
          status: 'completed',
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      dailyRevenue.push({
        label: dayLabels[dayStart.getDay()],
        value: dayRevenue._sum.totalAmount || 0,
      });
    }

    // Calculate total revenue for the week
    const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.value, 0);

    // Get previous week revenue for comparison
    const fourteenDaysAgo = new Date(sevenDaysAgo);
    fourteenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const prevWeekRevenue = await prisma.booking.aggregate({
      where: {
        userId,
        status: 'completed',
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const prevTotal = prevWeekRevenue._sum.totalAmount || 0;
    const changePercentage = prevTotal > 0
      ? Math.round(((totalRevenue - prevTotal) / prevTotal) * 100)
      : 0;

    return {
      data: dailyRevenue,
      total: totalRevenue,
      change: changePercentage,
    };
}
