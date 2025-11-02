import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/ensure-user';
import { sendEmail, teamInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getBusinessOwnerId } from '@/lib/get-business-owner';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);

    // Get the actual business owner ID (in case this user is a staff member)
    const ownerId = await getBusinessOwnerId(userId);

    const teamMembers = await prisma.teamMember.findMany({
      where: { ownerId },
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

    // Get the actual business owner ID (in case this user is a staff member)
    const ownerId = await getBusinessOwnerId(userId);

    const body = await request.json();
    const { email, name, role, permissions, locationId } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Get owner details
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { businessName: true, name: true },
    });

    const businessName = owner?.businessName || owner?.name || 'Your Business';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Delete any existing pending invites for this email to prevent conflicts
    await prisma.teamMember.deleteMany({
      where: {
        ownerId,
        email,
        status: 'pending',
      },
    });

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create team member invitation
    // Always create with pending status and invite token, even for existing users
    // They need to accept the invitation to join this specific business
    const teamMember = await prisma.teamMember.create({
      data: {
        ownerId,
        memberId: existingUser?.id || null,
        email,
        name,
        role: role || 'staff',
        permissions: permissions || {},
        status: 'pending',
        inviteToken: inviteToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // If user exists and locationId provided, assign them to location
    if (existingUser && locationId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { locationId },
      });
    }

    // Always send invitation email (even if user exists)
    // If user exists, they'll get an email to accept the team role
    if (true) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glambooking.co.uk';
      const emailHtml = teamInvitationEmail(
        businessName,
        role || 'staff',
        inviteToken,
        appUrl
      );

      const emailResult = await sendEmail({
        to: email,
        name,
        subject: `You've been invited to join ${businessName} on GlamBooking`,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error(`❌ Failed to send invitation email to ${email}:`, emailResult.error);
        // Delete the team member since email failed
        await prisma.teamMember.delete({ where: { id: teamMember.id } });
        return NextResponse.json(
          { error: 'Failed to send invitation email. Please check your email configuration.' },
          { status: 500 }
        );
      }

      console.log(`📧 Invitation email sent successfully to ${email}`);
      
      if (existingUser) {
        console.log(`ℹ️ User ${email} already exists - they will need to accept to join this business`);
      }
    }

    // Mark team as invited for onboarding progress
    await prisma.user.update({
      where: { id: ownerId },
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
