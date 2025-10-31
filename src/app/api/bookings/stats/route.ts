import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all bookings count
    const totalBookings = await prisma.booking.count({
      where: { userId },
    });

    // Get total revenue from completed bookings
    const revenueData = await prisma.booking.aggregate({
      where: {
        userId,
        status: 'completed',
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = revenueData._sum.totalAmount || 0;

    // Get average booking value
    const averageBookingValue = totalBookings > 0 
      ? totalRevenue / totalBookings 
      : 0;

    // Get bookings by status
    const pendingCount = await prisma.booking.count({
      where: { userId, status: 'pending' },
    });

    const confirmedCount = await prisma.booking.count({
      where: { userId, status: 'confirmed' },
    });

    const completedCount = await prisma.booking.count({
      where: { userId, status: 'completed' },
    });

    const cancelledCount = await prisma.booking.count({
      where: { userId, status: 'cancelled' },
    });

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      averageBookingValue,
      statusBreakdown: {
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking stats' },
      { status: 500 }
    );
  }
}
