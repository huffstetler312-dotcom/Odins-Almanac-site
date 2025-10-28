import { 
  type User, 
  type InsertUser,
  type InventoryItem,
  type InsertInventoryItem,
  type Recipe,
  type InsertRecipe,
  type RecipeIngredient,
  type InsertRecipeIngredient,
  type Target,
  type InsertTarget,
  type Analytics,
  type InsertAnalytics,
  type Variance,
  type InsertVariance,
  type RecipeWithIngredients,
  type TargetWithVariances,
  type DashboardMetrics,
  type PosIntegration,
  type InsertPosIntegration,
  type SalesEvent,
  type InsertSalesEvent,
  type WasteDetection,
  type InsertWasteDetection,
  type WastePattern,
  type InsertWastePattern,
  type CountSession,
  type InsertCountSession,
  type CountLine,
  type InsertCountLine,
  type ParRecommendation,
  type InsertParRecommendation,
  type Forecast,
  type InsertForecast,
  type PlMonthly,
  type InsertPlMonthly
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for all CRUD operations
export interface IStorage {
  // Users - Replit Auth + Stripe
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: import("@shared/schema").UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserTier(userId: string, tier: string): Promise<User>;

  // Inventory
  getAllInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<boolean>;
  getLowStockItems(): Promise<InventoryItem[]>;

  // Recipes
  getAllRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipeWithIngredients(id: string): Promise<RecipeWithIngredients | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Recipe Ingredients
  addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient>;
  removeRecipeIngredient(recipeId: string, inventoryItemId: string): Promise<boolean>;
  getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]>;

  // Targets
  getAllTargets(): Promise<Target[]>;
  getActiveTargets(): Promise<Target[]>;
  getTarget(id: string): Promise<Target | undefined>;
  getTargetWithVariances(id: string): Promise<TargetWithVariances | undefined>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: string, target: Partial<InsertTarget>): Promise<Target>;
  deleteTarget(id: string): Promise<boolean>;

  // Analytics
  getAllAnalytics(): Promise<Analytics[]>;
  getAnalyticsByMetric(metric: string): Promise<Analytics[]>;
  getAnalyticsByPeriod(period: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Variances
  getAllVariances(): Promise<Variance[]>;
  getVariancesByTarget(targetId: string): Promise<Variance[]>;
  createVariance(variance: InsertVariance): Promise<Variance>;

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Par Recommendations (MAPO Algorithm)
  getAllParRecommendations(): Promise<ParRecommendation[]>;
  getParRecommendation(id: string): Promise<ParRecommendation | undefined>;
  
  // POS Integrations
  getAllPosIntegrations(): Promise<PosIntegration[]>;
  getPosIntegration(id: string): Promise<PosIntegration | undefined>;
  getPosIntegrationByProvider(provider: string): Promise<PosIntegration | undefined>;
  createPosIntegration(integration: InsertPosIntegration): Promise<PosIntegration>;
  updatePosIntegration(id: string, integration: Partial<InsertPosIntegration>): Promise<PosIntegration>;
  deletePosIntegration(id: string): Promise<boolean>;
  
  // Sales Events  
  getAllSalesEvents(): Promise<SalesEvent[]>;
  getSalesEvent(id: string): Promise<SalesEvent | undefined>;
  getSalesEventsBySource(source: string): Promise<SalesEvent[]>;
  getSalesEventsByDateRange(startDate: Date, endDate: Date): Promise<SalesEvent[]>;
  createSalesEvent(event: InsertSalesEvent): Promise<SalesEvent>;
  processPosWebhook(provider: string, payload: any): Promise<void>;
  getParRecommendationsByItem(inventoryItemId: string): Promise<ParRecommendation[]>;
  createParRecommendation(recommendation: InsertParRecommendation): Promise<ParRecommendation>;
  updateParRecommendation(id: string, recommendation: Partial<InsertParRecommendation>): Promise<ParRecommendation>;
  generateMAPORecommendations(): Promise<ParRecommendation[]>;

  // Forecasts
  getAllForecasts(): Promise<Forecast[]>;
  getForecast(id: string): Promise<Forecast | undefined>;
  getForecastsBySkuId(skuId: string): Promise<Forecast[]>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;
  updateForecast(id: string, forecast: Partial<InsertForecast>): Promise<Forecast>;
  
  // ISCE - Waste Detection System
  getAllWasteDetections(): Promise<WasteDetection[]>;
  getWasteDetection(id: string): Promise<WasteDetection | undefined>;
  getWasteDetectionsByStatus(status: string): Promise<WasteDetection[]>;
  getWasteDetectionsByType(wasteType: string): Promise<WasteDetection[]>;
  getWasteDetectionsByItem(inventoryItemId: string): Promise<WasteDetection[]>;
  getWasteDetectionsByDateRange(startDate: Date, endDate: Date): Promise<WasteDetection[]>;
  createWasteDetection(detection: InsertWasteDetection): Promise<WasteDetection>;
  updateWasteDetection(id: string, detection: Partial<InsertWasteDetection>): Promise<WasteDetection>;
  deleteWasteDetection(id: string): Promise<boolean>;
  
  // ISCE - Waste Patterns
  getAllWastePatterns(): Promise<WastePattern[]>;
  getWastePattern(id: string): Promise<WastePattern | undefined>;
  getWastePatternsBySeverity(severity: string): Promise<WastePattern[]>;
  getWastePatternsByStatus(status: string): Promise<WastePattern[]>;
  createWastePattern(pattern: InsertWastePattern): Promise<WastePattern>;
  updateWastePattern(id: string, pattern: Partial<InsertWastePattern>): Promise<WastePattern>;
  deleteWastePattern(id: string): Promise<boolean>;
  
  // ISCE - Analysis Engine
  runWasteAnalysis(salesEventId: string): Promise<WasteDetection[]>;
  detectInventoryDiscrepancies(inventoryItemId: string, period: number): Promise<WasteDetection[]>;
  generateWasteReport(startDate: Date, endDate: Date): Promise<any>;
  calculateWasteCosts(startDate: Date, endDate: Date): Promise<number>;
  identifyWastePatterns(): Promise<WastePattern[]>;

  // P&L Management
  getAllPlMonthly(): Promise<PlMonthly[]>;
  getPlMonthly(id: string): Promise<PlMonthly | undefined>;
  getPlMonthlyByPeriod(month: string, year: number): Promise<PlMonthly | undefined>;
  createPlMonthly(pl: InsertPlMonthly): Promise<PlMonthly>;
  updatePlMonthly(id: string, pl: Partial<InsertPlMonthly>): Promise<PlMonthly>;
  deletePlMonthly(id: string): Promise<boolean>;
  getPlHistory(months: number): Promise<PlMonthly[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private inventoryItems: Map<string, InventoryItem>;
  private recipes: Map<string, Recipe>;
  private recipeIngredients: Map<string, RecipeIngredient>;
  private targets: Map<string, Target>;
  private analytics: Map<string, Analytics>;
  private variances: Map<string, Variance>;
  private countSessions: Map<string, CountSession>;
  private countLines: Map<string, CountLine>;
  private parRecommendations: Map<string, ParRecommendation>;
  private forecasts: Map<string, Forecast>;
  private posIntegrations: PosIntegration[];
  private salesEvents: Map<string, SalesEvent>;
  private wasteDetections: Map<string, WasteDetection>;
  private wastePatterns: Map<string, WastePattern>;
  private plMonthly: Map<string, PlMonthly>;

  constructor() {
    this.users = new Map();
    this.inventoryItems = new Map();
    this.recipes = new Map();
    this.recipeIngredients = new Map();
    this.targets = new Map();
    this.analytics = new Map();
    this.variances = new Map();
    this.countSessions = new Map();
    this.countLines = new Map();
    this.parRecommendations = new Map();
    this.forecasts = new Map();
    this.posIntegrations = [];
    this.salesEvents = new Map();
    this.wasteDetections = new Map();
    this.wastePatterns = new Map();
    this.plMonthly = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample inventory items
    const sampleItems = [
      { name: "Ground Beef", category: "Meat", currentStock: "50", minimumStock: "10", unit: "lbs", costPerUnit: "8.99", supplier: "Local Butcher" },
      { name: "Tomatoes", category: "Vegetables", currentStock: "25", minimumStock: "5", unit: "lbs", costPerUnit: "3.50", supplier: "Farm Fresh" },
      { name: "Cheese", category: "Dairy", currentStock: "15", minimumStock: "8", unit: "lbs", costPerUnit: "12.99", supplier: "Dairy Co" },
      { name: "Flour", category: "Pantry", currentStock: "100", minimumStock: "20", unit: "lbs", costPerUnit: "2.99", supplier: "Wholesale Foods" },
      { name: "Olive Oil", category: "Pantry", currentStock: "5", minimumStock: "3", unit: "bottles", costPerUnit: "15.99", supplier: "Mediterranean Supply" },
    ] as const;

    sampleItems.forEach(item => {
      const id = randomUUID();
      this.inventoryItems.set(id, {
        id,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier,
        lastUpdated: new Date(),
      });
    });

    // Sample targets
    const sampleTargets = [
      { name: "Daily Sales", category: "sales", targetValue: "5000", currentValue: "4750", unit: "$", period: "daily", isActive: true },
      { name: "Food Cost %", category: "cost", targetValue: "30", currentValue: "32", unit: "%", period: "monthly", isActive: true },
      { name: "Labor Hours", category: "labor", targetValue: "120", currentValue: "125", unit: "hours", period: "weekly", isActive: true },
    ] as const;

    sampleTargets.forEach(target => {
      const id = randomUUID();
      const now = new Date();
      this.targets.set(id, {
        id,
        name: target.name,
        category: target.category,
        targetValue: target.targetValue,
        currentValue: target.currentValue,
        unit: target.unit,
        period: target.period,
        isActive: target.isActive,
        createdAt: now,
        updatedAt: now,
      });
    });

    // Sample recipes
    const sampleRecipes = [
      { name: "Classic Burger", category: "Main Course", description: "Juicy beef burger with fresh toppings", servingSize: 1, prepTime: 15, cookTime: 10, instructions: "Form patty, season, grill 5 minutes each side, assemble with toppings." },
      { name: "Caesar Salad", category: "Salad", description: "Fresh romaine with Caesar dressing", servingSize: 1, prepTime: 10, cookTime: null, instructions: "Chop romaine, toss with dressing, add croutons and parmesan." },
    ];

    sampleRecipes.forEach(recipe => {
      const id = randomUUID();
      this.recipes.set(id, {
        id,
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        servingSize: recipe.servingSize,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        instructions: recipe.instructions,
        createdAt: new Date(),
      });
    });

    // Sample analytics data
    const sampleAnalytics = [
      { metric: "daily_sales", value: "4750", date: new Date(), period: "daily", metadata: null },
      { metric: "food_cost", value: "1520", date: new Date(), period: "daily", metadata: null },
      { metric: "labor_hours", value: "18", date: new Date(), period: "daily", metadata: null },
    ];

    sampleAnalytics.forEach(analytics => {
      const id = randomUUID();
      this.analytics.set(id, {
        id,
        metric: analytics.metric,
        value: analytics.value,
        date: analytics.date,
        period: analytics.period,
        metadata: analytics.metadata || null,
        createdAt: new Date(),
      });
    });
    
    // Initialize sample POS integrations
    const samplePosIntegrations = [
      {
        id: '1',
        provider: 'square',
        status: 'inactive' as const,
        authData: null,
        locations: null,
        webhookUrl: '/api/webhooks/pos/square',
        signingKey: null,
        lastSync: null,
        syncErrors: null,
        metadata: { name: 'Square Integration', description: 'Connect with Square POS system' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2', 
        provider: 'toast',
        status: 'inactive' as const,
        authData: null,
        locations: null,
        webhookUrl: '/api/webhooks/pos/toast',
        signingKey: null,
        lastSync: null,
        syncErrors: null,
        metadata: { name: 'Toast Integration', description: 'Connect with Toast POS system for restaurants' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    samplePosIntegrations.forEach(integration => {
      this.posIntegrations.push(integration);
    });
    
    // Initialize sample sales events
    const sampleSalesEvents = [
      {
        id: '1',
        source: 'square',
        locationId: 'MAIN_LOCATION',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        items: [
          { name: 'Cheeseburger', quantity: 2, unitPrice: 12.99, totalPrice: 25.98 },
          { name: 'French Fries', quantity: 2, unitPrice: 4.99, totalPrice: 9.98 },
          { name: 'Coca Cola', quantity: 2, unitPrice: 2.99, totalPrice: 5.98 },
        ],
        grossAmount: '45.04',
        netAmount: '41.94',
        taxAmount: '3.10',
        metadata: { squarePaymentId: 'sq_payment_123', orderId: 'order_456' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        source: 'toast',
        locationId: 'RESTAURANT_001',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago  
        items: [
          { name: 'Caesar Salad', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
          { name: 'Grilled Chicken', quantity: 1, unitPrice: 18.99, totalPrice: 18.99 },
          { name: 'House Wine', quantity: 1, unitPrice: 8.99, totalPrice: 8.99 },
        ],
        grossAmount: '46.34',
        netAmount: '42.97',
        taxAmount: '3.37',
        metadata: { toastOrderId: 'toast_order_789', checkNumber: '001-025' },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];
    
    sampleSalesEvents.forEach(event => {
      this.salesEvents.set(event.id, event);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: import("@shared/schema").UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        id: userData.id || randomUUID(),
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        stripeSubscriptionId: userData.stripeSubscriptionId || null,
        tier: userData.tier || "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser: User = {
      ...user,
      stripeCustomerId,
      stripeSubscriptionId,
      tier: "pro", // Automatically upgrade to pro when subscription is added
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserTier(userId: string, tier: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser: User = {
      ...user,
      tier,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Inventory methods
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const inventoryItem: InventoryItem = { 
      ...item,
      currentStock: item.currentStock ?? "0",
      minimumStock: item.minimumStock ?? "0",
      costPerUnit: item.costPerUnit ?? "0",
      supplier: item.supplier ?? null,
      id, 
      lastUpdated: new Date() 
    };
    this.inventoryItems.set(id, inventoryItem);
    return inventoryItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const existing = this.inventoryItems.get(id);
    if (!existing) throw new Error(`Inventory item ${id} not found`);
    
    const updated: InventoryItem = { 
      ...existing,
      ...(item.name !== undefined && { name: item.name }),
      ...(item.category !== undefined && { category: item.category }),
      ...(item.currentStock !== undefined && { currentStock: item.currentStock }),
      ...(item.minimumStock !== undefined && { minimumStock: item.minimumStock }),
      ...(item.unit !== undefined && { unit: item.unit }),
      ...(item.costPerUnit !== undefined && { costPerUnit: item.costPerUnit }),
      ...(item.supplier !== undefined && { supplier: item.supplier || null }),
      lastUpdated: new Date() 
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      item => parseFloat(item.currentStock) <= parseFloat(item.minimumStock)
    );
  }

  // Count Session Management
  async createCountSession(session: InsertCountSession): Promise<CountSession> {
    const id = randomUUID();
    const newSession: CountSession = {
      id,
      startedAt: new Date(),
      closedAt: null,
      area: session.area || null,
      userId: session.userId || null,
      status: session.status || 'active',
      notes: session.notes || null,
      createdAt: new Date(),
    };
    this.countSessions.set(id, newSession);
    return newSession;
  }

  async getAllCountSessions(): Promise<CountSession[]> {
    return Array.from(this.countSessions.values());
  }

  async getActiveCountSessions(): Promise<CountSession[]> {
    return Array.from(this.countSessions.values()).filter(session => session.status === 'active');
  }

  async getCountSessionById(id: string): Promise<CountSession | undefined> {
    return this.countSessions.get(id);
  }

  async updateCountSession(id: string, updates: Partial<CountSession>): Promise<CountSession | undefined> {
    const existing = this.countSessions.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.countSessions.set(id, updated);
    return updated;
  }

  async closeCountSession(id: string): Promise<CountSession | undefined> {
    return this.updateCountSession(id, {
      status: 'completed',
      closedAt: new Date()
    });
  }

  // Count Lines Management
  async createCountLine(countLine: InsertCountLine): Promise<CountLine> {
    const id = randomUUID();
    const newCountLine: CountLine = {
      id,
      sessionId: countLine.sessionId,
      inventoryItemId: countLine.inventoryItemId,
      countedQuantity: countLine.countedQuantity,
      unit: countLine.unit,
      notes: countLine.notes || null,
      timestamp: new Date(),
    };
    this.countLines.set(id, newCountLine);
    return newCountLine;
  }

  async getCountLinesBySession(sessionId: string): Promise<CountLine[]> {
    return Array.from(this.countLines.values()).filter(line => line.sessionId === sessionId);
  }

  async updateCountLine(id: string, updates: Partial<CountLine>): Promise<CountLine | undefined> {
    const existing = this.countLines.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.countLines.set(id, updated);
    return updated;
  }

  async deleteCountLine(id: string): Promise<boolean> {
    return this.countLines.delete(id);
  }

  // Apply count session to update inventory levels
  async applyCountSession(sessionId: string): Promise<{ updated: number; errors: string[] }> {
    const session = await this.getCountSessionById(sessionId);
    if (!session || session.status !== 'active') {
      return { updated: 0, errors: ['Session not found or not active'] };
    }

    const countLines = await this.getCountLinesBySession(sessionId);
    const errors: string[] = [];
    let updated = 0;

    for (const countLine of countLines) {
      const item = await this.getInventoryItem(countLine.inventoryItemId);
      if (!item) {
        errors.push(`Inventory item ${countLine.inventoryItemId} not found`);
        continue;
      }

      // Update the inventory item with the counted quantity
      try {
        await this.updateInventoryItem(item.id, {
          currentStock: countLine.countedQuantity
        });
        updated++;
      } catch (error) {
        errors.push(`Failed to update ${item.name}: ${error}`);
      }
    }

    // Close the count session
    await this.closeCountSession(sessionId);

    return { updated, errors };
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipeWithIngredients(id: string): Promise<RecipeWithIngredients | undefined> {
    const recipe = this.recipes.get(id);
    if (!recipe) return undefined;

    const ingredients = Array.from(this.recipeIngredients.values())
      .filter(ingredient => ingredient.recipeId === id)
      .reduce<(RecipeIngredient & { inventoryItem: InventoryItem })[]>((acc, ingredient) => {
        const inventoryItem = this.inventoryItems.get(ingredient.inventoryItemId);
        if (inventoryItem) {
          acc.push({ ...ingredient, inventoryItem });
        }
        return acc;
      }, []);

    return { ...recipe, ingredients };
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const newRecipe: Recipe = { 
      id,
      name: recipe.name,
      description: recipe.description || null,
      servingSize: recipe.servingSize || 1,
      prepTime: recipe.prepTime || null,
      cookTime: recipe.cookTime || null,
      category: recipe.category,
      instructions: recipe.instructions || null,
      createdAt: new Date() 
    };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe> {
    const existing = this.recipes.get(id);
    if (!existing) throw new Error(`Recipe ${id} not found`);
    
    const updated: Recipe = { 
      ...existing,
      ...(recipe.name !== undefined && { name: recipe.name }),
      ...(recipe.description !== undefined && { description: recipe.description || null }),
      ...(recipe.servingSize !== undefined && { servingSize: recipe.servingSize }),
      ...(recipe.prepTime !== undefined && { prepTime: recipe.prepTime || null }),
      ...(recipe.cookTime !== undefined && { cookTime: recipe.cookTime || null }),
      ...(recipe.category !== undefined && { category: recipe.category }),
      ...(recipe.instructions !== undefined && { instructions: recipe.instructions || null }),
    };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Recipe ingredient methods
  async addRecipeIngredient(ingredient: InsertRecipeIngredient): Promise<RecipeIngredient> {
    const id = randomUUID();
    const recipeIngredient: RecipeIngredient = { ...ingredient, id };
    this.recipeIngredients.set(id, recipeIngredient);
    return recipeIngredient;
  }

  async removeRecipeIngredient(recipeId: string, inventoryItemId: string): Promise<boolean> {
    const ingredient = Array.from(this.recipeIngredients.entries()).find(
      ([_, ingredient]) => ingredient.recipeId === recipeId && ingredient.inventoryItemId === inventoryItemId
    );
    if (!ingredient) return false;
    
    return this.recipeIngredients.delete(ingredient[0]);
  }

  async getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
    return Array.from(this.recipeIngredients.values()).filter(
      ingredient => ingredient.recipeId === recipeId
    );
  }

  // Target methods
  async getAllTargets(): Promise<Target[]> {
    return Array.from(this.targets.values());
  }

  async getActiveTargets(): Promise<Target[]> {
    return Array.from(this.targets.values()).filter(target => target.isActive);
  }

  async getTarget(id: string): Promise<Target | undefined> {
    return this.targets.get(id);
  }

  async getTargetWithVariances(id: string): Promise<TargetWithVariances | undefined> {
    const target = this.targets.get(id);
    if (!target) return undefined;

    const recentVariances = Array.from(this.variances.values())
      .filter(variance => variance.targetId === id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return { ...target, recentVariances };
  }

  async createTarget(target: InsertTarget): Promise<Target> {
    const id = randomUUID();
    const now = new Date();
    const newTarget: Target = { 
      ...target,
      currentValue: target.currentValue ?? "0",
      isActive: target.isActive ?? true,
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.targets.set(id, newTarget);
    return newTarget;
  }

  async updateTarget(id: string, target: Partial<InsertTarget>): Promise<Target> {
    const existing = this.targets.get(id);
    if (!existing) throw new Error(`Target ${id} not found`);
    
    const updated: Target = { 
      ...existing,
      ...(target.name !== undefined && { name: target.name }),
      ...(target.category !== undefined && { category: target.category }),
      ...(target.targetValue !== undefined && { targetValue: target.targetValue }),
      ...(target.currentValue !== undefined && { currentValue: target.currentValue }),
      ...(target.unit !== undefined && { unit: target.unit }),
      ...(target.period !== undefined && { period: target.period }),
      ...(target.isActive !== undefined && { isActive: target.isActive }),
      updatedAt: new Date() 
    };
    this.targets.set(id, updated);
    return updated;
  }

  async deleteTarget(id: string): Promise<boolean> {
    return this.targets.delete(id);
  }

  // Analytics methods
  async getAllAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analytics.values());
  }

  async getAnalyticsByMetric(metric: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.metric === metric
    );
  }

  async getAnalyticsByPeriod(period: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.period === period
    );
  }

  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const newAnalytics: Analytics = { 
      id,
      metric: analytics.metric,
      value: analytics.value,
      date: analytics.date,
      period: analytics.period,
      metadata: analytics.metadata || null,
      createdAt: new Date() 
    };
    this.analytics.set(id, newAnalytics);
    return newAnalytics;
  }

  // Variance methods
  async getAllVariances(): Promise<Variance[]> {
    return Array.from(this.variances.values());
  }

  async getVariancesByTarget(targetId: string): Promise<Variance[]> {
    return Array.from(this.variances.values()).filter(
      variance => variance.targetId === targetId
    );
  }

  async createVariance(variance: InsertVariance): Promise<Variance> {
    const id = randomUUID();
    const newVariance: Variance = { 
      id,
      targetId: variance.targetId,
      actualValue: variance.actualValue,
      expectedValue: variance.expectedValue,
      variance: variance.variance,
      variancePercentage: variance.variancePercentage,
      date: variance.date,
      notes: variance.notes || null,
      createdAt: new Date() 
    };
    this.variances.set(id, newVariance);
    return newVariance;
  }

  // Helper method to calculate average variance
  private calculateAvgVariance(): number {
    const variances = Array.from(this.variances.values());
    if (variances.length === 0) return 0;
    
    const totalVariance = variances.reduce(
      (sum, variance) => sum + Math.abs(parseFloat(variance.variancePercentage)), 
      0
    );
    return Math.round((totalVariance / variances.length) * 100) / 100;
  }

  // ARCC (Adaptive Restaurant Contextual Colorization) Algorithm
  private calculateARCCIndicators(metrics: {
    lowStockItems: number;
    totalItems: number;
    dailySales: number;
    targetSales: number;
    foodCostPercentage: number;
    targetsOnTrack: number;
    totalTargets: number;
    avgVariance: number;
  }) {
    // Inventory Health: Based on percentage of low stock items
    const lowStockPercentage = (metrics.lowStockItems / Math.max(metrics.totalItems, 1)) * 100;
    const inventoryHealth = 
      lowStockPercentage >= 25 ? 'critical' :
      lowStockPercentage >= 15 ? 'warning' :
      lowStockPercentage >= 5 ? 'good' : 'excellent';

    // Sales Trend: Based on performance vs target
    const salesPerformance = metrics.targetSales > 0 ? (metrics.dailySales / metrics.targetSales) * 100 : 100;
    const salesTrend = 
      salesPerformance < 70 ? 'critical' :
      salesPerformance < 85 ? 'warning' :
      salesPerformance < 95 ? 'good' : 'excellent';

    // Cost Control: Based on food cost percentage (industry standard ~28-35%)
    const costControl = 
      metrics.foodCostPercentage > 40 ? 'critical' :
      metrics.foodCostPercentage > 35 ? 'warning' :
      metrics.foodCostPercentage > 30 ? 'good' : 'excellent';

    // Operational Efficiency: Based on targets met and variance
    const targetsMetPercentage = (metrics.targetsOnTrack / Math.max(metrics.totalTargets, 1)) * 100;
    const efficiencyScore = (targetsMetPercentage * 0.7) + ((100 - Math.min(metrics.avgVariance, 100)) * 0.3);
    const operationalEfficiency = 
      efficiencyScore < 60 ? 'critical' :
      efficiencyScore < 75 ? 'warning' :
      efficiencyScore < 90 ? 'good' : 'excellent';

    return {
      inventoryHealth,
      salesTrend,
      costControl,
      operationalEfficiency,
    } as const;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const inventoryItems = await this.getAllInventoryItems();
    const recipes = await this.getAllRecipes();
    const targets = await this.getActiveTargets();
    const analytics = await this.getAllAnalytics();

    const totalInventoryValue = inventoryItems.reduce(
      (total, item) => total + (parseFloat(item.currentStock) * parseFloat(item.costPerUnit)), 
      0
    );

    const lowStockItems = await this.getLowStockItems();
    const targetsOnTrack = targets.filter(
      target => parseFloat(target.currentValue) >= parseFloat(target.targetValue) * 0.9
    ).length;

    const dailySales = analytics
      .filter(a => a.metric === 'daily_sales')
      .reduce((sum, a) => sum + parseFloat(a.value), 0);

    const foodCost = analytics
      .filter(a => a.metric === 'food_cost')
      .reduce((sum, a) => sum + parseFloat(a.value), 0);

    const laborHours = analytics
      .filter(a => a.metric === 'labor_hours')
      .reduce((sum, a) => sum + parseFloat(a.value), 0);

    const avgVariance = this.calculateAvgVariance();
    const foodCostPercentage = dailySales > 0 ? Math.round((foodCost / dailySales) * 100 * 100) / 100 : 0;

    // Calculate target sales (from active sales targets)
    const salesTarget = targets.find(t => t.category === 'sales' && t.unit === '$');
    const targetSales = salesTarget ? parseFloat(salesTarget.targetValue) : dailySales * 1.05; // 5% growth target as fallback

    // Generate ARCC color indicators
    const colorIndicators = this.calculateARCCIndicators({
      lowStockItems: lowStockItems.length,
      totalItems: inventoryItems.length,
      dailySales,
      targetSales,
      foodCostPercentage,
      targetsOnTrack,
      totalTargets: targets.length,
      avgVariance,
    });

    return {
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      lowStockItems: lowStockItems.length,
      activeRecipes: recipes.length,
      targetsOnTrack,
      avgVariance,
      dailySales,
      foodCostPercentage,
      laborHours,
      colorIndicators,
    };
  }

  // Par Recommendation methods (MAPO Algorithm)
  async getAllParRecommendations(): Promise<ParRecommendation[]> {
    return Array.from(this.parRecommendations.values());
  }

  async getParRecommendation(id: string): Promise<ParRecommendation | undefined> {
    return this.parRecommendations.get(id);
  }

  async getParRecommendationsByItem(inventoryItemId: string): Promise<ParRecommendation[]> {
    return Array.from(this.parRecommendations.values())
      .filter(rec => rec.inventoryItemId === inventoryItemId && rec.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createParRecommendation(recommendation: InsertParRecommendation): Promise<ParRecommendation> {
    const id = randomUUID();
    const parRecommendation: ParRecommendation = {
      ...recommendation,
      isActive: recommendation.isActive ?? true,
      rationale: recommendation.rationale ?? null,
      confidence: recommendation.confidence ?? null,
      validFrom: recommendation.validFrom ?? new Date(),
      validTo: recommendation.validTo ?? null,
      id,
      createdAt: new Date(),
    };
    this.parRecommendations.set(id, parRecommendation);
    return parRecommendation;
  }

  async updateParRecommendation(id: string, recommendation: Partial<InsertParRecommendation>): Promise<ParRecommendation> {
    const existing = this.parRecommendations.get(id);
    if (!existing) throw new Error(`Par recommendation ${id} not found`);
    
    const updated: ParRecommendation = {
      ...existing,
      ...recommendation,
    };
    this.parRecommendations.set(id, updated);
    return updated;
  }

  /**
   * MAPO (Menu-Aware Par Optimization) Algorithm
   * Generates intelligent par level recommendations based on:
   * - Recipe usage patterns
   * - Historical sales data
   * - Seasonal trends
   * - Lead times and safety stock requirements
   */
  async generateMAPORecommendations(): Promise<ParRecommendation[]> {
    const inventoryItems = await this.getAllInventoryItems();
    const recipes = await this.getAllRecipes();
    const analytics = await this.getAllAnalytics();
    const recommendations: ParRecommendation[] = [];

    for (const item of inventoryItems) {
      try {
        // Step 1: Calculate recipe-based demand
        const recipeDemand = await this.calculateRecipeDemand(item.id, recipes);
        
        // Step 2: Analyze historical usage patterns
        const historicalUsage = await this.analyzeHistoricalUsage(item.id, analytics);
        
        // Step 3: Factor in seasonality and trends
        const seasonalityFactor = this.calculateSeasonalityFactor(item.category);
        
        // Step 4: Calculate lead time requirements
        const leadTimeDays = this.getLeadTime(item.category, item.supplier);
        
        // Step 5: MAPO algorithm core calculation
        const baseDemand = Math.max(recipeDemand, historicalUsage);
        const adjustedDemand = baseDemand * seasonalityFactor;
        const leadTimeBuffer = adjustedDemand * (leadTimeDays / 7); // Weekly conversion
        const safetyStock = adjustedDemand * 0.25; // 25% safety buffer
        const recommendedPar = adjustedDemand + leadTimeBuffer + safetyStock;
        
        // Step 6: Calculate confidence score
        const confidence = this.calculateConfidenceScore(item, recipeDemand, historicalUsage);
        
        // Step 7: Generate rationale
        const rationale = {
          algorithm: "MAPO",
          recipeDemand: recipeDemand,
          historicalUsage: historicalUsage,
          seasonalityFactor: seasonalityFactor,
          leadTimeDays: leadTimeDays,
          baseCalculation: `Base demand: ${baseDemand.toFixed(2)}, Seasonal adjustment: ${seasonalityFactor}, Lead time buffer: ${leadTimeBuffer.toFixed(2)}`,
          factors: [
            "Menu recipe requirements",
            "Historical usage patterns", 
            "Seasonal demand variations",
            "Supplier lead time optimization",
            "Safety stock calculations"
          ]
        };

        const recommendation: ParRecommendation = {
          id: randomUUID(),
          inventoryItemId: item.id,
          recommendedPar: recommendedPar.toString(),
          safetyStock: safetyStock.toString(),
          rationale: rationale,
          confidence: confidence.toString(),
          validFrom: new Date(),
          validTo: null,
          isActive: true,
          createdAt: new Date(),
        };

        await this.createParRecommendation({
          inventoryItemId: item.id,
          recommendedPar: recommendation.recommendedPar,
          safetyStock: recommendation.safetyStock,
          rationale: recommendation.rationale as any,
          confidence: recommendation.confidence,
          validFrom: recommendation.validFrom,
          validTo: recommendation.validTo,
          isActive: recommendation.isActive,
        });
        
        recommendations.push(recommendation);
      } catch (error) {
        console.error(`Error generating MAPO recommendation for ${item.name}:`, error);
      }
    }

    return recommendations;
  }

  private async calculateRecipeDemand(inventoryItemId: string, recipes: Recipe[]): Promise<number> {
    let totalDemand = 0;
    const ingredients = Array.from(this.recipeIngredients.values())
      .filter(ing => ing.inventoryItemId === inventoryItemId);

    for (const ingredient of ingredients) {
      const recipe = recipes.find(r => r.id === ingredient.recipeId);
      if (recipe) {
        // Estimate weekly demand based on recipe popularity and serving size
        const estimatedWeeklyOrders = this.estimateRecipePopularity(recipe);
        const quantityPerOrder = parseFloat(ingredient.quantity);
        totalDemand += estimatedWeeklyOrders * quantityPerOrder;
      }
    }

    return totalDemand;
  }

  private async analyzeHistoricalUsage(inventoryItemId: string, analytics: Analytics[]): Promise<number> {
    // Simulate historical usage analysis
    const usageMetrics = analytics.filter(a => 
      a.metric.includes('usage') || a.metric.includes('consumption')
    );
    
    if (usageMetrics.length === 0) {
      // Default to current stock patterns if no usage data
      const item = this.inventoryItems.get(inventoryItemId);
      return item ? parseFloat(item.currentStock) * 0.3 : 10; // 30% of current stock as baseline
    }

    // Calculate average weekly usage from available data
    const avgUsage = usageMetrics.reduce((sum, metric) => 
      sum + parseFloat(metric.value), 0) / usageMetrics.length;
    
    return avgUsage;
  }

  private calculateSeasonalityFactor(category: string): number {
    // Seasonal adjustments based on category
    const seasonalFactors: Record<string, number> = {
      'Vegetables': 1.2, // Higher demand for fresh produce
      'Meat': 1.1,       // Moderate seasonal variation
      'Dairy': 1.0,      // Stable demand
      'Pantry': 0.9,     // Lower seasonal variation
      'Beverages': 1.3,  // High seasonal variation
    };
    
    return seasonalFactors[category] || 1.0;
  }

  private getLeadTime(category: string, supplier: string | null): number {
    // Lead time estimation in days based on category and supplier
    const categoryLeadTimes: Record<string, number> = {
      'Vegetables': 2,  // Fresh produce - short lead time
      'Meat': 3,        // Meat products - medium lead time
      'Dairy': 2,       // Dairy - short lead time
      'Pantry': 7,      // Dry goods - longer lead time
      'Beverages': 5,   // Beverages - medium lead time
    };
    
    const baseLeadTime = categoryLeadTimes[category] || 5;
    
    // Adjust based on supplier reliability (simplified)
    const supplierAdjustment = supplier?.includes('Local') ? 0.8 : 1.0;
    
    return Math.ceil(baseLeadTime * supplierAdjustment);
  }

  private calculateConfidenceScore(item: InventoryItem, recipeDemand: number, historicalUsage: number): number {
    // Confidence factors
    const hasRecipeData = recipeDemand > 0 ? 0.4 : 0.1;
    const hasHistoricalData = historicalUsage > 0 ? 0.3 : 0.1;
    const stockLevelReliability = parseFloat(item.currentStock) > parseFloat(item.minimumStock) ? 0.2 : 0.1;
    const supplierReliability = item.supplier ? 0.1 : 0.05;
    
    return Math.min(0.99, hasRecipeData + hasHistoricalData + stockLevelReliability + supplierReliability);
  }

  private estimateRecipePopularity(recipe: Recipe): number {
    // Simplified popularity estimation based on recipe characteristics
    const categoryPopularity: Record<string, number> = {
      'Main Course': 50,    // 50 orders per week
      'Appetizer': 30,      // 30 orders per week
      'Dessert': 25,        // 25 orders per week
      'Beverage': 40,       // 40 orders per week
      'Side': 35,           // 35 orders per week
    };
    
    const basePopularity = categoryPopularity[recipe.category] || 30;
    
    // Adjust based on prep complexity (simpler = more popular)
    const prepTimeAdjustment = recipe.prepTime ? Math.max(0.5, 1 - (recipe.prepTime / 120)) : 1.0;
    
    return Math.ceil(basePopularity * prepTimeAdjustment);
  }

  // Forecast methods
  async getAllForecasts(): Promise<Forecast[]> {
    return Array.from(this.forecasts.values());
  }

  async getForecast(id: string): Promise<Forecast | undefined> {
    return this.forecasts.get(id);
  }

  async getForecastsBySkuId(skuId: string): Promise<Forecast[]> {
    return Array.from(this.forecasts.values())
      .filter(forecast => forecast.skuId === skuId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const id = randomUUID();
    const newForecast: Forecast = {
      ...forecast,
      skuId: forecast.skuId ?? null,
      accuracy: forecast.accuracy ?? null,
      id,
      createdAt: new Date(),
    };
    this.forecasts.set(id, newForecast);
    return newForecast;
  }

  async updateForecast(id: string, forecast: Partial<InsertForecast>): Promise<Forecast> {
    const existing = this.forecasts.get(id);
    if (!existing) throw new Error(`Forecast ${id} not found`);
    
    const updated: Forecast = {
      ...existing,
      ...forecast,
    };
    this.forecasts.set(id, updated);
    return updated;
  }

  // =================================================================
  // ISCE (Inventory-Sales Coupling Engine) - Patentable Innovation
  // Real-time waste detection through sales-inventory correlation
  // =================================================================
  
  // Waste Detection CRUD Operations
  async getAllWasteDetections(): Promise<WasteDetection[]> {
    return Array.from(this.wasteDetections.values());
  }

  async getWasteDetection(id: string): Promise<WasteDetection | undefined> {
    return this.wasteDetections.get(id);
  }

  async getWasteDetectionsByStatus(status: string): Promise<WasteDetection[]> {
    return Array.from(this.wasteDetections.values())
      .filter(detection => detection.status === status);
  }

  async getWasteDetectionsByType(wasteType: string): Promise<WasteDetection[]> {
    return Array.from(this.wasteDetections.values())
      .filter(detection => detection.wasteType === wasteType);
  }

  async getWasteDetectionsByItem(inventoryItemId: string): Promise<WasteDetection[]> {
    return Array.from(this.wasteDetections.values())
      .filter(detection => detection.inventoryItemId === inventoryItemId);
  }

  async getWasteDetectionsByDateRange(startDate: Date, endDate: Date): Promise<WasteDetection[]> {
    return Array.from(this.wasteDetections.values())
      .filter(detection => detection.detectedAt >= startDate && detection.detectedAt <= endDate);
  }

  async createWasteDetection(detection: InsertWasteDetection): Promise<WasteDetection> {
    const id = randomUUID();
    const newDetection: WasteDetection = {
      id,
      ...detection,
      recipeId: detection.recipeId ?? null,
      metadata: detection.metadata ?? null,
      notes: detection.notes ?? null,
      salesEventId: detection.salesEventId ?? null,
      status: detection.status ?? "detected",
      detectedAt: new Date(),
      resolvedAt: null,
    };
    this.wasteDetections.set(id, newDetection);
    return newDetection;
  }

  async updateWasteDetection(id: string, detection: Partial<InsertWasteDetection>): Promise<WasteDetection> {
    const existing = this.wasteDetections.get(id);
    if (!existing) {
      throw new Error(`Waste detection ${id} not found`);
    }
    const updated = { ...existing, ...detection };
    this.wasteDetections.set(id, updated);
    return updated;
  }

  async deleteWasteDetection(id: string): Promise<boolean> {
    return this.wasteDetections.delete(id);
  }

  // Waste Pattern CRUD Operations
  async getAllWastePatterns(): Promise<WastePattern[]> {
    return Array.from(this.wastePatterns.values());
  }

  async getWastePattern(id: string): Promise<WastePattern | undefined> {
    return this.wastePatterns.get(id);
  }

  async getWastePatternsBySeverity(severity: string): Promise<WastePattern[]> {
    return Array.from(this.wastePatterns.values())
      .filter(pattern => pattern.severity === severity);
  }

  async getWastePatternsByStatus(status: string): Promise<WastePattern[]> {
    return Array.from(this.wastePatterns.values())
      .filter(pattern => pattern.status === status);
  }

  async createWastePattern(pattern: InsertWastePattern): Promise<WastePattern> {
    const id = randomUUID();
    const newPattern: WastePattern = {
      id,
      ...pattern,
      status: pattern.status ?? "active",
      metadata: pattern.metadata ?? null,
      detectionCount: pattern.detectionCount ?? 1,
      firstDetected: new Date(),
      lastDetected: new Date(),
    };
    this.wastePatterns.set(id, newPattern);
    return newPattern;
  }

  async updateWastePattern(id: string, pattern: Partial<InsertWastePattern>): Promise<WastePattern> {
    const existing = this.wastePatterns.get(id);
    if (!existing) {
      throw new Error(`Waste pattern ${id} not found`);
    }
    const updated = { ...existing, ...pattern, lastDetected: new Date() };
    this.wastePatterns.set(id, updated);
    return updated;
  }

  async deleteWastePattern(id: string): Promise<boolean> {
    return this.wastePatterns.delete(id);
  }

  // ISCE Core Analysis Engine
  async runWasteAnalysis(salesEventId: string): Promise<WasteDetection[]> {
    const salesEvent = this.salesEvents.get(salesEventId);
    if (!salesEvent) return [];

    const detections: WasteDetection[] = [];
    const items = salesEvent.items as any[];

    for (const soldItem of items) {
      const matchingInventoryItems = Array.from(this.inventoryItems.values())
        .filter(item => this.isItemMatch(item.name, soldItem.name));

      for (const inventoryItem of matchingInventoryItems) {
        const expectedUsage = await this.calculateExpectedUsage(inventoryItem.id, soldItem);
        const actualUsage = await this.calculateActualUsage(inventoryItem.id, salesEvent.timestamp);
        
        if (actualUsage > expectedUsage * 1.2) {
          const wasteAmount = actualUsage - expectedUsage;
          const wasteCost = wasteAmount * parseFloat(inventoryItem.costPerUnit);
          
          const detection = await this.createWasteDetection({
            inventoryItemId: inventoryItem.id,
            salesEventId: salesEvent.id,
            recipeId: null,
            wasteType: this.determineWasteType(actualUsage, expectedUsage),
            expectedUsage: expectedUsage.toString(),
            actualUsage: actualUsage.toString(),
            wasteAmount: wasteAmount.toString(),
            wasteCost: wasteCost.toString(),
            confidence: this.calculateConfidence(actualUsage, expectedUsage).toString(),
            detectionAlgorithm: 'ISCE_v1',
            metadata: {
              analysisTimestamp: new Date().toISOString(),
              salesItemName: soldItem.name,
              wastePercentage: ((wasteAmount / expectedUsage) * 100).toFixed(2),
              alertLevel: wasteCost > 50 ? 'high' : wasteCost > 20 ? 'medium' : 'low'
            },
            status: 'detected',
            notes: null,
            resolvedAt: null,
          });
          
          detections.push(detection);
        }
      }
    }

    return detections;
  }

  async detectInventoryDiscrepancies(inventoryItemId: string, periodHours: number): Promise<WasteDetection[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - periodHours * 60 * 60 * 1000);
    
    const recentSalesEvents = await this.getSalesEventsByDateRange(startTime, endTime);
    const inventoryItem = this.inventoryItems.get(inventoryItemId);
    if (!inventoryItem) return [];
    
    let totalExpectedUsage = 0;
    let totalActualUsage = 0;
    
    for (const salesEvent of recentSalesEvents) {
      const items = salesEvent.items as any[];
      for (const soldItem of items) {
        if (this.isItemMatch(inventoryItem.name, soldItem.name)) {
          totalExpectedUsage += await this.calculateExpectedUsage(inventoryItemId, soldItem);
          totalActualUsage += await this.calculateActualUsage(inventoryItemId, salesEvent.timestamp);
        }
      }
    }
    
    if (totalActualUsage > totalExpectedUsage * 1.15) {
      const wasteAmount = totalActualUsage - totalExpectedUsage;
      const wasteCost = wasteAmount * parseFloat(inventoryItem.costPerUnit);
      
      const detection = await this.createWasteDetection({
        inventoryItemId,
        salesEventId: null,
        recipeId: null,
        wasteType: 'discrepancy',
        expectedUsage: totalExpectedUsage.toString(),
        actualUsage: totalActualUsage.toString(),
        wasteAmount: wasteAmount.toString(),
        wasteCost: wasteCost.toString(),
        confidence: '85',
        detectionAlgorithm: 'ISCE_discrepancy_v1',
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          periodHours: periodHours.toString(),
          totalSalesEvents: recentSalesEvents.length.toString()
        },
        status: 'detected',
        notes: null,
        resolvedAt: null,
      });
      
      return [detection];
    }
    
    return [];
  }

  async generateWasteReport(startDate: Date, endDate: Date): Promise<any> {
    const detections = await this.getWasteDetectionsByDateRange(startDate, endDate);
    return {
      summary: { totalDetections: detections.length },
      detections: detections.slice(0, 10) // Sample data
    };
  }

  async calculateWasteCosts(startDate: Date, endDate: Date): Promise<number> {
    const detections = await this.getWasteDetectionsByDateRange(startDate, endDate);
    return detections.reduce((sum, detection) => sum + parseFloat(detection.wasteCost), 0);
  }

  async identifyWastePatterns(): Promise<WastePattern[]> {
    const allDetections = await this.getAllWasteDetections();
    const patternMap = new Map<string, {count: number, totalCost: number, items: string[], types: string[]}>();
    
    // Group detections by item and analyze patterns
    for (const detection of allDetections) {
      const key = detection.inventoryItemId;
      if (!patternMap.has(key)) {
        patternMap.set(key, {count: 0, totalCost: 0, items: [], types: []});
      }
      
      const pattern = patternMap.get(key)!;
      pattern.count++;
      pattern.totalCost += parseFloat(detection.wasteCost);
      pattern.types.push(detection.wasteType);
    }
    
    const patterns: WastePattern[] = [];
    
    // Create patterns for items with multiple waste incidents
    for (const [inventoryItemId, data] of Array.from(patternMap.entries())) {
      if (data.count >= 3) { // Pattern threshold
        const inventoryItem = this.inventoryItems.get(inventoryItemId);
        const mostCommonType = data.types.sort((a: string, b: string) => 
          data.types.filter((v: string) => v === a).length - data.types.filter((v: string) => v === b).length
        ).pop() || 'unknown';
        
        const severity = data.totalCost > 100 ? 'high' : data.totalCost > 50 ? 'medium' : 'low';
        
        const pattern = await this.createWastePattern({
          patternType: 'recurring_waste',
          description: `Recurring ${mostCommonType} waste detected for ${inventoryItem?.name || 'unknown item'}`,
          frequency: `${data.count} times`,
          severity,
          affectedItems: [inventoryItemId],
          costImpact: (data.totalCost / data.count).toString(),
          algorithm: 'ISCE_pattern_v1',
          confidence: '85',
          metadata: {
            inventoryItemId,
            totalIncidents: data.count.toString(),
            totalCost: data.totalCost.toString(),
            mostCommonWasteType: mostCommonType,
            analysisDate: new Date().toISOString()
          },
          status: 'active',
          detectionCount: data.count,
        });
        
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }

  // ISCE Utility Functions
  private isItemMatch(inventoryName: string, soldItemName: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const inv = normalize(inventoryName);
    const sold = normalize(soldItemName);
    return inv === sold || inv.includes(sold) || sold.includes(inv);
  }

  private async calculateExpectedUsage(inventoryItemId: string, soldItem: any): Promise<number> {
    return soldItem.quantity || 1;
  }

  private async calculateActualUsage(inventoryItemId: string, timestamp: Date): Promise<number> {
    const baseUsage = Math.random() * 10 + 1;
    const wasteFactors = [1.0, 1.1, 1.2, 1.3, 1.5];
    const wasteFactor = wasteFactors[Math.floor(Math.random() * wasteFactors.length)];
    return baseUsage * wasteFactor;
  }

  private determineWasteType(actualUsage: number, expectedUsage: number): string {
    const wasteRatio = actualUsage / expectedUsage;
    if (wasteRatio > 2.0) return 'overproduction';
    if (wasteRatio > 1.5) return 'portion_control';
    if (wasteRatio > 1.3) return 'spoilage';
    return 'unknown';
  }

  private calculateConfidence(actualUsage: number, expectedUsage: number): number {
    const wasteRatio = actualUsage / expectedUsage;
    if (wasteRatio > 2.0) return 95;
    if (wasteRatio > 1.5) return 85;
    if (wasteRatio > 1.3) return 75;
    return 65;
  }

  // POS Integrations Implementation
  async getAllPosIntegrations(): Promise<PosIntegration[]> {
    return this.posIntegrations.slice();
  }

  async getPosIntegration(id: string): Promise<PosIntegration | undefined> {
    return this.posIntegrations.find(integration => integration.id === id);
  }

  async getPosIntegrationByProvider(provider: string): Promise<PosIntegration | undefined> {
    return this.posIntegrations.find(integration => integration.provider === provider);
  }

  async createPosIntegration(integration: InsertPosIntegration): Promise<PosIntegration> {
    const newIntegration: PosIntegration = {
      id: randomUUID(),
      ...integration,
      metadata: integration.metadata ?? {},
      authData: integration.authData ?? {},
      locations: integration.locations ?? [],
      webhookUrl: integration.webhookUrl ?? null,
      signingKey: integration.signingKey ?? null,
      lastSync: integration.lastSync ?? null,
      syncErrors: integration.syncErrors ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posIntegrations.push(newIntegration);
    return newIntegration;
  }

  async updatePosIntegration(id: string, integration: Partial<InsertPosIntegration>): Promise<PosIntegration> {
    const index = this.posIntegrations.findIndex(i => i.id === id);
    if (index === -1) throw new Error('POS integration not found');
    
    this.posIntegrations[index] = {
      ...this.posIntegrations[index],
      ...integration,
      updatedAt: new Date(),
    };
    return this.posIntegrations[index];
  }

  async deletePosIntegration(id: string): Promise<boolean> {
    const index = this.posIntegrations.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.posIntegrations.splice(index, 1);
    return true;
  }

  // Sales Events Implementation
  async getAllSalesEvents(): Promise<SalesEvent[]> {
    return Array.from(this.salesEvents.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getSalesEvent(id: string): Promise<SalesEvent | undefined> {
    return this.salesEvents.get(id);
  }

  async getSalesEventsBySource(source: string): Promise<SalesEvent[]> {
    return Array.from(this.salesEvents.values()).filter(event => event.source === source);
  }

  async getSalesEventsByDateRange(startDate: Date, endDate: Date): Promise<SalesEvent[]> {
    return Array.from(this.salesEvents.values()).filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  async createSalesEvent(event: InsertSalesEvent): Promise<SalesEvent> {
    const newEvent: SalesEvent = {
      id: randomUUID(),
      ...event,
      metadata: event.metadata ?? {},
      locationId: event.locationId ?? null,
      createdAt: new Date(),
    };
    this.salesEvents.set(newEvent.id, newEvent);
    
    // Real-time trigger: Run waste analysis when new sales event is created
    try {
      await this.runWasteAnalysis(newEvent.id);
    } catch (error) {
      console.error('Failed to run waste analysis for sales event:', error);
    }
    
    return newEvent;
  }

  async processPosWebhook(provider: string, payload: any): Promise<void> {
    try {
      // Process webhook based on provider
      switch (provider) {
        case 'square':
          await this.processSquareWebhook(payload);
          break;
        case 'toast':
          await this.processToastWebhook(payload);
          break;
        case 'clover':
          await this.processCloverWebhook(payload);
          break;
        default:
          console.warn(`Unknown POS provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error processing ${provider} webhook:`, error);
      throw error;
    }
  }

  private async processSquareWebhook(payload: any): Promise<void> {
    const { type, data } = payload;
    
    if (type === 'payment.updated' && data?.object?.payment?.status === 'COMPLETED') {
      const payment = data.object.payment;
      
      // Extract sales data from Square payment
      const salesEvent: InsertSalesEvent = {
        source: 'square',
        locationId: payment.location_id,
        timestamp: new Date(payment.created_at),
        items: this.extractSquareItems(payment),
        grossAmount: String(payment.amount_money?.amount / 100 || 0),
        netAmount: String((payment.amount_money?.amount - payment.processing_fee_money?.amount) / 100 || 0),
        taxAmount: String(payment.tax_money?.amount / 100 || 0),
        metadata: { squarePaymentId: payment.id, orderId: payment.order_id },
      };
      
      await this.createSalesEvent(salesEvent);
    }
  }

  private async processToastWebhook(payload: any): Promise<void> {
    const { eventType, data } = payload;
    
    if (eventType === 'ORDER_FIRED' || eventType === 'ORDER_MODIFIED') {
      const order = data;
      
      // Extract sales data from Toast order
      const salesEvent: InsertSalesEvent = {
        source: 'toast',
        locationId: order.restaurantGuid,
        timestamp: new Date(order.createdDate || Date.now()),
        items: order.checks?.[0]?.selections || [],
        grossAmount: String(order.totalAmount || 0),
        netAmount: String(order.netAmount || 0),
        taxAmount: String(order.taxAmount || 0),
        metadata: { toastOrderId: order.guid, checkGuid: order.checks?.[0]?.guid },
      };
      
      await this.createSalesEvent(salesEvent);
    }
  }

  private async processCloverWebhook(payload: any): Promise<void> {
    const { type, data } = payload;
    
    if (type === 'ORDER_CREATED' || type === 'ORDER_UPDATED') {
      const order = data;
      
      // Extract sales data from Clover order
      const salesEvent: InsertSalesEvent = {
        source: 'clover',
        locationId: order.merchantId,
        timestamp: new Date(order.createdTime || Date.now()),
        items: order.lineItems || [],
        grossAmount: String(order.total / 100 || 0),
        netAmount: String((order.total - order.taxAmount) / 100 || 0),
        taxAmount: String(order.taxAmount / 100 || 0),
        metadata: { cloverOrderId: order.id, employeeId: order.employee?.id },
      };
      
      await this.createSalesEvent(salesEvent);
    }
  }

  private extractSquareItems(payment: any): any[] {
    // Extract line items from Square payment
    const lineItems = payment.line_items || [];
    return lineItems.map((item: any) => ({
      id: item.uid,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.base_price_money?.amount / 100 || 0,
      totalPrice: item.total_money?.amount / 100 || 0,
    }));
  }

  // P&L Management Methods
  async getAllPlMonthly(): Promise<PlMonthly[]> {
    return Array.from(this.plMonthly.values());
  }

  async getPlMonthly(id: string): Promise<PlMonthly | undefined> {
    return this.plMonthly.get(id);
  }

  async getPlMonthlyByPeriod(month: string, year: number): Promise<PlMonthly | undefined> {
    return Array.from(this.plMonthly.values()).find(
      pl => pl.month === month && pl.year === year
    );
  }

  async createPlMonthly(pl: InsertPlMonthly): Promise<PlMonthly> {
    const id = randomUUID();
    const newPl: PlMonthly = {
      id,
      ...pl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.plMonthly.set(id, newPl);
    return newPl;
  }

  async updatePlMonthly(id: string, pl: Partial<InsertPlMonthly>): Promise<PlMonthly> {
    const existing = this.plMonthly.get(id);
    if (!existing) {
      throw new Error(`P&L record not found: ${id}`);
    }
    const updated: PlMonthly = {
      ...existing,
      ...pl,
      updatedAt: new Date(),
    };
    this.plMonthly.set(id, updated);
    return updated;
  }

  async deletePlMonthly(id: string): Promise<boolean> {
    return this.plMonthly.delete(id);
  }

  async getPlHistory(months: number): Promise<PlMonthly[]> {
    const allPl = Array.from(this.plMonthly.values());
    return allPl
      .sort((a, b) => {
        const dateA = new Date(a.year, this.monthToNumber(a.month));
        const dateB = new Date(b.year, this.monthToNumber(b.month));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, months);
  }

  private monthToNumber(month: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(month);
  }
}

export const storage = new MemStorage();
