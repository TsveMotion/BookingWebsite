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

    // Fetch bookings with service details
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate, lte: toDate },
        status: "completed",
        paymentStatus: "PAID",
      },
      select: {
        totalAmount: true,
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group by service
    const serviceMap = new Map<string, { revenue: number; bookings: number }>();

    bookings.forEach((booking) => {
      const serviceName = booking.service?.name || "Unknown Service";
      
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { revenue: 0, bookings: 0 });
      }

      const data = serviceMap.get(serviceName)!;
      data.revenue += booking.totalAmount || 0;
      data.bookings += 1;
    });

    // Convert to array
    const serviceMix = Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services

    return NextResponse.json({ data: serviceMix });
  } catch (error) {
    console.error("Service mix error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
