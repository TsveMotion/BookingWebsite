# 🚀 GlamBooking Production Setup Guide

## ✅ Issues Fixed

### 1. **Clerk Middleware Location Error** ✓
**Problem:** `middleware.ts` was at root level, but Next.js 15 requires it in `src/` folder.

**Solution:** Moved `middleware.ts` → `src/middleware.ts`

### 2. **Stripe API Key Error** ✓
**Problem:** Server-side Stripe was being imported in client components.

**Solution:** Split into separate files:
- `src/lib/stripe-client.ts` - Client-side only
- `src/lib/stripe-server.ts` - Server-side only

### 3. **API Route Authentication** ✓
**Problem:** `auth()` calls failing because middleware wasn't running.

**Solution:** Fixed middleware location + proper route protection.

---

## 📁 Final File Structure

```
glamfullsystem/
├── src/
│   ├── middleware.ts              ← MOVED HERE (was at root)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-customer/route.ts
│   │   │   │   ├── create-setup-intent/route.ts
│   │   │   │   ├── create-subscription/route.ts
│   │   │   │   ├── webhook/route.ts
│   │   │   │   └── prices/route.ts
│   │   │   └── user/
│   │   │       └── subscription/route.ts
│   │   └── ...
│   ├── components/
│   │   └── payment-modal.tsx
│   └── lib/
│       ├── stripe-client.ts       ← CLIENT-SIDE ONLY
│       ├── stripe-server.ts       ← SERVER-SIDE ONLY
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env                           ← Development
├── .env.local                     ← Local overrides
└── .env.production                ← Production (Vercel)
```

---

## 🔐 Environment Variables

### Local Development (`.env.local`)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe CLI or dashboard

# Database
DATABASE_URL="postgres://..."
```

### Production (Vercel Environment Variables)

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `CLERK_SECRET_KEY` | `sk_live_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `DATABASE_URL` | Production Supabase URL | Production |

**Important:** Use `pk_live_` and `sk_live_` keys for production!

---

## 🔧 Code Files

### 1. `/src/middleware.ts` ✓

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/features',
  '/api/stripe/webhook',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**What it does:**
- Runs on ALL requests (including API routes)
- Public routes: `/`, `/pricing`, `/features`, sign-in/up, webhook
- Protected routes: Everything else requires authentication
- API routes automatically protected except webhook

---

### 2. `/src/lib/stripe-server.ts` ✓

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

**Usage:** Import ONLY in API routes (server-side)

---

### 3. `/src/lib/stripe-client.ts` ✓

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

**Usage:** Import ONLY in client components

---

### 4. `/src/app/api/stripe/create-customer/route.ts` ✓

```typescript
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if customer already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser?.stripeCustomerId) {
      return NextResponse.json({
        customerId: existingUser.stripeCustomerId,
      });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        clerkUserId: userId,
      },
    });

    // Save to database
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        stripeCustomerId: customer.id,
      },
      update: {
        stripeCustomerId: customer.id,
      },
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
```

---

### 5. `/src/app/api/stripe/create-setup-intent/route.ts` ✓

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
```

---

### 6. `/src/app/api/stripe/create-subscription/route.ts` ✓

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, paymentMethodId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: subscription.items.data[0].price.lookup_key || null,
        subscriptionStatus: subscription.status,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret:
        (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

---

### 7. `/src/app/api/user/subscription/route.ts` ✓

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
      });
    }

    return NextResponse.json({
      plan: user.subscriptionPlan || 'free',
      status: user.subscriptionStatus || 'active',
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Clerk Dashboard Configuration

### Development Setup

1. **Go to:** https://dashboard.clerk.com
2. **Select your app** → GlamBooking (or create new)
3. **Navigate to:** API Keys
4. **Copy:**
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`

### Application URLs

Go to: **Settings → Paths**

Set these URLs:

| Setting | Development | Production |
|---------|-------------|------------|
| Home URL | `http://localhost:3000` | `https://yourdomain.com` |
| Sign-in URL | `/sign-in` | `/sign-in` |
| Sign-up URL | `/sign-up` | `/sign-up` |
| After sign-in | `/dashboard` | `/dashboard` |
| After sign-up | `/dashboard` | `/dashboard` |

### Enable OAuth Providers (Optional)

Go to: **User & Authentication → Social Connections**

Enable:
- ✅ Google
- ✅ GitHub
- ✅ Microsoft

---

## 💳 Stripe Dashboard Configuration

### 1. Create Products

Go to: https://dashboard.stripe.com/test/products

Create 3 products:

#### Pro Plan
- Name: `Pro Plan`
- **Monthly Price:**
  - Amount: `£19.99`
  - Lookup key: `price_pro_monthly`
  - Billing period: Monthly
- **Yearly Price:**
  - Amount: `£16.99`
  - Lookup key: `price_pro_yearly`
  - Billing period: Monthly (billed annually)

#### Business Plan
- Name: `Business Plan`
- **Monthly Price:**
  - Amount: `£39.99`
  - Lookup key: `price_business_monthly`
  - Billing period: Monthly
- **Yearly Price:**
  - Amount: `£33.99`
  - Lookup key: `price_business_yearly`
  - Billing period: Monthly (billed annually)

### 2. Set Up Webhook

Go to: **Developers → Webhooks**

#### For Local Testing (Stripe CLI)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

#### For Production (Vercel)

