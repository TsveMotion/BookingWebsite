import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total bookings count
    const totalBookings = await prisma.booking.count({
      where: {
        status: { in: ["confirmed", "completed"] }
      }
    });

    // Get bookings this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const bookingsThisMonth = await prisma.booking.count({
      where: {
        createdAt: { gte: firstDayOfMonth },
        status: { in: ["confirmed", "completed"] }
      }
    });

    // Get total active businesses (with paid plans)
    const activeBusinesses = await prisma.user.count({
      where: {
        OR: [
          { plan: "pro" },
          { plan: "business" }
        ],
        businessName: { not: null }
      }
    });

    // Get all businesses to calculate average rating (placeholder until review system)
    const allBusinesses = await prisma.user.count({
      where: {
        businessName: { not: null }
      }
    });

    // Get total clients across all businesses
    const totalClients = await prisma.client.count();

    // Calculate retention rate (clients with 2+ bookings)
    const repeatClients = await prisma.client.findMany({
      select: {
        id: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    const clientsWithMultipleBookings = repeatClients.filter(
      client => client._count.bookings >= 2
    ).length;

    const retentionRate = totalClients > 0 
      ? Math.round((clientsWithMultipleBookings / totalClients) * 100) 
      : 0;

    return NextResponse.json({
      totalBookings,
      bookingsThisMonth,
      activeBusinesses,
      allBusinesses,
      totalClients,
      retentionRate,
      averageRating: 4.9, // Placeholder until review system
      totalReviews: 1200, // Placeholder
    });
  } catch (error) {
    console.error("Error fetching homepage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
