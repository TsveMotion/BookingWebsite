import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * POST - Update user's subscription plan (upgrade/downgrade)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planName, billingPeriod } = body;

    if (!planName) {
      return NextResponse.json(
        { error: "Plan name is required" },
        { status: 400 }
      );
    }

    // Handle downgrade to free plan
    if (planName === "free") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (user?.subscriptionPlan) {
        // Cancel subscription at period end
        await stripe.subscriptions.update(user.subscriptionPlan, {
          cancel_at_period_end: true,
        });

        return NextResponse.json({
          success: true,
          message: "Subscription will be canceled at the end of the billing period",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Already on free plan",
      });
    }

    if (!billingPeriod) {
      return NextResponse.json(
        { error: "Billing period is required for paid plans" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeCustomerId: true,
        subscriptionPlan: true,
        email: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get price IDs from environment
    const priceIds: Record<string, { monthly: string; yearly: string }> = {
      pro: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
      },
      business: {
        monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
        yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",
      },
    };

    const priceId = priceIds[planName]?.[billingPeriod as "monthly" | "yearly"];

    if (!priceId) {
      return NextResponse.json(
        { 
          error: `Price ID not configured for ${planName} ${billingPeriod}. Please set STRIPE_${planName.toUpperCase()}_${billingPeriod.toUpperCase()}_PRICE_ID in environment variables.` 
        },
        { status: 400 }
      );
    }

    // If user has existing subscription, update it
    if (user.subscriptionPlan && user.stripeCustomerId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionPlan);
        
        // Update the subscription with new price
        const updatedSubscription = await stripe.subscriptions.update(
          user.subscriptionPlan,
          {
            cancel_at_period_end: false,
            items: [
              {
                id: subscription.items.data[0].id,
                price: priceId,
              },
            ],
            proration_behavior: "create_prorations",
            metadata: {
              plan: planName,
              billingPeriod,
              userId,
            },
          }
        );

        // Update user in database
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planName,
            subscriptionStatus: updatedSubscription.status,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully updated to ${planName} ${billingPeriod} plan`,
          subscription: {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          },
        });
      } catch (subError: any) {
        console.error("Error updating existing subscription:", subError);
        return NextResponse.json(
          { error: `Failed to update subscription: ${subError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create new subscription if none exists
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        // Create Stripe customer first
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

      // Create checkout session for new subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
        metadata: {
          plan: planName,
          billingPeriod,
          userId,
        },
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        message: "Redirecting to checkout...",
      });
    }
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
