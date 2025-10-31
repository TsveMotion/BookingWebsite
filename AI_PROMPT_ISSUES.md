# 🚨 AI Developer Assistant - GlamBooking Issues

## 📋 Context

I'm building **GlamBooking**, a beauty booking SaaS platform using:
- **Next.js 15** (App Router)
- **Clerk** for authentication
- **Stripe** for subscription payments
- **Prisma + Supabase** for database
- Running locally with `npm run dev --turbo`

---

## 🔴 Current Critical Issues

### 1. Database Table Missing (BLOCKING)
```
Error [PrismaClientKnownRequestError]: 
The table public.User does not exist in the current database.
```

**When it happens:** When clicking "Subscribe Now" on pricing page  
**API affected:** `/api/stripe/create-customer`  
**Root cause:** Prisma migrations haven't been run

### 2. Clerk Middleware Confusion
```
Error: Clerk: clerkMiddleware() was not run, your middleware file might be misplaced.
Move your middleware file to ./src/middleware.ts. Currently located at ./middleware.ts
```

**Status:** Middleware file HAS been moved to `src/middleware.ts`, but error persists  
**Possible cause:** Next.js cache or old middleware file still exists  
**Impact:** API routes can't authenticate users

### 3. Stripe Integration Issues
- Stripe client initialization errors (was fixed, need to verify)
- Customer creation fails due to database error
- Subscription API returns 500 errors

### 4. User Flow Requirements (NEW)

**Required flow:**
1. **For Paid Plans (Pro/Business):**
   - User clicks "Subscribe Now"
   - → MUST sign up/log in with Clerk first
   - → Then show payment modal
   - → After successful payment, redirect to dashboard

2. **For Free Plan:**
   - User clicks "Join for Free"
   - → MUST sign up/log in with Clerk first
   - → Then redirect to dashboard (no payment needed)

3. **Dashboard Protection:**
   - `/dashboard` should be protected
   - Only accessible after Clerk authentication
   - Show user subscription status from database

---

## 📁 Current File Structure

```
glamfullsystem/
├── src/
│   ├── middleware.ts              ✅ EXISTS (moved here)
│   ├── app/
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-customer/route.ts
│   │   │   │   ├── create-setup-intent/route.ts
│   │   │   │   ├── create-subscription/route.ts
│   │   │   │   ├── webhook/route.ts
│   │   │   │   └── prices/route.ts
│   │   │   └── user/
│   │   │       └── subscription/route.ts
│   │   ├── dashboard/page.tsx
│   │   └── pricing/page.tsx
│   ├── components/
│   │   └── payment-modal.tsx
│   └── lib/
│       ├── stripe-client.ts       ✅ Client-side Stripe
│       ├── stripe-server.ts       ✅ Server-side Stripe
│       └── prisma.ts
├── prisma/
│   └── schema.prisma              ❓ Need to verify User model
├── .env.local                     ✅ Has Clerk + Stripe keys
└── middleware.ts                  ❌ MAY STILL EXIST (needs deletion)
```

---

## 🔍 Error Log Analysis

### From Terminal:
```
POST /api/stripe/create-customer 500 in 1199ms
Error creating customer: Error [PrismaClientKnownRequestError]: 
Invalid prisma.user.findUnique() invocation:
The table public.User does not exist in the current database.
```

**Line in code:**
```typescript
// src/app/api/stripe/create-customer/route.ts:15
const existingUser = await prisma.user.findUnique({
  where: { id: userId },
});
```

**Problem:** Prisma is trying to query a table that doesn't exist in Supabase.

---

## 🎯 What Needs to Be Fixed

### Priority 1: Database Setup (CRITICAL)
1. Verify `prisma/schema.prisma` has correct User model
2. Generate Prisma client: `npx prisma generate`
3. Push schema to database: `npx prisma db push`
4. OR run migration: `npx prisma migrate dev --name init`
5. Verify table exists: `npx prisma studio`

### Priority 2: Clear Next.js Cache
1. Stop dev server
2. Delete `.next` folder completely
3. Delete `node_modules/.cache` if exists
4. Restart: `npm run dev`

### Priority 3: Verify Middleware
1. Confirm `./middleware.ts` (root level) is deleted
2. Confirm `./src/middleware.ts` exists and is correct
3. Middleware should protect all routes except public ones

