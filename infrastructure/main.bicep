// Azure Infrastructure for Odin's Almanac SaaS Platform
// This Bicep template creates the core Azure resources

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'odins-almanac'

// Variables
var cosmosDbAccountName = '${appName}-cosmos-${environment}'
var keyVaultName = '${appName}-kv-${environment}'
var appServicePlanName = '${appName}-asp-${environment}'
var webAppName = '${appName}-web-${environment}'
var applicationInsightsName = '${appName}-ai-${environment}'

// Cosmos DB Account
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosDbAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds: 300
      maxStalenessPrefix: 100000
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless' // Cost-effective for startup
      }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 720 // 30 days
        backupStorageRedundancy: 'Local'
      }
    }
    isVirtualNetworkFilterEnabled: false
    enableFreeTier: environment == 'dev' ? true : false
    enableAnalyticalStorage: false
    analyticalStorageConfiguration: {
      schemaType: 'WellDefined'
    }
    createMode: 'Default'
  }
}

// Cosmos DB Database
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosDbAccount
  name: 'OdinsAlmanac'
  properties: {
    resource: {
      id: 'OdinsAlmanac'
    }
  }
}

// Cosmos DB Containers
resource restaurantsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'Restaurants'
  properties: {
    resource: {
      id: 'Restaurants'
      partitionKey: {
        paths: ['/restaurantId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/\"_etag\"/?'
          }
        ]
        compositeIndexes: [
          [
            {
              path: '/subscriptionTier'
              order: 'ascending'
            }
            {
              path: '/createdAt'
              order: 'descending'
            }
          ]
        ]
      }
      uniqueKeyPolicy: {
        uniqueKeys: []
      }
    }
  }
}

resource usersContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'Users'
  properties: {
    resource: {
      id: 'Users'
      partitionKey: {
        paths: ['/restaurantId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/\"_etag\"/?'
          }
        ]
        compositeIndexes: [
          [
            {
              path: '/email'
              order: 'ascending'
            }
          ]
          [
            {
              path: '/role'
              order: 'ascending'
            }
            {
              path: '/isActive'
              order: 'ascending'
            }
          ]
        ]
      }
    }
  }
}

resource transactionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'Transactions'
  properties: {
    resource: {
      id: 'Transactions'
      partitionKey: {
        paths: ['/restaurantId', '/locationId'] // Hierarchical partitioning
        kind: 'MultiHash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/\"_etag\"/?'
          }
          {
            path: '/items/*/description/?'
          }
        ]
        compositeIndexes: [
          [
            {
              path: '/timestamp'
              order: 'descending'
            }
          ]
          [
            {
              path: '/category'
              order: 'ascending'
            }
            {
              path: '/timestamp'
              order: 'descending'
            }
          ]
          [
            {
              path: '/type'
              order: 'ascending'
            }
            {
              path: '/amount'
              order: 'descending'
            }
          ]
        ]
      }
    }
  }
}

resource analyticsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'Analytics'
  properties: {
    resource: {
      id: 'Analytics'
      partitionKey: {
        paths: ['/restaurantId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/\"_etag\"/?'
          }
        ]
        compositeIndexes: [
          [
            {
              path: '/date'
              order: 'descending'
            }
          ]
          [
            {
              path: '/type'
              order: 'ascending'
            }
            {
              path: '/date'
              order: 'descending'
            }
          ]
        ]
      }
    }
  }
}

resource subscriptionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'Subscriptions'
  properties: {
    resource: {
      id: 'Subscriptions'
      partitionKey: {
        paths: ['/restaurantId']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/\"_etag\"/?'
          }
        ]
        compositeIndexes: [
          [
            {
              path: '/status'
              order: 'ascending'
            }
          ]
          [
            {
              path: '/billing/nextBillingDate'
              order: 'ascending'
            }
          ]
        ]
      }
    }
  }
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
    RetentionInDays: 30
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${appName}-logs-${environment}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      searchVersion: 1
      legacy: 0
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: environment == 'prod' ? 'P1V3' : 'B1'
    capacity: environment == 'prod' ? 2 : 1
  }
  properties: {
    reserved: true // Linux
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: environment == 'prod' ? true : false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: applicationInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'NODE_ENV'
          value: environment
        }
        {
          name: 'COSMOS_DB_ENDPOINT'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'KEY_VAULT_URL'
          value: keyVault.properties.vaultUri
        }
      ]
    }
    httpsOnly: true
  }
}

// RBAC assignments for managed identity
resource cosmosDbDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cosmosDbAccount.id, webApp.id, 'cosmosdb-data-contributor')
  scope: cosmosDbAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '00000000-0000-0000-0000-000000000002') // Cosmos DB Built-in Data Contributor
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource keyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, webApp.id, 'keyvault-secrets-user')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Output values
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint
output keyVaultUrl string = keyVault.properties.vaultUri
output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output applicationInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey