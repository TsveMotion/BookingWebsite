import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/ensure-user';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    const locations = await prisma.location.findMany({
      where: { ownerId },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            staff: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
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

    await ensureUserExists(userId);

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    // Check user plan and existing locations
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { plan: true },
    });

    const existingLocations = await prisma.location.count({
      where: { ownerId },
    });

    const plan = user?.plan?.toLowerCase() || 'free';
    const isBusiness = plan === 'business';
    const isFreeOrPro = plan === 'free' || plan === 'pro';

    // Plan-based limits: Free/Pro = 1, Business = unlimited
    if (isFreeOrPro && existingLocations >= 1) {
      return NextResponse.json(
        { error: 'Upgrade to Business plan for multiple locations', limit: 1 },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      phone,
      manager,
      workingHours,
      openingHours,
      active,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        ownerId,
        name,
        address: address || null,
        phone: phone || null,
        manager: manager || null,
        workingHours:
          workingHours && Object.keys(workingHours).length > 0
            ? workingHours
            : openingHours && Object.keys(openingHours).length > 0
            ? openingHours
            : null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
