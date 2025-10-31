# GlamBooking Team v4 Quick Setup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 GLAMBOOKING TEAM V4 SETUP" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

try {
    Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
    npm install bcryptjs
    npm install --save-dev @types/bcryptjs
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""

    Write-Host "🗄️  Step 2: Pushing schema to database..." -ForegroundColor Yellow
    npx prisma db push
    Write-Host "✅ Schema updated" -ForegroundColor Green
    Write-Host ""

    Write-Host "⚙️  Step 3: Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
    Write-Host ""

    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 New Features Added:" -ForegroundColor Cyan
    Write-Host "   ✓ Team invitations via Brevo email" -ForegroundColor White
    Write-Host "   ✓ Invite acceptance page /invite/[token]" -ForegroundColor White
    Write-Host "   ✓ Multi-location system (Business plan)" -ForegroundColor White
    Write-Host "   ✓ Custom roles (Business plan)" -ForegroundColor White
    Write-Host "   ✓ Fixed booking API dynamic params" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart dev server: npm run dev --turbo" -ForegroundColor White
    Write-Host "   2. Test team invites: /dashboard/team" -ForegroundColor White
    Write-Host "   3. Test locations: /dashboard/locations (Business only)" -ForegroundColor White
    Write-Host "   4. Test custom roles: /dashboard/team/roles (Business only)" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Email Configuration:" -ForegroundColor Cyan
    Write-Host "   Make sure BREVO_API_KEY is set in .env.local" -ForegroundColor White
    Write-Host "   Sender: glambooking@glambooking.co.uk" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ ERROR OCCURRED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try manual setup:" -ForegroundColor Yellow
    Write-Host "   1. npm install bcryptjs @types/bcryptjs" -ForegroundColor White
    Write-Host "   2. npx prisma db push" -ForegroundColor White
    Write-Host "   3. npx prisma generate" -ForegroundColor White
    Write-Host "   4. npm run dev --turbo" -ForegroundColor White
    exit 1
}
