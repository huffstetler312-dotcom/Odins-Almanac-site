# 🗄️ Database Configuration Guide
## Odin's Almanac - Database Setup Options

---

## 📊 Current Database Architecture

### What's Actually Implemented: Azure Cosmos DB (NoSQL)

The infrastructure is currently configured to use **Azure Cosmos DB** with the following setup:

```
Database Name: RestaurantIntelligence
Containers:
  - restaurants    (Partition Key: /restaurantId)
  - pldata         (Partition Key: /restaurantId)
  - inventory      (Partition Key: /restaurantId)
  - subscriptions  (Partition Key: /customerId)
```

**Implementation Files:**
- `infra/main.bicep` - Infrastructure as Code
- `server/lib/database/cosmos-client.js` - Database client
- `server/lib/database/restaurant-repository.js` - Data access layer
- `server/lib/database/inventory-repository.js` - Inventory operations

**Environment Variables Required:**
```bash
AZURE_COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
AZURE_COSMOS_KEY=your-key-here  # Optional, uses managed identity in Azure
```

---

## 🔍 Database Names: "muddy sky" and "odins vallhalla"

### Status: NOT FOUND in codebase

After comprehensive search, these database names are **not referenced** anywhere in the current codebase.

### Possible Scenarios:

#### Scenario 1: External Neon Databases
If you have existing Neon PostgreSQL databases with these names, you'll need to:

1. **Add PostgreSQL Support** (currently not implemented)
2. **Install dependencies:**
   ```bash
   npm install pg
   # or for serverless
   npm install @neondatabase/serverless
   ```

3. **Add environment variables:**
   ```bash
   # Neon Database: muddy-sky
   NEON_MUDDY_SKY_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/muddy-sky?sslmode=require
   
   # Neon Database: odins-vallhalla
   NEON_ODINS_VALLHALLA_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/odins-vallhalla?sslmode=require
   ```

4. **Create database client** (see PostgreSQL Integration section below)

#### Scenario 2: Naming Confusion
- **Found:** `odins-valhalla` (with single 'l') - This is an **Azure App Service name**, not a database
- **Looking for:** `odins-vallhalla` (with double 'l') - Not found

#### Scenario 3: Documentation Error
- These names may have been mentioned in planning but never implemented
- Current implementation uses Cosmos DB instead

---

## 🔄 Option 1: Continue with Cosmos DB (Recommended)

**Pros:**
- ✅ Already implemented and configured
- ✅ Serverless, auto-scaling
- ✅ Low latency (< 10ms)
- ✅ Managed identity security
- ✅ Multi-region support built-in

**Cons:**
- ❌ NoSQL (document-based, not relational)
- ❌ Different query language (SQL API but not PostgreSQL)
- ❌ Slightly higher cost than free-tier PostgreSQL

**No changes needed** - everything is ready to go!

---

## 🔄 Option 2: Add PostgreSQL/Neon Support

If you need to connect to existing Neon databases named "muddy sky" and "odins vallhalla":

### Step 1: Create Neon Databases

