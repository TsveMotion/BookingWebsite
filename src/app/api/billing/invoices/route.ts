import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { cacheFetch, cacheKeys } from "@/lib/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * GET - Fetch billing history and invoices from Stripe
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Redis cache with 5 minute TTL
    const cacheKey = cacheKeys.billing.invoices(userId);
    const data = await cacheFetch(
      cacheKey,
      async () => {
        return await fetchInvoicesData(userId);
      },
      300 // 5 minutes TTL
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching billing invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

async function fetchInvoicesData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json([]);
    }

    // Fetch Stripe invoices
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 20,
    });

    // Fetch SMS credit purchases from database
    const smsPurchases = await prisma.smsPurchase.findMany({
      where: { 
        userId,
        status: "completed",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Combine and format all billing history
    const billingHistory = [
      ...invoices.data.map((invoice) => ({
        id: invoice.id,
        type: "subscription" as const,
        date: new Date(invoice.created * 1000).toISOString(),
        description: invoice.lines.data[0]?.description || "Subscription payment",
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: invoice.status,
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      })),
      ...smsPurchases.map((purchase) => ({
        id: purchase.id,
        type: "sms_credits" as const,
        date: purchase.createdAt.toISOString(),
        description: `${purchase.credits} SMS Credits`,
        amount: purchase.amount,
        currency: purchase.currency.toUpperCase(),
        status: "paid",
        invoiceUrl: null,
        invoicePdf: null,
      })),
    ];

    // Sort by date descending
    billingHistory.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return billingHistory;
}
