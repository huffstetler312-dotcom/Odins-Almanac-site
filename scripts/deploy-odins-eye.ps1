#!/usr/bin/env pwsh
#Requires -Version 7.0

<#
.SYNOPSIS
    Deploy Odin's Eye application to Azure App Service
.DESCRIPTION
    This script automates the deployment of the Odin's Eye P&L converter application to Azure.
    It intelligently detects existing resources and reuses them when possible.
.PARAMETER SubscriptionId
    Azure Subscription ID (default: 5e0e2c8e-e8b7-4cb0-8e5e-c8e7e8b7e8b7)
.PARAMETER Region
    Azure region for deployment (default: eastus)
.PARAMETER ResourceGroup
    Resource group name (default: viking-restaurant-rg)
.PARAMETER SkipBuild
    Skip the application build step if already built
.EXAMPLE
    .\deploy-odins-eye.ps1
.EXAMPLE
    .\deploy-odins-eye.ps1 -SubscriptionId "your-subscription-id" -Region "westus2"
#>

param(
    [string]$SubscriptionId = "5e0e2c8e-e8b7-4cb0-8e5e-c8e7e8b7e8b7",
    [string]$Region = "eastus",
    [string]$ResourceGroup = "viking-restaurant-rg",
    [switch]$SkipBuild
)

# Script configuration
$ErrorActionPreference = "Stop"
$APP_NAME_PRIMARY = "odins-almanac"
$APP_NAME_SECONDARY = "odins-valhalla"
$APP_SERVICE_PLAN = "viking-app-service-plan"
$APP_SERVICE_SKU = "B1"
$RUNTIME_STACK = "NODE:20-lts"
$DEPLOYMENT_PACKAGE = "odins-eye-app.zip"
$BUSINESS_NAME = "Viking Restaurant Consultants LLC"

