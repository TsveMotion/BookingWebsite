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
        plan: true,
        services: {
          where: {
            // Only show active services
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}
