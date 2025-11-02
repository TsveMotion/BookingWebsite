# 🚀 GlamBooking - Multi-Location & Team Integration Roadmap

## ✅ Completed
- Schema updated: Service.locationId added
- Schema updated: Location.services relation added
- Database push initiated

---

## 🔧 Critical Fixes Needed

### 1. Stripe Billing Fix
**File**: `src/app/dashboard/billing/page.tsx`
**Issue**: Free plan users can't upgrade (no stripeCustomerId)
**Fix**: Use checkout session instead of portal for upgrades

### 2. Team Location Assignment
**Files**: 
- `src/app/dashboard/team/page.tsx`
- `src/app/api/team/route.ts`

**Changes**:
- Add location dropdown to invite modal
- Pass locationId when creating team member
- Update User.locationId on invite acceptance

### 3. Location Staff Count
**File**: `src/app/api/locations/route.ts`
**Change**: Include staff count in query:
```typescript
include: {
  staff: { select: { id: true, name: true, email: true } },
  _count: { select: { staff: true, services: true } }
}
```

### 4. Location Detail Page
**New File**: `src/app/dashboard/locations/[id]/page.tsx`
**Features**:
- Tabs: Staff | Services | Bookings
- Edit location details
- Assign/remove staff
- Toggle services

### 5. Service Multi-Location
**Files**:
- `src/app/dashboard/services/page.tsx`
- `src/app/api/services/route.ts`

**Changes**:
- Add location selector (optional)
- Filter services by location
- Show "All Locations" badge if locationId is null

### 6. Working Hours State
**File**: `src/app/dashboard/locations/page.tsx`
**Fix**: Manage working hours state properly and send to API on create

---

## 📋 Implementation Order

### Phase 1: Core Fixes (Now)
1. ✅ Update Prisma schema
2. ⏳ Fix locations API to return staff count
3. ⏳ Fix team API to accept locationId
4. ⏳ Update team page with location selector
5. ⏳ Fix working hours submission

### Phase 2: Enhanced Features (Next)
6. Location detail page
7. Multi-location services
8. Billing upgrade flow
9. Staff reassignment UI

---

## 🔑 Key Database Queries

### Get Location with Staff Count
```typescript
const location = await prisma.location.findUnique({
  where: { id },
  include: {
    staff: {
      select: { id: true, name: true, email: true }
    },
    services: {
      select: { id: true, name: true, price: true }
    },
    _count: {
      select: { staff: true, services: true }
    }
  }
});
```

### Assign Staff to Location
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { locationId: locationId }
});
```

### Get Services by Location
```typescript
const services = await prisma.service.findMany({
  where: {
    userId: ownerId,
    OR: [
      { locationId: null }, // Global services
      { locationId: locationId } // Location-specific
    ]
  },
  include: {
    location: { select: { name: true } }
  }
});
```

---

## 🎯 Expected Outcomes

✅ **Locations Page**:
- Shows actual staff count from database
- Working hours save correctly
- Cards are clickable → detail view

✅ **Team Page**:
- Location dropdown in invite form
- Staff assigned to locations on creation
- Can reassign staff to different locations

✅ **Services Page**:
- Location selector when creating service
- Badge showing "All Locations" or specific location
- Filter services by location

✅ **Billing Page**:
- Free users can upgrade via checkout
- Pro/Business users use portal
- Clear upgrade path shown
