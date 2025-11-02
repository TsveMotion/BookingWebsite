import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

const PLAN_PRICES: Record<'pro' | 'business', string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    const allowedPlans = ['pro', 'business'] as const;
    if (!plan || !allowedPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerEmail = user.email?.trim();

    if (!customerEmail) {
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        type ClerkEmail = (typeof clerkUser.emailAddresses)[number];

        const primaryEmail = clerkUser.emailAddresses.find(
          (address: ClerkEmail) => address.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;

        customerEmail =
          primaryEmail ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          '';
      } catch (error) {
        console.error('Failed to fetch email from Clerk:', error);
      }
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Unable to determine customer email address' }, { status: 400 });
    }

    // Create Stripe Checkout session for subscription
    const planKey = plan as (typeof allowedPlans)[number];
    const priceId = PLAN_PRICES[planKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Selected plan is not configured.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
