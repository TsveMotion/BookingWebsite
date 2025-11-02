# 🚨 QUICK FIX - Sync Your Pro Plan Now

## The Issue
You paid for Pro, but the billing page shows "free" because the webhook hasn't updated your database yet.

## ✅ Instant Fix (2 Steps)

### Step 1: Call the Sync Endpoint

**Open your browser console** (F12) on the billing page and run:

```javascript
fetch('/api/sync-subscription', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Sync Result:', data);
    if (data.success) {
      alert('✅ Plan synced! Refreshing page...');
      window.location.reload();
    } else {
      alert('❌ Sync failed: ' + data.message);
    }
  });
```

**OR** use this button in your browser:

1. Go to: http://localhost:3000/dashboard/billing
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste the code above
5. Press Enter

### Step 2: Refresh Page

After the sync completes, the page will auto-refresh and show your **Pro Plan**.

---

## What This Does

The sync endpoint:
1. Fetches your active subscription from Stripe
2. Determines your plan (Pro/Business/Free)
3. Sets your SMS credits (250 for Pro, 1000 for Business)
4. Updates your database immediately

---

## Why This Was Needed

The Stripe webhook fires asynchronously after payment. Sometimes it takes a few seconds. The sync endpoint pulls the data immediately from Stripe's API.

---

## ✅ After Sync

You should see:
- ✅ Plan shows: **"Pro Plan (Monthly)"** or **"Pro Plan (Yearly)"**
- ✅ SMS Credits: **250**
- ✅ Next billing date displayed
- ✅ Pro features unlocked

---

## If It Still Shows "Free"

1. **Check Stripe Dashboard**: https://dashboard.stripe.com/test/subscriptions
   - Verify the subscription is "Active"
   - Copy the customer ID

2. **Restart Dev Server**:
   ```bash
   # Press Ctrl+C to stop server
   npm run dev --turbo
   ```

3. **Try sync again** after server restarts

---

## Future Automation

This is already fixed for future subscriptions. The webhook now handles `checkout.session.completed` for subscription mode, so this manual sync won't be needed again.
