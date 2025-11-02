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

    // Pricing: 500 credits = £2.99, 1000 credits = £4.95
    const price = amount === 500 ? 299 : 495; // in pence
    const description = amount === 500 ? "500 SMS Credits" : "1000 SMS Credits - Best Value";

    // Create or use existing customer
    let customerId = user?.stripeCustomerId;
    if (!customerId && user?.email) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
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
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${amount} SMS Credits`,
              description: description,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=sms`,
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
    await prisma.smsPurchase.create({
      data: {
        userId,
        credits: amount,
        amount: price / 100,
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
