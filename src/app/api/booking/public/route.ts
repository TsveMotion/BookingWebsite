import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe-server';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/resend-email';
import { bookingConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessSlug, clientName, clientEmail, clientPhone, serviceId, startTime } = body;

    // Find the business user
    const user = await prisma.user.findUnique({
      where: { businessSlug },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Get the service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        userId: user.id,
        email: clientEmail,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
        },
      });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Create Stripe Checkout session first to get the session ID
    let stripeSessionId: string | null = null;
    let checkoutUrl: string | null = null;

    if (service.price > 0) {
      // Validate Stripe Connect account exists and is active
      if (!user.stripeAccountId) {
        return NextResponse.json(
          { error: 'This salon has not connected their Stripe account yet. Please contact them to enable online payments.' },
          { status: 400 }
        );
      }

      // Verify the Stripe account is valid and active
      try {
        const account = await stripe.accounts.retrieve(user.stripeAccountId);
        
        if (!account || account.charges_enabled === false) {
          return NextResponse.json(
            { error: 'This salon\'s payment account is not fully set up. Please contact them to complete their Stripe onboarding.' },
            { status: 400 }
          );
        }
      } catch (stripeError: any) {
        console.error('Invalid Stripe account:', stripeError);
        return NextResponse.json(
          { error: 'Invalid payment configuration. The salon needs to reconnect their Stripe account.' },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: service.name,
              description: service.description || undefined,
            },
            unit_amount: Math.round(service.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/${businessSlug}/success?booking_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/${businessSlug}`,
        customer_email: clientEmail,
        metadata: {
          bookingId: null,
          userId: user.id,
        },
        payment_intent_data: {
          application_fee_amount: 0, // 0% commission as per requirements
          transfer_data: {
            destination: user.stripeAccountId,
          },
        },
      }, {
        apiVersion: '2025-02-24.acacia',
      });

      stripeSessionId = session.id;
      checkoutUrl = session.url;
    }

    // Create booking with Stripe session ID
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        clientId: client.id,
        serviceId: service.id,
        startTime: start,
        endTime: end,
        totalAmount: service.price,
        status: 'pending',
        paymentStatus: service.price === 0 ? 'PAID' : 'PENDING',
        stripeSessionId,
      },
    });

    // Mark user as having received first booking
    await prisma.user.update({
      where: { id: user.id },
      data: { bookingsReceived: true },
    });

    // If free booking (no payment needed), send confirmation email immediately
    if (service.price === 0) {
      const formattedDate = start.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const formattedTime = start.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await sendEmail({
        to: clientEmail,
        subject: '✨ Booking Confirmed!',
        html: bookingConfirmationEmail(
          clientName,
          user.businessName || 'the business',
          service.name,
          formattedDate,
          formattedTime,
          service.price
        ),
      });
    }

    if (checkoutUrl) {
      return NextResponse.json({
        bookingId: booking.id,
        checkoutUrl,
      });
    }

    // If no Stripe, just return booking confirmation
    return NextResponse.json({ 
      bookingId: booking.id,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Error creating public booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
