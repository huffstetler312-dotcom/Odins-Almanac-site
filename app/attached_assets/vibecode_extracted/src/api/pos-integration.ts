/**
 * POS Integration Service
 * 
 * This service handles integration with various Point of Sale systems
 * to sync inventory levels, sales data, and revenue in real-time.
 */

import { useInventoryStore, POSConnection } from "../state/inventoryStore";
import { usePLStore } from "../state/plStore";

export interface POSSystemConfig {
  type: "square" | "toast" | "clover" | "lightspeed" | "other";
  name: string;
  apiKey: string;
  endpoint: string;
  webhookUrl?: string;
}

export interface POSSaleData {
  transactionId: string;
  timestamp: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    inventoryId?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
}

export interface POSInventoryUpdate {
  itemId: string;
  currentStock: number;
  lastUpdated: string;
}

class POSIntegrationService {
  private connections: Map<string, POSConnection> = new Map();
  private syncIntervals: Map<string, any> = new Map();

  constructor() {
    // Initialize with existing connections
    this.loadConnections();
  }

  private loadConnections() {
    const inventoryStore = useInventoryStore.getState();
    inventoryStore.posConnections.forEach(connection => {
      this.connections.set(connection.id, connection);
    });
  }

  /**
   * Add a new POS connection
   */
  async addConnection(config: POSSystemConfig): Promise<string> {
    try {
      // Test the connection first
      const isValid = await this.testConnection(config);
      if (!isValid) {
        throw new Error("Failed to connect to POS system");
      }

      const connection: Omit<POSConnection, "id"> = {
        name: config.name,
        type: config.type,
        apiKey: config.apiKey,
        endpoint: config.endpoint,
        isConnected: true,
        lastSync: new Date().toISOString(),
      };

      const inventoryStore = useInventoryStore.getState();
      inventoryStore.addPOSConnection(connection);

      // Start auto-sync for this connection
      this.startAutoSync(connection.name); // Using name as temp ID

      return connection.name;
    } catch (error) {
      console.error("Error adding POS connection:", error);
      throw error;
    }
  }

