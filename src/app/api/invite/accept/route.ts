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
    if (invite.status.toLowerCase() === 'active') {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    // Use a transaction to handle user creation/update atomically
    let user = await prisma.$transaction(async (tx) => {
      // First check if user exists by Clerk ID
      let existingUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (existingUser) {
        // User exists by Clerk ID - just connect them to the business
        return await tx.user.update({
          where: { id: userId },
          data: {
            businessId: invite.ownerId,
            email: existingUser.email || invite.email,
          },
        });
      }

      // User not found by Clerk ID - check by email (might be pre-created)
      const userByEmail = await tx.user.findUnique({
        where: { email: invite.email },
      });

      if (userByEmail) {
        // Pre-created user exists - need to delete and recreate with correct Clerk ID
        // First delete all related data to avoid constraint issues
        await tx.client.deleteMany({ where: { userId: userByEmail.id } });
        await tx.service.deleteMany({ where: { userId: userByEmail.id } });
        await tx.booking.deleteMany({ where: { userId: userByEmail.id } });
        await tx.location.deleteMany({ where: { ownerId: userByEmail.id } });
        await tx.teamMember.deleteMany({ where: { memberId: userByEmail.id } });
        
        // Now delete the old user
        await tx.user.delete({
          where: { id: userByEmail.id },
        });
        
        // Create fresh with correct Clerk ID and connect to business
        return await tx.user.create({
          data: {
            id: userId,
            email: invite.email,
            businessId: invite.ownerId,
            plan: 'free',
          },
        });
      }

      // Brand new user - create them
      return await tx.user.create({
        data: {
          id: userId,
          email: invite.email,
          businessId: invite.ownerId,
          plan: 'free',
        },
      });
    });

    console.log(`✅ User ${user.id} connected to business ${invite.ownerId}`);

    // Update team member invitation
    await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        status: 'active',
        memberId: userId,
        name: user.name || invite.name,
        inviteToken: null, // Clear the token after acceptance
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
