import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// POST - Request manual payout
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true, businessName: true },
    });

    if (!user?.stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account connected. Please connect your Stripe account first." },
        { status: 400 }
      );
    }

    // Check Stripe balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const availableAmount = balance.available[0]?.amount || 0;

    if (availableAmount <= 0) {
      return NextResponse.json(
        { error: "No funds available for payout" },
        { status: 400 }
      );
    }

    // Create payout in Stripe
    const payout = await stripe.payouts.create(
      {
        amount: availableAmount,
        currency: "gbp",
        metadata: {
          userId,
          businessName: user.businessName || "Unknown",
        },
      },
      {
        stripeAccount: user.stripeAccountId,
      }
    );

    // Record payout in database
    await prisma.payout.create({
      data: {
        userId,
        amount: availableAmount,
        currency: "gbp",
        status: "processing",
        stripePayoutId: payout.id,
        netAmount: availableAmount,
        payoutDate: new Date(payout.arrival_date * 1000),
        metadata: {
          manual: true,
          requestedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout requested successfully",
      payout: {
        id: payout.id,
        amount: availableAmount,
        arrivalDate: new Date(payout.arrival_date * 1000),
      },
    });
  } catch (error: any) {
    console.error("Error requesting payout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request payout" },
      { status: 500 }
    );
  }
}
