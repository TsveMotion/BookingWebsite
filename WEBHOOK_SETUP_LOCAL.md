# 🚨 CRITICAL: Webhook Setup for Local Development

## THE PROBLEM

**Webhooks DO NOT fire automatically in local development!**

When you complete a Stripe checkout on `localhost:3000`, Stripe cannot send webhook events to your computer because:
- Stripe servers can't reach `localhost`
- Your billing page shows cached data
- Plan never updates because webhook never runs

## THE SOLUTION

You have **2 options** to test webhooks locally:

---

## ✅ OPTION 1: Stripe CLI (RECOMMENDED)

### Step 1: Install Stripe CLI

**Windows (PowerShell):**
```powershell
# Download Stripe CLI
winget install stripe.stripe-cli
```

**Or download from:** https://github.com/stripe/stripe-cli/releases/latest

### Step 2: Login to Stripe
```powershell
stripe login
```
- Opens browser to authorize
- Connects CLI to your Stripe account

### Step 3: Forward Webhooks to Localhost
```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Output will show:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Update .env.local
Copy the `whsec_` secret from the CLI output and update:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Replace with CLI secret
```

### Step 5: Restart Dev Server
```powershell
npm run dev
```

### Step 6: Test Payment
1. Go to `/dashboard/billing`
2. Click "Change Plan" → Select Pro
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Watch the Stripe CLI terminal for webhook events
5. Return to billing page - plan should update!

**Expected Output in Stripe CLI:**
```
2025-11-02 09:00:00   --> checkout.session.completed [evt_xxx]
2025-11-02 09:00:01   --> customer.subscription.created [evt_xxx]
2025-11-02 09:00:02   <-- [200] POST http://localhost:3000/api/stripe/webhook
```

**Expected Output in Dev Server:**
```
🔔 Webhook received: checkout.session.completed
🎉 Subscription checkout completed for customer: cus_xxx
📊 Setting plan to: Pro Plan (Monthly)
✅ Subscription activated: Pro Plan (Monthly) with 250 SMS credits
🔄 Cache invalidated for user: user_xxx
✅ Webhook processed successfully
```

---

## ✅ OPTION 2: Ngrok + Stripe Dashboard

If Stripe CLI doesn't work, use ngrok to expose localhost:

### Step 1: Install Ngrok
```powershell
winget install ngrok.ngrok
```

### Step 2: Create Tunnel
```powershell
ngrok http 3000
```

**Output:**
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### Step 3: Configure Stripe Webhook
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://abc123.ngrok.io/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### Step 4: Copy Webhook Secret
1. Click the new webhook endpoint
2. Click **"Reveal"** on "Signing secret"
3. Copy the `whsec_` key

### Step 5: Update .env.local
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # From Stripe Dashboard
```

### Step 6: Restart Dev Server
```powershell
npm run dev
```

### Step 7: Test Payment
Complete a checkout - webhook will fire via ngrok tunnel

---

## 🧪 OPTION 3: Manual Webhook Testing (Quick Test)

If you just want to verify the webhook logic works:

### Step 1: Get a Test Event from Stripe
1. Go to: https://dashboard.stripe.com/test/events
2. Find a recent `checkout.session.completed` event
3. Click it, then click **"..."** → **"Send test webhook"**
4. Copy the raw JSON

### Step 2: Test with curl
```powershell
# Send test webhook directly to your API
curl -X POST http://localhost:3000/api/stripe/webhook `
  -H "Content-Type: application/json" `
  -H "stripe-signature: t=xxx,v1=xxx" `
  -d @webhook-test.json
```

⚠️ **Note**: This will fail signature verification, but you can temporarily disable it for testing

---

## 🚀 PRODUCTION SETUP

For production, webhooks work automatically:

### Step 1: Deploy to Vercel/Production
```bash
vercel --prod
```

### Step 2: Configure Webhook in Stripe
1. Go to: https://dashboard.stripe.com/webhooks (LIVE MODE)
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select same events as above
4. Copy signing secret

### Step 3: Add to Vercel Environment Variables
```bash
vercel env add STRIPE_WEBHOOK_SECRET production
```

---

## 🔍 DEBUGGING WEBHOOKS

### Check if Webhook Fired:
```sql
-- In Prisma Studio or database
SELECT * FROM "WebhookEvent" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Check if User Updated:
```sql
-- Check user plan
SELECT id, email, plan, "stripeCustomerId", "stripeSubscriptionId", "subscriptionStatus"
FROM "User"
WHERE id = 'user_xxx';
```

### Enable Verbose Logging:
The webhook handler already logs everything. Watch your terminal:
```bash
npm run dev
```

---

## 🎯 WHAT HAPPENS WHEN WEBHOOK FIRES

1. **Stripe** sends event to `/api/stripe/webhook`
2. **Webhook verifies signature** (security)
3. **Saves event** to `WebhookEvent` table (audit log)
4. **Processes event** based on type:
   - `checkout.session.completed` → Updates plan, adds SMS credits
   - `customer.subscription.updated` → Syncs plan status
   - `customer.subscription.deleted` → Reverts to free
   - `invoice.payment_succeeded` → Confirms recurring payment
5. **Invalidates cache** for user (forces fresh data)
6. **Logs success** to console

---

## ⚠️ COMMON ISSUES

### Issue 1: "Webhook signature verification failed"
**Solution**: Make sure `STRIPE_WEBHOOK_SECRET` matches your CLI/ngrok endpoint

### Issue 2: "User not found for customer"
**Solution**: Ensure user has `stripeCustomerId` set during checkout

### Issue 3: Plan still shows "free" after payment
**Solutions**:
- Check webhook fired (look for logs)
- Check webhook processed successfully (no errors)
- Check cache invalidated (should see "🔄 Cache invalidated")
- Force refresh: Delete Redis cache or restart server

### Issue 4: Stripe CLI not forwarding
**Solutions**:
- Check CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check dev server is running: `npm run dev`
- Check port 3000 is not blocked by firewall

---

## 📝 TESTING CHECKLIST

Before deploying to production:

- [ ] Stripe CLI installed and authenticated
- [ ] Webhook forwarding to localhost works
- [ ] Test checkout completes successfully
- [ ] Webhook logs show in terminal
- [ ] User plan updates from "free" to "pro"/"business"
- [ ] SMS credits added correctly (250 for Pro, 1000 for Business)
- [ ] Billing page shows updated plan immediately
- [ ] Cache invalidation working (no stale data)
- [ ] Email confirmation sent (check inbox/spam)
- [ ] Production webhook endpoint configured
- [ ] Production webhook secret added to Vercel

---

## 🆘 QUICK START (TL;DR)

```powershell
# 1. Install Stripe CLI
winget install stripe.stripe-cli

# 2. Login
stripe login

# 3. Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Copy the whsec_ key shown

# 5. Update .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# 6. Restart server
npm run dev

# 7. Test payment
# Go to /dashboard/billing → Change Plan → Pay
```

---

**Status**: ✅ Webhook handler is correct and working. The issue is that webhooks don't fire in local development without Stripe CLI or ngrok.
