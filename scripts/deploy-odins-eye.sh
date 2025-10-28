#!/bin/bash

# =============================================================================
# Odin's Eye Azure Deployment Script (Bash)
# =============================================================================
# Business: Viking Restaurant Consultants LLC
# Application: Odin's Eye (P&L Converter)
# 
# This script automates the deployment of the Odin's Eye application to Azure.
# It intelligently detects existing resources and reuses them when possible.
#
# Usage:
#   ./deploy-odins-eye.sh [options]
#
# Options:
#   -s, --subscription    Azure Subscription ID
#   -r, --region          Azure region (default: eastus)
#   -g, --resource-group  Resource group name (default: viking-restaurant-rg)
#   --skip-build          Skip the application build step
#   -h, --help            Show this help message
# =============================================================================

set -e  # Exit on error

# Default configuration
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-5e0e2c8e-e8b7-4cb0-8e5e-c8e7e8b7e8b7}"
REGION="eastus"
RESOURCE_GROUP="viking-restaurant-rg"
APP_NAME_PRIMARY="odins-almanac"
APP_NAME_SECONDARY="odins-valhalla"
APP_SERVICE_PLAN="viking-app-service-plan"
APP_SERVICE_SKU="B1"
RUNTIME_STACK="NODE:20-lts"
DEPLOYMENT_PACKAGE="odins-eye-app.zip"
BUSINESS_NAME="Viking Restaurant Consultants LLC"
SKIP_BUILD=false

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${MAGENTA}================================================================================${NC}"
    echo -e "${MAGENTA} $1${NC}"
    echo -e "${MAGENTA}================================================================================${NC}\n"
}

print_step() {
    echo -e "${CYAN}► $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}  $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    fi
    return 0
}

get_env_variable() {
    local var_name=$1
    local description=$2
    local value="${!var_name}"
    
    if [ -z "$value" ]; then
        echo -e "\n${CYAN}Please enter $description:${NC}"
        read -p "$var_name: " value
    fi
    echo "$value"
}

show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -s, --subscription SUBSCRIPTION_ID    Azure Subscription ID"
    echo "  -r, --region REGION                   Azure region (default: eastus)"
    echo "  -g, --resource-group GROUP            Resource group name"
    echo "  --skip-build                          Skip the application build step"
    echo "  -h, --help                            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  STRIPE_PUBLISHABLE_KEY               Stripe publishable key"
    echo "  STRIPE_SECRET_KEY                    Stripe secret key"
    echo "  DATABASE_URL                         PostgreSQL connection string"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--subscription)
            SUBSCRIPTION_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Main deployment logic
