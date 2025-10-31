import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await prisma.bookingPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.bookingPreferences.create({
        data: { userId },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching booking preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
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
      primaryColor,
      allowAddons,
      allowStaffPick,
      autoConfirm,
      cancellationHrs,
      businessHours,
    } = body;

    const preferences = await prisma.bookingPreferences.upsert({
      where: { userId },
      update: {
        primaryColor,
        allowAddons,
        allowStaffPick,
        autoConfirm,
        cancellationHrs,
        businessHours,
      },
      create: {
        userId,
        primaryColor,
        allowAddons,
        allowStaffPick,
        autoConfirm,
        cancellationHrs,
        businessHours,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error saving booking preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
