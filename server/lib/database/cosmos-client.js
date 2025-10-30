/**
 * Azure Cosmos DB Client Manager for Odin's Eye Restaurant Intelligence
 * Implements singleton pattern with managed identity authentication and connection pooling
 */

const { CosmosClient, CosmosDbDiagnosticLevel } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');

class CosmosClientManager {
  constructor() {
    this.client = null;
    this.databases = new Map();
    this.containers = new Map();
    this.retryOptions = {
      maxRetryAttemptsOnThrottledRequests: 9,
      maxRetryWaitTimeInSeconds: 60,
      fixedRetryIntervalInMilliseconds: 500
    };
    
    // Initialize client on first use
    this.initializeClient();
  }

  /**
   * Initialize Cosmos DB client with appropriate authentication
   * Uses emulator key for localhost, managed identity for Azure
   */
  initializeClient() {
    try {
      const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
      
      if (!endpoint) {
        throw new Error('AZURE_COSMOS_ENDPOINT environment variable is required');
      }

      let clientOptions;
      
      // Check if we're using the local emulator
      if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
        console.log('✅ Using Cosmos DB Emulator with well-known key');
        // Use the well-known emulator key for local development
        clientOptions = {
          endpoint,
          key: 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
          diagnosticLevel: CosmosDbDiagnosticLevel.info,
          connectionPolicy: {
            requestTimeout: 30000,
            enableEndpointDiscovery: false, // Disable for emulator
            ...this.retryOptions
          },
          userAgentSuffix: 'OdinsEye-RestaurantIntelligence/1.0'
        };
      } else if (process.env.AZURE_COSMOS_KEY) {
        console.log('✅ Using access key authentication for Azure Cosmos DB');
        // Use access key for development (more reliable than AAD for local dev)
        clientOptions = {
          endpoint,
          key: process.env.AZURE_COSMOS_KEY,
          diagnosticLevel: CosmosDbDiagnosticLevel.info,
          connectionPolicy: {
            requestTimeout: 30000,
            enableEndpointDiscovery: true,
            preferredLocations: ['East US', 'West US 2'],
            ...this.retryOptions
          },
          userAgentSuffix: 'OdinsEye-RestaurantIntelligence/1.0'
        };
      } else {
        console.log('✅ Using managed identity authentication for Azure Cosmos DB');
        // Use managed identity for secure authentication in production
        const credential = new DefaultAzureCredential();
        clientOptions = {
          endpoint,
          aadCredentials: credential,
          diagnosticLevel: CosmosDbDiagnosticLevel.debug,
          connectionPolicy: {
            requestTimeout: 30000,
            enableEndpointDiscovery: true,
            preferredLocations: ['East US', 'West US 2'], // Multi-region failover
            ...this.retryOptions
          },
          userAgentSuffix: 'OdinsEye-RestaurantIntelligence/1.0'
        };
      }

      this.client = new CosmosClient(clientOptions);

      console.log('✅ Cosmos DB client initialized with managed identity authentication');
      
    } catch (error) {
      console.error('🔥 Failed to initialize Cosmos DB client:', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get database with automatic creation and caching
   * @param {string} databaseId - Database identifier
   * @returns {Promise<Database>} Cosmos DB database instance
   */
  async getDatabase(databaseId) {
    try {
      // Return cached database if available
      if (this.databases.has(databaseId)) {
        return this.databases.get(databaseId);
      }

      // Create database if not exists with appropriate throughput
      const { database, diagnostics } = await this.client.databases.createIfNotExists({
        id: databaseId,
        throughput: 400 // Minimum for cost optimization
      });

      // Cache for future use
      this.databases.set(databaseId, database);
      
      console.log(`🏛️ Database '${databaseId}' ready`, {
        diagnostics: diagnostics?.toString(),
        timestamp: new Date().toISOString()
      });

      return database;
      
    } catch (error) {
      console.error(`🔥 Database operation failed for '${databaseId}':`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        diagnostics: error.diagnostics?.toString(),
        timestamp: new Date().toISOString()
      });
      throw this.buildError(error, `Failed to get database '${databaseId}'`);
    }
  }

  /**
   * Get container with automatic creation, caching, and partition key setup
   * @param {string} databaseId - Database identifier
   * @param {string} containerId - Container identifier
   * @param {string} partitionKeyPath - Partition key path (e.g., '/restaurantId')
   * @param {number} throughput - Optional throughput (default: 400)
   * @returns {Promise<Container>} Cosmos DB container instance
   */
  async getContainer(databaseId, containerId, partitionKeyPath = '/id', throughput = 400) {
    try {
      const containerKey = `${databaseId}:${containerId}`;
      
      // Return cached container if available
      if (this.containers.has(containerKey)) {
        return this.containers.get(containerKey);
      }

      const database = await this.getDatabase(databaseId);

      // Create container with hierarchical partition keys for restaurant multi-tenancy
      const containerSpec = {
        id: containerId,
        partitionKey: {
          paths: [partitionKeyPath],
          kind: 'Hash'
        },
        throughput,
        // Enable time-to-live for data lifecycle management
        defaultTtl: -1,
        // Indexing policy optimized for restaurant queries
        indexingPolicy: {
          automatic: true,
          indexingMode: 'consistent',
          includedPaths: [
            { path: '/*' }
          ],
          excludedPaths: [
            { path: '/diagnostics/*' }
          ]
        }
      };

      const { container, diagnostics } = await database.containers.createIfNotExists(containerSpec);

      // Cache for future use
      this.containers.set(containerKey, container);
      
      console.log(`📦 Container '${containerId}' ready in database '${databaseId}'`, {
        partitionKey: partitionKeyPath,
        throughput,
        diagnostics: diagnostics?.toString(),
        timestamp: new Date().toISOString()
      });

      return container;
      
    } catch (error) {
      console.error(`🔥 Container operation failed for '${containerId}':`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        diagnostics: error.diagnostics?.toString(),
        timestamp: new Date().toISOString()
      });
      throw this.buildError(error, `Failed to get container '${containerId}'`);
    }
  }