1. **Add endpoint:** `https://yourdomain.com/api/stripe/webhook`
2. **Select events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
3. **Copy webhook signing secret** → Add to Vercel env vars

---

## 🗃️ Database Setup

### Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Verify database
npx prisma studio
```

### Schema Overview

```prisma
model User {
  id                 String   @id
  email              String   @unique
  stripeCustomerId   String?  @unique
  subscriptionPlan   String?
  subscriptionStatus String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

---

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Fix Clerk middleware and Stripe integration"
git push origin main
```

### 2. Import to Vercel

1. Go to: https://vercel.com
2. **New Project** → Import from GitHub
3. Select: `glamfullsystem` repository
4. **Framework:** Next.js
5. **Build Command:** `npm run build`
6. **Install Command:** `npm install`

### 3. Add Environment Variables

Add ALL variables from `.env.local` (use production values):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgres://...
```

### 4. Deploy

Click **Deploy** → Wait for build → Done! 🎉

---

## 🧪 Testing the Complete Flow

### 1. Local Testing

```bash
# Start dev server
npm run dev

# In another terminal, start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test Authentication

1. Go to: `http://localhost:3000`
2. Click **Sign In** → Create account
3. Verify you're redirected to `/dashboard`

### 3. Test Subscription

1. Go to: `http://localhost:3000/pricing`
2. Click **Subscribe Now** on Pro plan
3. Enter test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. ZIP: Any 5 digits
7. Click **Subscribe Now**
8. Verify:
   - ✅ No redirects during payment
   - ✅ Payment processes locally
   - ✅ Redirected to `/dashboard` on success
   - ✅ Subscription shows in dashboard

### 4. Verify in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/customers
2. Find your customer (search by email)
3. Verify:
   - ✅ Customer has metadata: `clerkUserId`
   - ✅ Active subscription
   - ✅ Payment method on file

### 5. Verify in Database

```bash
npx prisma studio
```

Check `User` table:
- ✅ `stripeCustomerId` populated
- ✅ `subscriptionPlan` set (e.g., `price_pro_monthly`)
- ✅ `subscriptionStatus` = `active`

---

## 🔒 Security Checklist

- ✅ Middleware protects all routes except public ones
- ✅ API routes use `auth()` for user verification
- ✅ Stripe secret key never exposed to client
- ✅ Webhook signature verification enabled
- ✅ Environment variables properly configured
- ✅ Production uses live keys (pk_live_, sk_live_)
- ✅ Database connection uses SSL
- ✅ No sensitive data in git repository

---

## 🐛 Troubleshooting

### "Clerk: clerkMiddleware() was not run"
**Fix:** Ensure `middleware.ts` is at `src/middleware.ts` ✓

### "Neither apiKey nor config.authenticator provided"
**Fix:** Use `stripe-server.ts` in API routes, `stripe-client.ts` in components ✓

### "Failed to create customer" 500 error
**Check:**
1. Middleware is running (see above)
2. `CLERK_SECRET_KEY` is set correctly
3. User is authenticated

### Webhook not receiving events
**Check:**
1. Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. `STRIPE_WEBHOOK_SECRET` matches CLI output
3. Webhook endpoint is accessible

### Subscription not creating
**Check:**
1. Products exist in Stripe Dashboard
2. Lookup keys match (`price_pro_monthly`, etc.)
3. Payment method confirmed successfully
4. Check browser console for errors

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Journey                            │
└─────────────────────────────────────────────────────────────┘

1. User visits /pricing
   ↓
2. Clicks "Subscribe Now" (Pro/Business)
   ↓
3. PaymentModal opens
   ↓
4. API: POST /api/stripe/create-customer
   → Creates Stripe customer
   → Links to Clerk userId
   → Saves to Supabase
   ↓
5. API: POST /api/stripe/create-setup-intent
   → Creates SetupIntent
   → Returns clientSecret
   ↓
6. Stripe Elements loads in modal
   → User enters card details
   ↓
7. confirmSetup() called (LOCAL, no redirect)
   → Payment method attached
   ↓
8. API: POST /api/stripe/create-subscription
   → Creates subscription with payment method
   → Updates user in Supabase
   ↓
9. Redirect to /dashboard
   ↓
10. API: GET /api/user/subscription
    → Displays plan & status
    ↓
11. Stripe Webhook → POST /api/stripe/webhook
    → Updates subscription status in real-time
```

---

## ✅ Production Readiness Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Using Clerk production keys (`pk_live_`, `sk_live_`)
- [ ] Using Stripe live keys (`pk_live_`, `sk_live_`)
- [ ] Webhook configured in Stripe Dashboard (live mode)
- [ ] Domain added to Clerk allowed domains
- [ ] Database migrations run on production DB
- [ ] Test transactions in Stripe live mode
- [ ] SSL certificate active
- [ ] Error monitoring configured (Sentry/LogRocket)
- [ ] Stripe webhook signing secret set
- [ ] Clerk paths updated for production domain

---

## 🎉 You're All Set!

Your GlamBooking platform now has:
- ✅ Secure authentication with Clerk
- ✅ Local payment processing with Stripe
- ✅ Subscription management
- ✅ Webhook integration
- ✅ Database persistence
- ✅ Production-ready configuration

**Test command:**
```bash
npm run dev
```

**Visit:** http://localhost:3000

Happy building! 🚀
