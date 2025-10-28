# Odin's Almanac - Azure Infrastructure Deployment Script (PowerShell)
# This script deploys the Azure resources for the SaaS platform

param(
    [string]$ResourceGroupName = "rg-odins-almanac-dev",
    [string]$Location = "westus2",
    [string]$SubscriptionId = $env:AZURE_SUBSCRIPTION_ID,
    [string]$TemplateFile = "main.bicep",
    [string]$ParametersFile = "parameters.dev.json"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Odin's Almanac Infrastructure" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if user is logged in
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Azure. Please login first." -ForegroundColor Yellow
    az login
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-Host "📋 Setting subscription to: $SubscriptionId" -ForegroundColor Blue
    az account set --subscription $SubscriptionId
}

# Show current subscription
$currentSubscription = az account show --query "name" --output tsv
Write-Host "📊 Current subscription: $currentSubscription" -ForegroundColor Blue

# Create resource group if it doesn't exist
Write-Host "🏗️  Creating resource group: $ResourceGroupName" -ForegroundColor Blue
az group create `
    --name $ResourceGroupName `
    --location $Location `
    --tags "project=odins-almanac" "environment=dev" "owner=viking-restaurant-consultants"

# Validate the template
Write-Host "✅ Validating Bicep template" -ForegroundColor Blue
$validationResult = az deployment group validate `
    --resource-group $ResourceGroupName `
    --template-file $TemplateFile `
    --parameters "@$ParametersFile" `
    2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Template validation successful" -ForegroundColor Green
} else {
    Write-Host "❌ Template validation failed" -ForegroundColor Red
    Write-Host $validationResult -ForegroundColor Red
    exit 1
}

# Deploy the infrastructure
Write-Host "🚀 Deploying infrastructure..." -ForegroundColor Blue
$deploymentName = "odins-almanac-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$deploymentResult = az deployment group create `
    --name $deploymentName `
    --resource-group $ResourceGroupName `
    --template-file $TemplateFile `
    --parameters "@$ParametersFile" `
    --verbose `
    2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    
    # Get outputs
    Write-Host "📝 Deployment outputs:" -ForegroundColor Blue
    az deployment group show `
        --name $deploymentName `
        --resource-group $ResourceGroupName `
        --query "properties.outputs" `
        --output table
        
    # Get the web app URL
    $webAppUrl = az deployment group show `
        --name $deploymentName `
        --resource-group $ResourceGroupName `
        --query "properties.outputs.webAppUrl.value" `
        --output tsv
    
    Write-Host "🌐 Your app will be available at: $webAppUrl" -ForegroundColor Green
    
    # Instructions for next steps
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Configure your GitHub Actions secrets with the deployment outputs"
    Write-Host "2. Set up Stripe API keys in Azure Key Vault"
    Write-Host "3. Configure Azure AD B2C for authentication"
    Write-Host "4. Deploy your application code"
    
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host $deploymentResult -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Infrastructure deployment completed!" -ForegroundColor Green