import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

// Get locations assigned to a service
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
    const serviceId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const ownerId = await getBusinessOwnerId(userId);

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: ownerId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get all locations for this owner
    const allLocations = await prisma.location.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get assigned locations
    const serviceLocations = await prisma.serviceLocation.findMany({
      where: {
        serviceId,
      },
      include: {
        location: true,
      },
    });

    const assignedLocationIds = new Set(serviceLocations.map(sl => sl.locationId));

    // Return all locations with assignment status
    const locations = allLocations.map(location => ({
      ...location,
      assigned: assignedLocationIds.has(location.id),
    }));

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching service locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// Assign/unassign locations to a service
export async function POST(
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
    const serviceId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { locationIds } = body; // Array of location IDs to assign

    if (!Array.isArray(locationIds)) {
      return NextResponse.json({ error: 'locationIds must be an array' }, { status: 400 });
    }

    const ownerId = await getBusinessOwnerId(userId);

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: ownerId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify all locations belong to user
    const locations = await prisma.location.findMany({
      where: {
        id: { in: locationIds },
        ownerId,
      },
    });

    if (locations.length !== locationIds.length) {
      return NextResponse.json({ error: 'Invalid location IDs' }, { status: 400 });
    }

    // Delete all existing assignments
    await prisma.serviceLocation.deleteMany({
      where: {
        serviceId,
      },
    });

    // Create new assignments
    if (locationIds.length > 0) {
      await prisma.serviceLocation.createMany({
        data: locationIds.map(locationId => ({
          serviceId,
          locationId,
        })),
      });
    }

    return NextResponse.json({ success: true, assigned: locationIds.length });
  } catch (error) {
    console.error('Error updating service locations:', error);
    return NextResponse.json(
      { error: 'Failed to update locations' },
      { status: 500 }
    );
  }
}
