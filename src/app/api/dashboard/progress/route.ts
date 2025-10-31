import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists, create if not (avoiding P2002 error)
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        servicesAdded: true,
        scheduleConfigured: true,
        teamInvited: true,
        bookingsReceived: true,
        _count: {
          select: {
            services: true,
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `user-${userId}@temp.com`, // Temporary email, will be synced
        },
        select: {
          profileCompleted: true,
          servicesAdded: true,
          scheduleConfigured: true,
          teamInvited: true,
          bookingsReceived: true,
          _count: {
            select: {
              services: true,
              bookings: true,
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate actual completion status
    const servicesAdded = user.servicesAdded || user._count.services > 0;
    const firstBookingReceived = user.bookingsReceived || user._count.bookings > 0;

    const tasks = [
      user.profileCompleted,
      servicesAdded,
      user.scheduleConfigured,
      user.teamInvited,
      firstBookingReceived,
    ];

    const totalCompleted = tasks.filter(Boolean).length;
    const progress = Math.round((totalCompleted / 5) * 100);

    // If onboarding complete banner was already shown, hide the checklist
    const allComplete = user.profileCompleted && user.servicesAdded && 
      user.scheduleConfigured && user.teamInvited && user.bookingsReceived;

    // Simplified: removed onboardingCompleteShown check since field not in schema

    return NextResponse.json({
      profileCompleted: user.profileCompleted,
      servicesAdded: user.servicesAdded,
      scheduleConfigured: user.scheduleConfigured,
      teamInvited: user.teamInvited,
      bookingsReceived: user.bookingsReceived,
      totalCompleted,
      progress,
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value } = body;

    const validFields = ['profileCompleted', 'servicesAdded', 'scheduleConfigured', 'teamInvited', 'bookingsReceived'];
    
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!existingUser) {
      // Create user if doesn't exist
      await prisma.user.create({
        data: {
          id: userId,
          email: `user-${userId}@temp.com`,
          [field]: value,
        },
      });
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: userId },
        data: { [field]: value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}
