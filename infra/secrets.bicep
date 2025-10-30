// Key Vault Secrets - Restaurant Intelligence Platform
// This template manages secrets after the main infrastructure is deployed

@description('Key Vault name')
param keyVaultName string

@description('Stripe publishable key')
@secure()
param stripePublishableKey string

@description('Stripe secret key')
@secure()
param stripeSecretKey string

@description('Stripe webhook secret')
@secure()
param stripeWebhookSecret string

@description('Cosmos DB connection string')
@secure()
param cosmosDbConnectionString string

// Reference existing Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

// Stripe Publishable Key Secret
resource stripePublishableKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'stripe-publishable-key'
  properties: {
    value: stripePublishableKey
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Stripe Secret Key Secret
resource stripeSecretKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'stripe-secret-key'
  properties: {
    value: stripeSecretKey
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Stripe Webhook Secret
resource stripeWebhookSecretSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'stripe-webhook-secret'
  properties: {
    value: stripeWebhookSecret
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Cosmos DB Connection String
resource cosmosDbConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'cosmos-db-connection-string'
  properties: {
    value: cosmosDbConnectionString
    contentType: 'text/plain'
    attributes: {
      enabled: true
    }
  }
}

// Output secret references for App Service configuration
output stripePublishableKeyReference string = '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=stripe-publishable-key)'
output stripeSecretKeyReference string = '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=stripe-secret-key)'
output stripeWebhookSecretReference string = '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=stripe-webhook-secret)'
output cosmosDbConnectionStringReference string = '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=cosmos-db-connection-string)'
