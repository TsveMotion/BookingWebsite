import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/ensure-user';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);

    const teamMembers = await prisma.teamMember.findMany({
      where: { ownerId: userId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            locationId: true,
            assignedLocation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
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

    await ensureUserExists(userId);

    const body = await request.json();
    const { email, name, role, permissions, locationId } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create team member invitation
    const teamMember = await prisma.teamMember.create({
      data: {
        ownerId: userId,
        memberId: existingUser?.id || null,
        email,
        name,
        role: role || 'staff',
        permissions: permissions || {},
        status: 'pending',
      },
    });

    // If user exists and locationId provided, assign them to location
    if (existingUser && locationId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { locationId },
      });
    }

    // Mark team as invited for onboarding progress
    await prisma.user.update({
      where: { id: userId },
      data: { teamInvited: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Team member invited successfully',
      teamMember,
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
