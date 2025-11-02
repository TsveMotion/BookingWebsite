import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * POST - Create Stripe Checkout session for subscription
 * Prevents duplicate subscriptions by checking existing subscription
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planName, billingPeriod } = body;

    if (!planName || !billingPeriod) {
      return NextResponse.json(
        { error: "Plan name and billing period are required" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const primaryEmail =
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        clerkUser.primaryEmailAddress?.emailAddress;

      if (!primaryEmail) {
        return NextResponse.json(
          { error: "No email found" },
          { status: 400 }
        );
      }

      user = await prisma.user.create({
        data: {
          id: clerkUser.id,
          email: primaryEmail,
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" "),
          plan: "free",
        },
      });
    }

    // Get price ID from ENV
    const envKey = `STRIPE_${planName.toUpperCase()}_${billingPeriod.toUpperCase()}_PRICE_ID`;
    const priceId = process.env[envKey];

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not found for ${planName} ${billingPeriod}. Please add ${envKey} to .env` },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    if (user.stripeSubscriptionId) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        if (existingSub.status === 'active' || existingSub.status === 'trialing') {
          // User has active subscription - redirect to portal to manage it
          const portal = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId!,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
          });

          return NextResponse.json({
            error: "You already have an active subscription. Use the billing portal to change plans.",
            redirectToPortal: true,
            portalUrl: portal.url,
          });
        }
      } catch (subError) {
        console.log("Existing subscription not found or invalid, continuing with new checkout");
      }
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
          plan: planName,
          billingPeriod,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
