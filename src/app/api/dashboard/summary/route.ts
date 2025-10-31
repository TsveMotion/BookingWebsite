import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get bookings for current month
    const bookingsThisMonth = await prisma.booking.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
        status: { not: 'cancelled' },
      },
    });

    // Get bookings for last month
    const bookingsLastMonth = await prisma.booking.count({
      where: {
        userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: 'cancelled' },
      },
    });

    // Calculate booking change percentage
    const bookingChange = bookingsLastMonth > 0
      ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100)
      : bookingsThisMonth > 0 ? 100 : 0;

    // Get total clients
    const totalClients = await prisma.client.count({
      where: { userId },
    });

    // Get new clients this week
    const newClientsThisWeek = await prisma.client.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    });

    // Get revenue for this month
    const revenueThisMonth = await prisma.booking.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
        status: 'completed',
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
    });

    // Get revenue for last month
    const revenueLastMonth = await prisma.booking.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: 'completed',
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
    });

    const currentRevenue = revenueThisMonth._sum.totalAmount || 0;
    const lastRevenue = revenueLastMonth._sum.totalAmount || 0;

    // Calculate revenue change percentage
    const revenueChange = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0;

    // Calculate growth rate (average of booking and revenue growth)
    const growthRate = Math.round((bookingChange + revenueChange) / 2);

    // Get last 7 days revenue data for sparkline
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayRevenue = await prisma.booking.aggregate({
        where: {
          userId,
          createdAt: { gte: date, lt: nextDate },
          status: 'completed',
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      });

      last7Days.push(dayRevenue._sum.totalAmount || 0);
    }

    // Get upcoming appointments (next 5)
    const upcomingAppointments = await prisma.booking.findMany({
      where: {
        userId,
        startTime: { gte: now },
        status: { in: ['pending', 'confirmed'] },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    // Get today's appointments count
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await prisma.booking.count({
      where: {
        userId,
        startTime: { gte: startOfToday, lte: endOfToday },
        status: { in: ['pending', 'confirmed'] },
      },
    });

    return NextResponse.json({
      bookings: {
        value: bookingsThisMonth,
        change: bookingChange,
        sparkline: last7Days,
      },
      clients: {
        total: totalClients,
        newThisWeek: newClientsThisWeek,
      },
      revenue: {
        value: currentRevenue,
        change: revenueChange,
        sparkline: last7Days,
      },
      growthRate,
      upcomingAppointments: upcomingAppointments.map(apt => ({
        id: apt.id,
        clientName: apt.client.name,
        serviceName: apt.service.name,
        startTime: apt.startTime,
        totalAmount: apt.totalAmount,
        status: apt.status,
      })),
      todayAppointments,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
