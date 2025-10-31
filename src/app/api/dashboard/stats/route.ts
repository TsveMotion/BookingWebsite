import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get previous month date range for comparison
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch current month bookings
    const currentMonthBookings = await prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Fetch previous month bookings for comparison
    const prevMonthBookings = await prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
    });

    // Calculate booking change percentage
    const bookingChange = prevMonthBookings > 0
      ? Math.round(((currentMonthBookings - prevMonthBookings) / prevMonthBookings) * 100)
      : 0;

    // Fetch total unique clients
    const totalClients = await prisma.client.count({
      where: { userId },
    });

    // Fetch new clients this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const newClientsThisWeek = await prisma.client.count({
      where: {
        userId,
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Fetch current month revenue
    const currentMonthRevenue = await prisma.booking.aggregate({
      where: {
        userId,
        status: 'completed',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Fetch previous month revenue
    const prevMonthRevenue = await prisma.booking.aggregate({
      where: {
        userId,
        status: 'completed',
        createdAt: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const currentRevenue = currentMonthRevenue._sum.totalAmount || 0;
    const prevRevenue = prevMonthRevenue._sum.totalAmount || 0;

    // Calculate revenue change percentage
    const revenueChange = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    // Calculate overall growth rate (average of bookings and revenue growth)
    const growthRate = Math.round((bookingChange + revenueChange) / 2);

    return NextResponse.json({
      bookings: {
        value: currentMonthBookings,
        change: bookingChange,
      },
      clients: {
        total: totalClients,
        newThisWeek: newClientsThisWeek,
      },
      revenue: {
        value: currentRevenue,
        change: revenueChange,
      },
      growthRate: growthRate,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
