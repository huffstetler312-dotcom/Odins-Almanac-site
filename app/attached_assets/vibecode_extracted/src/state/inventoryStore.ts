import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  specialty: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "protein" | "vegetables" | "grains" | "dairy" | "other";
  currentStock: number;
  unit: string;
  costPerUnit: number;
  parLevel: number; // Renamed from reorderLevel to parLevel
  suggestedOrder: number;
  supplierId?: string;
  lastUpdated: string;
  posId?: string; // ID for POS system integration
}

export interface POSConnection {
  id: string;
  name: string;
  type: "square" | "toast" | "clover" | "lightspeed" | "other";
  apiKey?: string;
  endpoint?: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: "adjustment" | "sale" | "purchase" | "waste";
  quantity: number;
  reason?: string;
  timestamp: string;
  userId?: string;
  posTransactionId?: string; // Link to POS transaction
}

interface InventoryStore {
  items: InventoryItem[];
  suppliers: Supplier[];
  transactions: InventoryTransaction[];
  posConnections: POSConnection[];
  
  // Inventory Management
  addItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, quantity: number, reason?: string) => void;
  updateParLevel: (itemId: string, parLevel: number) => void;
  
  // Supplier Management
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // POS Integration
  addPOSConnection: (connection: Omit<POSConnection, "id">) => void;
  updatePOSConnection: (id: string, updates: Partial<POSConnection>) => void;
  deletePOSConnection: (id: string) => void;
  syncWithPOS: (connectionId: string) => Promise<void>;
  
  // Transaction History
  getTransactionHistory: (itemId?: string) => InventoryTransaction[];
  
  // Analytics
  getLowStockItems: () => InventoryItem[];
  getTotalInventoryValue: () => number;
  getSuggestedOrderValue: () => number;
  getInventoryTurnover: (itemId: string, days: number) => number;
}

const defaultSuppliers: Supplier[] = [
  {
    id: "supplier1",
    name: "Fresh Foods Distributors",
    contact: "John Smith",
    phone: "(555) 123-4567",
    email: "orders@freshfoods.com",
    specialty: ["vegetables", "dairy"],
  },
  {
    id: "supplier2", 
    name: "Prime Meats Co.",
    contact: "Sarah Johnson",
    phone: "(555) 987-6543",
    email: "sarah@primemeats.com",
    specialty: ["protein"],
  },
  {
    id: "supplier3",
    name: "Grain & More Supply",
    contact: "Mike Davis",
    phone: "(555) 456-7890",
    email: "mike@grainmore.com",
    specialty: ["grains", "other"],
  },
];