# Colors for output
$Colors = @{
    Success = "Green"
    Info = "Cyan"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

# Helper functions
function Write-Header {
    param([string]$Message)
    Write-Host "`n$("="*80)" -ForegroundColor $Colors.Header
    Write-Host " $Message" -ForegroundColor $Colors.Header
    Write-Host "$("="*80)`n" -ForegroundColor $Colors.Header
}

function Write-Step {
    param([string]$Message)
    Write-Host "► $Message" -ForegroundColor $Colors.Info
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Colors.Success
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Colors.Warning
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Colors.Error
}

function Test-Command {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

function Get-EnvironmentVariable {
    param([string]$Name, [string]$Description)
    
    $value = $env:$Name
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "`nPlease enter $Description" -ForegroundColor $Colors.Info
        $value = Read-Host -Prompt "$Name"
    }
    return $value
}

# Main deployment logic
try {
    Write-Header "Odin's Eye Azure Deployment Script"
    Write-Host "Business: $BUSINESS_NAME" -ForegroundColor $Colors.Info
    Write-Host "Application: Odin's Eye (P&L Converter)" -ForegroundColor $Colors.Info
    Write-Host "Target Subscription: $SubscriptionId" -ForegroundColor $Colors.Info
    Write-Host "Target Region: $Region`n" -ForegroundColor $Colors.Info

    # Step 1: Check Azure CLI
    Write-Header "Step 1: Checking Prerequisites"
    Write-Step "Checking Azure CLI installation..."
    
    if (-not (Test-Command "az")) {
        Write-ErrorMsg "Azure CLI is not installed!"
        Write-Host "`nPlease install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor $Colors.Warning
        Write-Host "After installation, restart your terminal and run this script again.`n"
        exit 1
    }
    
    $azVersion = (az version --output json | ConvertFrom-Json).'azure-cli'
    Write-Success "Azure CLI is installed (version $azVersion)"

    # Check Node.js
    Write-Step "Checking Node.js installation..."
    if (-not (Test-Command "node")) {
        Write-ErrorMsg "Node.js is not installed!"
        Write-Host "`nPlease install Node.js from: https://nodejs.org/" -ForegroundColor $Colors.Warning
        exit 1
    }
    
    $nodeVersion = node --version
    Write-Success "Node.js is installed ($nodeVersion)"

    # Step 2: Azure Authentication
    Write-Header "Step 2: Azure Authentication"
    Write-Step "Checking Azure authentication status..."
    
    $accountInfo = az account show 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-WarningMsg "Not logged in to Azure"
        Write-Step "Initiating Azure login..."
        az login
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Azure login failed"
            exit 1
        }
    }
    
    $currentAccount = az account show --output json | ConvertFrom-Json
    Write-Success "Authenticated as: $($currentAccount.user.name)"
    Write-Host "  Current Subscription: $($currentAccount.name) ($($currentAccount.id))" -ForegroundColor $Colors.Info

    # Set subscription
    Write-Step "Setting active subscription..."
    az account set --subscription $SubscriptionId
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Failed to set subscription"
        exit 1
    }
    Write-Success "Active subscription set to: $SubscriptionId"

    # Step 3: Resource Group
    Write-Header "Step 3: Resource Group Configuration"
    Write-Step "Checking for existing resource group: $ResourceGroup..."
    
    $rgExists = az group exists --name $ResourceGroup --output tsv
    
    if ($rgExists -eq "true") {
        Write-Success "Resource group '$ResourceGroup' already exists - reusing"
        $rgInfo = az group show --name $ResourceGroup --output json | ConvertFrom-Json
        Write-Host "  Location: $($rgInfo.location)" -ForegroundColor $Colors.Info
    } else {
        Write-Step "Creating resource group: $ResourceGroup in $Region..."
        az group create --name $ResourceGroup --location $Region --output none
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Failed to create resource group"
            exit 1
        }
        Write-Success "Resource group '$ResourceGroup' created successfully"
    }

    # Step 4: App Service Plan
    Write-Header "Step 4: App Service Plan Configuration"
    Write-Step "Checking for existing App Service Plan: $APP_SERVICE_PLAN..."
    
    $planExists = az appservice plan show --name $APP_SERVICE_PLAN --resource-group $ResourceGroup 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $planInfo = az appservice plan show --name $APP_SERVICE_PLAN --resource-group $ResourceGroup --output json | ConvertFrom-Json
        Write-Success "App Service Plan '$APP_SERVICE_PLAN' already exists - reusing"
        Write-Host "  SKU: $($planInfo.sku.name) ($($planInfo.sku.tier))" -ForegroundColor $Colors.Info
        Write-Host "  Location: $($planInfo.location)" -ForegroundColor $Colors.Info
    } else {
        Write-Step "Creating App Service Plan: $APP_SERVICE_PLAN (SKU: $APP_SERVICE_SKU)..."
        az appservice plan create `
            --name $APP_SERVICE_PLAN `
            --resource-group $ResourceGroup `
            --location $Region `
            --sku $APP_SERVICE_SKU `
            --is-linux `
            --output none
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Failed to create App Service Plan"
            exit 1
        }
        Write-Success "App Service Plan '$APP_SERVICE_PLAN' created successfully"
    }

    # Step 5: Web App
    Write-Header "Step 5: Web App Configuration"
    Write-Step "Checking for existing web app: $APP_NAME_PRIMARY..."
    
    $appName = $null
    $appExists = az webapp show --name $APP_NAME_PRIMARY --resource-group $ResourceGroup 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $appName = $APP_NAME_PRIMARY
        Write-Success "Web app '$APP_NAME_PRIMARY' already exists - reusing"
    } else {
        Write-WarningMsg "Web app '$APP_NAME_PRIMARY' not found"
        Write-Step "Checking for alternative web app: $APP_NAME_SECONDARY..."
        
        $appExists = az webapp show --name $APP_NAME_SECONDARY --resource-group $ResourceGroup 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $appName = $APP_NAME_SECONDARY
            Write-Success "Web app '$APP_NAME_SECONDARY' already exists - reusing"
        } else {
            Write-Step "Creating new web app: $APP_NAME_SECONDARY..."
            az webapp create `
                --name $APP_NAME_SECONDARY `
                --resource-group $ResourceGroup `
                --plan $APP_SERVICE_PLAN `
                --runtime "$RUNTIME_STACK" `
                --output none
            
            if ($LASTEXITCODE -ne 0) {
                Write-ErrorMsg "Failed to create web app"
                exit 1
            }
            $appName = $APP_NAME_SECONDARY
            Write-Success "Web app '$APP_NAME_SECONDARY' created successfully"
        }
    }

    # Get app URL
    $appInfo = az webapp show --name $appName --resource-group $ResourceGroup --output json | ConvertFrom-Json
    $appUrl = "https://$($appInfo.defaultHostName)"
    Write-Host "`n  App URL: $appUrl" -ForegroundColor $Colors.Info

    # Step 6: Environment Variables
    Write-Header "Step 6: Environment Variables Configuration"
    
    # Collect environment variables
    Write-Step "Collecting environment variables..."
    
    $stripePublishable = Get-EnvironmentVariable -Name "STRIPE_PUBLISHABLE_KEY" -Description "Stripe Publishable Key"
    $stripeSecret = Get-EnvironmentVariable -Name "STRIPE_SECRET_KEY" -Description "Stripe Secret Key"
    $databaseUrl = Get-EnvironmentVariable -Name "DATABASE_URL" -Description "PostgreSQL Database URL"
    
    Write-Step "Configuring environment variables for $appName..."
    
    # Set app settings
    az webapp config appsettings set `
        --name $appName `
        --resource-group $ResourceGroup `
        --settings `
            "STRIPE_PUBLISHABLE_KEY=$stripePublishable" `
            "STRIPE_SECRET_KEY=$stripeSecret" `
            "DATABASE_URL=$databaseUrl" `
            "NODE_ENV=production" `
            "WEBSITE_NODE_DEFAULT_VERSION=~20" `
            "SCM_DO_BUILD_DURING_DEPLOYMENT=true" `
        --output none
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Failed to configure environment variables"
        exit 1
    }
    Write-Success "Environment variables configured successfully"

    # Step 7: Build Application
    if (-not $SkipBuild) {
        Write-Header "Step 7: Building Application"
        Write-Step "Installing dependencies..."
        
        Push-Location
        Set-Location (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
        
        if (Test-Path "app") {
            Set-Location "app"
        }
        
        npm install --production=false
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "npm install failed"
            Pop-Location
            exit 1
        }
        Write-Success "Dependencies installed"
        
        Write-Step "Building application..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Build failed"
            Pop-Location
            exit 1
        }
        Write-Success "Application built successfully"
        
        Pop-Location
    } else {
        Write-WarningMsg "Skipping build step as requested"
    }

    # Step 8: Create Deployment Package
    Write-Header "Step 8: Creating Deployment Package"
    Write-Step "Preparing deployment files..."
    
    $packagePath = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) $DEPLOYMENT_PACKAGE
    
    # Check if odins-eye-app.zip already exists in the package directory
    if (Test-Path $packagePath) {
        Write-Success "Using existing deployment package: $packagePath"
    } else {
        Write-ErrorMsg "Deployment package not found: $packagePath"
        Write-Host "Please ensure odins-eye-app.zip is in the deployment package directory."
        exit 1
    }

    # Step 9: Deploy to Azure
    Write-Header "Step 9: Deploying to Azure"
    Write-Step "Uploading application to Azure..."
    Write-Host "  This may take several minutes..." -ForegroundColor $Colors.Warning
    
    az webapp deploy `
        --name $appName `
        --resource-group $ResourceGroup `
        --src-path $packagePath `
        --type zip `
        --async true
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Deployment failed"
        exit 1
    }
    Write-Success "Application uploaded successfully"

    Write-Step "Waiting for deployment to complete (this may take 2-5 minutes)..."
    Start-Sleep -Seconds 30

    # Step 10: Database Migration
    Write-Header "Step 10: Database Setup"
    Write-WarningMsg "Remember to run database migrations!"
    Write-Host "  You can run migrations using:" -ForegroundColor $Colors.Info
    Write-Host "  az webapp ssh --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    Write-Host "  Then run: npm run db:push" -ForegroundColor $Colors.Info

    # Step 11: Deployment Summary
    Write-Header "Deployment Complete!"
    Write-Host "Application successfully deployed!`n" -ForegroundColor $Colors.Success
    
    Write-Host "Deployment Summary:" -ForegroundColor $Colors.Header
    Write-Host "  • Business: $BUSINESS_NAME" -ForegroundColor $Colors.Info
    Write-Host "  • Application: Odin's Eye (P&L Converter)" -ForegroundColor $Colors.Info
    Write-Host "  • Resource Group: $ResourceGroup" -ForegroundColor $Colors.Info
    Write-Host "  • App Service Plan: $APP_SERVICE_PLAN" -ForegroundColor $Colors.Info
    Write-Host "  • Web App Name: $appName" -ForegroundColor $Colors.Info
    Write-Host "  • Region: $Region" -ForegroundColor $Colors.Info
    Write-Host "  • Application URL: $appUrl" -ForegroundColor $Colors.Success
    
    Write-Host "`nNext Steps:" -ForegroundColor $Colors.Header
    Write-Host "  1. Visit your application: $appUrl" -ForegroundColor $Colors.Info
    Write-Host "  2. Run database migrations (see instructions above)" -ForegroundColor $Colors.Info
    Write-Host "  3. Test the application functionality" -ForegroundColor $Colors.Info
    Write-Host "  4. Monitor logs: az webapp log tail --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    
    Write-Host "`nUseful Commands:" -ForegroundColor $Colors.Header
    Write-Host "  • View logs: az webapp log tail --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    Write-Host "  • SSH into app: az webapp ssh --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    Write-Host "  • Restart app: az webapp restart --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    Write-Host "  • View config: az webapp config appsettings list --name $appName --resource-group $ResourceGroup" -ForegroundColor $Colors.Info
    
    Write-Host "`n" -NoNewline
    Write-Success "All done! Your Odin's Eye application is now live on Azure!"
    Write-Host ""

} catch {
    Write-Host "`n"
    Write-ErrorMsg "Deployment failed with error:"
    Write-Host $_.Exception.Message -ForegroundColor $Colors.Error
    Write-Host $_.ScriptStackTrace -ForegroundColor $Colors.Error
    exit 1
}
