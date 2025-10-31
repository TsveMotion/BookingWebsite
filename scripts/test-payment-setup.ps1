# Payment Setup Verification Script
# Run this to verify your payment system is configured correctly

Write-Host "🔍 GlamBooking Payment System Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Environment Variables
Write-Host "1️⃣  Checking Environment Variables..." -ForegroundColor Yellow

$envFile = ".env.local"
$required = @(
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY", 
    "STRIPE_WEBHOOK_SECRET",
    "DATABASE_URL"
)

$missing = @()
$found = @()

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    foreach ($var in $required) {
        if ($content -match "$var=") {
            $found += $var
            Write-Host "   ✅ $var is set" -ForegroundColor Green
        } else {
            $missing += $var
            Write-Host "   ❌ $var is MISSING" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ .env.local file not found!" -ForegroundColor Red
    $missing = $required
}

Write-Host ""

# Check 2: Database Connection
Write-Host "2️⃣  Checking Database Schema..." -ForegroundColor Yellow

$schemaFile = "prisma\schema.prisma"
if (Test-Path $schemaFile) {
    $schema = Get-Content $schemaFile -Raw
    
    # Check for required fields
    $fields = @(
        "stripeCustomerId",
        "subscriptionPlan",
        "subscriptionStatus",
        "plan"
    )
    
    $allFound = $true
    foreach ($field in $fields) {
        if ($schema -match $field) {
            Write-Host "   ✅ Field '$field' exists in schema" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Field '$field' MISSING from schema" -ForegroundColor Red
            $allFound = $false
        }
    }
} else {
    Write-Host "   ❌ schema.prisma not found!" -ForegroundColor Red
}

Write-Host ""

# Check 3: Webhook Handler
Write-Host "3️⃣  Checking Webhook Handler..." -ForegroundColor Yellow

$webhookFile = "src\app\api\stripe\webhook\route.ts"
if (Test-Path $webhookFile) {
    $webhook = Get-Content $webhookFile -Raw
    
    $events = @(
        "invoice.payment_succeeded",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_failed"
    )
    
    foreach ($event in $events) {
        if ($webhook -match [regex]::Escape($event)) {
            Write-Host "   ✅ Handler for '$event' exists" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Handler for '$event' MISSING" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ Webhook route file not found!" -ForegroundColor Red
}

Write-Host ""

# Check 4: API Endpoints
Write-Host "4️⃣  Checking API Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "src\app\api\stripe\create-subscription-intent\route.ts",
    "src\app\api\stripe\webhook\route.ts"
)

foreach ($endpoint in $endpoints) {
    if (Test-Path $endpoint) {
        Write-Host "   ✅ $(Split-Path $endpoint -Leaf) exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $(Split-Path $endpoint -Leaf) MISSING" -ForegroundColor Red
    }
}

Write-Host ""

# Check 5: Frontend Components
Write-Host "5️⃣  Checking Frontend Components..." -ForegroundColor Yellow

$components = @(
    "src\components\modals\StripePaymentModal.tsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        Write-Host "   ✅ $(Split-Path $component -Leaf) exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $(Split-Path $component -Leaf) MISSING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Summary
if ($missing.Count -eq 0) {
    Write-Host "✅ Environment Configuration: PASS" -ForegroundColor Green
} else {
    Write-Host "❌ Environment Configuration: FAIL" -ForegroundColor Red
    Write-Host "   Missing variables: $($missing -join ', ')" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure all environment variables are set in .env.local" -ForegroundColor White
Write-Host "2. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook" -ForegroundColor White
Write-Host "3. Copy the webhook secret and update STRIPE_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host "5. Test payment at: http://localhost:3000/dashboard/billing" -ForegroundColor White
Write-Host "6. Use test card: 4242 4242 4242 4242" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full Testing Guide: See PAYMENT_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
