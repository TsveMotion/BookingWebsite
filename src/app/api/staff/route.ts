import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessSlug = searchParams.get("businessSlug");
    const locationId = searchParams.get("locationId");

    if (!businessSlug) {
      return NextResponse.json(
        { error: "Business slug required" },
        { status: 400 }
      );
    }

    // Get business owner
    const business = await prisma.user.findUnique({
      where: { businessSlug },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get business owner first
    const owner = await prisma.user.findUnique({
      where: { id: business.id },
      select: { id: true, name: true, email: true, businessName: true },
    });

    const staffList: Array<{
      id: string;
      name: string;
      displayName: string;
      email: string;
      role: string;
    }> = [];

    // Add business owner as first option
    if (owner) {
      const ownerName = owner.name || owner.businessName || "Owner";
      staffList.push({
        id: owner.id,
        name: ownerName,
        displayName: `${ownerName} (Owner)`,
        email: owner.email,
        role: "Owner",
      });
    }

    // Get team members (staff)
    const staff = await prisma.teamMember.findMany({
      where: {
        ownerId: business.id,
        status: "Accepted",
      },
      orderBy: { name: "asc" },
    });

    // Format and add staff to list
    staff.forEach((s) => {
      const staffName = s.name || "Team Member";
      const roleText = s.role || "Staff";
      staffList.push({
        id: s.memberId || s.id,
        name: staffName,
        displayName: `${staffName} (${roleText})`,
        email: s.email,
        role: roleText,
      });
    });

    return NextResponse.json(staffList);
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
