import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

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
    const locationId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Get the effective owner ID
    const ownerId = await getBusinessOwnerId(userId);

    // Verify location belongs to user
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        ownerId,
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Fetch bookings for analytics
    const bookings = await prisma.booking.findMany({
      where: {
        locationId,
        status: { in: ['confirmed', 'completed'] },
      },
      include: {
        client: {
          select: {
            id: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const totalBookings = bookings.length;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    
    // Count unique clients
    const uniqueClients = new Set(bookings.map(b => b.client?.id).filter(Boolean));
    const clientCount = uniqueClients.size;

    return NextResponse.json({
      totalRevenue,
      totalBookings,
      avgBookingValue,
      clientCount,
    });
  } catch (error) {
    console.error('Error fetching location analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
