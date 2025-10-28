# Odin's Almanac - Azure Infrastructure

This directory contains the Azure infrastructure as code (Bicep templates) for the Odin's Almanac SaaS platform.

## Architecture Overview

The platform uses a modern, scalable architecture on Azure:

- **Azure Cosmos DB** - Multi-tenant NoSQL database with partition-per-tenant isolation
- **Azure App Service** - Linux-based web app hosting the Node.js API
- **Azure Key Vault** - Secure storage for API keys and secrets
- **Application Insights** - Application monitoring and analytics
- **Managed Identity** - Secure authentication between Azure services

## Prerequisites

Before deploying, ensure you have:

1. **Azure CLI** installed and logged in
2. **Azure subscription** with appropriate permissions
3. **Resource Group Contributor** role or higher
4. **Bicep CLI** (automatically installed with Azure CLI 2.20.0+)

## Deployment

### Option 1: PowerShell (Windows)
```powershell
cd infrastructure
.\deploy.ps1
```

### Option 2: Bash (Linux/macOS/WSL)
```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Azure CLI
```bash
# Create resource group
az group create --name rg-odins-almanac-dev --location westus2

# Deploy infrastructure
az deployment group create \
    --resource-group rg-odins-almanac-dev \
    --template-file main.bicep \
    --parameters @parameters.dev.json
```

## Configuration

### Environment Parameters
Edit `parameters.dev.json` to customize:
- `environment`: dev, staging, or prod
- `location`: Azure region
- `appName`: Application name prefix

### Secrets Configuration
After deployment, configure these secrets in Azure Key Vault:
- `STRIPE-SECRET-KEY`: Your Stripe secret key
- `STRIPE-WEBHOOK-SECRET`: Stripe webhook endpoint secret
- `JWT-SECRET`: JWT signing secret
- `AZURE-AD-B2C-CLIENT-SECRET`: Azure AD B2C client secret

## Database Schema

The Cosmos DB database includes these containers:
- **Restaurants** - Restaurant information and settings
- **Users** - User accounts and permissions
- **Transactions** - Financial transaction data
- **Analytics** - Processed analytics and insights
- **Subscriptions** - Billing and subscription information

See `../docs/database-schema.md` for detailed schema documentation.

## Security Features

- **Managed Identity**: No stored credentials in code
- **RBAC**: Role-based access control for all resources
- **TLS 1.2+**: Encrypted communication
- **Key Vault**: Secure secret management
- **Network Security**: Application-level firewalls

## Monitoring

Application Insights provides:
- Performance monitoring
- Error tracking
- Usage analytics
- Custom telemetry

## Cost Optimization

The infrastructure is designed for cost efficiency:
- **Serverless Cosmos DB**: Pay-per-request pricing for dev
- **Consumption-based App Service**: Auto-scaling
- **Shared Application Insights**: Consolidated monitoring

## GitHub Actions Integration

The deployment creates outputs used in GitHub Actions:
- `AZURE_WEBAPP_NAME`: App Service name
- `COSMOS_DB_ENDPOINT`: Database endpoint
- `KEY_VAULT_URL`: Key Vault URL

Add these to your repository secrets for CI/CD.

## Environment Promotion

To deploy to staging/production:
1. Create new parameter files: `parameters.staging.json`, `parameters.prod.json`
2. Update environment-specific values
3. Run deployment with new parameters
4. Update GitHub Actions with production secrets

## Troubleshooting

### Common Issues

**Permission Errors**: Ensure your account has Contributor role on the subscription.

**Template Validation Failures**: Check Bicep syntax with `az deployment group validate`.

**Resource Naming Conflicts**: Cosmos DB and Key Vault names must be globally unique.

### Useful Commands

```bash
# Check deployment status
az deployment group list --resource-group rg-odins-almanac-dev

# View deployment outputs
az deployment group show --name <deployment-name> --resource-group rg-odins-almanac-dev --query properties.outputs

# Delete all resources
az group delete --name rg-odins-almanac-dev --yes
```

## Support

For infrastructure issues:
1. Check Azure Activity Log for detailed error messages
2. Review Application Insights for application-level issues
3. Validate Bicep templates before deployment
4. Ensure all required permissions are granted