import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend-email';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await request.json();

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
      include: {
        bookings: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json(
        { error: 'Client has no email address' },
        { status: 400 }
      );
    }

    // Get user profile for business name
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const businessName = user?.businessName || 'Your Business';

    // Create professional retention email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; background: #f4f4f4; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 50px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px; }
          .content { padding: 50px 40px; line-height: 1.8; color: #333; }
          .content p { margin: 0 0 20px 0; font-size: 16px; }
          .highlight { background: linear-gradient(135deg, rgba(233, 181, 216, 0.15), rgba(201, 165, 214, 0.15)); border-left: 4px solid #E9B5D8; padding: 20px; margin: 30px 0; border-radius: 4px; }
          .highlight-text { font-weight: 600; color: #8B5A8E; margin: 0; font-size: 17px; }
          .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 18px 45px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 30px 0; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(233, 181, 216, 0.4); transition: all 0.3s ease; }
          .signature { margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0; font-style: italic; color: #666; }
          .footer { text-align: center; padding: 30px; background: #fafafa; color: #888; font-size: 13px; border-top: 1px solid #e0e0e0; }
          .footer-brand { font-weight: 600; color: #8B5A8E; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We Would Love to See You Again</h1>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>I hope this message finds you well. It has been some time since your last visit to <strong>${businessName}</strong>, and we wanted to reach out personally to let you know how much we value your patronage.</p>
            <p>Our team has been thinking of you and would be delighted to welcome you back for another exceptional experience. We remain committed to providing you with the highest standard of service and care.</p>
            
            <div class="highlight">
              <p class="highlight-text">Exclusive Welcome Back Offer</p>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #666;">As a valued client, we would like to offer you a complimentary upgrade on your next appointment when booked this month.</p>
            </div>

            <center>
              <a href="https://glambooking.co.uk/book" class="button">Schedule Your Appointment</a>
            </center>

            <p style="margin-top: 35px;">We understand that life can be busy, and we are here whenever you are ready to indulge in some well-deserved self-care.</p>
            
            <div class="signature">
              <p style="margin: 0;">With warmest regards,</p>
              <p style="margin: 8px 0 0 0; font-weight: 600; font-style: normal; color: #333;">${businessName}</p>
            </div>
          </div>
          <div class="footer">
            <p class="footer-brand">GlamBooking</p>
            <p>Professional Beauty Management Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail({
      to: client.email,
      subject: `We Would Love to Welcome You Back – ${businessName}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Retention email sent successfully',
    });
  } catch (error) {
    console.error('Error sending retention email:', error);
    return NextResponse.json(
      { error: 'Failed to send retention email' },
      { status: 500 }
    );
  }
}
