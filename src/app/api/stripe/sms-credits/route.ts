import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * POST - Create Stripe checkout session for SMS credits purchase
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || (amount !== 500 && amount !== 1000)) {
      return NextResponse.json(
        { error: "Invalid credit amount. Must be 500 or 1000" },
        { status: 400 }
      );
    }

    // Ensure user exists with valid email
    await ensureUserExists(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeCustomerId: true,
        email: true,
        businessName: true,
      },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "Unable to determine customer email address" },
        { status: 400 }
      );
    }

    // Use Stripe price IDs: 500 credits = £9.99, 1000 credits = £14.99
    const priceId = amount === 500 
      ? process.env.STRIPE_SMS_500_PRICE_ID 
      : process.env.STRIPE_SMS_1000_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "SMS credit pricing not configured" },
        { status: 500 }
      );
    }

    // Create or use existing customer
    let customerId = user?.stripeCustomerId;
    if (!customerId && user?.email) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { 
          userId,
          businessName: user.businessName || '',
        },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings?success=sms`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId,
        creditAmount: amount.toString(),
        type: "sms_credits",
      },
    };

    // Add customer if available
    if (customerId) {
      sessionParams.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Log the purchase intent
    const priceAmount = amount === 500 ? 9.99 : 14.99;
    await prisma.smsPurchase.create({
      data: {
        userId,
        credits: amount,
        amount: priceAmount,
        currency: "gbp",
        stripePaymentId: session.id,
        status: "pending",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating SMS credits checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