  /**
   * Test connection to POS system
   */
  private async testConnection(config: POSSystemConfig): Promise<boolean> {
    try {
      // Mock implementation - in real app, this would test actual API
      if (config.type === "square") {
        return await this.testSquareConnection(config);
      } else if (config.type === "toast") {
        return await this.testToastConnection(config);
      } else if (config.type === "clover") {
        return await this.testCloverConnection(config);
      } else if (config.type === "lightspeed") {
        return await this.testLightspeedConnection(config);
      }
      
      // For "other" or unknown types, assume valid if required fields are present
      return !!(config.apiKey && config.endpoint);
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Square POS integration
   */
  private async testSquareConnection(config: POSSystemConfig): Promise<boolean> {
    try {
      // Mock Square API test
      const response = await fetch(`${config.endpoint}/v2/locations`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Square connection test failed:", error);
      return false;
    }
  }

  /**
   * Toast POS integration
   */
  private async testToastConnection(config: POSSystemConfig): Promise<boolean> {
    try {
      // Mock Toast API test
      const response = await fetch(`${config.endpoint}/restaurants`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Toast connection test failed:", error);
      return false;
    }
  }

  /**
   * Clover POS integration
   */
  private async testCloverConnection(config: POSSystemConfig): Promise<boolean> {
    try {
      // Mock Clover API test
      const response = await fetch(`${config.endpoint}/v3/merchants/current`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Clover connection test failed:", error);
      return false;
    }
  }

  /**
   * Lightspeed POS integration
   */
  private async testLightspeedConnection(config: POSSystemConfig): Promise<boolean> {
    try {
      // Mock Lightspeed API test
      const response = await fetch(`${config.endpoint}/API/Account/current.json`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Lightspeed connection test failed:", error);
      return false;
    }
  }

  /**
   * Start automatic sync for a connection
   */
  startAutoSync(connectionId: string, intervalMinutes: number = 5) {
    // Clear existing interval if any
    this.stopAutoSync(connectionId);

    const interval = setInterval(async () => {
      try {
        await this.syncConnection(connectionId);
      } catch (error) {
        console.error(`Auto-sync failed for connection ${connectionId}:`, error);
      }
    }, intervalMinutes * 60 * 1000);

    this.syncIntervals.set(connectionId, interval);
  }

  /**
   * Stop automatic sync for a connection
   */
  stopAutoSync(connectionId: string) {
    const interval = this.syncIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(connectionId);
    }
  }

  /**
   * Manually sync a specific connection
   */
  async syncConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isConnected) {
      throw new Error("Connection not found or not connected");
    }

    try {
      // Sync sales data
      const salesData = await this.fetchSalesData(connection);
      this.processSalesData(salesData);

      // Sync inventory updates
      const inventoryUpdates = await this.fetchInventoryUpdates(connection);
      this.processInventoryUpdates(inventoryUpdates);

      // Update last sync time
      const inventoryStore = useInventoryStore.getState();
      inventoryStore.updatePOSConnection(connectionId, {
        lastSync: new Date().toISOString(),
      });

    } catch (error) {
      console.error(`Sync failed for connection ${connectionId}:`, error);
      // Mark connection as disconnected if sync fails repeatedly
      const inventoryStore = useInventoryStore.getState();
      inventoryStore.updatePOSConnection(connectionId, {
        isConnected: false,
      });
      throw error;
    }
  }

  /**
   * Fetch sales data from POS system
   */
  private async fetchSalesData(connection: POSConnection): Promise<POSSaleData[]> {
    // Mock implementation - in real app, this would fetch from actual POS API
    // connection parameter would be used to make API calls to specific POS system
    
    // Generate mock sales data for demonstration
    const mockSales: POSSaleData[] = [
      {
        transactionId: `tx_${Date.now()}`,
        timestamp: new Date().toISOString(),
        items: [
          { name: "Chicken Breast", quantity: 2, price: 15.99, inventoryId: "1" },
          { name: "Rice", quantity: 1, price: 3.99, inventoryId: "5" },
        ],
        totalAmount: 19.98,
        paymentMethod: "card",
      },
    ];

    // In real implementation, use connection.endpoint and connection.apiKey
    console.log(`Fetching sales data from ${connection.name}`);
    return mockSales;
  }

  /**
   * Fetch inventory updates from POS system
   */
  private async fetchInventoryUpdates(connection: POSConnection): Promise<POSInventoryUpdate[]> {
    // Mock implementation - in real app, this would fetch from actual POS API
    // In real implementation, use connection.endpoint and connection.apiKey
    console.log(`Fetching inventory updates from ${connection.name}`);
    return [];
  }

  /**
   * Process sales data and update P&L
   */
  private processSalesData(salesData: POSSaleData[]) {
    const plStore = usePLStore.getState();
    const inventoryStore = useInventoryStore.getState();

    salesData.forEach(sale => {
      // Update revenue
      const currentActuals = plStore.actuals;
      plStore.setActuals({
        ...currentActuals,
        actualRevenue: currentActuals.actualRevenue + sale.totalAmount,
      });

      // Update inventory based on items sold
      sale.items.forEach(soldItem => {
        if (soldItem.inventoryId) {
          // Adjust stock (transaction is automatically created by adjustStock method)
          inventoryStore.adjustStock(
            soldItem.inventoryId,
            -soldItem.quantity,
            `POS sale: ${sale.transactionId}`
          );
        }
      });
    });
  }

  /**
   * Process inventory updates from POS
   */
  private processInventoryUpdates(updates: POSInventoryUpdate[]) {
    const inventoryStore = useInventoryStore.getState();

    updates.forEach(update => {
      const currentItem = inventoryStore.items.find(item => item.id === update.itemId);
      if (currentItem && currentItem.currentStock !== update.currentStock) {
        // Calculate adjustment needed
        const adjustment = update.currentStock - currentItem.currentStock;
        
        inventoryStore.adjustStock(
          update.itemId,
          adjustment,
          "POS system sync"
        );
      }
    });
  }

  /**
   * Get all active connections
   */
  getConnections(): POSConnection[] {
    const inventoryStore = useInventoryStore.getState();
    return inventoryStore.posConnections;
  }

  /**
   * Remove a POS connection
   */
  removeConnection(connectionId: string) {
    this.stopAutoSync(connectionId);
    this.connections.delete(connectionId);
    
    const inventoryStore = useInventoryStore.getState();
    inventoryStore.deletePOSConnection(connectionId);
  }

  /**
   * Get sync status for all connections
   */
  getSyncStatus(): Array<{ connectionId: string; isConnected: boolean; lastSync?: string }> {
    return this.getConnections().map(connection => ({
      connectionId: connection.id,
      isConnected: connection.isConnected,
      lastSync: connection.lastSync,
    }));
  }
}

// Export singleton instance
export const posIntegrationService = new POSIntegrationService();