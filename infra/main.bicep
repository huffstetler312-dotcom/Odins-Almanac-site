// Restaurant Intelligence Platform - Main Bicep Template
// Viking Restaurant Consultants - Production Infrastructure

// ============================================================================
// PARAMETERS - Configuration for deployment customization
// ============================================================================

@description('Primary location for all resources')
param location string = resourceGroup().location

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'prod'

@description('Application name prefix')
param appName string = 'restaurant-intelligence'

@description('Resource tags for cost management and organization')
param tags object = {
  Project: 'Restaurant Intelligence Platform'
  Owner: 'Viking Restaurant Consultants'
  Environment: environmentName
  CostCenter: 'Product Development'
}

@description('SKU for App Service Plan')
@allowed(['B1', 'B2', 'S1', 'S2', 'P1v2', 'P2v2'])
param appServicePlanSku string = 'B2'

@description('Cosmos DB account name (must be globally unique)')
param cosmosDbAccountName string = '${appName}-cosmos-${environmentName}-${uniqueString(resourceGroup().id)}'

// ============================================================================
// VARIABLES - Computed values for resource naming and configuration
// ============================================================================

var resourcePrefix = '${appName}-${environmentName}'
var appServicePlanName = '${resourcePrefix}-plan'
var appServiceName = '${resourcePrefix}-app'
var keyVaultName = '${resourcePrefix}-kv-${uniqueString(resourceGroup().id)}'
var applicationInsightsName = '${resourcePrefix}-insights'
var logAnalyticsWorkspaceName = '${resourcePrefix}-logs'
var cosmosDbDatabaseName = 'RestaurantIntelligence'

// ============================================================================
// LOG ANALYTICS WORKSPACE - Centralized logging and monitoring
// ============================================================================

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: environmentName == 'prod' ? 90 : 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ============================================================================
// APPLICATION INSIGHTS - Performance monitoring and telemetry
// ============================================================================

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================================================
// KEY VAULT - Secure secrets management
// ============================================================================

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true // Required for production
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
    accessPolicies: []
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// ============================================================================
// COSMOS DB ACCOUNT - NoSQL database for restaurant data
// ============================================================================

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosDbAccountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environmentName == 'prod'
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless' // Cost-effective for variable workloads
      }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: environmentName == 'prod' ? 240 : 1440
        backupRetentionIntervalInHours: environmentName == 'prod' ? 720 : 240
        backupStorageRedundancy: environmentName == 'prod' ? 'Geo' : 'Local'
      }
    }
    isVirtualNetworkFilterEnabled: false
    enableFreeTier: environmentName != 'prod'
    enableAnalyticalStorage: false
    analyticalStorageConfiguration: null
    publicNetworkAccess: 'Enabled'
    ipRules: []
    disableKeyBasedMetadataWriteAccess: false
    enableMultipleWriteLocations: false
    disableLocalAuth: false // Enable for managed identity access
  }
}

// ============================================================================
// COSMOS DB DATABASE - Restaurant Intelligence database
// ============================================================================

resource cosmosDbDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosDbAccount
  name: cosmosDbDatabaseName
  properties: {
    resource: {
      id: cosmosDbDatabaseName
    }
  }
}

// ============================================================================
// COSMOS DB CONTAINERS - Data containers for different entities
// ============================================================================

resource restaurantsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDbDatabase
  name: 'restaurants'
  properties: {
    resource: {
      id: 'restaurants'
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
            path: '/"_etag"/?'
          }
        ]
      }
      defaultTtl: -1
    }
  }
}

resource plDataContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDbDatabase
  name: 'pldata'
  properties: {
    resource: {
      id: 'pldata'
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
      }
      defaultTtl: -1
    }
  }
}

resource inventoryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDbDatabase
  name: 'inventory'
  properties: {
    resource: {
      id: 'inventory'
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
      }
      defaultTtl: -1
    }
  }
}

resource subscriptionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDbDatabase
  name: 'subscriptions'
  properties: {
    resource: {
      id: 'subscriptions'
      partitionKey: {
        paths: ['/customerId']
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
      }
      defaultTtl: -1
    }
  }
}

// ============================================================================
// APP SERVICE PLAN - Hosting plan for web application
// ============================================================================

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: appServicePlanSku
    tier: appServicePlanSku == 'B1' || appServicePlanSku == 'B2' ? 'Basic' : 
          appServicePlanSku == 'S1' || appServicePlanSku == 'S2' ? 'Standard' : 'PremiumV2'
    size: appServicePlanSku
    family: substring(appServicePlanSku, 0, 1)
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true // Required for Linux App Service
    targetWorkerCount: 1
    targetWorkerSizeId: 0
  }
}

// ============================================================================
// APP SERVICE - Web application hosting
// ============================================================================

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: appServiceName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: appServicePlanSku != 'B1' // Not available on Basic B1
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      http20Enabled: true
      nodeVersion: '18-lts'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '18-lts'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsights.properties.ConnectionString
        }
        {
          name: 'COSMOS_DB_ENDPOINT'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'AZURE_KEY_VAULT_URL'
          value: keyVault.properties.vaultUri
        }
      ]
      healthCheckPath: '/health'
      requestTracingEnabled: true
      httpLoggingEnabled: true
      logsDirectorySizeLimit: 50
      detailedErrorLoggingEnabled: true
    }
    keyVaultReferenceIdentity: 'SystemAssigned'
  }
}

// ============================================================================
// RBAC ROLE ASSIGNMENTS - Security permissions for managed identity
// ============================================================================

// Key Vault Secrets User role for App Service
resource keyVaultSecretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appService.id, 'Key Vault Secrets User')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Cosmos DB Data Contributor role for App Service
resource cosmosDbDataContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cosmosDbAccount.id, appService.id, 'Cosmos DB Data Contributor')
  scope: cosmosDbAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '00000000-0000-0000-0000-000000000002') // Cosmos DB Data Contributor
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================================================
// DIAGNOSTIC SETTINGS - Enable logging and monitoring
// ============================================================================

resource appServiceDiagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${appServiceName}-diagnostics'
  scope: appService
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
      {
        category: 'AppServiceAuditLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 90 : 30
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
    ]
  }
}

resource cosmosDbDiagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${cosmosDbAccountName}-diagnostics'
  scope: cosmosDbAccount
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'DataPlaneRequests'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
      {
        category: 'QueryRuntimeStatistics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
      {
        category: 'PartitionKeyStatistics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
    ]
    metrics: [
      {
        category: 'Requests'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: environmentName == 'prod' ? 30 : 7
        }
      }
    ]
  }
}

// ============================================================================
// OUTPUTS - Return important resource information
// ============================================================================

@description('The App Service application URL')
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'

@description('Application Insights connection string for monitoring')
output applicationInsightsConnectionString string = applicationInsights.properties.ConnectionString

@description('Cosmos DB endpoint URL')
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint

@description('Key Vault URL for secrets management')
output keyVaultUrl string = keyVault.properties.vaultUri

@description('App Service principal ID for additional role assignments')
output appServicePrincipalId string = appService.identity.principalId

@description('Resource group name')
output resourceGroupName string = resourceGroup().name

@description('Log Analytics Workspace ID for additional monitoring setup')
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id