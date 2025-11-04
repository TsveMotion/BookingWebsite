import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe-server";

/**
 * GET - Fetch Stripe Connect account status for billing page
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
        stripeAccountId: true,
        totalEarnings: true,
      },
    });

    if (!user?.stripeAccountId) {
      return NextResponse.json({ 
        connected: false,
        totalEarnings: user?.totalEarnings || 0,
      });
    }

    // Get Stripe Connect account details
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    
    // Get balance
    let balance = null;
    try {
      balance = await stripe.balance.retrieve({
        stripeAccount: user.stripeAccountId,
      });
    } catch (balanceError) {
      console.log('Could not fetch balance:', balanceError);
    }

    return NextResponse.json({
      connected: true,
      accountId: user.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      totalEarnings: user.totalEarnings || 0,
      availableBalance: balance?.available?.[0]?.amount || 0,
      pendingBalance: balance?.pending?.[0]?.amount || 0,
      currency: balance?.available?.[0]?.currency || 'gbp',
      email: account.email,
      country: account.country,
    });
  } catch (error) {
    console.error("Error fetching Connect status:", error);
    return NextResponse.json(
      { error: "Failed to fetch Connect status" },
      { status: 500 }
    );
  }
}
