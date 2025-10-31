import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Fetch all bookings for the current customer
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find client records for this user
    const clients = await prisma.client.findMany({
      where: {
        email: (await prisma.user.findUnique({ where: { id: userId } }))?.email || "",
      },
      select: { id: true },
    });

    if (clients.length === 0) {
      return NextResponse.json([]);
    }

    const clientIds = clients.map((c) => c.id);

    // Fetch bookings for these clients
    const bookings = await prisma.booking.findMany({
      where: {
        clientId: { in: clientIds },
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        user: {
          select: {
            businessName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
