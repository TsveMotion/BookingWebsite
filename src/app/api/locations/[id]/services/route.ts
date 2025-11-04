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

    // Fetch services assigned to this location via ServiceLocation junction table
    const serviceLocations = await prisma.serviceLocation.findMany({
      where: {
        locationId,
        active: true,
      },
      include: {
        service: {
          include: {
            addons: {
              where: {
                active: true,
              },
            },
          },
        },
      },
      orderBy: {
        service: {
          name: 'asc',
        },
      },
    });

    // Extract services from the junction table results
    const services = serviceLocations.map(sl => sl.service);

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching location services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
