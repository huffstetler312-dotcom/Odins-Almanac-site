# Odin's Almanac Server Starter
Write-Host "🏴‍☠️ Starting Odin's Almanac Server..." -ForegroundColor Yellow
Write-Host "📍 Navigating to server directory..." -ForegroundColor Cyan

$ServerPath = "C:\Users\huffs\Odins-Almanac-site\server"
$NodePath = "C:\nvm\v20.9.0\node.exe"

if (!(Test-Path $ServerPath)) {
    Write-Host "❌ Server directory not found: $ServerPath" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $NodePath)) {
    Write-Host "❌ Node.js not found: $NodePath" -ForegroundColor Red
    exit 1
}

Set-Location $ServerPath
Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green

Write-Host "🚀 Starting Node.js server..." -ForegroundColor Yellow
& $NodePath "index.js"