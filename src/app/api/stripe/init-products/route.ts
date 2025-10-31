import { NextResponse } from 'next/server';
import { initializeStripeProducts } from '@/lib/stripe-products';

export async function POST() {
  try {
    await initializeStripeProducts();
    return NextResponse.json({ success: true, message: 'Stripe products initialized' });
  } catch (error: any) {
    console.error('Error initializing Stripe products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize products' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await initializeStripeProducts();
    return NextResponse.json({ success: true, message: 'Stripe products initialized' });
  } catch (error: any) {
    console.error('Error initializing Stripe products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize products' },
      { status: 500 }
    );
  }
}
