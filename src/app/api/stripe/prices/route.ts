import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const formattedPrices = prices.data.map((price) => ({
      id: price.id,
      lookupKey: price.lookup_key,
      amount: price.unit_amount ? price.unit_amount / 100 : 0,
      currency: price.currency,
      interval: price.recurring?.interval,
      product: price.product,
    }));

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