main() {
    print_header "Odin's Eye Azure Deployment Script"
    echo -e "${CYAN}Business: ${NC}$BUSINESS_NAME"
    echo -e "${CYAN}Application: ${NC}Odin's Eye (P&L Converter)"
    echo -e "${CYAN}Target Subscription: ${NC}$SUBSCRIPTION_ID"
    echo -e "${CYAN}Target Region: ${NC}$REGION\n"

    # Step 1: Check Prerequisites
    print_header "Step 1: Checking Prerequisites"
    print_step "Checking Azure CLI installation..."
    
    if ! check_command "az"; then
        print_error "Azure CLI is not installed!"
        print_info "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        print_info "After installation, restart your terminal and run this script again."
        exit 1
    fi
    
    az_version=$(az version --output json | jq -r '."azure-cli"')
    print_success "Azure CLI is installed (version $az_version)"

    # Check Node.js
    print_step "Checking Node.js installation..."
    if ! check_command "node"; then
        print_error "Node.js is not installed!"
        print_info "Please install Node.js from: https://nodejs.org/"
        exit 1
    fi
    
    node_version=$(node --version)
    print_success "Node.js is installed ($node_version)"

    # Check jq for JSON parsing
    if ! check_command "jq"; then
        print_warning "jq is not installed. Installing it will improve output formatting."
        print_info "You can install it with: sudo apt-get install jq (Ubuntu/Debian)"
        print_info "or: brew install jq (macOS)"
    fi

    # Step 2: Azure Authentication
    print_header "Step 2: Azure Authentication"
    print_step "Checking Azure authentication status..."
    
    if ! az account show &> /dev/null; then
        print_warning "Not logged in to Azure"
        print_step "Initiating Azure login..."
        az login
        if [ $? -ne 0 ]; then
            print_error "Azure login failed"
            exit 1
        fi
    fi
    
    current_user=$(az account show --query user.name -o tsv)
    current_sub_name=$(az account show --query name -o tsv)
    current_sub_id=$(az account show --query id -o tsv)
    print_success "Authenticated as: $current_user"
    print_info "Current Subscription: $current_sub_name ($current_sub_id)"

    # Set subscription
    print_step "Setting active subscription..."
    az account set --subscription "$SUBSCRIPTION_ID"
    if [ $? -ne 0 ]; then
        print_error "Failed to set subscription"
        exit 1
    fi
    print_success "Active subscription set to: $SUBSCRIPTION_ID"

    # Step 3: Resource Group
    print_header "Step 3: Resource Group Configuration"
    print_step "Checking for existing resource group: $RESOURCE_GROUP..."
    
    rg_exists=$(az group exists --name "$RESOURCE_GROUP" --output tsv)
    
    if [ "$rg_exists" == "true" ]; then
        rg_location=$(az group show --name "$RESOURCE_GROUP" --query location -o tsv)
        print_success "Resource group '$RESOURCE_GROUP' already exists - reusing"
        print_info "Location: $rg_location"
    else
        print_step "Creating resource group: $RESOURCE_GROUP in $REGION..."
        az group create --name "$RESOURCE_GROUP" --location "$REGION" --output none
        if [ $? -ne 0 ]; then
            print_error "Failed to create resource group"
            exit 1
        fi
        print_success "Resource group '$RESOURCE_GROUP' created successfully"
    fi

    # Step 4: App Service Plan
    print_header "Step 4: App Service Plan Configuration"
    print_step "Checking for existing App Service Plan: $APP_SERVICE_PLAN..."
    
    if az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        plan_sku=$(az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" --query "sku.name" -o tsv)
        plan_tier=$(az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" --query "sku.tier" -o tsv)
        plan_location=$(az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" --query location -o tsv)
        print_success "App Service Plan '$APP_SERVICE_PLAN' already exists - reusing"
        print_info "SKU: $plan_sku ($plan_tier)"
        print_info "Location: $plan_location"
    else
        print_step "Creating App Service Plan: $APP_SERVICE_PLAN (SKU: $APP_SERVICE_SKU)..."
        az appservice plan create \
            --name "$APP_SERVICE_PLAN" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$REGION" \
            --sku "$APP_SERVICE_SKU" \
            --is-linux \
            --output none
        
        if [ $? -ne 0 ]; then
            print_error "Failed to create App Service Plan"
            exit 1
        fi
        print_success "App Service Plan '$APP_SERVICE_PLAN' created successfully"
    fi

    # Step 5: Web App
    print_header "Step 5: Web App Configuration"
    print_step "Checking for existing web app: $APP_NAME_PRIMARY..."
    
    APP_NAME=""
    if az webapp show --name "$APP_NAME_PRIMARY" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        APP_NAME="$APP_NAME_PRIMARY"
        print_success "Web app '$APP_NAME_PRIMARY' already exists - reusing"
    else
        print_warning "Web app '$APP_NAME_PRIMARY' not found"
        print_step "Checking for alternative web app: $APP_NAME_SECONDARY..."
        
        if az webapp show --name "$APP_NAME_SECONDARY" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
            APP_NAME="$APP_NAME_SECONDARY"
            print_success "Web app '$APP_NAME_SECONDARY' already exists - reusing"
        else
            print_step "Creating new web app: $APP_NAME_SECONDARY..."
            az webapp create \
                --name "$APP_NAME_SECONDARY" \
                --resource-group "$RESOURCE_GROUP" \
                --plan "$APP_SERVICE_PLAN" \
                --runtime "$RUNTIME_STACK" \
                --output none
            
            if [ $? -ne 0 ]; then
                print_error "Failed to create web app"
                exit 1
            fi
            APP_NAME="$APP_NAME_SECONDARY"
            print_success "Web app '$APP_NAME_SECONDARY' created successfully"
        fi
    fi

    # Get app URL
    APP_URL="https://$(az webapp show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --query defaultHostName -o tsv)"
    print_info "App URL: $APP_URL"

    # Step 6: Environment Variables
    print_header "Step 6: Environment Variables Configuration"
    print_step "Collecting environment variables..."
    
    STRIPE_PUBLISHABLE=$(get_env_variable "STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key")
    STRIPE_SECRET=$(get_env_variable "STRIPE_SECRET_KEY" "Stripe Secret Key")
    DATABASE_URL=$(get_env_variable "DATABASE_URL" "PostgreSQL Database URL")
    
    print_step "Configuring environment variables for $APP_NAME..."
    
    az webapp config appsettings set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --settings \
            "STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE" \
            "STRIPE_SECRET_KEY=$STRIPE_SECRET" \
            "DATABASE_URL=$DATABASE_URL" \
            "NODE_ENV=production" \
            "WEBSITE_NODE_DEFAULT_VERSION=~20" \
            "SCM_DO_BUILD_DURING_DEPLOYMENT=true" \
        --output none
    
    if [ $? -ne 0 ]; then
        print_error "Failed to configure environment variables"
        exit 1
    fi
    print_success "Environment variables configured successfully"

    # Step 7: Build Application
    if [ "$SKIP_BUILD" = false ]; then
        print_header "Step 7: Building Application"
        print_step "Installing dependencies..."
        
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PACKAGE_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
        
        pushd "$PACKAGE_DIR" > /dev/null
        
        if [ -d "app" ]; then
            cd app
        fi
        
        npm install --production=false
        if [ $? -ne 0 ]; then
            print_error "npm install failed"
            popd > /dev/null
            exit 1
        fi
        print_success "Dependencies installed"
        
        print_step "Building application..."
        npm run build
        if [ $? -ne 0 ]; then
            print_error "Build failed"
            popd > /dev/null
            exit 1
        fi
        print_success "Application built successfully"
        
        popd > /dev/null
    else
        print_warning "Skipping build step as requested"
    fi

    # Step 8: Create Deployment Package
    print_header "Step 8: Creating Deployment Package"
    print_step "Preparing deployment files..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PACKAGE_PATH="$(dirname "$(dirname "$SCRIPT_DIR")")/$DEPLOYMENT_PACKAGE"
    
    if [ -f "$PACKAGE_PATH" ]; then
        print_success "Using existing deployment package: $PACKAGE_PATH"
    else
        print_error "Deployment package not found: $PACKAGE_PATH"
        print_info "Please ensure $DEPLOYMENT_PACKAGE is in the deployment package directory."
        exit 1
    fi

    # Step 9: Deploy to Azure
    print_header "Step 9: Deploying to Azure"
    print_step "Uploading application to Azure..."
    print_warning "This may take several minutes..."
    
    az webapp deploy \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --src-path "$PACKAGE_PATH" \
        --type zip \
        --async true
    
    if [ $? -ne 0 ]; then
        print_error "Deployment failed"
        exit 1
    fi
    print_success "Application uploaded successfully"

    print_step "Waiting for deployment to complete (this may take 2-5 minutes)..."
    sleep 30

    # Step 10: Database Migration
    print_header "Step 10: Database Setup"
    print_warning "Remember to run database migrations!"
    print_info "You can run migrations using:"
    print_info "az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP"
    print_info "Then run: npm run db:push"

    # Step 11: Deployment Summary
    print_header "Deployment Complete!"
    echo -e "${GREEN}Application successfully deployed!${NC}\n"
    
    echo -e "${MAGENTA}Deployment Summary:${NC}"
    print_info "• Business: $BUSINESS_NAME"
    print_info "• Application: Odin's Eye (P&L Converter)"
    print_info "• Resource Group: $RESOURCE_GROUP"
    print_info "• App Service Plan: $APP_SERVICE_PLAN"
    print_info "• Web App Name: $APP_NAME"
    print_info "• Region: $REGION"
    echo -e "${GREEN}  • Application URL: $APP_URL${NC}"
    
    echo -e "\n${MAGENTA}Next Steps:${NC}"
    print_info "1. Visit your application: $APP_URL"
    print_info "2. Run database migrations (see instructions above)"
    print_info "3. Test the application functionality"
    print_info "4. Monitor logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
    
    echo -e "\n${MAGENTA}Useful Commands:${NC}"
    print_info "• View logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
    print_info "• SSH into app: az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP"
    print_info "• Restart app: az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP"
    print_info "• View config: az webapp config appsettings list --name $APP_NAME --resource-group $RESOURCE_GROUP"
    
    echo -e "\n${GREEN}✓ All done! Your Odin's Eye application is now live on Azure!${NC}\n"
}

# Error handler
trap 'print_error "Deployment failed at line $LINENO"; exit 1' ERR

# Run main function
main

exit 0
