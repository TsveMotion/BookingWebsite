import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, teamInvitationEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { memberId } = body;

    // Verify the member belongs to this user
    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        ownerId: userId,
        status: 'Pending',
      },
      include: {
        owner: {
          select: {
            businessName: true,
            name: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Generate new token and extend expiration
    const newToken = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        inviteToken: newToken,
        expiresAt,
      },
    });

    // Send invitation email via Brevo
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const businessName = member.owner.businessName || member.owner.name || 'GlamBooking Business';
    const inviteLink = `${appUrl}/invite/${newToken}`;

    const emailHtml = teamInvitationEmail(
      businessName,
      member.role,
      newToken,
      appUrl
    );

    const emailResult = await sendEmail({
      to: member.email,
      subject: `Reminder: Join ${businessName} on GlamBooking`,
      html: emailHtml,
      name: member.name || undefined,
    });

    if (!emailResult.success) {
      console.error(`❌ Failed to resend invitation to ${member.email}:`, emailResult.error);
      return NextResponse.json(
        { error: `Failed to resend invitation email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log(`📧 Invitation resent successfully to ${member.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully' 
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}
