import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { invalidateProfileCache } from '@/lib/cache-invalidation';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

/**
 * Generate a clean URL slug from business name
 */
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if slug is already taken
 */
async function isSlugAvailable(slug: string, currentUserId: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      businessSlug: slug,
      id: { not: currentUserId },
    },
  });
  return !existing;
}

/**
 * GET - Fetch user's current business slug and booking link
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        businessName: true,
        businessSlug: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookingLink = user.businessSlug
      ? `https://glambooking.co.uk/book/${user.businessSlug}`
      : null;

    return NextResponse.json({
      businessName: user.businessName,
      businessSlug: user.businessSlug,
      bookingLink,
    });
  } catch (error) {
    console.error('Error fetching business slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business slug' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update business slug
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    const body = await request.json();
    const { businessName } = body;

    if (!businessName || businessName.trim().length < 3) {
      return NextResponse.json(
        { error: 'Business name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(businessName);
    
    // Check if slug is available
    let isAvailable = await isSlugAvailable(slug, ownerId);
    
    // If slug is taken, append numbers until we find an available one
    let counter = 1;
    const originalSlug = slug;
    while (!isAvailable && counter < 100) {
      slug = `${originalSlug}-${counter}`;
      isAvailable = await isSlugAvailable(slug, ownerId);
      counter++;
    }

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Unable to generate a unique slug. Please try a different business name.' },
        { status: 400 }
      );
    }

    // Update user with business name and slug
    const updatedUser = await prisma.user.update({
      where: { id: ownerId },
      data: {
        businessName,
        businessSlug: slug,
        bookingsReceived: true, // Mark as ready to receive bookings
      },
      select: {
        businessName: true,
        businessSlug: true,
      },
    });

    // Invalidate user cache
    await invalidateProfileCache(userId);

    const bookingLink = `https://glambooking.co.uk/book/${slug}`;

    return NextResponse.json({
      success: true,
      businessName: updatedUser.businessName,
      businessSlug: updatedUser.businessSlug,
      bookingLink,
    });
  } catch (error) {
    console.error('Error creating business slug:', error);
    return NextResponse.json(
      { error: 'Failed to create business slug' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update existing business slug
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the effective owner ID (for staff members, this returns their owner's ID)
    const ownerId = await getBusinessOwnerId(userId);

    const body = await request.json();
    const { businessSlug } = body;

    if (!businessSlug || businessSlug.trim().length < 3) {
      return NextResponse.json(
        { error: 'Slug must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(businessSlug)) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug is available
    const isAvailable = await isSlugAvailable(businessSlug, ownerId);

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This slug is already taken' },
        { status: 400 }
      );
    }

    // Update user slug
    const updatedUser = await prisma.user.update({
      where: { id: ownerId },
      data: {
        businessSlug,
      },
      select: {
        businessName: true,
        businessSlug: true,
      },
    });

    // Invalidate user cache
    await invalidateProfileCache(ownerId);

    const bookingLink = `https://glambooking.co.uk/book/${businessSlug}`;

    return NextResponse.json({
      success: true,
      businessName: updatedUser.businessName,
      businessSlug: updatedUser.businessSlug,
      bookingLink,
    });
  } catch (error) {
    console.error('Error updating business slug:', error);
    return NextResponse.json(
      { error: 'Failed to update business slug' },
      { status: 500 }
    );
  }
}
