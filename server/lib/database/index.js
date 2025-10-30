/**
 * Database Connection Layer Index
 * Exports all database components for Odin's Eye Restaurant Intelligence Platform
 */

const { cosmosClient, CosmosClientManager } = require('./cosmos-client');
const { RestaurantRepository } = require('./restaurant-repository');
const { InventoryRepository } = require('./inventory-repository');

// Create repository instances
const restaurantRepo = new RestaurantRepository();
const inventoryRepo = new InventoryRepository();

/**
 * Initialize database connections and perform health checks
 * @returns {Promise<Object>} Initialization status
 */
async function initializeDatabase() {
  try {
    console.log('🏰 Initializing Odin\'s Eye database connections...');
    
    // Perform health check
    const healthStatus = await cosmosClient.healthCheck();
    
    if (healthStatus.status !== 'healthy') {
      throw new Error(`Database health check failed: ${healthStatus.error}`);
    }
    
    console.log('✅ Database initialization completed successfully', {
      service: healthStatus.service,
      duration: healthStatus.duration,
      timestamp: healthStatus.timestamp
    });
    
    return {
      status: 'initialized',
      repositories: {
        restaurants: 'ready',
        inventory: 'ready'
      },
      healthStatus
    };
    
  } catch (error) {
    console.error('🔥 Database initialization failed:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

/**
 * Graceful shutdown of database connections
 * @returns {Promise<void>}
 */
async function shutdownDatabase() {
  try {
    console.log('🛡️ Shutting down Odin\'s Eye database connections...');
    
    await cosmosClient.dispose();
    
    console.log('✅ Database shutdown completed successfully');
    
  } catch (error) {
    console.error('⚠️ Error during database shutdown:', error.message);
  }
}

/**
 * Get database health status
 * @returns {Promise<Object>} Health status
 */
async function getDatabaseHealth() {
  return await cosmosClient.healthCheck();
}

// Export all database components
module.exports = {
  // Core client
  cosmosClient,
  CosmosClientManager,
  
  // Repositories
  restaurantRepo,
  inventoryRepo,
  RestaurantRepository,
  InventoryRepository,
  
  // Lifecycle functions
  initializeDatabase,
  shutdownDatabase,
  getDatabaseHealth
};