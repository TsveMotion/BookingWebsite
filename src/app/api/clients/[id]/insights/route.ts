import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const clientId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof clientId !== 'string' || !clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get all bookings for lifetime value and analytics
    const bookings = await prisma.booking.findMany({
      where: {
        clientId,
        userId,
        status: 'completed',
        paymentStatus: 'PAID',
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const lifetimeValue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const avgSpend = bookings.length > 0 ? lifetimeValue / bookings.length : 0;

    // Calculate visit frequency (days between visits)
    let visitFrequency = 'N/A';
    if (bookings.length >= 2) {
      const firstVisit = new Date(bookings[0].startTime);
      const lastVisit = new Date(bookings[bookings.length - 1].startTime);
      const daysDiff = Math.floor(
        (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24)
      );
      const avgDays = Math.floor(daysDiff / (bookings.length - 1));
      visitFrequency = `Every ${avgDays} days`;
    } else if (bookings.length === 1) {
      visitFrequency = 'First visit';
    }

    // Calculate retention score (simple heuristic based on recency and frequency)
    const lastBooking = bookings[bookings.length - 1];
    let retentionScore = 50; // Base score

    if (lastBooking) {
      const daysSinceLastVisit = Math.floor(
        (Date.now() - new Date(lastBooking.startTime).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Recency score (0-40 points)
      if (daysSinceLastVisit <= 30) {
        retentionScore += 40;
      } else if (daysSinceLastVisit <= 60) {
        retentionScore += 25;
      } else if (daysSinceLastVisit <= 90) {
        retentionScore += 10;
      }

      // Frequency score (0-10 points)
      if (bookings.length >= 10) {
        retentionScore += 10;
      } else if (bookings.length >= 5) {
        retentionScore += 5;
      }
    }

    retentionScore = Math.min(100, retentionScore);

    return NextResponse.json({
      lifetimeValue,
      avgSpend,
      visitFrequency,
      retentionScore,
      totalBookings: bookings.length,
      lastVisit: lastBooking ? lastBooking.startTime : null,
    });
  } catch (error) {
    console.error('Error fetching client insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client insights' },
      { status: 500 }
    );
  }
}
