/**
 * Restaurant Data Access Layer for Odin's Eye Intelligence Platform
 * Provides CRUD operations and business logic for restaurant management
 */

const { cosmosClient } = require('./cosmos-client');

class RestaurantRepository {
  constructor() {
    this.databaseId = 'OdinsEye';
    this.containerId = 'Restaurants';
    this.partitionKeyPath = '/restaurantId';
  }

  /**
   * Get container instance with lazy initialization
   * @returns {Promise<Container>} Cosmos DB container
   */
  async getContainer() {
    return await cosmosClient.getContainer(
      this.databaseId,
      this.containerId,
      this.partitionKeyPath,
      800 // Higher throughput for restaurant operations
    );
  }

  /**
   * Create a new restaurant with Viking-themed metadata
   * @param {Object} restaurantData - Restaurant information
   * @returns {Promise<Object>} Created restaurant document
   */
  async createRestaurant(restaurantData) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const restaurant = {
        id: restaurantData.id || this.generateRestaurantId(),
        restaurantId: restaurantData.restaurantId || restaurantData.id,
        name: restaurantData.name,
        type: 'restaurant',
        
        // Business Information
        address: restaurantData.address,
        phone: restaurantData.phone,
        email: restaurantData.email,
        timezone: restaurantData.timezone || 'America/New_York',
        
        // Viking-themed metadata
        battleStats: {
          laborVictoryPercentage: 0,
          wealthShieldStrength: 0,
          empireDefenseRating: 0,
          lastBattleTimestamp: new Date().toISOString()
        },
        
        // Odin's Eye Intelligence Features
        intelligenceConfig: {
          predictiveParLevels: {
            enabled: true,
            algorithms: ['seasonal', 'weather', 'events', 'historical'],
            confidence: 0.85
          },
          actualVsTheoretical: {
            enabled: true,
            trackingMode: 'realtime',
            alertThreshold: 0.15 // 15% variance threshold
          },
          inventoryIntelligence: {
            generativeAI: true,
            patternLearning: true,
            externalFactors: ['weather', 'events', 'holidays', 'promotions']
          }
        },
        
        // System metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        status: 'active'
      };

      const { resource, diagnostics } = await container.items.create(restaurant);
      
      console.log(`🏰 Restaurant '${restaurant.name}' created successfully`, {
        id: resource.id,
        diagnostics: diagnostics?.toString()
      });

      return resource;
      
    }, `CreateRestaurant-${restaurantData.name}`);
  }

  /**
   * Get restaurant by ID with battle stats
   * @param {string} restaurantId - Restaurant identifier
   * @returns {Promise<Object>} Restaurant document
   */
  async getRestaurant(restaurantId) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const { resource, diagnostics } = await container.item(restaurantId, restaurantId).read();
      
      if (!resource) {
        throw {
          code: 404,
          message: `Restaurant '${restaurantId}' not found in the realm`,
          statusCode: 404
        };
      }

      console.log(`🔍 Retrieved restaurant '${resource.name}'`, {
        id: restaurantId,
        diagnostics: diagnostics?.toString()
      });

      return resource;
      
    }, `GetRestaurant-${restaurantId}`);
  }

  /**
   * Update restaurant battle stats and configuration
   * @param {string} restaurantId - Restaurant identifier
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated restaurant document
   */
  async updateRestaurant(restaurantId, updates) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      // Get current restaurant data
      const current = await this.getRestaurant(restaurantId);
      
      // Merge updates with current data
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
        version: (current.version || 1) + 1
      };

      // Update battle stats if provided
      if (updates.battleStats) {
        updated.battleStats = {
          ...current.battleStats,
          ...updates.battleStats,
          lastBattleTimestamp: new Date().toISOString()
        };
      }

      const { resource, diagnostics } = await container.item(restaurantId, restaurantId).replace(updated);
      
      console.log(`⚔️ Restaurant '${resource.name}' battle stats updated`, {
        id: restaurantId,
        version: resource.version,
        diagnostics: diagnostics?.toString()
      });

      return resource;
      
    }, `UpdateRestaurant-${restaurantId}`);
  }

  /**
   * Get all restaurants with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of restaurants
   */
  async getRestaurants(options = {}) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const {
        limit = 50,
        offset = 0,
        status = 'active',
        sortBy = 'name'
      } = options;

      const query = {
        query: `
          SELECT * FROM r 
          WHERE r.type = 'restaurant' 
          AND r.status = @status
          ORDER BY r.${sortBy}
          OFFSET @offset LIMIT @limit
        `,
        parameters: [
          { name: '@status', value: status },
          { name: '@offset', value: offset },
          { name: '@limit', value: limit }
        ]
      };

      const { resources, diagnostics } = await container.items.query(query).fetchAll();
      
      console.log(`🏰 Retrieved ${resources.length} restaurants from the realm`, {
        limit,
        offset,
        diagnostics: diagnostics?.toString()
      });

      return resources;
      
    }, 'GetRestaurants');
  }

  /**
   * Delete restaurant (soft delete by default)
   * @param {string} restaurantId - Restaurant identifier
   * @param {boolean} hardDelete - Whether to permanently delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteRestaurant(restaurantId, hardDelete = false) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      if (hardDelete) {
        // Permanent deletion
        await container.item(restaurantId, restaurantId).delete();
        
        console.log(`💀 Restaurant '${restaurantId}' permanently deleted from realm`);
        
      } else {
        // Soft delete - update status
        await this.updateRestaurant(restaurantId, {
          status: 'deleted',
          deletedAt: new Date().toISOString()
        });
        
        console.log(`🗡️ Restaurant '${restaurantId}' marked for deletion`);
      }

      return true;
      
    }, `DeleteRestaurant-${restaurantId}`);
  }

  /**
   * Update battle stats for restaurant performance tracking
   * @param {string} restaurantId - Restaurant identifier
   * @param {Object} metrics - Performance metrics
   * @returns {Promise<Object>} Updated battle stats
   */
  async updateBattleStats(restaurantId, metrics) {
    const {
      laborEfficiency,
      costSavings,
      wasteReduction,
      customerSatisfaction
    } = metrics;

    // Calculate Viking-themed battle stats
    const laborVictoryPercentage = Math.min(100, laborEfficiency * 100);
    const wealthShieldStrength = Math.min(100, (costSavings / 1000) * 100);
    const empireDefenseRating = Math.min(100, 
      (wasteReduction * 0.4 + customerSatisfaction * 0.6) * 100
    );

    const battleStats = {
      laborVictoryPercentage: Math.round(laborVictoryPercentage * 10) / 10,
      wealthShieldStrength: Math.round(wealthShieldStrength * 10) / 10,
      empireDefenseRating: Math.round(empireDefenseRating * 10) / 10,
      lastBattleTimestamp: new Date().toISOString(),
      metricsHistory: {
        laborEfficiency,
        costSavings,
        wasteReduction,
        customerSatisfaction,
        timestamp: new Date().toISOString()
      }
    };

    return await this.updateRestaurant(restaurantId, { battleStats });
  }

  /**
   * Generate unique restaurant ID with Viking naming
   * @returns {string} Unique restaurant identifier
   */
  generateRestaurantId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `restaurant_${timestamp}_${random}`;
  }
}

module.exports = { RestaurantRepository };