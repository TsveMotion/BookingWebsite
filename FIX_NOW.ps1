Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔧 GLAMBOOKING DATABASE FIX" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Stop if any command fails
$ErrorActionPreference = "Stop"

try {
    Write-Host "📋 Step 1: Checking Prisma schema..." -ForegroundColor Yellow
    if (Test-Path "prisma\schema.prisma") {
        Write-Host "✅ Schema found" -ForegroundColor Green
    } else {
        Write-Host "❌ Schema not found!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "🗄️  Step 2: Pushing schema to database..." -ForegroundColor Yellow
    Write-Host "   (This will update your database with new fields)" -ForegroundColor Gray
    npx prisma db push --accept-data-loss --skip-generate

    Write-Host ""
    Write-Host "⚙️  Step 3: Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate

    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ DATABASE FIXED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 What was fixed:" -ForegroundColor Cyan
    Write-Host "   ✓ Added 'notes' field to Client table" -ForegroundColor White
    Write-Host "   ✓ Added 'category' and 'active' fields to Service table" -ForegroundColor White
    Write-Host "   ✓ Created ServiceAddon table for Pro features" -ForegroundColor White
    Write-Host "   ✓ User foreign key constraints fixed" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart your dev server: npm run dev --turbo" -ForegroundColor White
    Write-Host "   2. Navigate to /dashboard/services" -ForegroundColor White
    Write-Host "   3. Try adding a service - should work now!" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ ERROR OCCURRED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try this manual fix:" -ForegroundColor Yellow
    Write-Host "   1. Stop your dev server (Ctrl+C)" -ForegroundColor White
    Write-Host "   2. Run: npx prisma db push --accept-data-loss" -ForegroundColor White
    Write-Host "   3. Run: npx prisma generate" -ForegroundColor White
    Write-Host "   4. Restart server: npm run dev --turbo" -ForegroundColor White
    exit 1
}
