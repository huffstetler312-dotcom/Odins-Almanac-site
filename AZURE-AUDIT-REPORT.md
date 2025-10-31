# 🔍 Azure Deployment Audit Report
## Comprehensive Analysis of Odin's Almanac Site Configuration

**Date:** October 29, 2025  
**Audited By:** GitHub Copilot Workspace Agent  
**Repository:** Viking-Restaurant-Consultants/Odins-Almanac-site

---

## 🎯 Executive Summary

This audit was conducted to investigate:
1. Application errors on Azure deployment
2. CSS not loading and buttons not functioning
3. Node.js version compatibility (specifically Node 22)
4. Neon database names "muddy sky" and "odins vallhalla"

### Critical Findings

❌ **CRITICAL ISSUES IDENTIFIED:**

1. **Node.js Version Mismatch** - Infrastructure configured for Node 18, but application requires Node 20+
2. **Database Configuration Confusion** - Mixed references to Cosmos DB and PostgreSQL/Neon
3. **Missing Database Names** - "muddy sky" and "odins vallhalla" not found in codebase
4. **Port Configuration** - Bicep uses port 8080, but application uses port 3000

---

## 🔴 Critical Issue #1: Node.js Version Mismatch

### Problem
The infrastructure and application have incompatible Node.js version requirements.

### Evidence

**Infrastructure (infra/main.bicep):**
```bicep
linuxFxVersion: 'NODE|18-lts'  // Line 318
nodeVersion: '18-lts'           // Line 324
WEBSITE_NODE_DEFAULT_VERSION: '18-lts'  // Line 332
```

**Application (package.json):**
```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=8.0.0"
}
```

**Documentation (.env.template, README.md):**
```
WEBSITE_NODE_DEFAULT_VERSION=~20
```

### Impact
⚠️ **HIGH SEVERITY** - Application will fail to start or exhibit undefined behavior when deployed to Azure with Node 18.

### Recommendation
Update `infra/main.bicep` to use Node 20-lts:
```bicep
linuxFxVersion: 'NODE|20-lts'
nodeVersion: '20-lts'
WEBSITE_NODE_DEFAULT_VERSION: '20-lts'
```

**Note:** User mentioned Node 22, but the application is only tested/configured for Node 20. Node 22 would require additional testing and potential code updates.

---

## 🔴 Critical Issue #2: Database Configuration Confusion

### Problem
The codebase has conflicting database implementations:

1. **Azure Infrastructure** uses **Azure Cosmos DB (NoSQL)**
2. **Documentation** references **PostgreSQL (Neon, Supabase, Heroku)**
3. **Server code** (`server/lib/database/cosmos-client.js`) implements Cosmos DB
4. **Environment templates** reference PostgreSQL connection strings

### Evidence

**Cosmos DB Implementation (infra/main.bicep):**
```bicep
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15'
resource cosmosDbDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15'
// Containers: restaurants, pldata, inventory, subscriptions
```

**PostgreSQL References (.env.template):**
```bash
# PostgreSQL Database Connection String
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Examples:
# - Neon: postgresql://user:pass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Actual Server Code (server/index.js, server/lib/database/):**
- Uses `@azure/cosmos` package
- Implements Cosmos DB client with Azure managed identity
- No PostgreSQL implementation found

### Impact
⚠️ **CRITICAL** - Documentation suggests PostgreSQL setup, but actual deployment requires Cosmos DB. This will cause deployment failures if users follow docs.

### Database Names "muddy sky" and "odins vallhalla"

**FINDING:** ❌ **NOT FOUND**

Comprehensive search results:
```bash
# Searched for:
- "muddy sky" (case-insensitive)
- "muddy" alone
- "odins vallhalla" (with double 'l')
- "valhalla" / "vallhalla"

# Found:
- "odins-valhalla" (with single 'l') - Azure App Service name
- No database named "muddy sky"
- No database named "odins vallhalla"
```

**Actual Database Names in Codebase:**

1. **Cosmos DB Database:** `RestaurantIntelligence` (defined in infra/main.bicep line 43)
2. **Cosmos DB Containers:**
   - `restaurants`
   - `pldata`
   - `inventory`
   - `subscriptions`

3. **Azure App Service Names:**
   - Primary: `odins-almanac`
   - Secondary: `odins-valhalla` (not "vallhalla")

### Recommendation
**If these database names should exist:**
1. Create documentation for Neon database setup
2. Add environment variable references
3. Decide: Are we using Cosmos DB or PostgreSQL?

**If user has external Neon databases with these names:**
1. Add `DATABASE_URL` environment variable to Azure App Service
2. Install PostgreSQL client libraries (`pg` or `@neondatabase/serverless`)
3. Implement PostgreSQL connection alongside or instead of Cosmos DB

---

## 🟡 Issue #3: Port Configuration Mismatch

### Problem
Infrastructure expects port 8080, but application uses port 3000.

### Evidence

**Bicep Configuration (infra/main.bicep line 336):**
```bicep
{
  name: 'PORT'
  value: '8080'
}
```

**Application Default (server.js, index.js):**
```javascript
const PORT = process.env.PORT || 3000
```

**Documentation (.env.template, COMPREHENSIVE-AUDIT-REPORT.md):**
- Standardized on port 3000

### Impact
🟡 **MEDIUM** - App will start but may have routing issues. Azure expects 8080, app defaults to 3000.

### Recommendation
**Option 1 (Recommended):** App should respect `process.env.PORT` (it already does)
- Azure will set PORT=8080, app will use it ✅

**Option 2:** Update Bicep to use port 3000
```bicep
{
  name: 'PORT'
  value: '3000'
}
```

---

## 🟢 Additional Findings

### Cosmos DB Configuration
✅ **CORRECT:** Cosmos DB is properly configured with:
- Serverless capacity mode (cost-effective)
- Managed identity authentication
- Proper RBAC roles assigned
- Diagnostic logging enabled
- Containers with appropriate partition keys

### Security Configuration
✅ **CORRECT:** 
- HTTPS enforcement
- TLS 1.2 minimum
- Managed identities used
- Key Vault integration
- Rate limiting configured

### Environment Variables
⚠️ **INCOMPLETE:** Missing from Azure Bicep:
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL` (if PostgreSQL is needed)
- `AZURE_COSMOS_KEY` (fallback for local development)

