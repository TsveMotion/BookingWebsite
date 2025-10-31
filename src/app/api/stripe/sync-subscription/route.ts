import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

interface SyncSubscriptionRequest {
  subscriptionId?: string;
  planName?: string;
  billingPeriod?: 'monthly' | 'yearly';
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

function errorResponse(error: string, status = 400, details?: unknown) {
  return NextResponse.json<ErrorResponse>({ error, details }, { status });
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const body = (await request.json()) as SyncSubscriptionRequest;
    const { subscriptionId, planName: planOverride, billingPeriod: billingOverride } = body || {};

    if (!subscriptionId) {
      return errorResponse('Missing subscriptionId', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'latest_invoice.payment_intent', 'items.data.price.product'],
    });

    if (!subscription) {
      return errorResponse('Subscription not found in Stripe', 404);
    }

    // Extract customer ID - handle both string and expanded object
    const stripeCustomerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    console.log('🔍 Sync-subscription check:', {
      userId: user.id,
      userEmail: user.email,
      userStoredCustomerId: user.stripeCustomerId,
      subscriptionCustomerId: stripeCustomerId,
      subscriptionId,
      subscriptionStatus: subscription.status,
    });

    // Update customer ID if not set or mismatched
    // The subscription creation already validated the user, so we trust it
    if (!user.stripeCustomerId) {
      console.log('📝 Setting customer ID for user (first subscription)');
    } else if (user.stripeCustomerId !== stripeCustomerId) {
      console.warn('⚠️ Customer ID mismatch - updating to match subscription', {
        stored: user.stripeCustomerId,
        fromSubscription: stripeCustomerId,
      });
    }

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

    const metadataPlan = subscription.metadata?.plan;
    const metadataBilling = subscription.metadata?.billingPeriod as 'monthly' | 'yearly' | undefined;

    const resolvedPlan = (planOverride || metadataPlan || user.plan || 'free').toLowerCase();
    const resolvedBilling = billingOverride || metadataBilling || 'monthly';
    const subscriptionStatus = subscription.status;

    const shouldActivatePlan = subscriptionStatus === 'active' || paymentIntent?.status === 'succeeded';

    console.log('✨ Updating user with subscription data:', {
      planToSet: shouldActivatePlan ? resolvedPlan : user.plan,
      shouldActivatePlan,
      subscriptionStatus,
      paymentIntentStatus: paymentIntent?.status,
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: stripeCustomerId, // Always update to subscription's customer ID
        subscriptionPlan: subscription.id,
        subscriptionStatus,
        plan: shouldActivatePlan ? resolvedPlan : user.plan,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        plan: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    console.log('✅ User subscription synced successfully!', {
      userId: updatedUser.id,
      plan: updatedUser.plan,
      status: updatedUser.subscriptionStatus,
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionId: updatedUser.subscriptionPlan,
      billingPeriod: resolvedBilling,
    });
  } catch (error) {
    console.error('❌ sync-subscription error:', error);
    return errorResponse(
      'Failed to sync subscription',
      500,
      error instanceof Error ? { message: error.message, stack: error.stack } : error
    );
  }
}
