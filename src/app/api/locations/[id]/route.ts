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
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Get the effective owner ID
    const ownerId = await getBusinessOwnerId(userId);

    // Fetch location with staff details
    const location = await prisma.location.findFirst({
      where: {
        id,
        ownerId,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }
    const body = await request.json();
    const { name, address, phone, manager, workingHours, active } = body;

    // Verify location belongs to user
    const location = await prisma.location.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        manager: manager !== undefined ? manager : undefined,
        workingHours: workingHours !== undefined ? workingHours : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }

    // Verify location belongs to user
    const location = await prisma.location.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
