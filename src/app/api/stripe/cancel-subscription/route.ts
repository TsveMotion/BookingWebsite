import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * POST - Cancel user's subscription
 * Can cancel immediately or at period end
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { immediately = false } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        subscriptionPlan: true,
        stripeCustomerId: true,
      },
    });

    if (!user?.subscriptionPlan) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.update(
      user.subscriptionPlan,
      {
        cancel_at_period_end: !immediately,
        ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
      }
    );

    // Update user in database
    if (immediately) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: "free",
          subscriptionStatus: "canceled",
          subscriptionPlan: null,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "active",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: immediately 
        ? "Subscription canceled immediately"
        : "Subscription will cancel at the end of the billing period",
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAt: canceledSubscription.cancel_at 
          ? new Date(canceledSubscription.cancel_at * 1000)
          : null,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
