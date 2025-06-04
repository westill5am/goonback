# GoonerBrain Backend Startup Script for PowerShell
# Automatically detects and fixes common 503 Service Unavailable issues

Write-Host "🚀 =================================" -ForegroundColor Cyan
Write-Host "🚀 GoonerBrain Backend Startup" -ForegroundColor Cyan  
Write-Host "🚀 =================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "💡 Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js version compatibility
$majorVersion = [int]($nodeVersion -replace "v(\d+)\..*", '$1')
if ($majorVersion -ge 24) {
    Write-Host "❌ CRITICAL: Node.js v24+ detected!" -ForegroundColor Red
    Write-Host "❌ This version causes WebAssembly 503 errors" -ForegroundColor Red
    Write-Host "💡 RECOMMENDED: Switch to Node.js v16.20.2" -ForegroundColor Yellow
} elseif ($majorVersion -ge 20) {
    Write-Host "⚠️  WARNING: Node.js v20+ may have issues" -ForegroundColor Yellow
    Write-Host "💡 RECOMMENDED: Use Node.js v16.20.2" -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js version is compatible" -ForegroundColor Green
}

Write-Host ""

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Run enhanced diagnostics
Write-Host "🔍 Running system diagnostics..." -ForegroundColor Cyan
node console-error-debugger-enhanced.js
Write-Host ""

# Start the smart startup system
Write-Host "🚀 Starting GoonerBrain server..." -ForegroundColor Cyan
Write-Host ""

try {
    node smart-startup.js
} catch {
    Write-Host "❌ Smart startup failed, trying emergency server..." -ForegroundColor Red
    node index-emergency.js
}

Read-Host "Press Enter to exit"
