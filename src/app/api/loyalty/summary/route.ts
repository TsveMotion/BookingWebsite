import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total clients
    const totalClients = await prisma.client.count({
      where: { userId },
    });

    // Get clients with bookings in last 90 days (active clients)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activeClients = await prisma.client.count({
      where: {
        userId,
        bookings: {
          some: {
            createdAt: { gte: ninetyDaysAgo },
          },
        },
      },
    });

    // Calculate retention rate
    const retentionRate = totalClients > 0 
      ? Math.round((activeClients / totalClients) * 100) 
      : 0;

    // Get total loyalty points issued
    const loyaltyStats = await prisma.loyaltyPoints.aggregate({
      where: { userId },
      _sum: {
        totalEarned: true,
        totalSpent: true,
      },
    });

    const pointsIssued = loyaltyStats._sum.totalEarned || 0;
    const pointsRedeemed = loyaltyStats._sum.totalSpent || 0;

    // Get top loyal clients (by total points earned)
    const topClients = await prisma.loyaltyPoints.findMany({
      where: { userId },
      orderBy: { totalEarned: "desc" },
      take: 5,
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalClients,
      activeClients,
      retentionRate,
      pointsIssued,
      pointsRedeemed,
      topClients: topClients.map((lp) => ({
        name: lp.client.name,
        email: lp.client.email,
        points: lp.points,
        totalEarned: lp.totalEarned,
      })),
    });
  } catch (error) {
    console.error("Error fetching loyalty summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty summary" },
      { status: 500 }
    );
  }
}
