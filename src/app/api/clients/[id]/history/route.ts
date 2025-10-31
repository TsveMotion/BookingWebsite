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
    const clientId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof clientId !== 'string' || !clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get booking history
    const bookings = await prisma.booking.findMany({
      where: {
        clientId,
        userId,
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching client history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client history' },
      { status: 500 }
    );
  }
}
