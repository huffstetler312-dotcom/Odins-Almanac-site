# 🛡️ Odin's Eye - Azure Deployment Package

<div align="center">

**Viking Restaurant Consultants LLC**  
*Odin's Eye - P&L Converter*

[![Azure](https://img.shields.io/badge/Azure-App%20Service-0078D4?logo=microsoft-azure)](https://azure.microsoft.com)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)](https://postgresql.org)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe)](https://stripe.com)

*Production-ready deployment package for Microsoft Azure*

</div>

---

## 🚀 Quick Start - Local Development

Get started with local development in minutes:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and fill in your actual credentials:
# - Get Stripe keys from https://dashboard.stripe.com/apikeys
# - Get Database URL from your PostgreSQL provider (Neon, Azure, etc.)
# - See .env.example for detailed instructions
```

### 3. Start the Development Server
```bash
npm run start:dev
```

The server will start on `http://localhost:3001` (or the PORT specified in your .env file).

### 4. Test Spreadsheet Generation
```bash
node test-spreadsheet-generation.js
```

### 5. Check System Readiness
```bash
curl http://localhost:3001/ready
```

This endpoint returns JSON showing which environment variables are missing (if any).

### 6. Run Health Check
```bash
npm run health
# or
curl http://localhost:3001/health
```

> ⚠️ **IMPORTANT SECURITY NOTE**  
> **NEVER commit real API keys or secrets to version control!**  
> - Use `.env.example` for documentation (with placeholders only)
> - Keep your actual `.env` file private (it's in `.gitignore`)
> - For production, use Azure App Settings (see DEPLOYMENT-GUIDE.md)
> - Consider using Azure Key Vault for enhanced security

---

## 📦 Package Contents

This deployment package contains everything you need to deploy the Odin's Eye application to Azure:

```
odins-eye-deployment-package/
├── 📄 README.md                          # This file
├── 📄 DEPLOYMENT-GUIDE.md                # Comprehensive deployment guide
├── 📄 .env.template                      # Environment variables template
├── 📦 odins-eye-app.zip                  # Ready-to-deploy application (15MB)
│
├── 📁 scripts/
│   ├── deploy-odins-eye.ps1             # PowerShell deployment script (Windows)
│   └── deploy-odins-eye.sh              # Bash deployment script (Linux/Mac)
│
├── 📁 docs/
│   └── VERIFICATION-GUIDE.md            # Post-deployment testing guide
│
└── 📁 app/                               # Application source code
    ├── client/                           # React frontend
    ├── server/                           # Express backend
    ├── shared/                           # Shared code
    ├── package.json                      # Dependencies
    └── ...                               # Additional files
```

---

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

#### For Windows Users:
```powershell
# Open PowerShell 7 as Administrator
cd path\to\odins-eye-deployment-package
.\scripts\deploy-odins-eye.ps1
```

#### For Linux/Mac Users:
```bash
# Open Terminal
cd path/to/odins-eye-deployment-package
chmod +x scripts/deploy-odins-eye.sh
./scripts/deploy-odins-eye.sh
```

**⏱️ Deployment Time:** 5-10 minutes  
**🎯 Result:** Fully deployed and configured application on Azure

### Option 2: Manual Deployment

Follow the detailed steps in [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)

---

## ✅ Prerequisites

Before running the deployment, ensure you have:

### Required Software
- ✅ **Azure CLI** ([Install](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- ✅ **Node.js 20.x or higher** ([Download](https://nodejs.org))
- ✅ **PowerShell 7.x** (Windows users) ([Download](https://github.com/PowerShell/PowerShell/releases))

### Azure Requirements
- ✅ Active Azure subscription
- ✅ Contributor or Owner role
- ✅ Subscription ID: `5e0e2c8e-e8b7-4cb0-8e5e-c8e7e8b7e8b7` (or your own)

### External Services
- ✅ **PostgreSQL Database** (Neon, Azure PostgreSQL, Supabase, or Heroku)
- ✅ **Stripe Account** (for payment processing)

**Need help getting these?** See the [Prerequisites section](DEPLOYMENT-GUIDE.md#prerequisites) in the deployment guide.

---

## 🔧 Configuration

### Step 1: Set Environment Variables

Copy the template and fill in your credentials:

```bash
cp .env.template .env
```

Edit `.env` and provide:
- `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard → Developers → API Keys
- `STRIPE_SECRET_KEY` - From Stripe Dashboard → Developers → API Keys
- `DATABASE_URL` - PostgreSQL connection string

**Format:**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Step 2: Verify Prerequisites

```bash
# Check Azure CLI
az --version

# Check Node.js
node --version

# Login to Azure
az login
```

### Step 3: Run Deployment

See [Quick Start](#-quick-start) above.

---

## 📚 Documentation

| Document | Description | Link |
|----------|-------------|------|
| **Deployment Guide** | Complete deployment instructions | [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) |
| **Verification Guide** | Post-deployment testing procedures | [docs/VERIFICATION-GUIDE.md](docs/VERIFICATION-GUIDE.md) |
| **Environment Template** | Configuration variables reference | [.env.template](.env.template) |

---

## 🎯 What the Deployment Does

The automated deployment script will:

1. ✅ **Verify Prerequisites** - Check Azure CLI, Node.js, authentication
2. ✅ **Authenticate with Azure** - Login and select subscription
3. ✅ **Create Resource Group** - Or reuse existing `viking-restaurant-rg`
4. ✅ **Create App Service Plan** - Or reuse existing `viking-app-service-plan`
5. ✅ **Create Web App** - Check for `odins-almanac`, create `odins-valhalla` if needed
6. ✅ **Configure Environment** - Set all required environment variables
7. ✅ **Build Application** - Compile frontend and backend (optional)
8. ✅ **Deploy Package** - Upload and deploy application to Azure
9. ✅ **Verify Deployment** - Check application health
10. ✅ **Display Results** - Show application URL and next steps

**Smart Features:**
- 🧠 Detects and reuses existing Azure resources
- 🔄 Handles interrupted deployments gracefully  
- 📊 Provides real-time progress updates
- ⚠️ Clear error messages with solutions
- 🎨 Color-coded output for easy reading

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         Azure App Service (Node.js 20)          │
│  ┌──────────────────────────────────────────┐  │
│  │         Frontend (React + Vite)          │  │
│  │  • Modern UI with shadcn/ui components   │  │
│  │  • Real-time data visualization          │  │
│  │  • Responsive design                     │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
│  ┌────────────────▼─────────────────────────┐  │
│  │        Backend (Express + TypeScript)    │  │
│  │  • REST API endpoints                    │  │
│  │  • File upload/processing                │  │
│  │  • Authentication & sessions             │  │
│  └────────────────┬─────────────────────────┘  │
└───────────────────┼──────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼─────────┐
│   PostgreSQL   │    │    Stripe API     │
│   (Database)   │    │    (Payments)     │
│  • User data   │    │  • Subscriptions  │
│  • P&L records │    │  • Invoices       │
│  • Analytics   │    │  • Webhooks       │
└────────────────┘    └───────────────────┘
```

---

## 💰 Cost Estimate

### Azure Resources

| Resource | Tier | Monthly Cost |
|----------|------|--------------|
| App Service Plan | B1 (Basic) | ~$13.14 |
| App Service | Included | $0.00 |
| **Total Azure** | | **~$13.14/month** |

### External Services

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| PostgreSQL (Neon) | Free Tier | $0.00 |
| Stripe | Pay-per-transaction | 2.9% + $0.30 |
| **Total External** | | **~$0.00/month** (+ transaction fees) |

### Grand Total
**~$13-15/month** for a production-ready deployment

**Cost Optimization Tips:**
- Use free-tier database (Neon, Supabase)
- Stop app when not in use
- Scale up only when needed
- Monitor usage with Azure Cost Management

---

## 🔒 Security Features

- ✅ **HTTPS Enforced** - All traffic encrypted with TLS 1.2+
- ✅ **Environment Variables** - Secrets stored securely in App Service
- ✅ **Database SSL** - Encrypted database connections
- ✅ **Session Management** - Secure authentication with express-session
- ✅ **Input Validation** - Zod schemas for all user input
- ✅ **CORS Protection** - Configured for your domain
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Security Headers** - X-Frame-Options, CSP, etc.

---

## 🛠️ Deployment Options

### Customize Your Deployment

Both deployment scripts support custom parameters:

#### PowerShell:
```powershell
.\scripts\deploy-odins-eye.ps1 `
  -SubscriptionId "your-subscription-id" `
  -Region "westus2" `
  -ResourceGroup "custom-rg-name" `
  -SkipBuild
```

#### Bash:
```bash
./scripts/deploy-odins-eye.sh \
  --subscription "your-subscription-id" \
  --region "westus2" \
  --resource-group "custom-rg-name" \
  --skip-build
```

### Deployment Targets

- **Primary:** `odins-almanac` (if exists)
- **Secondary:** `odins-valhalla` (created if primary doesn't exist)
- **Custom:** Edit script to use your own app name

---

## 📊 Post-Deployment

### Verify Your Deployment

1. **Check Application Status:**
   ```bash
   curl -I https://your-app.azurewebsites.net
   ```

2. **View Logs:**
   ```bash
   az webapp log tail --name odins-valhalla --resource-group viking-restaurant-rg
   ```

3. **Run Health Checks:**
   - See [VERIFICATION-GUIDE.md](docs/VERIFICATION-GUIDE.md)

### Initialize Database

```bash
# SSH into app
az webapp ssh --name odins-valhalla --resource-group viking-restaurant-rg

# Run migrations
cd /home/site/wwwroot
npm run db:push
```

### Access Your Application

Your application will be available at:
- **Primary URL:** `https://odins-almanac.azurewebsites.net`
- **Or Secondary:** `https://odins-valhalla.azurewebsites.net`

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Azure CLI not found | Install from [microsoft.com](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) |
| Not authenticated | Run `az login` |
| App won't start | Check logs: `az webapp log tail` |
| Database error | Verify `DATABASE_URL` format |
| Stripe not working | Check keys are correct and not expired |

**Need more help?** See the [Troubleshooting section](DEPLOYMENT-GUIDE.md#troubleshooting) in the deployment guide.

---

## 📈 Scaling & Performance

### Vertical Scaling (Bigger Instance)
```bash
az appservice plan update \
  --name viking-app-service-plan \
  --resource-group viking-restaurant-rg \
  --sku P1V2  # Premium tier
```

### Horizontal Scaling (More Instances)
```bash
az appservice plan update \
  --name viking-app-service-plan \
  --resource-group viking-restaurant-rg \
  --number-of-workers 3
```

### Enable Always On
```bash
az webapp config set \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg \
  --always-on true
```

---

## 🔄 Updates & Maintenance

### Redeploying After Changes

1. **Make code changes** in `app/` directory
2. **Rebuild** (if needed):
   ```bash
   cd app/
   npm run build
   ```
3. **Redeploy**:
   ```bash
   az webapp deploy \
     --name odins-valhalla \
     --resource-group viking-restaurant-rg \
     --src-path odins-eye-app.zip \
     --type zip
   ```

### Managing Environment Variables

```bash
# Update variables
az webapp config appsettings set \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg \
  --settings "VARIABLE_NAME=new_value"

# Restart app
az webapp restart \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg
```

---

## 🆘 Support

### Documentation Resources
- 📖 [Complete Deployment Guide](DEPLOYMENT-GUIDE.md)
- ✅ [Verification & Testing Guide](docs/VERIFICATION-GUIDE.md)
- 🔧 [Environment Configuration](.env.template)

### External Resources
- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/developer/javascript/)

### Business Contact
**Viking Restaurant Consultants LLC**  
For application-specific questions and support.

---

## 📝 What's Included

### Deployment Scripts
- ✅ **PowerShell Script** - Full-featured deployment for Windows
- ✅ **Bash Script** - Full-featured deployment for Linux/Mac
- ✅ **Intelligent Resource Detection** - Reuses existing resources
- ✅ **Error Handling** - Clear messages and recovery steps
- ✅ **Progress Indicators** - Real-time status updates

### Documentation
- ✅ **Deployment Guide** - 30+ pages of comprehensive instructions
- ✅ **Verification Guide** - Complete testing procedures
- ✅ **Environment Template** - All configuration variables explained
- ✅ **This README** - Quick reference and overview

### Application Package
- ✅ **Production Build** - Optimized and ready to deploy
- ✅ **All Dependencies** - package.json with complete dependency list
- ✅ **Azure Configuration** - .deployment and startup scripts
- ✅ **15MB Zip File** - Compressed and ready for upload

---

## 🎉 Getting Started

Ready to deploy? Here's your checklist:

- [ ] Install prerequisites (Azure CLI, Node.js)
- [ ] Create PostgreSQL database
- [ ] Get Stripe API keys
- [ ] Set environment variables
- [ ] Run deployment script
- [ ] Verify deployment
- [ ] Initialize database
- [ ] Test application

**Time Required:** 15-30 minutes (including setup)

---

## 📄 License

This deployment package is provided by Viking Restaurant Consultants LLC for the Odin's Eye application.

---

## 🚀 Version History

### Version 1.0.0 (October 2025)
- Initial deployment package release
- PowerShell and Bash deployment scripts
- Comprehensive documentation
- Azure App Service deployment support
- PostgreSQL and Stripe integration
- Automated resource detection and reuse

---

<div align="center">

**Ready to Deploy?**

```bash
./scripts/deploy-odins-eye.sh
```

*or*

```powershell
.\scripts\deploy-odins-eye.ps1
```

**🎯 Your Odin's Eye application will be live in 10 minutes!**

---

Made with ⚔️ by Viking Restaurant Consultants LLC

</div>
# Deployment fix for missing node_modules
CORS fix deployed
