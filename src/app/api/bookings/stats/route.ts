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

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    // Get all bookings count
    const totalBookings = await prisma.booking.count({
      where: { userId: ownerId },
    });

    // Get total revenue from completed bookings
    const revenueData = await prisma.booking.aggregate({
      where: {
        userId: ownerId,
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
      where: { userId: ownerId, status: 'pending' },
    });

    const confirmedCount = await prisma.booking.count({
      where: { userId: ownerId, status: 'confirmed' },
    });

    const completedCount = await prisma.booking.count({
      where: { userId: ownerId, status: 'completed' },
    });

    const cancelledCount = await prisma.booking.count({
      where: { userId: ownerId, status: 'cancelled' },
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
