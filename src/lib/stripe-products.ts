import { stripe } from './stripe-server';
import { prisma } from './prisma';

export const PLAN_CONFIGS = {
  pro: {
    name: 'GlamBooking Pro',
    description: 'Perfect for growing beauty businesses',
    monthly: 19.99,
    yearly: 203.90, // 15% off (19.99 * 12 * 0.85)
    features: [
      'Unlimited staff',
      'SMS reminders',
      'Loyalty & retention tools',
      'Remove branding',
      'Priority support',
      'Advanced analytics',
    ],
  },
  business: {
    name: 'GlamBooking Business',
    description: 'For multi-location salons & spas',
    monthly: 39.99,
    yearly: 407.90, // 15% off (39.99 * 12 * 0.85)
    features: [
      'Multi-location support',
      'Team roles & staff permissions',
      'Advanced reporting',
      'AI Booking Assistant (priority access)',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
};

export async function initializeStripeProducts() {
  try {
    // Check if products already exist in database
    const existingProducts = await prisma.stripeProduct.findMany();
    
    if (existingProducts.length >= 4) {
      // Already initialized (2 plans x 2 periods = 4 products)
      console.log('✅ Stripe products already initialized');
      return;
    }

    console.log('🔄 Initializing Stripe products...');

    for (const [planKey, config] of Object.entries(PLAN_CONFIGS)) {
      // Create monthly price
      const monthlyProduct = await createOrUpdateStripeProduct(
        planKey as 'pro' | 'business',
        'monthly',
        config.monthly,
        config.name,
        config.description
      );

      // Create yearly price
      const yearlyProduct = await createOrUpdateStripeProduct(
        planKey as 'pro' | 'business',
        'yearly',
        config.yearly,
        config.name,
        config.description
      );

      console.log(`✅ Created ${config.name} - Monthly & Yearly`);
    }

    console.log('✅ All Stripe products initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Stripe products:', error);
    throw error;
  }
}

async function createOrUpdateStripeProduct(
  planName: 'pro' | 'business',
  billingPeriod: 'monthly' | 'yearly',
  amount: number,
  name: string,
  description: string
) {
  // Check if already exists in DB
  const existing = await prisma.stripeProduct.findUnique({
    where: {
      planName_billingPeriod: {
        planName,
        billingPeriod,
      },
    },
  });

  if (existing) {
    return existing;
  }

  // Create Stripe product
  const product = await stripe.products.create({
    name: `${name} - ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`,
    description,
    metadata: {
      plan: planName,
      billing_period: billingPeriod,
    },
  });

  // Create Stripe price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100), // Convert to pence
    currency: 'gbp',
    recurring: {
      interval: billingPeriod === 'monthly' ? 'month' : 'year',
    },
    metadata: {
      plan: planName,
      billing_period: billingPeriod,
    },
  });

  // Store in database using upsert to prevent duplicates
  const stripeProduct = await prisma.stripeProduct.upsert({
    where: {
      planName_billingPeriod: {
        planName,
        billingPeriod,
      },
    },
    update: {
      productId: product.id,
      priceId: price.id,
      amount,
      currency: 'gbp',
    },
    create: {
      planName,
      billingPeriod,
      productId: product.id,
      priceId: price.id,
      amount,
      currency: 'gbp',
    },
  });

  return stripeProduct;
}

export async function getStripePriceId(
  planName: 'pro' | 'business',
  billingPeriod: 'monthly' | 'yearly'
): Promise<string> {
  const product = await prisma.stripeProduct.findUnique({
    where: {
      planName_billingPeriod: {
        planName,
        billingPeriod,
      },
    },
  });

  if (!product) {
    throw new Error(`Stripe product not found for ${planName} ${billingPeriod}`);
  }

  return product.priceId;
}
