# 🔧 Quick Fix Guide - GlamBooking Issues

## Issue Summary
- ❌ Stripe portal 404 (can't upgrade plan)
- ❌ Team members can't be assigned to locations
- ❌ Location cards not showing correct staff count
- ❌ Can't click locations to view details
- ❌ Services don't support multiple locations
- ❌ Working hours need better state management

---

## Critical Database Schema Changes Needed

Run this migration FIRST:

```powershell
npx prisma generate
npx prisma db push
```

### Schema Updates Required:

1. **Service Model** - Add locationId:
```prisma
model Service {
  // ... existing fields
  locationId  String?
  location    Location? @relation(fields: [locationId], references: [id])
  
  @@index([locationId])
}
```

2. **Location Model** - Add services relation:
```prisma
model Location {
  // ... existing fields
  services Service[]
}
```

3. **User Model** - Already has locationId field ✅

---

## Fix 1: Stripe Billing Portal (404 Error)

**Problem**: Portal endpoint returns 404 because free plan users don't have `stripeCustomerId`

**Solution**: Redirect to checkout when upgrading from free plan

Update billing page to handle upgrades properly - create checkout session instead of portal.

---

## Fix 2: Team Location Assignment

**Current**: Team members created without location assignment
**Needed**: Location dropdown in team invite modal

Update `/api/team` POST to accept `locationId` and assign user.

---

## Fix 3: Location Staff Count

**Current**: Shows 0 staff members
**Fix**: Query actual assigned staff count from database

```typescript
const location = await prisma.location.findUnique({
  where: { id },
  include: {
    staff: { select: { id: true, name: true } },
    _count: { select: { staff: true } }
  }
});
```

---

## Fix 4: Clickable Location Cards

Create location detail page: `/dashboard/locations/[id]/page.tsx`

Show tabs:
- Staff assigned to this location
- Clients (bookings at this location)
- Services available at this location

---

## Fix 5: Multi-Location Services

Add location selector when creating/editing services.

Allow services to be:
- Global (all locations)
- Location-specific

---

## Fix 6: Working Hours State Management

Currently: Default values in modal don't save
Fix: Properly manage state for working hours and send to API

```typescript
const [workingHours, setWorkingHours] = useState({
  monday: { open: "09:00", close: "17:00", closed: false },
  // ... other days
});
```

---

## Quick Commands

```powershell
# Update Prisma schema
npx prisma generate

# Push schema changes
npx prisma db push

# Reset if needed
npx prisma migrate reset --force

# Start dev server
npm run dev
```

---

## Priority Order

1. ✅ Fix Prisma schema (add relations)
2. ✅ Fix billing upgrade flow
3. ✅ Add location assignment to team
4. ✅ Fix staff count display
5. ⏳ Create location detail page
6. ⏳ Add multi-location to services
