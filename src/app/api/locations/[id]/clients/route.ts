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

    // Fetch all bookings for this location and aggregate client data
    const bookings = await prisma.booking.findMany({
      where: {
        locationId,
        status: { in: ['confirmed', 'completed'] },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Aggregate client stats
    const clientMap = new Map<string, any>();

    bookings.forEach((booking) => {
      if (!booking.client) return;

      const clientId = booking.client.id;
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: booking.client.id,
          name: booking.client.name,
          email: booking.client.email,
          phone: booking.client.phone,
          totalBookings: 0,
          totalSpent: 0,
        });
      }

      const client = clientMap.get(clientId);
      client.totalBookings += 1;
      client.totalSpent += booking.totalAmount || 0;
    });

    const clients = Array.from(clientMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching location clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