1. Go to [neon.tech](https://neon.tech)
2. Create two projects:
   - **Project 1:** Name it "muddy-sky" or "muddy sky"
   - **Project 2:** Name it "odins-vallhalla" or "odins valhalla"
3. Copy connection strings for each

### Step 2: Install PostgreSQL Client

```bash
cd /home/runner/work/Odins-Almanac-site/Odins-Almanac-site
npm install @neondatabase/serverless
# or
npm install pg
```

### Step 3: Create PostgreSQL Client Module

Create `server/lib/database/neon-client.js`:

```javascript
const { Pool } = require('pg');
// or
const { neon } = require('@neondatabase/serverless');

class NeonDatabaseClient {
  constructor() {
    // Muddy Sky database connection
    this.muddySkyPool = new Pool({
      connectionString: process.env.NEON_MUDDY_SKY_URL,
      ssl: { rejectUnauthorized: false }
    });

    // Odins Vallhalla database connection
    this.odinsVallhallaPool = new Pool({
      connectionString: process.env.NEON_ODINS_VALLHALLA_URL,
      ssl: { rejectUnauthorized: false }
    });
  }

  async queryMuddySky(sql, params = []) {
    try {
      const result = await this.muddySkyPool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Muddy Sky query error:', error);
      throw error;
    }
  }

  async queryOdinsVallhalla(sql, params = []) {
    try {
      const result = await this.odinsVallhallaPool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Odins Vallhalla query error:', error);
      throw error;
    }
  }

  async close() {
    await this.muddySkyPool.end();
    await this.odinsVallhallaPool.end();
  }
}

module.exports = new NeonDatabaseClient();
```

### Step 4: Add Environment Variables

Update `.env` or Azure App Service configuration:

```bash
# Neon PostgreSQL Databases
NEON_MUDDY_SKY_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/muddy-sky?sslmode=require
NEON_ODINS_VALLHALLA_URL=postgresql://username:password@ep-polished-thunder-789012.us-east-2.aws.neon.tech/odins-vallhalla?sslmode=require
```

For Azure deployment:
```bash
az webapp config appsettings set \
  --name odins-valhalla \
  --resource-group viking-restaurant-rg \
  --settings \
    "NEON_MUDDY_SKY_URL=postgresql://..." \
    "NEON_ODINS_VALLHALLA_URL=postgresql://..."
```

### Step 5: Create Database Schema

For each Neon database, you'll need to create tables:

```sql
-- Example schema for Muddy Sky database
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  restaurant_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example schema for Odins Vallhalla database
CREATE TABLE IF NOT EXISTS pl_data (
  id SERIAL PRIMARY KEY,
  restaurant_id VARCHAR(255) NOT NULL,
  period VARCHAR(50),
  revenue DECIMAL(10, 2),
  expenses DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Option 3: Hybrid Approach (Cosmos DB + PostgreSQL)

Use both databases for different purposes:

- **Cosmos DB:** Primary operational data (restaurants, inventory, subscriptions)
- **Neon "Muddy Sky":** Analytics, reporting, data warehouse
- **Neon "Odins Vallhalla":** Legacy data, backups, or specific integrations

**Implementation:**
```javascript
// In your server code
const cosmosClient = require('./lib/database/cosmos-client');
const neonClient = require('./lib/database/neon-client');

// Write to Cosmos DB for operations
await cosmosClient.restaurantRepo.create(restaurantData);

// Sync to Neon for analytics
await neonClient.queryMuddySky(
  'INSERT INTO restaurants (...) VALUES (...)',
  [...]
);
```

---

## 🎯 Recommendations

### If databases don't exist yet:
**✅ USE COSMOS DB** - It's already fully configured and working

### If databases exist in Neon:
**✅ IMPLEMENT OPTION 2** - Add PostgreSQL support alongside Cosmos DB

### If you're unsure:
**✅ ASK THESE QUESTIONS:**
1. Do you have existing Neon databases named "muddy sky" and "odins vallhalla"?
2. What data is stored in them?
3. Should they replace Cosmos DB or work alongside it?

---

## 🔧 Troubleshooting

### Issue: Can't find database names
**Check:**
- Neon project dashboard - what are your actual project/database names?
- Connection strings - database name is at the end: `...neon.tech/DATABASE_NAME`
- Azure portal - no Neon databases are deployed via Azure infrastructure

### Issue: Connection errors
**Verify:**
- SSL mode is set to `require` or `allow`
- IP allowlist in Neon (add Azure App Service outbound IPs)
- Connection string format is correct
- Environment variables are set in Azure App Service

### Issue: Which database is being used?
**Check logs:**
```javascript
console.log('Database config:', {
  cosmos: !!process.env.AZURE_COSMOS_ENDPOINT,
  muddySky: !!process.env.NEON_MUDDY_SKY_URL,
  odinsVallhalla: !!process.env.NEON_ODINS_VALLHALLA_URL
});
```

---

## 📚 References

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Neon Database Documentation](https://neon.tech/docs)
- [PostgreSQL Node.js Client](https://node-postgres.com/)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)

---

## ✅ Current Status

**Implemented:** ✅ Azure Cosmos DB  
**Not Implemented:** ❌ PostgreSQL/Neon connection  
**Database Names Found:**
- ❌ "muddy sky" - NOT FOUND
- ❌ "odins vallhalla" - NOT FOUND
- ✅ "RestaurantIntelligence" - Cosmos DB database (active)
- ✅ "odins-valhalla" - Azure App Service name (not a database)

---

**Last Updated:** October 29, 2025  
**Status:** Awaiting clarification on "muddy sky" and "odins vallhalla" requirements
