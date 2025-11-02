import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the actual business owner ID (in case this user is a staff member)
    const ownerId = await getBusinessOwnerId(userId);

    const services = await prisma.service.findMany({
      where: { userId: ownerId },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
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
    const { name, description, duration, price } = body;

    // Get the actual business owner ID (in case this user is a staff member)
    const ownerId = await getBusinessOwnerId(userId);

    const service = await prisma.service.create({
      data: {
        userId: ownerId,
        name,
        description: description || null,
        duration,
        price,
      },
    });

    // Mark services as added for the owner
    await prisma.user.update({
      where: { id: ownerId },
      data: { servicesAdded: true },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
