import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Fetch loyalty points for the current customer across all businesses
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user email to find associated clients
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json([]);
    }

    // Find all client records with this email
    const clients = await prisma.client.findMany({
      where: {
        email: user.email,
      },
      select: { id: true },
    });

    if (clients.length === 0) {
      return NextResponse.json([]);
    }

    const clientIds = clients.map((c) => c.id);

    // Fetch loyalty points for these clients
    const loyaltyPoints = await prisma.loyaltyPoints.findMany({
      where: {
        clientId: { in: clientIds },
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        points: "desc",
      },
    });

    return NextResponse.json(loyaltyPoints);
  } catch (error) {
    console.error("Error fetching customer loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty points" },
      { status: 500 }
    );
  }
}
