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
    const { email, name } = body;

    // Mark team as invited for onboarding progress
    await prisma.user.update({
      where: { id: userId },
      data: { teamInvited: true },
    });

    return NextResponse.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
