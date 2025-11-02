# Testing Stripe Webhooks Locally

## The Problem
When you upgrade subscriptions in test mode on localhost, Stripe cannot send webhooks to your local server. This means the database never updates with the new plan.

## The Solution: Stripe CLI

### 1. Install Stripe CLI
Download from: https://stripe.com/docs/stripe-cli

Or using Chocolatey (Windows):
```powershell
choco install stripe-cli
```

### 2. Login to Stripe
```powershell
stripe login
```

### 3. Forward Webhooks to Your Local Server
Open a **new terminal** and run:
```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret like:
```
whsec_xxxxxxxxxxxxx
```

### 4. Update Your .env File
Replace the `STRIPE_WEBHOOK_SECRET` with the new secret from step 3:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Restart Your Dev Server
```powershell
npm run dev
```

### 6. Test Subscription Upgrade
1. Go to billing page
2. Click upgrade to Pro
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Watch the terminal with `stripe listen` - you'll see webhook events!

## What You'll See

In the terminal running `stripe listen`, you'll see:
```
checkout.session.completed
customer.subscription.created
invoice.payment_succeeded
```

In your Next.js dev server, you'll see:
```
🔍 Subscription Price Details: {...}
✅ Matched PRO plan
📊 Updating subscription for user: xxx Plan: pro Status: active
♻️♻️♻️ FULL CACHE INVALIDATION for user: xxx
```

And the billing page will immediately show your new plan! 🎉

## Alternative: Test in Production
Deploy to Vercel/production where webhooks work automatically without Stripe CLI.
