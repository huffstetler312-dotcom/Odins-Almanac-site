# 🏴‍☠️ AZURE DEPLOYMENT CONFIGURATION GUIDE

## 🚨 CRITICAL: Azure Environment Variables Setup

Your Azure App Service needs these environment variables configured properly for the site to work correctly:

### 1. 🔥 Azure Portal Configuration Steps

1. **Go to Azure Portal** → App Services → `odinsalmanac-drbxbhewetbghqdu`
2. **Navigate to**: Settings → Configuration → Application settings
3. **Add these environment variables**:

### 2. 📝 Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=8080
WEBSITE_NODE_DEFAULT_VERSION=20.9.0

# Stripe Payment Configuration (CRITICAL for buttons!)
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Pricing Configuration (Enterprise Pricing Structure)
STRIPE_STARTER_MONTHLY_AMOUNT=4500    # $45.00
STRIPE_PRO_MONTHLY_AMOUNT=9900        # $99.00  
STRIPE_PLATINUM_MONTHLY_AMOUNT=29900  # $299.00

# Subscription Management
STRIPE_STARTER_PRICE_ID=price_starter_monthly
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_PLATINUM_PRICE_ID=price_platinum_monthly
STRIPE_WEBHOOK_ENDPOINT_SECRET=whsec_your_webhook_secret

# Azure Cosmos DB
COSMOS_DB_ENDPOINT=https://odins-almanac-cosmos.documents.azure.com:443/
COSMOS_DB_DATABASE_NAME=odins-almanac
COSMOS_DB_KEY=ceNVzDMkGM5BajEKyOdFHMJqdFCd6H3Y1p4zbFzDgnZWZzWQqKHANVuXIDnsMg8m6cZd0YRYPfSdACDbhNwCfQ==

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.3

# Application Insights (monitoring)
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key

# Callback URLs (update with your domain)
STRIPE_SUCCESS_URL=https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/success.html
STRIPE_CANCEL_URL=https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/pricing.html
```

### 3. 🏪 Stripe Setup (URGENT - For Revenue!)

**You need to create a Stripe account and configure payment processing:**

1. **Create Stripe Account**: https://dashboard.stripe.com/register
2. **Get your keys**: Dashboard → Developers → API keys
3. **Create Products** in Stripe with these exact IDs:
   - `price_starter_monthly` → $45/month
   - `price_pro_monthly` → $99/month  
   - `price_platinum_monthly` → $299/month

### 4. 🎯 Azure Restart Required

After adding environment variables:
1. Go to **Overview** tab
2. Click **Restart** button
3. Wait 2-3 minutes for restart to complete

### 5. 🔍 Verify Deployment

Test these URLs after restart:
- ✅ Main site: https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/
- ✅ Health check: https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/health
- ✅ Pricing buttons should now work for Stripe checkout

### 6. 🚨 CSS Issue Resolution

If CSS still isn't loading:
1. Check **Logs** in Azure Portal → Monitoring → Log stream
2. Look for any error messages about static files
3. Verify the app is using the correct PORT (should auto-detect Azure's port)

## 🎉 Success Indicators

When properly configured:
- ✅ Site loads with full Viking-themed styling
- ✅ Buttons respond to clicks
- ✅ Stripe checkout opens when clicking upgrade buttons
- ✅ Health endpoint returns green status
- ✅ No JavaScript console errors

## 💰 Ready for Revenue!

Once configured, customers can:
- 🛒 Purchase subscriptions immediately
- 💳 Process payments through Stripe
- 📊 Access restaurant intelligence features
- 🔄 Start free 14-day trials

---
**⚔️ Viking Restaurant Consultants - Odin's Almanac Production Deployment**