import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invitation
    const invite = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: {
        owner: {
          select: {
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

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      businessName: invite.owner.businessName || invite.owner.name || 'GlamBooking Business',
      permissions: invite.permissions,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
