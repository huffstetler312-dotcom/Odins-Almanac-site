# Restaurant Intelligence Platform - Server Control Script
# Viking Restaurant Consultants - Easy Server Management

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "health", "test", "patents")]
    [string]$Action = "start"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "🏴‍☠️ VIKING SERVER CONTROL 🏴‍☠️" -ForegroundColor Yellow

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting Restaurant Intelligence Platform with crash protection..." -ForegroundColor Green
        node server-manager.js
    }
    
    "stop" {
        Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "✅ Server stopped" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "🔄 Restarting server..." -ForegroundColor Cyan
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 3
        Write-Host "🚀 Starting server with crash protection..." -ForegroundColor Green
        node server-manager.js
    }
    
    "status" {
        Write-Host "📊 Checking server status..." -ForegroundColor Cyan
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Host "✅ Server is running:" -ForegroundColor Green
            $nodeProcesses | ForEach-Object { 
                Write-Host "   PID: $($_.Id), Memory: $([math]::Round($_.WorkingSet / 1MB, 2))MB" 
            }
            
            # Test health endpoint
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
                Write-Host "💚 Health Check: $($response.status)" -ForegroundColor Green
                Write-Host "⏱️  Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Cyan
            } catch {
                Write-Host "❤️‍🩹 Health Check: Failed to connect" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Server is not running" -ForegroundColor Red
        }
    }
    
    "logs" {
        Write-Host "📜 Showing server logs (press Ctrl+C to exit)..." -ForegroundColor Cyan
        if (Test-Path "logs\server-manager.log") {
            Get-Content "logs\server-manager.log" -Tail 20 -Wait
        } else {
            Write-Host "⚠️  No log file found. Start the server first." -ForegroundColor Yellow
        }
    }
    
    "health" {
        Write-Host "🏥 Running health check..." -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 10
            Write-Host "✅ Health Check Results:" -ForegroundColor Green
            Write-Host "   Status: $($response.status)" -ForegroundColor Green
            Write-Host "   Version: $($response.version)" -ForegroundColor Cyan
            Write-Host "   Environment: $($response.environment)" -ForegroundColor Cyan
            Write-Host "   Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Cyan
            Write-Host "   Memory Usage: $([math]::Round($response.memory.heapUsed / 1MB, 2))MB" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "test" {
        Write-Host "🧪 Starting test server..." -ForegroundColor Cyan
        node patent-feature-tests.js
    }
    
    "patents" {
        Write-Host "🧠 Opening patent features testing interface..." -ForegroundColor Magenta
        node patent-feature-tests.js &
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:3001/test"
    }
    
    default {
        Write-Host "❓ Unknown action: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available actions:" -ForegroundColor Cyan
        Write-Host "  start    - Start server with crash protection" -ForegroundColor White
        Write-Host "  stop     - Stop all server processes" -ForegroundColor White
        Write-Host "  restart  - Restart the server" -ForegroundColor White
        Write-Host "  status   - Check server status" -ForegroundColor White
        Write-Host "  logs     - View server logs" -ForegroundColor White
        Write-Host "  health   - Run health check" -ForegroundColor White
        Write-Host "  test     - Start test server" -ForegroundColor White
        Write-Host "  patents  - Open patent features testing" -ForegroundColor White
        Write-Host ""
        Write-Host "Usage: .\server-control.ps1 [action]" -ForegroundColor Yellow
    }
}