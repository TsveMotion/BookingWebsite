# PowerShell script to initialize Stripe products
# Run this after starting the dev server: npm run dev

Write-Host "Initializing GlamBooking Stripe products..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auto-init" -Method GET -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Stripe products initialized successfully!" -ForegroundColor Green
        $response.Content | ConvertFrom-Json | Format-List
    } else {
        Write-Host "❌ Initialization failed with status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Make sure the dev server is running (npm run dev)" -ForegroundColor Yellow
}
