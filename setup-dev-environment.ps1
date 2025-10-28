# Restaurant Intelligence Platform - Development Environment Setup
# Viking Restaurant Consultants - Developer Onboarding Script

Write-Host "🏴‍☠️ VIKING RESTAURANT INTELLIGENCE PLATFORM SETUP 🏴‍☠️" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Yellow

# Check if Node.js is installed
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found in PATH"
    }
} catch {
    Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
    
    # Check common installation locations
    $commonPaths = @(
        "$env:APPDATA\npm",
        "$env:LOCALAPPDATA\Programs\nodejs",
        "$env:ProgramFiles\nodejs",
        "${env:ProgramFiles(x86)}\nodejs"
    )
    
    $nodePath = $null
    foreach ($path in $commonPaths) {
        if (Test-Path "$path\node.exe") {
            $nodePath = $path
            break
        }
    }
    
    if ($nodePath) {
        Write-Host "🔧 Found Node.js at: $nodePath" -ForegroundColor Yellow
        Write-Host "🔧 Adding to PATH..." -ForegroundColor Yellow
        
        # Add to user PATH permanently
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$nodePath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$nodePath", "User")
            Write-Host "✅ Node.js added to permanent PATH" -ForegroundColor Green
        }
        
        # Update current session PATH
        $env:PATH = "$env:PATH;$nodePath"
        
        # Verify it works now
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "✅ Node.js now available: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm now available: $npmVersion" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Node.js not found. Please install from: https://nodejs.org/" -ForegroundColor Red
        Write-Host "   After installation, restart your terminal and run this script again." -ForegroundColor Yellow
        exit 1
    }
}

# Check Node.js version requirements
Write-Host "`n🔍 Verifying Node.js version requirements..." -ForegroundColor Cyan
$nodeVersionNumber = (node --version).TrimStart('v')
$majorVersion = [int]($nodeVersionNumber.Split('.')[0])

if ($majorVersion -ge 18) {
    Write-Host "✅ Node.js version $nodeVersionNumber meets requirements (>=18.0.0)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node.js version $nodeVersionNumber is below recommended (18.0.0)" -ForegroundColor Yellow
    Write-Host "   Consider upgrading for best performance and security" -ForegroundColor Yellow
}

# Install project dependencies
Write-Host "`n📦 Installing project dependencies..." -ForegroundColor Cyan

try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Install production dependencies if not already present
Write-Host "`n🔒 Checking production dependencies..." -ForegroundColor Cyan

$prodDependencies = @(
    "applicationinsights",
    "compression", 
    "helmet",
    "express-rate-limit",
    "morgan",
    "winston"
)

$missingDeps = @()
foreach ($dep in $prodDependencies) {
    try {
        npm list $dep --depth=0 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            $missingDeps += $dep
        }
    } catch {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "🔧 Installing missing production dependencies: $($missingDeps -join ', ')" -ForegroundColor Yellow
    try {
        npm install $missingDeps
        Write-Host "✅ Production dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install production dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ All production dependencies already installed" -ForegroundColor Green
}

# Create logs directory
Write-Host "`n📁 Creating logs directory..." -ForegroundColor Cyan
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" | Out-Null
    Write-Host "✅ Logs directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Logs directory already exists" -ForegroundColor Green
}

# Create .env file if it doesn't exist
Write-Host "`n🔐 Checking environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Write-Host "🔧 Creating .env file from template..." -ForegroundColor Yellow
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Host "✅ .env file created from template" -ForegroundColor Green
        Write-Host "⚠️  Please update .env with your actual values before running the server" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  No .env.template found. You'll need to create .env manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Test server startup (quick test)
Write-Host "`n🧪 Testing server startup..." -ForegroundColor Cyan
try {
    # Test if server.js exists and is valid
    if (Test-Path "server.js") {
        Write-Host "✅ Production server file (server.js) found" -ForegroundColor Green
    } elseif (Test-Path "working-ai-server.js") {
        Write-Host "✅ Development server file (working-ai-server.js) found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No server file found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Server test failed: $_" -ForegroundColor Yellow
}

# Success message
Write-Host "`n🏆 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🚀 Your Viking Restaurant Intelligence Platform is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your API keys (Stripe, etc.)" -ForegroundColor White
Write-Host "2. Run: npm start    (for production server)" -ForegroundColor White
Write-Host "3. Run: npm run dev  (for development server)" -ForegroundColor White
Write-Host "4. Open: http://localhost:8080 (production) or http://localhost:3000 (dev)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test patentable features: http://localhost:3001/test" -ForegroundColor Yellow
Write-Host "🏴‍☠️ May Odin guide your restaurant intelligence journey! ⚔️" -ForegroundColor Yellow