import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Calculate previous period for trends
    const periodDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevFromDate = new Date(fromDate);
    prevFromDate.setDate(prevFromDate.getDate() - periodDays);
    const prevToDate = new Date(fromDate);

    // Current period data
    const currentBookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    // Previous period data
    const previousBookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: prevFromDate, lte: prevToDate },
      },
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    });

    // Calculate metrics
    const revenue = currentBookings
      .filter(b => b.status === "completed" && b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const prevRevenue = previousBookings
      .filter(b => b.status === "completed" && b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const bookings = currentBookings.length;
    const prevBookings = previousBookings.length;

    // New clients
    const newClients = await prisma.client.count({
      where: {
        userId,
        createdAt: { gte: fromDate, lte: toDate },
      },
    });

    const prevNewClients = await prisma.client.count({
      where: {
        userId,
        createdAt: { gte: prevFromDate, lte: prevToDate },
      },
    });

    const avgBookingValue = bookings > 0 ? revenue / bookings : 0;
    const prevAvgBookingValue = prevBookings > 0 ? prevRevenue / prevBookings : 0;

    // Calculate trends (percentage change)
    const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const bookingsTrend = prevBookings > 0 ? ((bookings - prevBookings) / prevBookings) * 100 : 0;
    const clientsTrend = prevNewClients > 0 ? ((newClients - prevNewClients) / prevNewClients) * 100 : 0;
    const avgValueTrend = prevAvgBookingValue > 0 ? ((avgBookingValue - prevAvgBookingValue) / prevAvgBookingValue) * 100 : 0;

    return NextResponse.json({
      revenue,
      bookings,
      newClients,
      avgBookingValue,
      trends: {
        revenue: Math.round(revenueTrend),
        bookings: Math.round(bookingsTrend),
        clients: Math.round(clientsTrend),
        avgValue: Math.round(avgValueTrend),
      },
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
