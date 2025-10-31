import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, waitlistConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Store in database (you can create a Waitlist model or just log it)
    // For now, we'll send the email directly
    
    const emailResult = await sendEmail({
      to: email,
      name,
      subject: '🤖 Welcome to GlamAI Waitlist!',
      html: waitlistConfirmationEmail(name, email),
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    // Also notify the GlamBooking team
    await sendEmail({
      to: 'glambooking@glambooking.co.uk',
      subject: 'New GlamAI Waitlist Signup',
      html: `
        <h2>New GlamAI Waitlist Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${userId}</p>
      `,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined the waitlist!' 
    });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
