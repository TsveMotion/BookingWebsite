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
    const type = searchParams.get("type") || "summary";

    if (!from || !to) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        id: true,
        client: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        totalAmount: true,
        status: true,
        paymentStatus: true,
        startTime: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    let csv = "";

    if (type === "summary") {
      // Summary CSV with all bookings
      csv = "Date,Client,Service,Price,Status,Payment\n";
      bookings.forEach((booking) => {
        const date = booking.createdAt.toLocaleDateString("en-GB");
        const client = booking.client?.name || "N/A";
        const service = booking.service?.name || "N/A";
        const price = `£${booking.totalAmount?.toFixed(2) || "0.00"}`;
        const status = booking.status;
        const payment = booking.paymentStatus || "N/A";
        
        csv += `${date},"${client}","${service}",${price},${status},${payment}\n`;
      });
    }

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
