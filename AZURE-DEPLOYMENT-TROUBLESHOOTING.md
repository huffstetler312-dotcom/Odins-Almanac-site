# 🔧 Azure Deployment Troubleshooting Guide

## Common Azure Deployment Issues and Solutions

### Issue 1: Resource Not Found (404) - Deployment Slot Error

**Error Message:**
```json
{
  "error": {
    "message": "Resource not found",
    "code": 404,
    "details": {
      "Resource ID": "/subscriptions/.../providers/Microsoft.Web/sites/odinsalmanac/slots/drbxbhewetbghqdu",
      "Status Code": 404,
      "Status Message": "unavailable"
    }
  }
}
```

**Root Cause:**
The GitHub Actions workflow was attempting to deploy to a non-existent deployment slot. Azure was incorrectly parsing the app name as having a base name and a slot suffix.

**Solution:**
The GitHub Actions workflow has been updated to explicitly specify `slot-name: 'production'` which ensures deployment goes to the main app (production slot) and not to a named deployment slot.

**What Changed:**
```yaml
# Before (could cause slot parsing issues):
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v3
  with:
    app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
    package: release.zip

# After (explicit production slot):
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v3
  with:
    app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
    slot-name: 'production'  # ← Explicitly deploy to production
    package: release.zip
```

**Verification Steps:**
1. Ensure your `AZURE_WEBAPP_NAME` GitHub secret contains only the app service name (e.g., `odinsalmanac` or `odinsalmanac-drbxbhewetbghqdu`)
2. Push a commit to the main branch to trigger the deployment workflow
3. Monitor the GitHub Actions run to ensure deployment succeeds
4. Verify the app is accessible at `https://[your-app-name].azurewebsites.net`

---

### Issue 2: App Service Name Configuration

**Problem:**
Confusion about whether the app name should include suffixes or additional identifiers.

**Solution:**
Your Azure App Service name should match what's shown in the Azure Portal:
- Navigate to Azure Portal → App Services
- Find your app in the list
- Use the exact name shown (e.g., `odinsalmanac-drbxbhewetbghqdu`)
- Set this as the `AZURE_WEBAPP_NAME` secret in GitHub

**To Update GitHub Secret:**
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Update or create the `AZURE_WEBAPP_NAME` secret with your exact Azure App Service name
4. Do NOT include `/slots/...` or any URL path in the secret value

---

### Issue 3: Deployment Slots vs Production Deployment

**Understanding Azure Deployment Slots:**
- **Production Slot:** The main, live version of your app (default)
- **Deployment Slots:** Staging environments for testing before swapping to production
- Most apps only need the production slot

**When to Use Deployment Slots:**
- You want blue-green deployments
- You need a staging environment separate from production
- You want to test changes before they go live

**For Most Users:**
- Deploy directly to production (as configured in the updated workflow)
- Deployment slots are optional and require additional Azure configuration

---

### Issue 4: GitHub Actions Authentication Issues

**If you see authentication errors:**

1. **Verify Your Service Principal Credentials:**
   - Check that the following secrets are set in GitHub:
     - `AZUREAPPSERVICE_CLIENTID_...`
     - `AZUREAPPSERVICE_TENANTID_...`
     - `AZUREAPPSERVICE_SUBSCRIPTIONID_...`

2. **Recreate Service Principal if Needed:**
   ```bash
   # Create a new service principal with correct permissions
   az ad sp create-for-rbac \
     --name "github-actions-odinsalmanac" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group-name} \
     --sdk-auth
   ```

3. **Update GitHub Secrets:**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Update the secrets with the output from the above command

---

### Issue 5: Server Not Starting After Deployment

**Symptoms:**
- Deployment succeeds but app returns 500 errors
- Health check endpoint fails
- App logs show startup errors

**Solutions:**

1. **Check Environment Variables:**
   - Go to Azure Portal → Your App Service → Configuration
   - Verify all required environment variables are set:
     - `NODE_ENV=production`
     - `PORT=8080`
     - `WEBSITE_NODE_DEFAULT_VERSION=20.9.0`
     - Database connection strings
     - API keys (Stripe, etc.)

2. **Review Application Logs:**
   ```bash
   # Using Azure CLI
   az webapp log tail --name your-app-name --resource-group your-resource-group
   ```

3. **Check Startup Command:**
   - Azure Portal → Your App Service → Configuration → General settings
   - Ensure the startup command is correct (usually auto-detected for Node.js)

4. **Verify web.config:**
   - Ensure `web.config` exists in the repository root
   - It should point to the correct entry file (e.g., `server-manager.js` or `server/index.js`)

---

### Issue 6: Static Files Not Serving

**Problem:**
CSS, JavaScript, or other static assets return 404 errors.

**Solutions:**

1. **Check Static File Path:**
   - Ensure static files are in the correct directory (e.g., `public/` or `server/public/`)
   - Verify Express.js static middleware is configured:
   ```javascript
   app.use(express.static(path.join(__dirname, 'public')));
   ```

2. **Verify Deployment Package:**
   - Ensure the deployment ZIP includes the static files
   - Check the GitHub Actions workflow builds/includes all necessary files

3. **Check web.config Rewrite Rules:**
   - The `web.config` should have rules to serve static content before routing to Node.js

---

### Issue 7: Database Connection Failures

**Symptoms:**
- App starts but can't access data
- Health check shows database errors
- Cosmos DB or SQL connection timeouts

**Solutions:**

1. **Verify Connection Strings:**
   - Check `COSMOS_DB_ENDPOINT` and `COSMOS_DB_KEY` in Azure App Service Configuration
   - Ensure they match your Cosmos DB account in Azure Portal

2. **Check Firewall Rules:**
   - Azure Portal → Cosmos DB Account → Firewall and virtual networks
   - Add `0.0.0.0` to allow Azure services (or specific IPs)
   - Enable "Allow access from Azure Portal" for testing

3. **Test Connection:**
   - Use the health check endpoint: `https://your-app.azurewebsites.net/health` or `https://your-app.azurewebsites.net/healthz`
   - Check database health status in the response

---

## Quick Diagnostic Checklist

When deployment fails, check these in order:

- [ ] GitHub Actions workflow completed successfully
- [ ] Azure App Service exists and is running
- [ ] `AZURE_WEBAPP_NAME` secret matches the actual Azure App Service name
- [ ] Deployment is configured for `slot-name: 'production'`
- [ ] All required environment variables are set in Azure App Service Configuration
- [ ] Application logs show no startup errors
- [ ] Health check endpoint returns 200 OK
- [ ] Database connection is successful
- [ ] Static files are accessible

---

## Getting Help

If you continue to experience issues:

1. **Check Application Logs:**
   - Azure Portal → Your App Service → Monitoring → Log stream

2. **Review GitHub Actions Logs:**
   - GitHub repository → Actions tab → Select the failed workflow run

3. **Test Locally:**
   - Run the server locally to ensure code works: `npm start` or `node server/index.js`

4. **Azure Support:**
   - For Azure-specific issues, consult [Azure App Service documentation](https://docs.microsoft.com/azure/app-service/)

---

## Related Documentation

- [AZURE-DEPLOYMENT-CONFIG.md](AZURE-DEPLOYMENT-CONFIG.md) - Environment variables configuration
- [AZURE-SETUP-WALKTHROUGH.md](AZURE-SETUP-WALKTHROUGH.md) - Step-by-step Azure setup
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Comprehensive deployment guide
- [.github/workflows/azure-webapp.yml](.github/workflows/azure-webapp.yml) - Deployment workflow configuration

---

**⚔️ Viking Restaurant Consultants - Technical Support Documentation**
