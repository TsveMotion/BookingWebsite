import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const location = searchParams.get("location") || "";
    const category = searchParams.get("category") || "";

    const whereConditions: any = {
      AND: [
        // Must have a business name
        {
          businessName: { not: null },
        },
      ],
    };

    // Text search
    if (query) {
      whereConditions.AND.push({
        OR: [
          { businessName: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    // Location filter
    if (location) {
      whereConditions.AND.push({
        address: { contains: location, mode: "insensitive" },
      });
    }

    const businesses = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        businessName: true,
        businessSlug: true,
        description: true,
        logoUrl: true,
        address: true,
        phone: true,
        createdAt: true,
        plan: true,
        _count: {
          select: {
            bookings: true,
            services: true,
          },
        },
      },
      orderBy: [
        { plan: "desc" }, // Business plan first
        { createdAt: "desc" },
      ],
      take: 50, // Limit results
    });

    // Format the response
    const formattedBusinesses = businesses.map((business: any) => ({
      id: business.id,
      slug: business.businessSlug || business.businessName?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "business",
      name: business.businessName || "Beauty Business",
      category: category || "Beauty Services",
      location: business.address?.split(',')[0] || "UK",
      description: business.description || "Professional beauty services",
      image: business.logoUrl || "/logo/Logo_Long.png",
      rating: 4.5 + Math.random() * 0.5, // Placeholder until reviews are implemented
      reviews: Math.floor(Math.random() * 100) + 20,
      featured: business.plan === "business",
      totalBookings: business._count.bookings,
      totalServices: business._count.services,
    }));

    return NextResponse.json(formattedBusinesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
