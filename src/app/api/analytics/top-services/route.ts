import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get booking counts grouped by service
    const serviceStats = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        userId,
        status: {
          in: ['confirmed', 'completed'],
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Fetch service details
    const serviceIds = serviceStats.map((stat) => stat.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Combine data
    const data = serviceStats.map((stat) => {
      const service = services.find((s) => s.id === stat.serviceId);
      return {
        serviceId: stat.serviceId,
        serviceName: service?.name || 'Unknown',
        bookings: stat._count.id,
        revenue: stat._sum.totalAmount || 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching top services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top services' },
      { status: 500 }
    );
  }
}