const defaultItems: InventoryItem[] = [
  {
    id: "1",
    name: "Chicken Breast",
    category: "protein",
    currentStock: 25,
    unit: "lbs",
    costPerUnit: 4.50,
    parLevel: 50,
    suggestedOrder: 75,
    supplierId: "supplier2",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Ground Beef",
    category: "protein",
    currentStock: 15,
    unit: "lbs",
    costPerUnit: 5.25,
    parLevel: 30,
    suggestedOrder: 45,
    supplierId: "supplier2",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Lettuce",
    category: "vegetables",
    currentStock: 8,
    unit: "heads",
    costPerUnit: 1.25,
    parLevel: 20,
    suggestedOrder: 30,
    supplierId: "supplier1",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Tomatoes",
    category: "vegetables",
    currentStock: 12,
    unit: "lbs",
    costPerUnit: 2.50,
    parLevel: 25,
    suggestedOrder: 40,
    supplierId: "supplier1",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Rice",
    category: "grains",
    currentStock: 45,
    unit: "lbs",
    costPerUnit: 0.85,
    parLevel: 20,
    suggestedOrder: 50,
    supplierId: "supplier3",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Cheese",
    category: "dairy",
    currentStock: 8,
    unit: "lbs",
    costPerUnit: 4.75,
    parLevel: 15,
    suggestedOrder: 25,
    supplierId: "supplier1",
    lastUpdated: new Date().toISOString(),
  },
];

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: defaultItems,
      suppliers: defaultSuppliers,
      transactions: [],
      posConnections: [],

      // Inventory Management
      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: generateId(),
          lastUpdated: new Date().toISOString(),
        };
        set(state => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },

      adjustStock: (itemId, quantity, reason = "Manual adjustment") => {
        const transaction: InventoryTransaction = {
          id: generateId(),
          itemId,
          type: "adjustment",
          quantity,
          reason,
          timestamp: new Date().toISOString(),
        };

        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { 
                  ...item, 
                  currentStock: Math.max(0, item.currentStock + quantity),
                  lastUpdated: new Date().toISOString() 
                }
              : item
          ),
          transactions: [...state.transactions, transaction],
        }));
      },

      updateParLevel: (itemId, parLevel) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, parLevel, lastUpdated: new Date().toISOString() }
              : item
          ),
        }));
      },

      // Supplier Management
      addSupplier: (supplier) => {
        const newSupplier: Supplier = {
          ...supplier,
          id: generateId(),
        };
        set(state => ({ suppliers: [...state.suppliers, newSupplier] }));
      },

      updateSupplier: (id, updates) => {
        set(state => ({
          suppliers: state.suppliers.map(supplier =>
            supplier.id === id ? { ...supplier, ...updates } : supplier
          ),
        }));
      },

      deleteSupplier: (id) => {
        set(state => ({
          suppliers: state.suppliers.filter(supplier => supplier.id !== id),
        }));
      },

      // POS Integration
      addPOSConnection: (connection) => {
        const newConnection: POSConnection = {
          ...connection,
          id: generateId(),
        };
        set(state => ({ posConnections: [...state.posConnections, newConnection] }));
      },

      updatePOSConnection: (id, updates) => {
        set(state => ({
          posConnections: state.posConnections.map(connection =>
            connection.id === id ? { ...connection, ...updates } : connection
          ),
        }));
      },

      deletePOSConnection: (id) => {
        set(state => ({
          posConnections: state.posConnections.filter(connection => connection.id !== id),
        }));
      },

      syncWithPOS: async (connectionId) => {
        // This will be implemented with actual POS integration
        const connection = get().posConnections.find(c => c.id === connectionId);
        if (!connection || !connection.isConnected) {
          throw new Error("POS connection not found or not connected");
        }

        // Mock sync for now - in real implementation, this would call POS API
        set(state => ({
          posConnections: state.posConnections.map(c =>
            c.id === connectionId
              ? { ...c, lastSync: new Date().toISOString() }
              : c
          ),
        }));
      },

      // Transaction History
      getTransactionHistory: (itemId) => {
        const { transactions } = get();
        return itemId
          ? transactions.filter(t => t.itemId === itemId)
          : transactions;
      },

      // Analytics
      getLowStockItems: () => {
        const { items } = get();
        return items.filter(item => item.currentStock <= item.parLevel);
      },

      getTotalInventoryValue: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.currentStock * item.costPerUnit), 0);
      },

      getSuggestedOrderValue: () => {
        const { items } = get();
        return items
          .filter(item => item.currentStock <= item.parLevel)
          .reduce((total, item) => total + (item.suggestedOrder * item.costPerUnit), 0);
      },

      getInventoryTurnover: (itemId, days) => {
        const { transactions } = get();
        const item = get().items.find(i => i.id === itemId);
        if (!item) return 0;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const salesTransactions = transactions.filter(
          t => t.itemId === itemId && 
               t.type === "sale" && 
               new Date(t.timestamp) >= cutoffDate
        );

        const totalSold = salesTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
        const averageInventory = item.currentStock + (totalSold / 2);

        return averageInventory > 0 ? totalSold / averageInventory : 0;
      },
    }),
    {
      name: "inventory-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        suppliers: state.suppliers,
        transactions: state.transactions,
        posConnections: state.posConnections,
      }),
    }
  )
);