# 🧪 Payment Flow Testing Guide

## Critical Fix Applied ✅

**Issue Found:** The webhook was missing the `invoice.payment_succeeded` event handler, which is the PRIMARY event that fires when a subscription payment completes successfully.

**Solution:** Added comprehensive webhook handling for `invoice.payment_succeeded` to update the database when payments succeed.

---

## How Stripe Subscription Payments Work

### Event Flow
1. User clicks "Subscribe" button
2. Frontend calls `/api/stripe/create-subscription-intent`
3. Backend creates Stripe subscription with `payment_behavior: 'default_incomplete'`
4. User enters payment details and confirms
5. **CRITICAL**: Stripe fires `invoice.payment_succeeded` when payment completes
6. Webhook handler updates database: `plan: 'free'` → `plan: 'pro'` or `plan: 'business'`
7. User sees updated subscription status

### Why `invoice.payment_succeeded` is Critical
- `customer.subscription.created`: Fires when subscription is created (BEFORE payment)
- `customer.subscription.updated`: Fires on subscription changes
- **`invoice.payment_succeeded`**: Fires when payment ACTUALLY succeeds ✅ (This updates the plan!)
- `invoice.payment_failed`: Fires when payment fails

---

## Manual Testing Steps

### Prerequisites
1. **Stripe CLI installed**: Download from https://stripe.com/docs/stripe-cli
2. **Webhook forwarding running**: See setup below
3. **Test card ready**: Use `4242 4242 4242 4242`

### Setup Webhook Forwarding

```powershell
# Login to Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# This will output a webhook secret like: whsec_xxxxx
# Copy this and add to your .env.local file:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Test Scenario 1: Pro Monthly Subscription

1. **Start the dev server**
   ```powershell
   cd d:\glambookingfull\BookingWeb
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in separate terminal)
   ```powershell
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

3. **Navigate to billing page**
   - Go to: http://localhost:3000/dashboard/billing
   - Check current plan (should be "FREE")

4. **Subscribe to Pro Monthly**
   - Click "Get Started" under Pro plan
   - Select "Monthly" billing
   - Click "Subscribe Now"

5. **Enter test payment details**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Test User
   - Postal: Any code (e.g., `12345`)

6. **Complete payment**
   - Click "Subscribe Now" button
   - Wait for success message

7. **Verify in terminal logs**
   Look for these logs in your dev server terminal:
   ```
   🔔 Webhook received: invoice.payment_succeeded
   💳 Payment succeeded for customer: cus_xxxxx subscription: sub_xxxxx
   ✅ Updating user: user_xxxxx to plan: pro status: active
   ✨ User updated successfully! Plan is now: pro
   📧 Sending confirmation email to: user@example.com
   ✅ Email sent successfully
   ✅ Webhook processed successfully
   ```

8. **Verify in database**
   - Refresh the billing page
   - Plan badge should now show "PRO"
   - Database should show: `plan: "pro"`, `subscriptionStatus: "active"`

9. **Verify in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/test/subscriptions
   - Find your subscription
   - Status should be "Active"

### Test Scenario 2: Business Yearly Subscription

Repeat the same steps as above but:
- Choose "Business" plan instead of "Pro"
- Select "Yearly" billing
- Verify final plan is "business" in database

### Test Scenario 3: Payment Failure

1. Use failing test card: `4000 0000 0000 0002`
2. Complete the form and submit
3. Payment should fail
4. Verify user remains on "FREE" plan
5. Check logs for: `💔 Payment failed for customer:`

### Test Scenario 4: Subscription Cancellation

1. After successful subscription, cancel it in Stripe Dashboard
2. Go to: https://dashboard.stripe.com/test/subscriptions
3. Find your subscription and click "Cancel subscription"
4. Check webhook logs for:
   ```
   ❌ Subscription deleted for customer: cus_xxxxx
   🔄 Reverting user: user_xxxxx to free plan
   ✅ User reverted to free plan
   ```
5. Verify user is back on "FREE" plan

---

## Automated Testing

### Run Test Suite

```powershell
# Install dependencies
npm install

# Run webhook tests
npx ts-node tests/webhook-test.ts
```

### Expected Test Results

```
✅ Webhook Endpoint: Endpoint is accessible
✅ Customer Creation: Customer created and retrieved successfully
✅ Subscription Creation: Subscription created successfully
✅ Webhook Event Construction: Test event payload constructed successfully
✅ Webhook Endpoints: Found X webhook endpoint(s)
✅ Required Webhook Events: All 6 required events are supported
✅ Database Connection: Database connection successful

Pass Rate: 100%
```

---

## Debugging Common Issues

### Issue 1: "Webhook signature verification failed"

**Cause:** `STRIPE_WEBHOOK_SECRET` is incorrect or missing

**Fix:**
1. Run `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
2. Copy the webhook secret from output
3. Update `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
4. Restart dev server

### Issue 2: Plan not updating after payment

**Cause:** Webhook not receiving events

**Fix:**
1. Ensure Stripe CLI is running: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
2. Check terminal logs for webhook events
3. Verify webhook secret is correct

### Issue 3: "User not found for customer"

**Cause:** Customer was created but not linked to user in database

**Fix:**
1. Check that `stripeCustomerId` is being saved when customer is created
2. Verify user exists in database
3. Check logs for customer ID and user ID matching

### Issue 4: Database not updating despite successful webhook

**Cause:** Prisma client might need regeneration

**Fix:**
```powershell
npx prisma generate
npx prisma db push
```

---

## Monitoring Webhooks in Production

### Stripe Dashboard
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. View event logs and retry failed events

### Application Logs
Monitor your application logs for these patterns:
- ✅ Success: `✨ User updated successfully! Plan is now: pro`
- ⚠️ Warning: `⚠️ User not found for customer:`
- ❌ Error: `❌ Webhook handler error:`

---

## Webhook Events Reference

| Event | When It Fires | Action Taken |
|-------|--------------|--------------|
| `invoice.payment_succeeded` | ✅ Payment completes | Update plan to pro/business |
| `customer.subscription.created` | Subscription created | Store subscription ID |
| `customer.subscription.updated` | Subscription changed | Update subscription status |
| `customer.subscription.deleted` | Subscription cancelled | Revert to free plan |
| `invoice.payment_failed` | Payment fails | Mark as past_due |
| `checkout.session.completed` | Booking paid | Mark booking as paid |

---

## Test Cards

| Card Number | Description | Expected Result |
|------------|-------------|-----------------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0000 0000 0002` | Decline | Payment fails |
| `4000 0000 0000 9995` | Insufficient funds | Payment fails |
| `4000 0000 0000 0077` | Charge succeeds, auth fails | Payment succeeds |

More test cards: https://stripe.com/docs/testing

---

## Checklist Before Going Live

- [ ] Webhook endpoint configured in Stripe Dashboard (production)
- [ ] `STRIPE_WEBHOOK_SECRET` set in production environment
- [ ] `STRIPE_SECRET_KEY` set to production key
- [ ] `STRIPE_PUBLISHABLE_KEY` set to production key
- [ ] Test subscription flow end-to-end in production
- [ ] Verify email notifications are working
- [ ] Monitor webhook logs in Stripe Dashboard
- [ ] Set up alerts for failed webhooks
- [ ] Test cancellation and refund flows

---

## Support

If payments are still not working:
1. Check server logs for detailed error messages
2. Check Stripe Dashboard webhook logs
3. Verify all environment variables are correct
4. Ensure database is accessible and up to date
5. Check that Prisma schema matches database schema

**Last Updated:** 2025-10-30
**Critical Fix:** Added `invoice.payment_succeeded` webhook handler
