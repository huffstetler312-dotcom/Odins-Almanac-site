# 🔧 CSS and Button Functionality Troubleshooting Guide
## Odin's Almanac - Azure Deployment Issues

---

## 🎯 Issue Summary

**Reported Problems:**
1. CSS not loading on Azure deployment
2. Buttons not functioning
3. Application error being displayed

---

## ✅ Configuration Analysis

### Static File Serving: CORRECT ✅

**Server Configuration (server/index.js):**
```javascript
// Serve static files from public
const clientPath = path.join(__dirname, 'public');
app.use(express.static(clientPath));
```

**Static Files Present:**
```
server/public/
  ├── favicon.ico
  ├── images/
  ├── index.html (18,202 bytes)
  ├── style.css (2,561 bytes) ✅
  ├── logo.svg
  └── odin-logo.png
```

### Content Security Policy: ACCEPTABLE ✅

**Helmet CSP Configuration:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // ✅ Allows CSS
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

**Analysis:**
- ✅ External CSS from same origin allowed (`'self'`)
- ✅ Inline styles allowed (`'unsafe-inline'`)
- ❌ External scripts blocked (only `'self'`)
- ✅ Images from HTTPS sources allowed

---

## 🔍 Root Cause Analysis

### Primary Issue: Node.js Version Mismatch ❌ **FIXED**

**Before:**
- Infrastructure: Node 18-lts
- Application requirement: Node 20+
- Result: Application fails to start or runs with errors

**After Fix:**
```bicep
linuxFxVersion: 'NODE|20-lts'
nodeVersion: '20-lts'
WEBSITE_NODE_DEFAULT_VERSION: '20-lts'
```

### Secondary Issue: HTML Uses Inline Styles

**Finding:**
The `server/public/index.html` file uses **inline styles** (embedded `<style>` tag), NOT the external `style.css` file.

**Evidence:**
```html
<!-- In index.html -->
<head>
    <style>
        :root {
            --primary-bg: #1a1a2e;
            --secondary-bg: #16213e;
            /* ... extensive inline styles ... */
        }
    </style>
</head>
```

**Impact:**
- If inline styles aren't loading, CSP might be too restrictive
- Current CSP allows `'unsafe-inline'` so this should work
- External `style.css` is present but not referenced in HTML

---

## 🐛 Potential Issues & Solutions

### Issue 1: Application Not Starting
**Symptoms:** White screen, "Application Error" message  
**Root Cause:** Node version mismatch  
**Status:** ✅ **FIXED** - Updated to Node 20-lts

### Issue 2: Static Files Not Accessible
**Symptoms:** 404 errors for CSS, images, or JavaScript files  
**Potential Causes:**
1. Incorrect build configuration
2. Files not deployed to Azure
3. Wrong path in HTML references

**Diagnostic Steps:**
```bash
# Check if files are deployed
az webapp ssh --name odins-valhalla --resource-group viking-restaurant-rg
ls -la /home/site/wwwroot/server/public/

# Check application logs
az webapp log tail --name odins-valhalla --resource-group viking-restaurant-rg
```

**Solution:**
Ensure build process includes all public files:
```json
// In package.json (if using build step)
{
  "scripts": {
    "build": "echo 'No build step required for Node.js'",
    "postinstall": "echo 'Installation complete'"
  }
}
```

### Issue 3: Buttons Not Working
**Symptoms:** Click events not firing, no console errors  
**Potential Causes:**
1. JavaScript blocked by CSP
2. JavaScript files not loaded
3. Event listeners not attached

**Current CSP for Scripts:**
```javascript
scriptSrc: ["'self'"]  // Only same-origin scripts allowed
```

**If using external CDN scripts (jQuery, etc.):**
❌ **BLOCKED** - Need to add to CSP

**Fix for External Scripts:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

### Issue 4: Azure Deployment Environment Variables
**Required Environment Variables:**
```bash
NODE_ENV=production
PORT=8080  # Azure sets this automatically
AZURE_COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

**Missing from Bicep (need manual setup):**
```bash
# If using Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# If using PostgreSQL
DATABASE_URL=postgresql://...

# If using Cosmos DB key auth (fallback)
AZURE_COSMOS_KEY=your-key-here
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [x] Node.js version set to 20-lts in infrastructure
- [ ] Environment variables configured in Azure
- [ ] Database connection tested (Cosmos DB or PostgreSQL)
- [ ] Static files present in `server/public/`
- [ ] Build command configured (if needed)

