import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentLinkEmail } from '@/lib/resend-email';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const bookingId = params.id;

    // Fetch booking with client and service details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            businessName: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify booking belongs to this user's business
    if (booking.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if booking has a payment link
    if (!booking.paymentLink) {
      return NextResponse.json(
        { error: 'No payment link available for this booking' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'This booking is already paid' },
        { status: 400 }
      );
    }

    // Format date and time
    const formattedDate = new Date(booking.startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedTime = new Date(booking.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const businessName = booking.user.businessName || booking.user.name || 'Your Business';

    // Resend payment link email
    const emailResult = await sendPaymentLinkEmail(
      booking.client.email,
      booking.client.name,
      booking.paymentLink,
      {
        businessName,
        serviceName: booking.service.name,
        date: formattedDate,
        time: formattedTime,
        price: booking.totalAmount,
      }
    );

    if (!emailResult.success) {
      console.error('Failed to resend payment link email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`✅ Payment link resent to ${booking.client.email}`);

    return NextResponse.json({ 
      success: true,
      message: 'Payment link resent successfully' 
    });
  } catch (error) {
    console.error('Error resending payment link:', error);
    return NextResponse.json(
      { error: 'Failed to resend payment link' },
      { status: 500 }
    );
  }
}
