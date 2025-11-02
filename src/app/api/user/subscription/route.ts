import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { cacheFetch, cacheKeys } from '@/lib/cache';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Redis cache with 5 minute TTL
    const cacheKey = cacheKeys.dashboard.subscription(userId);
    const data = await cacheFetch(
      cacheKey,
      async () => {
        return await fetchSubscriptionData(userId);
      },
      300 // 5 minutes TTL
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

async function fetchSubscriptionData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
      });
    }

    return {
      plan: user.plan || 'free',
      status: user.subscriptionStatus || 'active',
      subscriptionId: user.subscriptionPlan || null,
    };
}