  /**
   * Execute operation with retry logic and diagnostic logging
   * @param {Function} operation - Async operation to execute
   * @param {string} operationName - Name for logging
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(operation, operationName, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const duration = Date.now() - startTime;
        
        console.log(`✅ ${operationName} completed`, {
          attempt,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
        
        return result;
        
      } catch (error) {
        lastError = error;
        const isThrottled = error.code === 429;
        const isTransient = error.code >= 500 || isThrottled;
        
        console.warn(`⚠️ ${operationName} attempt ${attempt} failed`, {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          isThrottled,
          isTransient,
          diagnostics: error.diagnostics?.toString(),
          timestamp: new Date().toISOString()
        });

        // Don't retry non-transient errors
        if (!isTransient && attempt === 1) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delayMs = isThrottled 
            ? (error.retryAfterInMilliseconds || 1000) 
            : Math.min(1000 * Math.pow(2, attempt - 1), 30000);
            
          console.log(`⏳ Retrying ${operationName} in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All retries exhausted
    console.error(`🔥 ${operationName} failed after ${maxRetries} attempts`);
    throw this.buildError(lastError, `${operationName} failed after retries`);
  }

  /**
   * Build standardized error object
   * @param {Error} error - Original error
   * @param {string} message - Custom message
   * @returns {Object} Standardized error object
   */
  buildError(error, message) {
    const statusCode = error?.statusCode || error?.code || 500;
    return {
      code: statusCode,
      message: `${message}: ${error?.message || 'Unknown error'}`,
      diagnostics: error?.diagnostics?.toString(),
      timestamp: new Date().toISOString(),
      retryable: statusCode >= 500 || statusCode === 429
    };
  }

  /**
   * Health check for Cosmos DB connection
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Simple read operation to test connectivity
      await this.client.getDatabaseAccount();
      
      const duration = Date.now() - startTime;
      
      return {
        status: 'healthy',
        service: 'Azure Cosmos DB',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'Azure Cosmos DB',
        error: error.message,
        diagnostics: error.diagnostics?.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clean shutdown with resource cleanup
   */
  async dispose() {
    try {
      console.log('🧹 Cleaning up Cosmos DB connections...');
      
      // Clear caches
      this.databases.clear();
      this.containers.clear();
      
      // Note: CosmosClient doesn't have explicit close method
      // Connection pooling is handled automatically by the SDK
      this.client = null;
      
      console.log('✅ Cosmos DB cleanup completed');
      
    } catch (error) {
      console.error('⚠️ Error during Cosmos DB cleanup:', error.message);
    }
  }
}

// Export singleton instance
const cosmosClient = new CosmosClientManager();

module.exports = {
  cosmosClient,
  CosmosClientManager
};