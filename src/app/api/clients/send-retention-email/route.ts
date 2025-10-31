import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

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

    // Create retention email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #E9B5D8, #C9A5D6); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; font-size: 16px; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💜 We Miss You!</h1>
          </div>
          <div class="content">
            <p>Hi ${client.name},</p>
            <p>It's been a while since we last saw you at <strong>${businessName}</strong>, and we wanted to reach out!</p>
            <p>We'd love to welcome you back and help you look and feel your best. Our team has been thinking of you and would be thrilled to see you again.</p>
            <p><strong>Special Offer:</strong> Book your next appointment this month and enjoy a complimentary upgrade on your favorite service! 💅✨</p>
            <center>
              <a href="https://glambooking.co.uk/book" class="button">Book Your Appointment</a>
            </center>
            <p style="margin-top: 30px;">We're here whenever you're ready. Looking forward to seeing you soon!</p>
            <p>With love,<br><strong>${businessName}</strong></p>
          </div>
          <div class="footer">
            <p>Powered by GlamBooking.co.uk</p>
            <p>The UK's #1 Beauty Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail({
      to: client.email,
      subject: `We Miss You! Come Back to ${businessName} 💜`,
      html: emailHtml,
      name: client.name,
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
