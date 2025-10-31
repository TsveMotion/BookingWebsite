import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get completed bookings as billing history
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        status: 'completed',
        paymentStatus: 'PAID',
      },
      include: {
        service: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const history = bookings.map((booking) => ({
      id: booking.id,
      date: booking.createdAt.toLocaleDateString('en-GB'),
      amount: booking.totalAmount,
      status: 'paid',
      description: `${booking.service.name} - ${booking.client.name}`,
    }));

    return NextResponse.json({ data: history });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
