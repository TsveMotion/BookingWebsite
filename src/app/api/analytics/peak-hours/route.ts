import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: {
          in: ['confirmed', 'completed'],
        },
      },
      select: {
        startTime: true,
      },
    });

    // Group by hour
    const hourCounts: Record<number, number> = {};
    
    bookings.forEach((booking) => {
      const hour = booking.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Convert to array format
    const data = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      label: `${hour.padStart(2, '0')}:00`,
      bookings: count,
    })).sort((a, b) => a.hour - b.hour);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peak hours' },
      { status: 500 }
    );
  }
}
