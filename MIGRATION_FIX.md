# Migration & Database Issues - Quick Fix Guide

## Issues Identified

### 1. ✅ React Hooks Violation (FIXED)
**Error**: `React has detected a change in the order of Hooks called by GettingStartedChecklist`

**Cause**: The confetti `useEffect` was being called after a conditional return statement, violating React's Rules of Hooks.

**Solution**: Moved the `useEffect` hook before all conditional returns in the component.

### 2. 🔄 Prisma Migration Shadow DB Drift (IN PROGRESS)
**Error**: `Migration '20251030075658_add_bookings_and_clients' failed to apply cleanly to the shadow database. Error: relation "User" already exists`

**Cause**: The shadow database has drift - existing migrations have been modified or the database was manually altered.

**Solution**: Running `prisma migrate reset --force` to:
- Drop the database
- Recreate it fresh
- Apply all migrations from scratch

### 3. ⏳ Database Columns Missing (PENDING)
**Error**: `The column User.name does not exist in the current database`

**Cause**: Prisma Client was generated with the new schema, but the database hasn't been updated yet.

**Solution**: After reset completes, the migration will create all new columns.

## Steps to Complete

### Option A: Reset Database (RECOMMENDED - if you don't have production data)
```bash
# This will drop and recreate your database with all new fields
npx prisma migrate reset --force
```

**Warning**: This deletes ALL data in the database. Only use in development.

### Option B: Create New Migration (if you have data to preserve)
```bash
# Delete problematic migration files
rm -rf prisma/migrations/20251030075658_add_bookings_and_clients

# Create fresh migration
npx prisma migrate dev --name add_all_new_fields --create-only

# Review the generated SQL in prisma/migrations

# Apply the migration
npx prisma migrate deploy
```

## New Schema Fields Being Added

The following fields are being added to the `User` model:
- `name` - User's full name
- `businessSlug` (unique) - URL slug for booking page
- `address` - Business address
- `description` - Business description
- `logo` - Logo URL
- `phone` - Contact phone
- `stripeAccountId` (unique) - Stripe Connect ID
- `payoutFrequency` - Payout schedule (default: "weekly")
- `notificationsEmail` - Email notification preferences
- `notificationsWhatsApp` - WhatsApp notification preferences

## After Migration Success

1. **Restart the development server**:
   ```bash
   npm run dev --turbo
   ```

2. **Verify database columns**:
   ```bash
   npx prisma studio
   ```

3. **Test the application**:
   - Visit `/dashboard/settings` to update profile
   - Add services in `/dashboard/services`
   - Check that API errors are resolved

## Common Errors & Solutions

### "Unique constraint failed on the fields: (email)"
- **Cause**: Trying to create a user that already exists
- **Solution**: Fixed in `src/app/api/dashboard/progress/route.ts` by using `findUnique` instead of `upsert`

### "Column does not exist in the current database"
- **Cause**: Prisma Client out of sync with database
- **Solution**: Run migrations to update database schema

### "Relation already exists"
- **Cause**: Shadow database has old state
- **Solution**: Use `migrate reset` to clear shadow database

## Quick Commands Reference

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Reset database (DELETES DATA)
npx prisma migrate reset --force

# Check migration status
npx prisma migrate status

# Open database browser
npx prisma studio

# Deploy migrations (production)
npx prisma migrate deploy
```

## Status

- ✅ React Hooks fixed
- 🔄 Database reset in progress
- ⏳ Waiting for migration to complete

Once the reset completes successfully, all database errors will be resolved and the application will work with the new schema.
