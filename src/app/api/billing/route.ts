import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { cacheFetch, cacheKeys } from "@/lib/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * GET - Fetch current subscription and billing information
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Redis cache with 5 minute TTL for billing data
    const cacheKey = cacheKeys.billing.data(userId);
    const data = await cacheFetch(
      cacheKey,
      async () => {
        return await fetchBillingData(userId);
      },
      300 // 5 minutes TTL
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching billing information:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}

async function fetchBillingData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        plan: true,
        subscriptionStatus: true,
        smsCredits: true,
        smsCreditsUsed: true,
      },
    });

    if (!user?.stripeCustomerId) {
      // No Stripe customer = definitely free plan
      // Sync database if it's out of sync
      if (user?.plan && user.plan !== "free") {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "free", subscriptionStatus: "inactive" },
        });
      }
      
      return {
        plan: "free",
        planDisplayName: "Free",
        status: "inactive",
        nextBillingDate: null,
        amountDue: 0,
        currency: "gbp",
        paymentMethod: null,
        interval: "month",
        smsCredits: user?.smsCredits || 0,
        smsCreditsUsed: user?.smsCreditsUsed || 0,
        cancelAtPeriodEnd: false,
        cancelAt: null,
      };
    }

    // Fetch active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      expand: ["data.default_payment_method"],
      limit: 1,
    });

    const activeSubscription = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    // NO ACTIVE SUBSCRIPTION = FREE PLAN (regardless of what's in the database)
    if (!activeSubscription) {
      // Sync database to reflect reality
      if (user.plan !== "free" || user.subscriptionStatus !== "inactive") {
        await prisma.user.update({
          where: { id: userId },
          data: { 
            plan: "free", 
            subscriptionStatus: "inactive",
            stripeSubscriptionId: null,
          },
        });
      }
      
      return {
        plan: "free",
        planDisplayName: "Free",
        status: "inactive",
        nextBillingDate: null,
        amountDue: 0,
        currency: "gbp",
        paymentMethod: null,
        interval: "month",
        smsCredits: user.smsCredits || 0,
        smsCreditsUsed: user.smsCreditsUsed || 0,
        cancelAtPeriodEnd: false,
        cancelAt: null,
      };
    }

    let paymentMethodDetails = null;

    if (activeSubscription?.default_payment_method) {
      const pm = activeSubscription.default_payment_method as Stripe.PaymentMethod;
      if (pm.card) {
        paymentMethodDetails = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }
    }

    // Derive plan from ACTIVE subscription (not from database)
    let planName = "free";
    let planDisplayName = "Free";
    
    // Extract plan from the active subscription
    const priceItem = activeSubscription.items.data[0];
    const priceNickname = priceItem.price.nickname;
    const interval = priceItem.price.recurring?.interval;
    const priceId = priceItem.price.id;
    
    // Determine plan from price ID or nickname
    if (priceNickname?.toLowerCase().includes('business')) {
      planName = 'business';
      planDisplayName = `Business Plan (${interval === 'year' ? 'Yearly' : 'Monthly'})`;
    } else if (priceNickname?.toLowerCase().includes('pro')) {
      planName = 'pro';
      planDisplayName = `Pro Plan (${interval === 'year' ? 'Yearly' : 'Monthly'})`;
    } else {
      // Fallback: check price metadata or product
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
      const product = price.product as Stripe.Product;
      
      if (product.name?.toLowerCase().includes('business')) {
        planName = 'business';
        planDisplayName = `Business Plan (${interval === 'year' ? 'Yearly' : 'Monthly'})`;
      } else if (product.name?.toLowerCase().includes('pro')) {
        planName = 'pro';
        planDisplayName = `Pro Plan (${interval === 'year' ? 'Yearly' : 'Monthly'})`;
      } else {
        // Final fallback
        planDisplayName = priceNickname || product.name || 'Pro Plan';
        planName = 'pro';
      }
    }
    
    // Sync database with Stripe subscription state
    if (user.plan !== planName || user.subscriptionStatus !== activeSubscription.status) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          plan: planName,
          subscriptionStatus: activeSubscription.status,
          stripeSubscriptionId: activeSubscription.id,
        },
      });
    }

    return {
      plan: planName,
      planDisplayName,
      status: activeSubscription?.status || "inactive",
      nextBillingDate: activeSubscription
        ? new Date(activeSubscription.current_period_end * 1000).toISOString()
        : null,
      amountDue: activeSubscription
        ? (activeSubscription.items.data[0].price.unit_amount || 0) / 100
        : 0,
      currency: activeSubscription?.items.data[0].price.currency || "gbp",
      paymentMethod: paymentMethodDetails,
      interval: activeSubscription?.items.data[0].price.recurring?.interval || "month",
      smsCredits: user.smsCredits || 0,
      smsCreditsUsed: user.smsCreditsUsed || 0,
      subscriptionId: activeSubscription?.id,
      cancelAtPeriodEnd: activeSubscription?.cancel_at_period_end || false,
      cancelAt: activeSubscription?.cancel_at 
        ? new Date(activeSubscription.cancel_at * 1000).toISOString()
        : null,
    };
}
