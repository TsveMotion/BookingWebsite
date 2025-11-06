import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessSlug,
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      locationId,
      staffId,
      startTime,
      notes,
    } = body;

    // Ensure APP_URL has proper scheme
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"}`;

    // Get business owner
    const business = await prisma.user.findUnique({
      where: { businessSlug },
      select: { id: true, stripeAccountId: true, businessName: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { name: true, price: true, duration: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // No platform fee (0% commission as per requirements)
    const totalAmount = service.price;
    const platformFee = 0; // 0% commission
    const businessAmount = Math.round(totalAmount * 100);

    // Create or find client
    let client = await prisma.client.findFirst({
      where: { email: clientEmail, userId: business.id },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: business.id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone || "",
          notes: "",
        },
      });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + service.duration);

    // Create pending booking
    const booking = await prisma.booking.create({
      data: {
        userId: business.id,
        clientId: client.id,
        serviceId,
        locationId: locationId || null,
        staffId: staffId || null,
        startTime: start,
        endTime: end,
        totalAmount,
        status: "pending",
        paymentStatus: "PENDING",
        notes,
      },
    });

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: service.name,
              description: `${service.duration} minutes with ${business.businessName}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/book/${businessSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book/${businessSlug}`,
      customer_email: clientEmail,
      metadata: {
        bookingId: booking.id,
        businessId: business.id,
        clientId: client.id,
      },
    };

    // If business has Stripe Connect, use it
    if (business.stripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: business.stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update booking with session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