### Post-Deployment
- [ ] Health check endpoint accessible: `/healthz`
- [ ] Static files loading: `/style.css`, `/index.html`
- [ ] Application Insights receiving telemetry
- [ ] Database connectivity verified
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for 404 or CSP errors

### Verification Commands

```bash
# 1. Check application is running
curl https://odins-valhalla.azurewebsites.net/healthz

# 2. Check static files
curl https://odins-valhalla.azurewebsites.net/style.css
curl https://odins-valhalla.azurewebsites.net/index.html

# 3. Check logs
az webapp log tail \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg

# 4. SSH into container
az webapp ssh \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg

# 5. Inside SSH session:
ls -la /home/site/wwwroot/
ls -la /home/site/wwwroot/server/public/
node --version  # Should show v20.x.x
```

---

## 🔧 Quick Fixes

### Fix 1: Force Deployment with New Node Version
```bash
# After updating Bicep to Node 20-lts
az deployment group create \
  --resource-group viking-restaurant-rg \
  --template-file infra/main.bicep \
  --parameters environmentName=prod

# Restart the app
az webapp restart \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg
```

### Fix 2: Add Missing Environment Variables
```bash
az webapp config appsettings set \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg \
  --settings \
    "NODE_ENV=production" \
    "AZURE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/" \
    "STRIPE_PUBLISHABLE_KEY=pk_..." \
    "STRIPE_SECRET_KEY=sk_..."
```

### Fix 3: Enable More Detailed Logging
```bash
az webapp log config \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg \
  --application-logging filesystem \
  --level verbose \
  --web-server-logging filesystem
```

### Fix 4: Reference External CSS (if needed)
If you want to use the external `style.css` file instead of inline styles:

**Update index.html:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Odin's Almanac</title>
    <link rel="stylesheet" href="/style.css">  <!-- Add this -->
</head>
```

---

## 🚨 Common Errors & Solutions

### Error: "Application Error - :("
**Cause:** Application crashed or failed to start  
**Solution:**
1. Check Node version (should be 20-lts) ✅
2. Check logs: `az webapp log tail`
3. Verify environment variables are set
4. Check database connectivity

### Error: 404 on /style.css
**Cause:** Static files not served or wrong path  
**Solution:**
1. Verify file exists: `/server/public/style.css` ✅
2. Check express.static configuration ✅
3. Ensure deployment includes public folder
4. Check if app is serving from correct directory

### Error: "Refused to load stylesheet... CSP"
**Cause:** Content Security Policy too restrictive  
**Solution:**
1. Current CSP allows inline and self-hosted ✅
2. If using CDN, add to `styleSrc` directive
3. Check browser console for exact CSP error

### Error: Buttons don't respond to clicks
**Cause:** JavaScript not loaded or CSP blocking  
**Solution:**
1. Check browser console for JavaScript errors
2. Verify `scriptSrc` CSP allows necessary sources
3. Check if event listeners are properly attached
4. Ensure JavaScript files are loaded (Network tab)

---

## 📊 Expected Behavior

### Successful Deployment
```
✅ Application starts with Node 20.x.x
✅ Health check returns 200 OK
✅ Static files accessible (200 response)
✅ CSS styles applied to page
✅ JavaScript executes without errors
✅ Buttons respond to clicks
✅ Database connection established
✅ Application Insights receiving data
```

### Health Check Response
```json
{
  "status": "healthy",
  "service": "Odin's Eye Restaurant Intelligence",
  "timestamp": "2025-10-29T...",
  "version": "v1",
  "database": {
    "status": "healthy",
    "service": "Azure Cosmos DB",
    "duration": "45ms"
  },
  "authentication": {
    "status": "ready",
    "canAuthenticate": true
  },
  "uptime": 123.45,
  "memory": { ... }
}
```

---

## 🎯 Next Steps

1. **Immediate:** Deploy updated infrastructure with Node 20-lts ✅
2. **Short-term:** Test deployment and verify CSS/buttons work
3. **Medium-term:** Add missing environment variables
4. **Long-term:** Set up CI/CD pipeline for automated deployments

---

## 📞 Support Resources

**Azure Portal:**
https://portal.azure.com → App Services → odins-valhalla

**Application Logs:**
```bash
az webapp log tail --name odins-valhalla --resource-group viking-restaurant-rg
```

**SSH Access:**
```bash
az webapp ssh --name odins-valhalla --resource-group viking-restaurant-rg
```

**GitHub Repository:**
https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site

---

**Last Updated:** October 29, 2025  
**Status:** Node version fix applied, awaiting deployment test
