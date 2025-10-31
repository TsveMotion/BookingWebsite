import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendEmail, paymentLinkEmail, bookingConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
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

    const body = await request.json();
    const { clientId, serviceId, startTime, endTime, totalAmount, notes, status, paymentType } = body;

    // Get client and service details for payment link
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!client || !service) {
      return NextResponse.json(
        { error: 'Client or service not found' },
        { status: 404 }
      );
    }

    let paymentLink = null;
    let paymentStatus: 'PENDING' | 'PAID' | 'UNPAID' = 'PENDING';

    // Create Stripe Payment Link if online payment selected
    if (paymentType === 'online') {
      try {
        // Create a price for this specific booking
        const price = await stripe.prices.create({
          currency: 'gbp',
          unit_amount: Math.round(totalAmount * 100), // Convert to pence
          product_data: {
            name: `${service.name} - Booking for ${client.name}`,
          },
        });

        // Create payment link
        const link = await stripe.paymentLinks.create({
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          after_completion: {
            type: 'redirect',
            redirect: {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?amount=${totalAmount}&service=${encodeURIComponent(service.name)}`,
            },
          },
          metadata: {
            bookingId: '', // Will be updated after booking creation
            clientEmail: client.email,
            clientName: client.name,
          },
        });

        paymentLink = link.url;
        paymentStatus = 'PENDING';
      } catch (stripeError) {
        console.error('Failed to create Stripe payment link:', stripeError);
        // Continue with booking creation even if payment link fails
      }
    } else if (paymentType === 'manual') {
      paymentStatus = 'UNPAID';
    }

    // Get user profile for business name
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessName: true, name: true },
    });

    const businessName = userProfile?.businessName || userProfile?.name || 'Your Business';

    const booking = await prisma.booking.create({
      data: {
        userId,
        clientId,
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalAmount,
        notes: notes || null,
        status: status || 'pending',
        paymentStatus,
        paymentLink,
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Format date and time for email
    const formattedDate = new Date(startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedTime = new Date(startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send email to client
    if (client.email) {
      let emailHtml: string;
      let emailSubject: string;

      if (paymentLink) {
        // Send payment link email
        console.log(`📧 Sending payment link to ${client.email}`);
        emailHtml = paymentLinkEmail(
          client.name,
          businessName,
          service.name,
          formattedDate,
          formattedTime,
          totalAmount,
          paymentLink
        );
        emailSubject = `💳 Payment Required - ${service.name} Booking`;
      } else {
        // Send booking confirmation email
        console.log(`📧 Sending booking confirmation to ${client.email}`);
        emailHtml = bookingConfirmationEmail(
          client.name,
          businessName,
          service.name,
          formattedDate,
          formattedTime,
          totalAmount,
          paymentType === 'manual'
        );
        emailSubject = `✨ Booking Confirmed - ${service.name}`;
      }

      const emailResult = await sendEmail({
        to: client.email,
        subject: emailSubject,
        html: emailHtml,
        name: client.name,
      });

      if (emailResult.success) {
        console.log(`✅ Email sent successfully to ${client.email}`);
      } else {
        console.error(`❌ Failed to send email:`, emailResult.error);
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
