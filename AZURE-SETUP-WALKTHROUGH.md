# 🏴‍☠️ STEP-BY-STEP AZURE CONFIGURATION WALKTHROUGH

## 🚨 IMMEDIATE ACTION REQUIRED: Configure Azure Environment Variables

### Step 1: Open Azure Portal
1. **Go to**: https://portal.azure.com
2. **Sign in** with your Azure account
3. **Search for**: "App Services" in the top search bar
4. **Click on**: `odinsalmanac-drbxbhewetbghqdu` (your app)

### Step 2: Navigate to Configuration Settings
1. **In the left menu**, click: **Settings** → **Configuration**
2. **Click the**: **Application settings** tab
3. **You'll see**: A list of current environment variables (if any)

### Step 3: Add CRITICAL Environment Variables

**Click "+ New application setting" for each of these:**

#### 🔧 **Core Server Settings**
```
Name: NODE_ENV
Value: production

Name: WEBSITE_NODE_DEFAULT_VERSION  
Value: 20.9.0

Name: PORT
Value: 8080
```

#### 💳 **Stripe Payment Settings (REVENUE CRITICAL!)**
```
Name: STRIPE_STARTER_MONTHLY_AMOUNT
Value: 4500

Name: STRIPE_PRO_MONTHLY_AMOUNT
Value: 9900

Name: STRIPE_PLATINUM_MONTHLY_AMOUNT
Value: 29900
```

#### 🏪 **Stripe API Keys (You need to get these from Stripe)**
```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_XXXXXXXX (get from Stripe dashboard)

Name: STRIPE_SECRET_KEY
Value: sk_test_XXXXXXXX (get from Stripe dashboard)
```

#### 📊 **Database Settings**
```
Name: COSMOS_DB_ENDPOINT
Value: https://odins-almanac-cosmos.documents.azure.com:443/

Name: COSMOS_DB_DATABASE_NAME
Value: odins-almanac

Name: COSMOS_DB_KEY
Value: ceNVzDMkGM5BajEKyOdFHMJqdFCd6H3Y1p4zbFzDgnZWZzWQqKHANVuXIDnsMg8m6cZd0YRYPfSdACDbhNwCfQ==
```

### Step 4: Save Configuration
1. **After adding each variable**, click **OK**
2. **After adding ALL variables**, click **Save** at the top
3. **Click "Continue"** when prompted about restart

### Step 5: Restart App Service
1. **Go to**: **Overview** tab (in left menu)
2. **Click**: **Restart** button at the top
3. **Click**: **Yes** to confirm restart
4. **Wait**: 2-3 minutes for restart to complete

---

## 🏪 **URGENT: Set Up Stripe Account (For Revenue!)**

### Get Your Stripe Account:
1. **Go to**: https://dashboard.stripe.com/register
2. **Create account** with your business details
3. **Verify your email** and complete setup

### Get Your API Keys:
1. **In Stripe Dashboard**: Go to **Developers** → **API keys**
2. **Copy these values**:
   - **Publishable key**: `pk_test_...` or `pk_live_...`
   - **Secret key**: `sk_test_...` or `sk_live_...`
3. **Add these to Azure** (replace the placeholder values above)

### Create Products in Stripe:
1. **Go to**: **Products** in Stripe Dashboard
2. **Click**: **+ Add product**
3. **Create these 3 products**:
   - **Starter**: $45/month, ID: `price_starter_monthly`
   - **Pro**: $99/month, ID: `price_pro_monthly`  
   - **Platinum**: $299/month, ID: `price_platinum_monthly`

---

## 🔍 **Verify Everything Works**

### After 5 minutes, test these:
- ✅ **Main site**: https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/
- ✅ **Health check**: https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net/health
- ✅ **CSS should now load properly** (Viking styling)
- ✅ **Buttons should work** (Stripe checkout)

## 🎉 **Success Indicators**

When properly configured:
- 🎨 **Full Viking-themed styling loads**
- 🖱️ **Buttons respond to clicks**
- 💳 **Stripe checkout opens**
- 💰 **Ready for customer purchases!**

---
**Need help with any step? Let me know which part you're stuck on!**