import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ensureUserExists } from '@/lib/ensure-user';
import { sendEmail } from '@/lib/resend-email';
import { teamInvitationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUserExists(userId);

    // Check user plan and get business info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, businessName: true, name: true },
    });

    const isPro = user?.plan?.toLowerCase() === 'pro' || user?.plan?.toLowerCase() === 'business';

    if (!isPro) {
      return NextResponse.json(
        { error: 'Feature available on Pro plan only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, permissions } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if already invited
    const existing = await prisma.teamMember.findFirst({
      where: {
        ownerId: userId,
        email,
        status: 'Pending',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Team member already invited' },
        { status: 400 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        ownerId: userId,
        email,
        role: role || 'Staff',
        status: 'Pending',
        permissions: permissions || {},
        inviteToken,
        expiresAt,
      },
    });

    // Send email invitation via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const businessName = user?.businessName || user?.name || 'GlamBooking Business';
    
    const emailHtml = teamInvitationEmail(
      businessName,
      role || 'Staff',
      inviteToken,
      appUrl
    );

    const emailResult = await sendEmail({
      to: email,
      subject: `You've been invited to join ${businessName} on GlamBooking!`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error(`❌ Failed to send invitation email to ${email}:`, emailResult.error);
      // Delete the team member since email failed
      await prisma.teamMember.delete({ where: { id: teamMember.id } });
      return NextResponse.json(
        { error: `Failed to send invitation email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log(`📧 Invitation email sent successfully to ${email}`);
  

    // Mark team invited for onboarding progress
    await prisma.user.update({
      where: { id: userId },
      data: { teamInvited: true },
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
