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

    // Fetch bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const dailyData = new Map<string, { revenue: number; bookings: number }>();

    bookings.forEach((booking) => {
      const dateKey = booking.createdAt.toISOString().split("T")[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { revenue: 0, bookings: 0 });
      }

      const data = dailyData.get(dateKey)!;
      data.bookings += 1;
      
      if (booking.status === "completed" && booking.paymentStatus === "PAID") {
        data.revenue += booking.totalAmount || 0;
      }
    });

    // Convert to array and format dates
    const seriesData = Array.from(dailyData.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short" 
      }),
      revenue: data.revenue,
      bookings: data.bookings,
    }));

    return NextResponse.json({ data: seriesData });
  } catch (error) {
    console.error("Revenue series error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
