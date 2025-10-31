import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

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
      return NextResponse.json({
        plan: user?.plan || "free",
        status: "inactive",
        nextBillingDate: null,
        amountDue: 0,
        paymentMethod: null,
        smsCredits: user?.smsCredits || 0,
        smsCreditsUsed: user?.smsCreditsUsed || 0,
      });
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

    // Get plan name from price nickname or product name
    let planName = user.plan || "free";
    if (activeSubscription) {
      const priceItem = activeSubscription.items.data[0];
      planName = priceItem.price.nickname || priceItem.price.product?.toString() || user.plan || "pro";
    }

    return NextResponse.json({
      plan: planName,
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
    });
  } catch (error) {
    console.error("Error fetching billing information:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}
