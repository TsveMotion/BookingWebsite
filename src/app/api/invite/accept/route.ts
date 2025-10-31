import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, teamWelcomeEmail } from '@/lib/email';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get current authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to accept an invitation' },
        { status: 401 }
      );
    }

    // Find the invitation
    const invite = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: {
        owner: {
          select: {
            id: true,
            businessName: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 404 });
    }

    // Check if expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if already accepted
    if (invite.status === 'Active') {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    // Get or create user in our database
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create user record if doesn't exist
      user = await prisma.user.create({
        data: {
          id: userId,
          email: invite.email,
          plan: 'free',
        },
      });
    }

    // Verify email matches
    if (user.email !== invite.email) {
      return NextResponse.json(
        { error: 'Your account email does not match the invitation email' },
        { status: 400 }
      );
    }

    // Update user with business connection
    await prisma.user.update({
      where: { id: userId },
      data: {
        businessId: invite.ownerId,
      },
    });

    // Update team member invitation
    await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        status: 'Active',
        memberId: userId,
        name: user.name,
      },
    });

    // Send welcome email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const businessName = invite.owner.businessName || invite.owner.name || 'GlamBooking Business';

    const welcomeHtml = teamWelcomeEmail(user.name || 'Team Member', businessName, appUrl);

    await sendEmail({
      to: invite.email,
      subject: `Welcome to ${businessName} on GlamBooking!`,
      html: welcomeHtml,
      name: user.name || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
