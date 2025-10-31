# Database Schema Update - Emergency Fix

## Current Problem

The Prisma Client has been generated with the new schema, but the PostgreSQL database hasn't been updated. This causes errors:
- `The column User.name does not exist in the current database`
- `Foreign key constraint violated` (User doesn't exist after reset)

## Quick Fix Solution

Run this command to push the schema directly to the database:

```bash
npx prisma db push --accept-data-loss
```

This will:
1. Update the database schema to match `prisma/schema.prisma`
2. Add all missing columns (name, businessSlug, stripeAccountId, etc.)
3. Bypass the migration system (useful when migrations have issues)

⚠️ **Use `--accept-data-loss` flag** because you just reset the database anyway.

## Why This Happened

1. `prisma migrate reset` was run but may not have completed successfully
2. The database is in a partially reset state
3. Migrations folder may have conflicting migration files

## Alternative: Manual Migration Creation

If `db push` doesn't work, try:

```bash
# Delete all migration folders
rm -rf prisma/migrations/*

# Create initial migration from current schema
npx prisma migrate dev --name initial_schema
```

## Verify Success

After running `db push`, verify the columns exist:

```bash
npx prisma studio
```

Look at the User table - you should see all these columns:
- name
- businessSlug  
- stripeAccountId
- address
- description
- logo
- phone
- payoutFrequency
- notificationsEmail
- notificationsWhatsApp

## Then Restart Your App

```bash
# Stop the current server (Ctrl+C)
# Restart it
npm run dev --turbo
```

## Expected Result

After `db push` completes:
- ✅ No more "column does not exist" errors
- ✅ Settings page loads successfully
- ✅ Services can be created (User exists in DB)
- ✅ Stripe Connect API works

## Run This Now

```bash
npx prisma db push --accept-data-loss
```

Then restart the dev server and refresh your browser.
