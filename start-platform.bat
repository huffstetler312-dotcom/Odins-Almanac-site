@echo off
echo 🏴‍☠️ VIKING RESTAURANT INTELLIGENCE PLATFORM LAUNCHER
echo =======================================================

REM Try multiple Node.js installation locations
set "NODE_PATHS=C:\Program Files\nodejs\node.exe;C:\Program Files (x86)\nodejs\node.exe;%APPDATA%\npm\node.exe;%PROGRAMFILES%\nodejs\node.exe"

for %%i in (%NODE_PATHS%) do (
    if exist "%%i" (
        echo ✅ Found Node.js at: %%i
        echo 🚀 Starting Viking Restaurant Intelligence Platform...
        echo.
        echo 📍 ACCESS URLS:
        echo    • Main Platform: http://localhost:3000
        echo    • Pricing Page:  http://localhost:3000/pricing.html  
        echo    • Dashboard:     http://localhost:3000/dashboard.html
        echo    • Health Check:  http://localhost:3000/health
        echo.
        echo 🛡️  Server includes crash protection and auto-restart
        echo 💰 Free 14-day trial available - Enterprise pricing active
        echo.
        "%%i" server-manager.js
        goto :end
    )
)

REM If Node.js not found, try using 'node' from PATH
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Using Node.js from PATH
    echo 🚀 Starting Viking Restaurant Intelligence Platform...
    node server-manager.js
) else (
    echo ❌ Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Or ensure Node.js is in your PATH
    pause
)

:end