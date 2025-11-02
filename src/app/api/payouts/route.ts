import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// GET - Fetch payouts for the authenticated user
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    // If no Stripe account, return empty state with helpful message
    if (!user?.stripeAccountId) {
      return NextResponse.json({
        payouts: [],
        summary: {
          availableBalance: 0,
          pendingBalance: 0,
          totalEarnings: 0,
          totalPlatformFees: 0,
          totalStripeFees: 0,
        },
        message: "Connect your Stripe account in Settings to receive payouts",
        needsStripeAccount: true,
      });
    }

    // Fetch payouts from database
    const payouts = await prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch Stripe balance and recent payouts
    let availableBalance = 0;
    let pendingBalance = 0;
    let stripePayouts: any[] = [];
    let nextPayout: any = null;
    let stripeError = null;
    
    try {
      // Fetch balance
      const balance = await stripe.balance.retrieve({
        stripeAccount: user.stripeAccountId,
      });
      availableBalance = balance.available[0]?.amount || 0;
      pendingBalance = balance.pending[0]?.amount || 0;

      // Fetch recent payouts from Stripe
      const stripePayoutsList = await stripe.payouts.list(
        { limit: 20 },
        { stripeAccount: user.stripeAccountId }
      );
      stripePayouts = stripePayoutsList.data;
      
      // Get next scheduled payout
      nextPayout = stripePayouts.find((p) => p.status === 'in_transit' || p.status === 'pending');
    } catch (error: any) {
      console.error("Error fetching Stripe data:", error);
      stripeError = error.message;
      // Continue without Stripe data if account is not fully set up
    }

    // Calculate summary stats
    const totalEarnings = await prisma.payout.aggregate({
      where: { userId, status: "paid" },
      _sum: { netAmount: true },
    });

    const totalFees = await prisma.payout.aggregate({
      where: { userId, status: "paid" },
      _sum: { platformFee: true, stripeFee: true },
    });

    return NextResponse.json({
      payouts,
      stripePayouts,
      nextPayout,
      summary: {
        availableBalance,
        pendingBalance,
        totalEarnings: totalEarnings._sum.netAmount || 0,
        totalPlatformFees: totalFees._sum.platformFee || 0,
        totalStripeFees: totalFees._sum.stripeFee || 0,
      },
      stripeError: stripeError || undefined,
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch payouts",
        message: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
