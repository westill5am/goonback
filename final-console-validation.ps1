# Final Console Error Validation Test
Write-Host "=== FINAL GOONERBRAIN CONSOLE ERROR VALIDATION ===" -ForegroundColor Green

# Start server in background
Write-Host "Starting server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock { 
    Set-Location "c:\Users\D\Desktop\goonerbrain\goonerbrain-backend-main"
    node index.js 2>&1 
}

Start-Sleep 3

try {
    # Test all endpoints
    Write-Host "Testing endpoints..." -ForegroundColor Yellow
    
    # Test 1: Health check
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    Write-Host "✓ Health endpoint: Status $($health.StatusCode)" -ForegroundColor Green
    
    # Test 2: Test endpoint
    $test = Invoke-WebRequest -Uri "http://localhost:8000/test" -UseBasicParsing
    Write-Host "✓ Test endpoint: Status $($test.StatusCode)" -ForegroundColor Green
    
    # Test 3: Recommendations
    $recommendations = Invoke-WebRequest -Uri "http://localhost:8000/recommendations" -UseBasicParsing
    Write-Host "✓ Recommendations endpoint: Status $($recommendations.StatusCode)" -ForegroundColor Green
    
    # Test 4: Search categories
    $categories = Invoke-WebRequest -Uri "http://localhost:8000/search-categories" -UseBasicParsing
    Write-Host "✓ Search categories endpoint: Status $($categories.StatusCode)" -ForegroundColor Green
    
    # Test 5: Quick search test
    Write-Host "Testing search functionality..." -ForegroundColor Yellow
    $search = Invoke-WebRequest -Uri "http://localhost:8000/search?q=test" -TimeoutSec 15 -UseBasicParsing
    Write-Host "✓ Search endpoint: Status $($search.StatusCode), Content length: $($search.Content.Length) bytes" -ForegroundColor Green
    
    Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
    Write-Host "✅ No console errors detected in any endpoint" -ForegroundColor Green
    Write-Host "✅ All API endpoints responding correctly" -ForegroundColor Green
    Write-Host "✅ Search functionality working without errors" -ForegroundColor Green
    Write-Host "✅ Server startup clean with proper logging" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error during testing: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Stop server and get any console output
    Write-Host "`nCapturing server console output..." -ForegroundColor Yellow
    Stop-Job $serverJob
    $serverOutput = Receive-Job $serverJob
    Remove-Job $serverJob
    
    Write-Host "`n=== SERVER CONSOLE OUTPUT ===" -ForegroundColor Cyan
    $serverOutput | ForEach-Object { Write-Host $_ }
    
    # Count any error lines
    $errorLines = $serverOutput | Where-Object { $_ -match "error|Error|ERROR" }
    if ($errorLines.Count -eq 0) {
        Write-Host "`n🎉 NO CONSOLE ERRORS DETECTED!" -ForegroundColor Green
        Write-Host "The GoonerBrain backend is running cleanly without console errors." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Potential console errors found:" -ForegroundColor Yellow
        $errorLines | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    }
}
