import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ businessSlug: string }> }
) {
  try {
    const { businessSlug } = await context.params;
    
    const user = await prisma.user.findUnique({
      where: { businessSlug },
      select: {
        id: true,
        businessName: true,
        description: true,
        address: true,
        phone: true,
        logo: true,
        logoUrl: true,
        plan: true,
        services: {
          where: {
            active: true,
          },
          orderBy: {
            name: 'asc',
          },
          include: {
            locations: {
              where: {
                active: true,
              },
              include: {
                location: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    phone: true,
                    workingHours: true,
                  },
                },
              },
            },
            addons: {
              where: {
                active: true,
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
        },
        ownedLocations: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            manager: true,
            workingHours: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Format response with flattened locations per service
    const response = {
      ...user,
      services: user.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        locations: service.locations.map(sl => sl.location),
        addons: service.addons || [],
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}