---

## 📋 Action Items

### Immediate (Critical)

- [ ] **Fix Node.js version mismatch**
  - Update `infra/main.bicep` lines 318, 324, 332 from `18-lts` to `20-lts`
  - Redeploy infrastructure

- [ ] **Clarify database strategy**
  - Determine: Cosmos DB only, PostgreSQL only, or both?
  - Remove conflicting documentation
  - Update deployment scripts accordingly

- [ ] **Investigate "muddy sky" and "odins vallhalla" requirement**
  - Confirm with user if these are external Neon databases
  - If yes, add connection configuration
  - If no, document actual database names

### High Priority

- [ ] **Add missing environment variables to Bicep**
  - Add Stripe keys as Key Vault secrets
  - Reference secrets in App Service settings
  - Add DATABASE_URL if PostgreSQL is needed

- [ ] **Test CSS and button functionality**
  - Deploy with corrected Node version
  - Verify static file serving
  - Check Content Security Policy headers

- [ ] **Update documentation**
  - Align database references (Cosmos vs PostgreSQL)
  - Document actual deployment architecture
  - Clarify Node.js version requirements

### Medium Priority

- [ ] **Port standardization**
  - Document that Azure controls the PORT variable
  - Ensure all components respect process.env.PORT

- [ ] **Add health check endpoint**
  - Verify `/health` or `/healthz` is accessible
  - Test with Azure health check configuration

---

## 🎓 Understanding the Architecture

### What's Actually Deployed

```
┌─────────────────────────────────────────────┐
│         Azure App Service (Linux)           │
│  - Node.js 18-lts (SHOULD BE 20-lts) ❌    │
│  - Port 8080                                 │
│  - Managed Identity Enabled                 │
└────────────┬────────────────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                  │
    ┌────────▼─────────┐           ┌──────────▼──────────┐
    │  Azure Cosmos DB  │           │  Azure Key Vault    │
    │  (NoSQL)          │           │  (Secrets)          │
    │                   │           │                     │
    │  Database:        │           │  - Stripe Keys      │
    │  RestaurantIntel  │           │  - DB Credentials   │
    │                   │           └─────────────────────┘
    │  Containers:      │
    │  - restaurants    │
    │  - pldata         │
    │  - inventory      │
    │  - subscriptions  │
    └───────────────────┘
```

### What the Docs Suggest (PostgreSQL/Neon)
```
┌─────────────────────────────────────────────┐
│         Azure App Service                   │
└────────────┬────────────────────────────────┘
             │
             │
    ┌────────▼─────────┐
    │  PostgreSQL       │
    │  (Neon/Supabase)  │
    │                   │
    │  Databases:       │
    │  - muddy sky ❓   │
    │  - odins vallha.. │
    └───────────────────┘
```

**MISMATCH IDENTIFIED** ⚠️

---

## 🚀 Recommended Next Steps

1. **Clarify Requirements with User**
   - What are "muddy sky" and "odins vallhalla"?
   - Are these existing Neon databases that need to be connected?
   - Should the app use Cosmos DB, PostgreSQL, or both?

2. **Fix Critical Node Version Issue**
   - This is preventing the app from running properly
   - Quick fix in Bicep file

3. **Test Deployment**
   - After Node version fix, redeploy
   - Check Azure App Service logs
   - Verify CSS loads and buttons work

4. **Document Actual Architecture**
   - Clear up Cosmos DB vs PostgreSQL confusion
   - Update all references to match actual implementation

---

## 📞 Questions for User

1. **Database Names:** Do "muddy sky" and "odins vallhalla" refer to:
   - Neon database project names you've already created?
   - Database names that should be created?
   - Something else entirely?

2. **Database Type:** Should the application use:
   - Azure Cosmos DB (currently implemented)
   - PostgreSQL/Neon (currently documented but not implemented)
   - Both databases for different purposes?

3. **Node Version:** The issue mentioned Node 22, but:
   - Application is configured for Node 20
   - Should we test with Node 22 or fix to use Node 20?

---

## 📝 Summary

**Root Cause of Issues:**
1. ❌ Node 18 vs Node 20 mismatch causing runtime errors
2. ❌ Database configuration confusion (Cosmos vs PostgreSQL)
3. ❌ Missing database name references suggest incomplete setup

**To Fix Application Errors:**
1. Update Node version in infrastructure to 20-lts
2. Redeploy to Azure
3. Add missing environment variables (Stripe, database)
4. Verify CSS/JavaScript are served correctly with proper headers

**To Address Database Question:**
1. Clarify what "muddy sky" and "odins vallhalla" are
2. Decide on single database strategy
3. Update code and docs to match

---

**Report Status:** COMPLETE  
**Next Action:** Fix Node.js version mismatch in infra/main.bicep
