# 🔧 Stripe Setup Guide - Fix All Billing Errors

This guide will fix all the errors you're seeing:
- ❌ `POST /api/stripe/portal 500` - Portal not configured
- ❌ `POST /api/stripe/update-subscription 400` - Missing price IDs
- ❌ SMS credits not adding after purchase

---

## 🎯 Step 1: Configure Stripe Customer Portal (Required)

### The Error:
```
Error creating portal session: [Error: No configuration provided and your test mode default configuration has not been created...]
```

### The Fix:

1. **Go to Stripe Dashboard:**
   👉 https://dashboard.stripe.com/test/settings/billing/portal

2. **Click "Activate" or "Configure"**

3. **Enable these options:**
   - ✅ **Payment methods:** Allow customers to update payment methods
   - ✅ **Invoices:** Allow customers to view invoices
   - ✅ **Subscriptions:** Allow customers to cancel subscriptions
   - ✅ **Customer information:** Allow customers to update email and billing address

4. **Set Return URL:**
   ```
   http://localhost:3000/dashboard/billing
   ```
   (For production, use your actual domain)

5. **Click "Save"**

✅ **Test:** Click "Manage Payment Methods" button - should now redirect properly!

---

## 🎯 Step 2: Create Stripe Products & Prices

### The Error:
```
POST /api/stripe/update-subscription 400 (Bad Request)
Price ID not configured for pro monthly...
```

### The Fix:

1. **Go to Stripe Dashboard:**
   👉 https://dashboard.stripe.com/test/products

2. **Create "Pro Plan" Product:**
   - Click **"Add product"**
   - Name: `Pro Plan`
   - Description: `Unlimited staff, SMS reminders, loyalty tools`
   
   **Add Monthly Price:**
   - Price: `£19.99`
   - Billing period: `Monthly`
   - ✅ Check "Recurring"
   - Click **"Add price"**
   - **📋 Copy the Price ID** (starts with `price_`)
   
   **Add Yearly Price:**
   - Click "Add another price"
   - Price: `£203.90`
   - Billing period: `Yearly`
   - ✅ Check "Recurring"
   - Click **"Add price"**
   - **📋 Copy the Price ID**

3. **Create "Business Plan" Product:**
   - Click **"Add product"**
   - Name: `Business Plan`
   - Description: `Multi-location, team roles, advanced reporting`
   
   **Add Monthly Price:**
   - Price: `£39.99`
   - Billing period: `Monthly`
   - ✅ Check "Recurring"
   - **📋 Copy the Price ID**
   
   **Add Yearly Price:**
   - Price: `£407.90`
   - Billing period: `Yearly`
   - ✅ Check "Recurring"
   - **📋 Copy the Price ID**

---

## 🎯 Step 3: Add Price IDs to Environment Variables

Open your `.env.local` file and add:

```env
# Stripe Price IDs (replace with your actual IDs from Step 2)
STRIPE_PRO_MONTHLY_PRICE_ID=price_1ABC123monthly
STRIPE_PRO_YEARLY_PRICE_ID=price_1ABC123yearly
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_1ABC456monthly
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_1ABC456yearly
```

**Important:** Replace the example IDs with the **actual price IDs** you copied from Stripe Dashboard.

### Where to find your Price IDs:
1. Go to: https://dashboard.stripe.com/test/products
2. Click on "Pro Plan"
3. Under "Pricing", you'll see each price with its ID (e.g., `price_1ABC123...`)
4. Click the ID to copy it

---

## 🎯 Step 4: Fix SMS Credits (Update Webhook)

### The Error:
SMS credits are purchased but not added to account.

### The Fix:

The webhook handler needs to properly handle SMS credit purchases. **Already fixed in your code!**

Just make sure your webhook is configured:

1. **Go to Stripe Dashboard:**
   👉 https://dashboard.stripe.com/test/webhooks

2. **Add endpoint:**
   ```
   http://localhost:3000/api/stripe/webhook
   ```
   (Use ngrok for local testing or your production URL)

3. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **Copy the webhook signing secret** and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_***
   ```

---

## 🎯 Step 5: Restart Your Dev Server

After adding all environment variables:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Testing Checklist

### Test 1: Manage Payment Methods
- [ ] Click "Manage Payment Methods" button
- [ ] Should redirect to Stripe Customer Portal
- [ ] Can add/update card
- [ ] Can return to billing page

### Test 2: Change Plan (Free → Pro)
- [ ] Click "Change Plan" button
- [ ] Select "Pro" plan
- [ ] Click "Upgrade"
- [ ] Should redirect to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Should redirect back with success message
- [ ] Plan should update to "Pro"

### Test 3: Change Plan (Pro → Business)
- [ ] Click "Change Plan" button
- [ ] Select "Business" plan
- [ ] Click "Upgrade"
- [ ] Should update immediately (no checkout)
- [ ] Success toast appears
- [ ] Plan updates to "Business"
- [ ] Next billing amount updates

### Test 4: Change Plan (Business → Pro)
- [ ] Click "Change Plan" button
- [ ] Select "Pro" plan
- [ ] Click "Downgrade"
- [ ] Should update immediately
- [ ] Prorated credit applied
- [ ] Success toast appears

### Test 5: Downgrade to Free
- [ ] Click "Change Plan" button
- [ ] Select "Free" plan
- [ ] Should show cancellation at period end
- [ ] Subscription remains active until end date

### Test 6: Buy SMS Credits
- [ ] Click "1000 Credits - £4.95" button
- [ ] Should redirect to Stripe Checkout
- [ ] Complete payment
- [ ] Webhook processes purchase
- [ ] Credits added to account
- [ ] Balance updates on page

### Test 7: Cancel Subscription
- [ ] Click "Cancel Subscription" button
- [ ] Confirm cancellation
- [ ] Subscription marked for cancellation
- [ ] Remains active until period end

---

## 🐛 Common Issues & Solutions

### Issue: "Price ID not configured"
**Solution:** Double-check your `.env.local` file has all 4 price IDs and restart dev server.

### Issue: Portal still returns 500
**Solution:** Make sure you clicked "Save" in Stripe Customer Portal settings.

### Issue: SMS credits not adding
**Solution:** 
1. Check webhook is configured with correct URL
2. Check webhook secret is in `.env.local`
3. Check terminal for webhook logs

### Issue: Plan change redirects to checkout when it shouldn't
**Solution:** User doesn't have an existing subscription. This is expected for first-time subscribers.

### Issue: Can't update existing subscription
**Solution:** Check that `subscriptionPlan` field in database contains valid Stripe subscription ID.

---

## 📊 Test Cards

Use these for testing:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Declined |

Use any future expiry date and any 3-digit CVC.

---

## 🚀 Production Checklist

Before going live:

- [ ] Switch to live Stripe keys in `.env`
- [ ] Configure Customer Portal in **live mode**
- [ ] Create products/prices in **live mode**
- [ ] Update webhook URL to production domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test all flows with real card (small amounts)
- [ ] Monitor Stripe Dashboard for webhooks

---

## ✨ You're Done!

All billing features should now work perfectly:
- ✅ Manage payment methods via Stripe portal
- ✅ Upgrade/downgrade between all plans
- ✅ Monthly/yearly billing toggle
- ✅ SMS credits purchase
- ✅ Automatic credit allocation
- ✅ Cancel subscription
- ✅ Billing history

**Need help?** Check Stripe Dashboard → Developers → Webhooks for event logs.
