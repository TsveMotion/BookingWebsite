import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

/**
 * POST - Test email functionality
 * Sends a test email to the authenticated user
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, businessName: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
    }

    // Send test email
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #E9B5D8 0%, #C9A5D6 50%, #B8A3D9 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .success-box { background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Test Successful!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name || 'there'},</p>
            <p>Congratulations! Your GlamBooking email system is working perfectly.</p>
            
            <div class="success-box">
              <h2 style="color: #28a745; margin: 0;">🎉 All Systems Go!</h2>
              <p style="margin: 10px 0 0 0; color: #155724;">
                Your business email notifications are now active.
              </p>
            </div>

            <p><strong>What emails will you receive?</strong></p>
            <ul style="color: #666; line-height: 1.8;">
              <li>New booking notifications</li>
              <li>Payment confirmations</li>
              <li>Subscription updates</li>
              <li>Team member invitations</li>
              <li>Client booking confirmations</li>
            </ul>

            <p>You're all set! Your clients and team will now receive professional email notifications.</p>
          </div>
          <div class="footer">
            <p>GlamBooking Email System Test</p>
            <p>Powered by GlamBooking.co.uk</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: user.email,
      name: user.name || undefined,
      subject: '✅ GlamBooking Email Test - Success!',
      html: testHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${user.email}`,
        email: user.email,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to send test email',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error },
      { status: 500 }
    );
  }
}
