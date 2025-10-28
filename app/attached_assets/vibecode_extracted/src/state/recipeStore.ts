import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RecipeIngredient {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "entrees" | "appetizers" | "desserts" | "beverages" | "sides";
  price: number;
  ingredients: RecipeIngredient[];
  prepTime?: number; // minutes
  servingSize?: string;
  imageUrl?: string;
  isActive: boolean;
  posId?: string; // Link to POS system menu item
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCostBreakdown {
  totalIngredientCost: number;
  laborCostEstimate: number;
  overheadAllocation: number;
  totalCost: number;
  menuPrice: number;
  grossProfit: number;
  profitMargin: number;
  foodCostPercentage: number;
}

interface RecipeStore {
  menuItems: MenuItem[];
  
  // Menu Item Management
  addMenuItem: (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemActive: (id: string) => void;
  
  // Ingredient Management
  addIngredientToMenuItem: (menuItemId: string, ingredient: RecipeIngredient) => void;
  removeIngredientFromMenuItem: (menuItemId: string, inventoryItemId: string) => void;
  updateIngredientQuantity: (menuItemId: string, inventoryItemId: string, quantity: number) => void;
  
  // Recipe Analysis
  calculateRecipeCost: (menuItemId: string) => RecipeCostBreakdown | null;
  getMenuItemsByCategory: (category: MenuItem["category"]) => MenuItem[];
  searchMenuItems: (query: string) => MenuItem[];
  
  // Bulk Operations
  importMenuFromPOS: (menuItems: Omit<MenuItem, "id" | "createdAt" | "updatedAt">[]) => void;
  exportRecipes: () => string;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Default sample menu items for demo
const defaultMenuItems: MenuItem[] = [
  {
    id: "menu1",
    name: "Classic Burger",
    category: "entrees",
    price: 12.99,
    ingredients: [
      { inventoryItemId: "2", inventoryItemName: "Ground Beef", quantity: 0.33, unit: "lbs" },
      { inventoryItemId: "3", inventoryItemName: "Lettuce", quantity: 0.1, unit: "heads" },
      { inventoryItemId: "4", inventoryItemName: "Tomatoes", quantity: 0.15, unit: "lbs" },
      { inventoryItemId: "6", inventoryItemName: "Cheese", quantity: 0.1, unit: "lbs" },
    ],
    prepTime: 10,
    servingSize: "1 burger",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "menu2",
    name: "Grilled Chicken Bowl",
    category: "entrees",
    price: 14.99,
    ingredients: [
      { inventoryItemId: "1", inventoryItemName: "Chicken Breast", quantity: 0.5, unit: "lbs" },
      { inventoryItemId: "5", inventoryItemName: "Rice", quantity: 0.5, unit: "lbs" },
      { inventoryItemId: "3", inventoryItemName: "Lettuce", quantity: 0.15, unit: "heads" },
      { inventoryItemId: "4", inventoryItemName: "Tomatoes", quantity: 0.2, unit: "lbs" },
    ],
    prepTime: 15,
    servingSize: "1 bowl",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "menu3",
    name: "Caesar Salad",
    category: "appetizers",
    price: 8.99,
    ingredients: [
      { inventoryItemId: "3", inventoryItemName: "Lettuce", quantity: 0.25, unit: "heads" },
      { inventoryItemId: "6", inventoryItemName: "Cheese", quantity: 0.15, unit: "lbs" },
    ],
    prepTime: 5,
    servingSize: "1 salad",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      menuItems: defaultMenuItems,

      addMenuItem: (item) => {
        const newItem: MenuItem = {
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));
      },

      updateMenuItem: (id, updates) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
      },

      toggleMenuItemActive: (id) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      addIngredientToMenuItem: (menuItemId, ingredient) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) => {
            if (item.id === menuItemId) {
              // Check if ingredient already exists
              const exists = item.ingredients.some(
                (ing) => ing.inventoryItemId === ingredient.inventoryItemId
              );
              if (exists) return item;
              
              return {
                ...item,
                ingredients: [...item.ingredients, ingredient],
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          }),
        }));
      },

      removeIngredientFromMenuItem: (menuItemId, inventoryItemId) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === menuItemId
              ? {
                  ...item,
                  ingredients: item.ingredients.filter(
                    (ing) => ing.inventoryItemId !== inventoryItemId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      updateIngredientQuantity: (menuItemId, inventoryItemId, quantity) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === menuItemId
              ? {
                  ...item,
                  ingredients: item.ingredients.map((ing) =>
                    ing.inventoryItemId === inventoryItemId
                      ? { ...ing, quantity }
                      : ing
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      calculateRecipeCost: (menuItemId) => {
        const menuItem = get().menuItems.find((item) => item.id === menuItemId);
        if (!menuItem) return null;

        // Import inventory store to get current prices
        // Note: This is a simplified calculation - in production you'd import useInventoryStore
        const totalIngredientCost = menuItem.ingredients.reduce((total, ingredient) => {
          // Mock cost - in production, fetch from inventory store
          const mockCostPerUnit = 3.5; // Average cost per unit
          return total + (ingredient.quantity * mockCostPerUnit);
        }, 0);

        // Estimate labor cost based on prep time (rough estimate)
        const laborRate = 15; // $15/hour
        const laborCostEstimate = menuItem.prepTime
          ? (menuItem.prepTime / 60) * laborRate
          : 0;

        // Overhead allocation (simplified - typically 10-15% of revenue)
        const overheadAllocation = menuItem.price * 0.12;

        const totalCost = totalIngredientCost + laborCostEstimate + overheadAllocation;
        const grossProfit = menuItem.price - totalCost;
        const profitMargin = (grossProfit / menuItem.price) * 100;
        const foodCostPercentage = (totalIngredientCost / menuItem.price) * 100;

        return {
          totalIngredientCost,
          laborCostEstimate,
          overheadAllocation,
          totalCost,
          menuPrice: menuItem.price,
          grossProfit,
          profitMargin,
          foodCostPercentage,
        };
      },

      getMenuItemsByCategory: (category) => {
        return get().menuItems.filter((item) => item.category === category);
      },

      searchMenuItems: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().menuItems.filter((item) =>
          item.name.toLowerCase().includes(lowerQuery)
        );
      },

      importMenuFromPOS: (menuItems) => {
        const newItems = menuItems.map((item) => ({
          ...item,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        set((state) => ({
          menuItems: [...state.menuItems, ...newItems],
        }));
      },

      exportRecipes: () => {
        const { menuItems } = get();
        return JSON.stringify({ menuItems, exportDate: new Date().toISOString() }, null, 2);
      },
    }),
    {
      name: "recipe-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
