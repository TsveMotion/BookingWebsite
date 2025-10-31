import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, bookingStatusChangeEmail } from '@/lib/email';

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }
    const body = await request.json();
    const { status } = body;

    // Get current booking to check old status
    const currentBooking = await prisma.booking.findUnique({
      where: { id, userId },
      include: {
        client: true,
        service: true,
      },
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const oldStatus = currentBooking.status;

    // Update booking
    const booking = await prisma.booking.update({
      where: {
        id,
        userId,
      },
      data: {
        status,
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Send email notification if status changed
    if (oldStatus !== status && booking.client.email) {
      console.log(`📧 Sending status change email to ${booking.client.email}`);

      // Get user profile for business name
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: { businessName: true, name: true },
      });

      const businessName = userProfile?.businessName || userProfile?.name || 'Your Business';

      const formattedDate = booking.startTime.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const formattedTime = booking.startTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const emailHtml = bookingStatusChangeEmail(
        booking.client.name,
        businessName,
        booking.service?.name || 'Service',
        formattedDate,
        formattedTime,
        oldStatus,
        status
      );

      const emailResult = await sendEmail({
        to: booking.client.email,
        subject: `📅 Booking Status Update - ${booking.service?.name || 'Your Booking'}`,
        html: emailHtml,
        name: booking.client.name,
      });

      if (emailResult.success) {
        console.log(`✅ Status change email sent successfully to ${booking.client.email}`);
      } else {
        console.error(`❌ Failed to send status change email:`, emailResult.error);
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    await prisma.booking.delete({
      where: {
        id,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
