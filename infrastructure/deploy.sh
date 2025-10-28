#!/bin/bash

# Odin's Almanac - Azure Infrastructure Deployment Script
# This script deploys the Azure resources for the SaaS platform

set -e

# Configuration
RESOURCE_GROUP_NAME="rg-odins-almanac-dev"
LOCATION="westus2"
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
TEMPLATE_FILE="main.bicep"
PARAMETERS_FILE="parameters.dev.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Odin's Almanac Infrastructure${NC}"
echo "======================================"

# Check if Azure CLI is installed and user is logged in
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please login first.${NC}"
    az login
fi

# Set subscription if provided
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    echo -e "${BLUE}📋 Setting subscription to: $SUBSCRIPTION_ID${NC}"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Show current subscription
CURRENT_SUBSCRIPTION=$(az account show --query "name" -o tsv)
echo -e "${BLUE}📊 Current subscription: $CURRENT_SUBSCRIPTION${NC}"

# Create resource group if it doesn't exist
echo -e "${BLUE}🏗️  Creating resource group: $RESOURCE_GROUP_NAME${NC}"
az group create \
    --name "$RESOURCE_GROUP_NAME" \
    --location "$LOCATION" \
    --tags "project=odins-almanac" "environment=dev" "owner=viking-restaurant-consultants"

# Validate the template
echo -e "${BLUE}✅ Validating Bicep template${NC}"
az deployment group validate \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file "$TEMPLATE_FILE" \
    --parameters "@$PARAMETERS_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Template validation successful${NC}"
else
    echo -e "${RED}❌ Template validation failed${NC}"
    exit 1
fi

# Deploy the infrastructure
echo -e "${BLUE}🚀 Deploying infrastructure...${NC}"
DEPLOYMENT_NAME="odins-almanac-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
    --name "$DEPLOYMENT_NAME" \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file "$TEMPLATE_FILE" \
    --parameters "@$PARAMETERS_FILE" \
    --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    
    # Get outputs
    echo -e "${BLUE}📝 Deployment outputs:${NC}"
    az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --query "properties.outputs" \
        --output table
        
    # Get the web app URL
    WEB_APP_URL=$(az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --query "properties.outputs.webAppUrl.value" \
        --output tsv)
    
    echo -e "${GREEN}🌐 Your app will be available at: $WEB_APP_URL${NC}"
    
    # Instructions for next steps
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Configure your GitHub Actions secrets with the deployment outputs"
    echo "2. Set up Stripe API keys in Azure Key Vault"
    echo "3. Configure Azure AD B2C for authentication"
    echo "4. Deploy your application code"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Infrastructure deployment completed!${NC}"