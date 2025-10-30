#!/usr/bin/env node

/**
 * ODIN'S ALMANAC - DATABASE SETUP SCRIPT 🏰
 * 
 * This script sets up the complete Cosmos DB database structure for
 * the Viking Restaurant Intelligence Platform.
 * 
 * Run this script after the Cosmos DB account is created to initialize:
 * - Database: odins-almanac
 * - All containers with proper partition keys and indexing
 */

const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');

// Viking-themed database configuration
const DATABASE_CONFIG = {
  name: 'odins-almanac',
  description: 'Viking Restaurant Intelligence Platform Database'
};

// Container configurations with proper partition keys
const CONTAINER_CONFIGS = [
  {
    id: 'users',
    partitionKey: '/userId',
    description: 'Viking warriors (users) and their battle profiles',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/email/?' },
        { path: '/battleRank/?' },
        { path: '/restaurants/*/?' }
      ]
    }
  },
  {
    id: 'restaurants',
    partitionKey: '/ownerId',
    description: 'Viking longhouses (restaurants) and their territories',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/name/?' },
        { path: '/location/?' },
        { path: '/subscriptionTier/?' }
      ]
    }
  },
  {
    id: 'inventory',
    partitionKey: '/restaurantId',
    description: 'Battle supplies (inventory) for each longhouse',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/category/?' },
        { path: '/supplier/?' },
        { path: '/quantity/?' },
        { path: '/alertThreshold/?' }
      ]
    }
  },
  {
    id: 'transactions',
    partitionKey: '/restaurantId',
    description: 'Battle records (sales transactions) and spoils of war',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/transactionDate/?' },
        { path: '/totalAmount/?' },
        { path: '/paymentMethod/?' }
      ]
    }
  },
  {
    id: 'analytics',
    partitionKey: '/restaurantId',
    description: 'Battle intelligence (analytics data) and strategic insights',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/reportType/?' },
        { path: '/dateRange/?' },
        { path: '/metrics/?' }
      ]
    }
  },
  {
    id: 'subscriptions',
    partitionKey: '/ownerId',
    description: 'Alliance memberships (subscription plans) and tribute payments',
    indexingPolicy: {
      includedPaths: [
        { path: '/*' },
        { path: '/tier/?' },
        { path: '/status/?' },
        { path: '/expirationDate/?' }
      ]
    }
  }
];

async function setupDatabase() {
  console.log('🏰 Initializing Odin\'s Almanac Database Setup...\n');

  try {
    // Get Cosmos DB endpoint from environment or command line
    const endpoint = process.env.COSMOS_DB_ENDPOINT || process.argv[2];
    
    if (!endpoint) {
      console.error('❌ Error: Cosmos DB endpoint required!');
      console.log('Usage: node setup-database.js <cosmos-db-endpoint>');
      console.log('Or set COSMOS_DB_ENDPOINT environment variable');
      process.exit(1);
    }

    console.log(`🔗 Connecting to Cosmos DB: ${endpoint}`);
    
    // Initialize Cosmos client with managed identity
    const client = new CosmosClient({
      endpoint: endpoint,
      aadCredentials: new DefaultAzureCredential()
    });

    console.log('✅ Cosmos DB client initialized\n');

    // Create database
    console.log(`🏗️  Creating database: ${DATABASE_CONFIG.name}`);
    const { database } = await client.databases.createIfNotExists({
      id: DATABASE_CONFIG.name
    });
    console.log(`✅ Database '${DATABASE_CONFIG.name}' ready\n`);

    // Create all containers
    console.log('🏗️  Creating containers...\n');
    
    for (const containerConfig of CONTAINER_CONFIGS) {
      console.log(`   Creating container: ${containerConfig.id}`);
      console.log(`   Partition Key: ${containerConfig.partitionKey}`);
      console.log(`   Description: ${containerConfig.description}`);
      
      const { container } = await database.containers.createIfNotExists({
        id: containerConfig.id,
        partitionKey: containerConfig.partitionKey,
        indexingPolicy: containerConfig.indexingPolicy
      });
      
      console.log(`   ✅ Container '${containerConfig.id}' ready\n`);
    }

    console.log('🎉 Database setup complete!\n');
    console.log('🏰 Odin\'s Almanac is ready for battle!\n');
    
    // Display summary
    console.log('📊 SETUP SUMMARY:');
    console.log(`   Database: ${DATABASE_CONFIG.name}`);
    console.log(`   Containers: ${CONTAINER_CONFIGS.length}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log('\n⚔️  Your Viking Restaurant Intelligence Platform is ready to conquer!\n');

    return {
      success: true,
      database: DATABASE_CONFIG.name,
      containers: CONTAINER_CONFIGS.map(c => c.id),
      endpoint: endpoint
    };

  } catch (error) {
    console.error('💀 Database setup failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify Cosmos DB account is fully provisioned');
    console.error('2. Check Azure authentication (az login)');
    console.error('3. Ensure proper permissions on Cosmos DB account');
    console.error('4. Verify network connectivity to Azure');
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(result => {
      if (result.success) {
        console.log('🍻 Victory! Database setup completed successfully!');
        process.exit(0);
      } else {
        console.error('💀 Defeat! Database setup failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💀 Fatal error during setup:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, DATABASE_CONFIG, CONTAINER_CONFIGS };