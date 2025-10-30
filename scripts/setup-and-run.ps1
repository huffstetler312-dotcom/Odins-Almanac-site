# PowerShell helper for Windows: setup-and-run.ps1
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-and-run.ps1
# The script will: copy .env.example to .env if missing, open .env for you to edit, install server deps, and open a new PowerShell window that runs the server.

$ErrorActionPreference = 'Stop'

Write-Host "== Odin's Almanac: setup-and-run.ps1 starting =="

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Repo root detected: $repoRoot"

$envPath = Join-Path $repoRoot '.env'
$envExampleRoot = Join-Path $repoRoot '.env.example'
$envExampleServer = Join-Path $repoRoot 'server\.env.example'

# 1) Ensure .env exists at repo root
if (!(Test-Path $envPath)) {
  if (Test-Path $envExampleRoot) {
    Copy-Item $envExampleRoot $envPath -Force
    Write-Host "Copied .env.example from repo root to .env"
  } elseif (Test-Path $envExampleServer) {
    Copy-Item $envExampleServer $envPath -Force
    Write-Host "Copied server/.env.example to repo .env"
  } else {
    Write-Host "No .env.example found. Creating minimal .env with placeholders."
    @"
NODE_ENV=development
PORT=3001
STRIPE_PUBLISHABLE_KEY=pk_test_PLACEHOLDER
STRIPE_SECRET_KEY=sk_test_PLACEHOLDER
DATABASE_URL=postgresql://user:pass@localhost:5432/db
"@ | Out-File -Encoding utf8 $envPath
    Write-Host "Created .env with placeholders at $envPath"
  }
} else {
  Write-Host ".env already exists at $envPath — leaving it in place."
}

# 2) Open .env for user to edit
Write-Host "Opening .env in Notepad. Edit values (do NOT commit real secrets) and save/close Notepad to continue."
Start-Process notepad $envPath -Wait

# 3) Install server dependencies (run npm install in server/)
$serverPath = Join-Path $repoRoot 'server'
if (!(Test-Path (Join-Path $serverPath 'package.json'))) {
  Write-Host "ERROR: No package.json found in server/. Cannot install server dependencies."
  exit 1
}

Write-Host "Installing server dependencies (npm install) in: $serverPath"
Push-Location $serverPath
npm install
$npmExit = $LASTEXITCODE
Pop-Location
if ($npmExit -ne 0) {
  Write-Host "npm install failed with exit code $npmExit"
  exit $npmExit
}
Write-Host "npm install completed successfully."

# 4) Start the server in a new PowerShell window so this script can exit while the server runs
$nodeCommand = "node `"$repoRoot\\server\\index.js`""
# Use a PowerShell window that stays open
Write-Host "Launching server in a new PowerShell window: $nodeCommand"
$psArgs = "-NoExit -Command cd `"$repoRoot`"; $nodeCommand"
Start-Process powershell -ArgumentList $psArgs

Write-Host "Done. A new PowerShell window should be running the server."
Write-Host "If you want to run the spreadsheet test, in this repo root run: node test-spreadsheet-generation.js"
Write-Host "Reminder: do NOT commit .env or any real secrets to Git. Use Azure App Settings / Key Vault for production."

Write-Host "== setup-and-run.ps1 finished =="