import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.loyaltySettings.findUnique({
      where: { userId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.loyaltySettings.create({
        data: {
          userId,
          enabled: true,
          pointsPerPound: 1,
          bonusPerBooking: 10,
          welcomeBonus: 50,
          redemptionRate: 100,
          minimumRedemption: 100,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching loyalty settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      enabled,
      pointsPerPound,
      bonusPerBooking,
      welcomeBonus,
      redemptionRate,
      minimumRedemption,
    } = body;

    const settings = await prisma.loyaltySettings.upsert({
      where: { userId },
      update: {
        enabled: enabled !== undefined ? enabled : undefined,
        pointsPerPound: pointsPerPound !== undefined ? pointsPerPound : undefined,
        bonusPerBooking: bonusPerBooking !== undefined ? bonusPerBooking : undefined,
        welcomeBonus: welcomeBonus !== undefined ? welcomeBonus : undefined,
        redemptionRate: redemptionRate !== undefined ? redemptionRate : undefined,
        minimumRedemption: minimumRedemption !== undefined ? minimumRedemption : undefined,
      },
      create: {
        userId,
        enabled: enabled !== undefined ? enabled : true,
        pointsPerPound: pointsPerPound || 1,
        bonusPerBooking: bonusPerBooking || 10,
        welcomeBonus: welcomeBonus || 50,
        redemptionRate: redemptionRate || 100,
        minimumRedemption: minimumRedemption || 100,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating loyalty settings:", error);
    return NextResponse.json(
      { error: "Failed to update loyalty settings" },
      { status: 500 }
    );
  }
}
