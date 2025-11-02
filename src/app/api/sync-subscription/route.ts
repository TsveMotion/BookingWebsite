import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * POST - Manually sync subscription from Stripe to database
 * Use this when webhook hasn't fired yet after checkout
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, plan: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    console.log("🔄 Syncing subscription for customer:", user.stripeCustomerId);

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSubscription) {
      console.log("❌ No active subscription found in Stripe");
      return NextResponse.json({
        success: false,
        message: "No active subscription found in Stripe",
        currentPlan: user.plan,
      });
    }

    // Extract plan info from subscription
    const priceId = activeSubscription.items.data[0]?.price.id;
    const priceNickname = activeSubscription.items.data[0]?.price.nickname;
    const interval = activeSubscription.items.data[0]?.price.recurring?.interval;

    // Determine plan from price ID or nickname
    let planName = "free";
    let displayName = "Free";

    if (priceId) {
      const isYearly = interval === "year";

      if (
        priceId.includes(process.env.STRIPE_PRO_MONTHLY_PRICE_ID!) ||
        priceId.includes(process.env.STRIPE_PRO_YEARLY_PRICE_ID!) ||
        priceNickname?.toLowerCase().includes("pro")
      ) {
        planName = "pro";
        displayName = isYearly ? "Pro Plan (Yearly)" : "Pro Plan (Monthly)";
      } else if (
        priceId.includes(process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!) ||
        priceId.includes(process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!) ||
        priceNickname?.toLowerCase().includes("business")
      ) {
        planName = "business";
        displayName = isYearly
          ? "Business Plan (Yearly)"
          : "Business Plan (Monthly)";
      }
    }

    // Set SMS credits based on plan
    let smsCredits = 0;
    if (planName === "pro") {
      smsCredits = 250;
    } else if (planName === "business") {
      smsCredits = 1000;
    }

    console.log("📊 Updating user to plan:", displayName);

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: activeSubscription.id,
        subscriptionStatus: activeSubscription.status,
        plan: planName,
        smsCredits: smsCredits,
        smsCreditsUsed: 0,
        smsCreditsRenewDate: new Date(),
      },
    });

    console.log("✅ Subscription synced successfully!");

    return NextResponse.json({
      success: true,
      message: "Subscription synced successfully",
      plan: planName,
      displayName: displayName,
      status: activeSubscription.status,
      subscriptionId: activeSubscription.id,
      smsCredits: smsCredits,
    });
  } catch (error: any) {
    console.error("❌ Error syncing subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to sync subscription",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
