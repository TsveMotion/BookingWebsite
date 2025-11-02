# 🔧 Fixes Applied - Multi-Location & Team Integration

## ✅ What's Been Fixed

### 1. **Database Schema Updated**
- ✅ Added `locationId` to `Service` model
- ✅ Added `services` relation to `Location` model
- ✅ Added `_count` support for staff and services

**Commands Running**:
```powershell
npx prisma generate  # Regenerating Prisma client
npx prisma db push   # Pushing schema to database
```

### 2. **Locations API Enhanced**
- ✅ Updated GET endpoint to return staff count
- ✅ Updated GET endpoint to return services count
- ✅ Fixed `workingHours` field (changed from `openingHours`)

---

## 🚀 Next Steps (Manual Actions Required)

### Step 1: Wait for Prisma Commands
The following commands are running in the background:
- `npx prisma generate` - Regenerating type-safe client
- `npx prisma db push` - Updating database schema

**Wait for these to complete** (watch your terminal for "✔ Generated Prisma Client")

### Step 2: Restart Dev Server
```powershell
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🔨 Remaining Work Needed

### Priority 1: Billing Upgrade Flow

**Problem**: Free users get 404 when trying to upgrade (no `stripeCustomerId`)

**Solution**: Check if user is on free plan, redirect to checkout instead of portal

**File**: `src/app/dashboard/billing/page.tsx`

Update `handleManagePaymentMethods`:
```typescript
const handleUpgrade = async (plan: 'pro' | 'business') => {
  if (billing?.plan === 'free') {
    // Redirect to checkout for new subscription
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } else {
    // Use portal for existing customers
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }
};
```

### Priority 2: Team Location Assignment

**File**: `src/app/dashboard/team/page.tsx`

Add location selector to invite modal:
```tsx
const [selectedLocationId, setSelectedLocationId] = useState<string>("");

// In modal form:
<select 
  value={selectedLocationId}
  onChange={(e) => setSelectedLocationId(e.target.value)}
>
  <option value="">No specific location</option>
  {locations.map(loc => (
    <option key={loc.id} value={loc.id}>{loc.name}</option>
  ))}
</select>
```

**File**: `src/app/api/team/route.ts`

Accept `locationId` in POST request:
```typescript
const { email, role, permissions, locationId } = await request.json();

// When creating team member:
await prisma.teamMember.create({
  data: {
    ownerId: userId,
    email,
    role,
    permissions,
    // ...other fields
  }
});

// If locationId provided, assign user to location
if (locationId && memberId) {
  await prisma.user.update({
    where: { id: memberId },
    data: { locationId }
  });
}
```

### Priority 3: Working Hours State Management

**File**: `src/app/dashboard/locations/page.tsx`

Add state for working hours:
```typescript
const [workingHours, setWorkingHours] = useState({
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "10:00", close: "16:00", closed: false },
  sunday: { open: "10:00", close: "16:00", closed: true },
});

// Update handleAddLocation to include workingHours:
const response = await fetch("/api/locations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...newLocation,
    workingHours: workingHours
  }),
});
```

### Priority 4: Location Detail Page

**Create**: `src/app/dashboard/locations/[id]/page.tsx`

```tsx
export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'staff' | 'services' | 'bookings'>('staff');
  
  // Fetch location with staff, services, bookings
  const { data: location } = useSWR(`/api/locations/${params.id}`, fetcher);
  
  return (
    <div>
      <h1>{location.name}</h1>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Staff ({location._count.staff})</TabsTrigger>
          <TabsTrigger value="services">Services ({location._count.services})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff">
          {/* Show staff assigned to this location */}
        </TabsContent>
        
        <TabsContent value="services">
          {/* Show services available at this location */}
        </TabsContent>
        
        <TabsContent value="bookings">
          {/* Show bookings for this location */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Priority 5: Services Multi-Location Support

**File**: `src/app/dashboard/services/page.tsx`

Add location selector:
```tsx
<select
  value={service.locationId || ""}
  onChange={(e) => setService({ ...service, locationId: e.target.value || null })}
>
  <option value="">All Locations</option>
  {locations.map(loc => (
    <option key={loc.id} value={loc.id}>{loc.name}</option>
  ))}
</select>
```

**File**: `src/app/api/services/route.ts`

Save `locationId` when creating/updating services.

---

## 📊 Expected Results After Fixes

### Locations Page
✅ Shows actual staff count from database  
✅ Shows services count per location  
✅ Working hours save correctly on location creation  
✅ Can click location cards to view details  

### Team Page
✅ Location dropdown in invite modal  
✅ Staff assigned to location on creation  
✅ Can see which location each team member is assigned to  

### Services Page
✅ Location selector when creating service  
✅ Badge showing "All Locations" or specific location name  
✅ Can filter services by location  

### Billing Page
✅ Free users can click "Upgrade" → redirects to Stripe Checkout  
✅ Pro/Business users click "Manage" → opens Customer Portal  
✅ Clear pricing and plan comparison  

---

## 🐛 Common Issues & Solutions

### Issue: Lint errors about `services` or `workingHours`
**Solution**: Prisma client not regenerated yet. Wait for `npx prisma generate` to complete, then restart dev server.

### Issue: Location staff count shows 0
**Solution**: Make sure users are assigned to location via `User.locationId` field.

### Issue: Can't create location
**Solution**: Working hours field must be null or valid JSON object matching the expected format.

### Issue: Stripe portal 404
**Solution**: Free plan users don't have `stripeCustomerId`. Use checkout flow instead of portal.

---

## 🎯 Testing Checklist

After implementing fixes:

- [ ] Create a location with working hours
- [ ] Invite a team member and assign to location
- [ ] Verify location shows correct staff count
- [ ] Click location to view detail page
- [ ] Create a service and assign to location
- [ ] Try to upgrade from free plan (should go to checkout)
- [ ] Verify working hours display correctly after reload

---

**Status**: Schema updated ✅ | API updated ✅ | UI updates needed ⏳
