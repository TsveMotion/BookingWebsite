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
    const serviceId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof serviceId !== 'string' || !serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get add-ons
    const addons = await prisma.serviceAddon.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addons);
  } catch (error) {
    console.error('Error fetching service add-ons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}

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

    if (typeof serviceId !== 'string' || !serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, extraTime, extraPrice } = body;

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create add-on
    const addon = await prisma.serviceAddon.create({
      data: {
        serviceId,
        name,
        description: description || null,
        extraTime,
        extraPrice,
      },
    });

    return NextResponse.json(addon);
  } catch (error) {
    console.error('Error creating service add-on:', error);
    return NextResponse.json(
      { error: 'Failed to create add-on' },
      { status: 500 }
    );
  }
}
