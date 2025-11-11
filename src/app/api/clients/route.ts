import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { invalidateClientCache } from '@/lib/cache-invalidation';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerId = await getBusinessOwnerId(userId);

    const clients = await prisma.client.findMany({
      where: { userId: ownerId },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch all locations for this owner
    const locations = await prisma.location.findMany({
      where: { ownerId },
      select: { id: true, name: true },
    });

    // Create a location map for quick lookup
    const locationMap = new Map(locations.map(loc => [loc.id, loc]));

    // Add location data to each client
    const clientsWithLocation = clients.map(client => ({
      ...client,
      location: client.locationId ? locationMap.get(client.locationId) : null,
    }));

    return NextResponse.json(clientsWithLocation);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: '',
        plan: 'free',
      },
    });

    const body = await request.json();
    const { name, email, phone, locationId } = body;

    const ownerId = await getBusinessOwnerId(userId);

    const client = await prisma.client.create({
      data: {
        userId: ownerId,
        name,
        email,
        phone: phone || null,
        locationId: locationId || null,
      },
    });

    // Invalidate cache after client creation
    await invalidateClientCache(ownerId);

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
