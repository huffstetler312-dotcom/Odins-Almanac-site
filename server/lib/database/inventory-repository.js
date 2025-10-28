/**
 * Inventory Intelligence Data Access Layer
 * Handles actual vs theoretical inventory tracking with predictive par levels
 */

const { cosmosClient } = require('./cosmos-client');

class InventoryRepository {
  constructor() {
    this.databaseId = 'OdinsEye';
    this.containerId = 'Inventory';
    this.partitionKeyPath = '/restaurantId';
  }

  /**
   * Get container instance for inventory operations
   * @returns {Promise<Container>} Cosmos DB container
   */
  async getContainer() {
    return await cosmosClient.getContainer(
      this.databaseId,
      this.containerId,
      this.partitionKeyPath,
      1000 // High throughput for real-time inventory tracking
    );
  }

  /**
   * Create inventory item with predictive intelligence
   * @param {Object} inventoryData - Inventory item data
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventoryItem(inventoryData) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const item = {
        id: inventoryData.id || this.generateInventoryId(inventoryData.restaurantId, inventoryData.itemName),
        restaurantId: inventoryData.restaurantId,
        itemName: inventoryData.itemName,
        category: inventoryData.category,
        type: 'inventory-item',
        
        // Current inventory levels
        actualInventory: {
          quantity: inventoryData.actualQuantity || 0,
          unit: inventoryData.unit || 'units',
          lastUpdated: new Date().toISOString(),
          location: inventoryData.location || 'main-storage'
        },
        
        // Theoretical inventory tracking
        theoreticalInventory: {
          quantity: inventoryData.theoreticalQuantity || inventoryData.actualQuantity || 0,
          calculatedAt: new Date().toISOString(),
          algorithm: 'baseline',
          confidence: 0.95
        },
        
        // Predictive Par Level Intelligence (Patent-pending)
        parLevelIntelligence: {
          currentParLevel: inventoryData.parLevel || 50,
          predictedParLevel: inventoryData.parLevel || 50,
          
          // External factor correlation
          externalFactors: {
            weather: { impact: 0, confidence: 0 },
            events: { impact: 0, confidence: 0 },
            holidays: { impact: 0, confidence: 0 },
            promotions: { impact: 0, confidence: 0 },
            seasonality: { impact: 0, confidence: 0 }
          },
          
          // Learning algorithm state
          algorithmState: {
            pattern: 'learning',
            dataPoints: 0,
            accuracy: 0,
            lastTraining: new Date().toISOString()
          }
        },
        
        // Cost and supplier information
        costData: {
          unitCost: inventoryData.unitCost || 0,
          supplier: inventoryData.supplier || 'unknown',
          leadTimeDays: inventoryData.leadTimeDays || 7,
          minimumOrderQuantity: inventoryData.minimumOrderQuantity || 1
        },
        
        // System metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      const { resource, diagnostics } = await container.items.create(item);
      
      console.log(`📦 Inventory item '${item.itemName}' created for restaurant ${item.restaurantId}`, {
        id: resource.id,
        diagnostics: diagnostics?.toString()
      });

      return resource;
      
    }, `CreateInventoryItem-${inventoryData.itemName}`);
  }

  /**
   * Update actual inventory with variance tracking
   * @param {string} restaurantId - Restaurant identifier
   * @param {string} itemId - Inventory item ID
   * @param {number} newQuantity - New actual quantity
   * @param {string} updateReason - Reason for update
   * @returns {Promise<Object>} Updated inventory item with variance analysis
   */
  async updateActualInventory(restaurantId, itemId, newQuantity, updateReason = 'manual-count') {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      // Get current item
      const { resource: current } = await container.item(itemId, restaurantId).read();
      
      if (!current) {
        throw {
          code: 404,
          message: `Inventory item '${itemId}' not found`,
          statusCode: 404
        };
      }

      const previousActual = current.actualInventory.quantity;
      const theoretical = current.theoreticalInventory.quantity;
      
      // Calculate variance (actual vs theoretical)
      const variance = newQuantity - theoretical;
      const variancePercentage = theoretical > 0 ? (variance / theoretical) * 100 : 0;
      
      // Update item with variance tracking
      const updated = {
        ...current,
        actualInventory: {
          ...current.actualInventory,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
          previousQuantity: previousActual,
          updateReason
        },
        
        // Variance analysis
        varianceAnalysis: {
          variance,
          variancePercentage: Math.round(variancePercentage * 100) / 100,
          isSignificant: Math.abs(variancePercentage) > 15, // 15% threshold
          trend: this.calculateVarianceTrend(current.varianceHistory || [], variancePercentage),
          timestamp: new Date().toISOString()
        },
        
        // Update variance history for learning
        varianceHistory: [
          ...(current.varianceHistory || []).slice(-29), // Keep last 30 entries
          {
            actual: newQuantity,
            theoretical,
            variance,
            variancePercentage,
            timestamp: new Date().toISOString(),
            reason: updateReason
          }
        ],
        
        updatedAt: new Date().toISOString()
      };

      const { resource, diagnostics } = await container.item(itemId, restaurantId).replace(updated);
      
      console.log(`📊 Actual inventory updated for '${current.itemName}'`, {
        previousActual,
        newActual: newQuantity,
        theoretical,
        variance: `${variancePercentage.toFixed(1)}%`,
        significant: updated.varianceAnalysis.isSignificant,
        diagnostics: diagnostics?.toString()
      });

      // Trigger alert if significant variance
      if (updated.varianceAnalysis.isSignificant) {
        await this.triggerVarianceAlert(restaurantId, resource);
      }

      return resource;
      
    }, `UpdateActualInventory-${itemId}`);
  }

  /**
   * Update theoretical inventory using predictive algorithms
   * @param {string} restaurantId - Restaurant identifier
   * @param {string} itemId - Inventory item ID
   * @param {Object} externalFactors - External factors for prediction
   * @returns {Promise<Object>} Updated theoretical inventory
   */
  async updateTheoreticalInventory(restaurantId, itemId, externalFactors = {}) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const { resource: current } = await container.item(itemId, restaurantId).read();
      
      if (!current) {
        throw {
          code: 404,
          message: `Inventory item '${itemId}' not found`,
          statusCode: 404
        };
      }

      // Calculate new theoretical quantity using AI algorithms
      const prediction = await this.calculateTheoreticalQuantity(current, externalFactors);
      
      const updated = {
        ...current,
        theoreticalInventory: {
          quantity: prediction.quantity,
          calculatedAt: new Date().toISOString(),
          algorithm: prediction.algorithm,
          confidence: prediction.confidence,
          externalFactorsUsed: externalFactors
        },
        
        // Update par level intelligence
        parLevelIntelligence: {
          ...current.parLevelIntelligence,
          predictedParLevel: prediction.parLevel,
          externalFactors: prediction.externalFactorImpact,
          algorithmState: {
            ...current.parLevelIntelligence.algorithmState,
            dataPoints: (current.parLevelIntelligence.algorithmState.dataPoints || 0) + 1,
            accuracy: prediction.confidence,
            lastTraining: new Date().toISOString()
          }
        },
        
        updatedAt: new Date().toISOString()
      };

      const { resource, diagnostics } = await container.item(itemId, restaurantId).replace(updated);
      
      console.log(`🧠 Theoretical inventory updated for '${current.itemName}'`, {
        algorithm: prediction.algorithm,
        confidence: `${(prediction.confidence * 100).toFixed(1)}%`,
        parLevel: prediction.parLevel,
        diagnostics: diagnostics?.toString()
      });

      return resource;
      
    }, `UpdateTheoreticalInventory-${itemId}`);
  }

  /**
   * Get inventory items with actual vs theoretical analysis
   * @param {string} restaurantId - Restaurant identifier
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Inventory items with variance analysis
   */
  async getInventoryWithAnalysis(restaurantId, options = {}) {
    return await cosmosClient.executeWithRetry(async () => {
      const container = await this.getContainer();
      
      const {
        category,
        showOnlyVariances = false,
        varianceThreshold = 15,
        limit = 100
      } = options;

      let queryString = `
        SELECT * FROM i 
        WHERE i.restaurantId = @restaurantId 
        AND i.type = 'inventory-item' 
        AND i.status = 'active'
      `;
      
      const parameters = [
        { name: '@restaurantId', value: restaurantId }
      ];

      if (category) {
        queryString += ' AND i.category = @category';
        parameters.push({ name: '@category', value: category });
      }

      if (showOnlyVariances) {
        queryString += ` AND (
          ABS((i.actualInventory.quantity - i.theoreticalInventory.quantity) / 
              i.theoreticalInventory.quantity * 100) > @threshold
          OR i.theoreticalInventory.quantity = 0
        )`;
        parameters.push({ name: '@threshold', value: varianceThreshold });
      }

      queryString += ` ORDER BY i.itemName OFFSET 0 LIMIT @limit`;
      parameters.push({ name: '@limit', value: limit });

      const query = { query: queryString, parameters };
      
      const { resources, diagnostics } = await container.items.query(query).fetchAll();
      
      // Enhance with real-time variance calculations
      const enhancedItems = resources.map(item => ({
        ...item,
        realtimeVariance: this.calculateRealtimeVariance(item)
      }));
      
      console.log(`📈 Retrieved ${enhancedItems.length} inventory items with analysis`, {
        restaurantId,
        showOnlyVariances,
        diagnostics: diagnostics?.toString()
      });

      return enhancedItems;
      
    }, `GetInventoryAnalysis-${restaurantId}`);
  }

  /**
   * Calculate theoretical quantity using predictive algorithms
   * @param {Object} item - Current inventory item
   * @param {Object} externalFactors - External factors
   * @returns {Promise<Object>} Prediction result
   */
  async calculateTheoreticalQuantity(item, externalFactors) {
    // Simplified prediction algorithm (replace with actual ML model)
    const baseQuantity = item.actualInventory.quantity;
    const historicalAverage = this.calculateHistoricalAverage(item.varianceHistory || []);
    
    // External factor impacts
    const weatherImpact = externalFactors.weather?.temperature > 85 ? 1.2 : 1.0;
    const eventImpact = externalFactors.events?.count > 0 ? 1.3 : 1.0;
    const holidayImpact = externalFactors.holiday ? 1.5 : 1.0;
    
    const predictedQuantity = Math.round(
      (baseQuantity + historicalAverage) * weatherImpact * eventImpact * holidayImpact
    );
    
    return {
      quantity: Math.max(0, predictedQuantity),
      algorithm: 'predictive-ml-v1',
      confidence: 0.85,
      parLevel: Math.round(predictedQuantity * 1.2), // 20% buffer
      externalFactorImpact: {
        weather: { impact: (weatherImpact - 1) * 100, confidence: 0.7 },
        events: { impact: (eventImpact - 1) * 100, confidence: 0.8 },
        holidays: { impact: (holidayImpact - 1) * 100, confidence: 0.9 }
      }
    };
  }

  /**
   * Calculate historical average from variance history
   * @param {Array} varianceHistory - Historical variance data
   * @returns {number} Historical average
   */
  calculateHistoricalAverage(varianceHistory) {
    if (varianceHistory.length === 0) return 0;
    
    const recentHistory = varianceHistory.slice(-7); // Last 7 entries
    const sum = recentHistory.reduce((acc, entry) => acc + entry.actual, 0);
    return Math.round(sum / recentHistory.length);
  }

  /**
   * Calculate variance trend
   * @param {Array} history - Variance history
   * @param {number} currentVariance - Current variance percentage
   * @returns {string} Trend direction
   */
  calculateVarianceTrend(history, currentVariance) {
    if (history.length < 2) return 'stable';
    
    const recentVariances = history.slice(-3).map(h => h.variancePercentage);
    const average = recentVariances.reduce((a, b) => a + b, 0) / recentVariances.length;
    
    if (currentVariance > average + 5) return 'increasing';
    if (currentVariance < average - 5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate real-time variance analysis
   * @param {Object} item - Inventory item
   * @returns {Object} Real-time variance data
   */
  calculateRealtimeVariance(item) {
    const actual = item.actualInventory.quantity;
    const theoretical = item.theoreticalInventory.quantity;
    
    if (theoretical === 0) {
      return {
        variance: actual,
        variancePercentage: actual > 0 ? 100 : 0,
        status: actual > 0 ? 'overstocked' : 'accurate',
        alertLevel: actual > 0 ? 'warning' : 'normal'
      };
    }
    
    const variance = actual - theoretical;
    const variancePercentage = (variance / theoretical) * 100;
    const absVariance = Math.abs(variancePercentage);
    
    let status = 'accurate';
    let alertLevel = 'normal';
    
    if (absVariance > 25) {
      status = variance > 0 ? 'overstocked' : 'understocked';
      alertLevel = 'critical';
    } else if (absVariance > 15) {
      status = variance > 0 ? 'overstocked' : 'understocked';
      alertLevel = 'warning';
    }
    
    return {
      variance,
      variancePercentage: Math.round(variancePercentage * 100) / 100,
      status,
      alertLevel
    };
  }

  /**
   * Trigger variance alert for significant discrepancies
   * @param {string} restaurantId - Restaurant identifier
   * @param {Object} item - Inventory item with variance
   * @returns {Promise<void>}
   */
  async triggerVarianceAlert(restaurantId, item) {
    // Log alert (in production, this would trigger notifications)
    console.warn(`🚨 VARIANCE ALERT: ${item.itemName} in restaurant ${restaurantId}`, {
      actual: item.actualInventory.quantity,
      theoretical: item.theoreticalInventory.quantity,
      variance: `${item.varianceAnalysis.variancePercentage}%`,
      trend: item.varianceAnalysis.trend,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate unique inventory item ID
   * @param {string} restaurantId - Restaurant identifier
   * @param {string} itemName - Item name
   * @returns {string} Unique inventory ID
   */
  generateInventoryId(restaurantId, itemName) {
    const cleanName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    return `inv-${restaurantId}-${cleanName}-${timestamp}`;
  }
}

module.exports = { InventoryRepository };