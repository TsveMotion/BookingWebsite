Write-Host "🔧 Fixing Database Schema..." -ForegroundColor Cyan

# Step 1: Push schema to database
Write-Host "`n📤 Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss --skip-generate

# Step 2: Generate Prisma Client
Write-Host "`n⚙️  Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n✅ Database fixed! Restart your dev server with: npm run dev --turbo" -ForegroundColor Green
