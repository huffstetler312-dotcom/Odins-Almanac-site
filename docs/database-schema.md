# Odin's Almanac - Database Schema Design
## Multi-Tenant Architecture with Azure Cosmos DB

### **Tenant Isolation Strategy**
- **Model**: Partition key-per-tenant
- **Primary Partition Key**: `restaurantId` 
- **Hierarchical Keys**: For large restaurants with multiple locations
  - Level 1: `restaurantId`
  - Level 2: `locationId` (for chain restaurants)
  - Level 3: `transactionId` or `userId` (for high-volume data)

### **Collections (Containers)**

#### 1. **Restaurants Collection**
```json
{
  "id": "restaurant-12345",
  "restaurantId": "rest_12345", // Partition Key
  "name": "Mario's Pizza Palace",
  "type": "italian",
  "locations": [
    {
      "locationId": "loc_001",
      "address": "123 Main St, Seattle, WA",
      "phone": "+1-206-555-0123",
      "isActive": true
    }
  ],
  "subscriptionTier": "pro",
  "settings": {
    "timezone": "America/Los_Angeles",
    "currency": "USD",
    "fiscalYearStart": "01-01"
  },
  "integrations": {
    "posSystem": "square",
    "accounting": "quickbooks",
    "bankConnections": ["chase_checking"]
  },
  "createdAt": "2025-10-23T00:00:00Z",
  "updatedAt": "2025-10-23T00:00:00Z"
}
```

#### 2. **Users Collection**
```json
{
  "id": "user-67890",
  "restaurantId": "rest_12345", // Partition Key
  "email": "mario@pizzapalace.com",
  "name": "Mario Rossi",
  "role": "owner", // owner, manager, staff, readonly
  "permissions": ["analytics.read", "billing.manage", "users.manage"],
  "isActive": true,
  "lastLogin": "2025-10-23T00:00:00Z",
  "authProvider": "azure-ad-b2c",
  "externalId": "azure_user_id_12345",
  "createdAt": "2025-10-23T00:00:00Z"
}
```

#### 3. **Transactions Collection**
```json
{
  "id": "txn-98765",
  "restaurantId": "rest_12345", // Partition Key
  "locationId": "loc_001",
  "type": "sale", // sale, expense, adjustment
  "amount": 45.67,
  "currency": "USD",
  "category": "food_sales",
  "subcategory": "pizza",
  "description": "Large Margherita Pizza + Drinks",
  "paymentMethod": "credit_card",
  "source": "square_pos",
  "externalId": "square_txn_abc123",
  "items": [
    {
      "name": "Large Margherita Pizza",
      "quantity": 1,
      "unitPrice": 18.99,
      "category": "pizza"
    },
    {
      "name": "Coca Cola",
      "quantity": 2,
      "unitPrice": 2.99,
      "category": "beverages"
    }
  ],
  "taxAmount": 4.12,
  "tipAmount": 8.00,
  "processingFees": 1.37,
  "timestamp": "2025-10-23T14:30:00Z",
  "createdAt": "2025-10-23T14:35:00Z"
}
```

#### 4. **Analytics Collection**
```json
{
  "id": "analytics-daily-2025-10-23",
  "restaurantId": "rest_12345", // Partition Key
  "type": "daily_summary",
  "date": "2025-10-23",
  "locationId": "loc_001",
  "metrics": {
    "totalRevenue": 1234.56,
    "totalExpenses": 678.90,
    "netProfit": 555.66,
    "transactionCount": 67,
    "averageTicket": 18.43,
    "topSellingItems": [
      {"name": "Margherita Pizza", "count": 15, "revenue": 284.85},
      {"name": "Caesar Salad", "count": 12, "revenue": 143.88}
    ],
    "hourlyBreakdown": {
      "11": {"revenue": 45.67, "orders": 3},
      "12": {"revenue": 234.56, "orders": 14},
      "13": {"revenue": 345.67, "orders": 18}
    }
  },
  "predictions": {
    "nextDayRevenue": 1300.00,
    "confidence": 0.85,
    "seasonalTrend": "increasing"
  },
  "alerts": [
    {
      "type": "cash_flow_warning",
      "severity": "medium",
      "message": "Cash flow projected to drop below threshold next week"
    }
  ],
  "createdAt": "2025-10-23T23:59:59Z"
}
```

#### 5. **Subscriptions Collection**
```json
{
  "id": "sub-11111",
  "restaurantId": "rest_12345", // Partition Key
  "planId": "pro_monthly",
  "status": "active", // active, cancelled, past_due, suspended
  "currentPeriod": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-11-01T00:00:00Z"
  },
  "billing": {
    "amount": 100.00,
    "currency": "USD",
    "frequency": "monthly",
    "nextBillingDate": "2025-11-01T00:00:00Z",
    "stripeSubscriptionId": "sub_stripe_12345"
  },
  "usage": {
    "transactionsProcessed": 1543,
    "apiCallsThisMonth": 2345,
    "storageUsedMB": 156.7
  },
  "features": ["analytics", "integrations", "alerts", "api_access"],
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-10-23T00:00:00Z"
}
```

### **Indexing Strategy**

#### Primary Indexes (Automatic)
- `id` + `restaurantId` (composite primary key)

#### Secondary Indexes
- **Transactions**: `timestamp`, `category`, `locationId`
- **Users**: `email`, `role`
- **Analytics**: `date`, `type`
- **Restaurants**: `subscriptionTier`

### **Data Partitioning Rules**

1. **Small Restaurants** (< 20GB): Single partition key `restaurantId`
2. **Chain Restaurants** (> 20GB): Hierarchical partitioning
   ```
   Level 1: restaurantId
   Level 2: locationId
   Level 3: transactionId (for high-volume locations)
   ```
3. **Query Optimization**: Always include `restaurantId` in WHERE clauses

### **Security & Compliance**

1. **Encryption**: Customer-managed keys via Azure Key Vault
2. **Access Control**: RBAC with managed identity
3. **Audit Logging**: All read/write operations logged
4. **Data Retention**: Configurable per restaurant (default 7 years)
5. **GDPR Compliance**: Soft delete with purge capabilities

### **Performance Targets**

- **Single-tenant queries**: < 10ms
- **Cross-partition queries**: < 100ms
- **Batch operations**: < 1000 items per batch
- **Throughput**: 400 RU/s baseline, auto-scale to 4000 RU/s