### Priority 4: User Flow Implementation
1. Update pricing page to check auth before showing payment modal
2. Add Clerk sign-in redirect for unauthenticated users
3. Free plan should redirect to Clerk sign-up first
4. After authentication, proceed with payment (if paid) or dashboard (if free)

### Priority 5: Production Configuration
1. Replace Clerk dev keys with production keys
2. Add proper environment variable handling
3. Configure Vercel deployment settings

---

## 💻 Code That Needs Review/Update

### 1. `prisma/schema.prisma` - User Model
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

**Verify:** Is this model correct?

### 2. `src/middleware.ts` - Clerk Middleware
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

**Question:** Is this configuration correct for Next.js 15?

### 3. `src/app/pricing/page.tsx` - Add Auth Check
```typescript
// CURRENT: Opens payment modal directly
// NEEDED: Check if user is authenticated first

// Pseudo-code:
onClick={() => {
  if (!isSignedIn) {
    router.push('/sign-in?redirect_url=/pricing');
  } else {
    openPaymentModal();
  }
}}
```

### 4. Environment Variables (`.env.local`)
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="postgresql://..."
```

**Verify:** Are all keys present and valid?

---

## 🧪 Testing Steps After Fix

### 1. Database Test
```bash
npx prisma studio
# Should open UI showing User table with columns:
# id, email, stripeCustomerId, subscriptionPlan, subscriptionStatus, createdAt, updatedAt
```

### 2. Middleware Test
```bash
npm run dev
# Visit: http://localhost:3000/dashboard
# Expected: Redirects to Clerk sign-in (if not authenticated)
```

### 3. Free Plan Test
1. Visit: `http://localhost:3000/pricing`
2. Click "Join for Free"
3. Should redirect to Clerk sign-up
4. After sign-up, should go to dashboard
5. Database should have new user record

### 4. Paid Plan Test
1. Sign in with Clerk
2. Visit: `http://localhost:3000/pricing`
3. Click "Subscribe Now" (Pro plan)
4. Payment modal opens
5. Enter test card: `4242 4242 4242 4242`
6. Should process payment locally
7. On success, redirect to dashboard
8. Check Supabase: User record should have `stripeCustomerId` populated

### 5. API Test
```bash
# While signed in, open browser console and run:
fetch('http://localhost:3000/api/user/subscription')
  .then(r => r.json())
  .then(console.log);

# Expected output:
# { plan: "free", status: "active" }
# OR
# { plan: "price_pro_monthly", status: "active" }
```

---

## 📝 Expected Output from AI

Please provide:

1. **Fixed `prisma/schema.prisma`** (if needed)
2. **Step-by-step database setup commands**
3. **Updated `src/app/pricing/page.tsx`** with auth checks
4. **Updated `src/components/payment-modal.tsx`** (if needed)
5. **Cache clearing instructions**
6. **Complete testing procedure**
7. **Production deployment checklist**

---

## 🎯 Success Criteria

✅ Database table exists and is queryable  
✅ No middleware errors in console  
✅ Unauthenticated users redirected to sign-in  
✅ Free plan requires sign-up before dashboard access  
✅ Paid plans require sign-in before payment modal  
✅ Payment processing works locally without redirects  
✅ User data persists in Supabase with Stripe customer ID  
✅ Dashboard shows correct subscription status  

---

## ⚡ Immediate Next Steps

1. **First:** Run Prisma migrations to create database table
2. **Second:** Clear Next.js cache completely
3. **Third:** Verify old `middleware.ts` is deleted from root
4. **Fourth:** Restart dev server
5. **Fifth:** Test the complete flow

---

## 🆘 Additional Context

- **Stripe version:** Latest (from npm)
- **Clerk SDK:** `@clerk/nextjs` latest
- **Next.js:** 15.5.6
- **Prisma:** 6.18.0
- **Database:** Supabase (PostgreSQL)
- **Hosting target:** Vercel
- **Node version:** [Your version]

---

## 💬 Questions for AI

1. Is the database migration the root cause of ALL errors?
2. Should I use `prisma db push` or `prisma migrate dev`?
3. How do I ensure the middleware runs on every request?
4. What's the correct way to check authentication in pricing page?
5. Should payment modal initialization happen before or after auth check?

---

**END OF PROMPT**
