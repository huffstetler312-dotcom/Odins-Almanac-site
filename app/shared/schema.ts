import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
// IMPORTANT: This table is mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth + Stripe
// IMPORTANT: This table is mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Stripe fields for subscription management
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  tier: varchar("tier").notNull().default("free"), // 'free' or 'pro'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;

// Suppliers for inventory management
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  specialty: jsonb("specialty"), // Array of categories
  leadTimeDays: integer("lead_time_days").default(1),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }), // 0-100
  deliveryReliability: decimal("delivery_reliability", { precision: 5, scale: 2 }), // 0-100
  priceCompetitiveness: decimal("price_competitiveness", { precision: 5, scale: 2 }), // 0-100
  wasteCorrelation: decimal("waste_correlation", { precision: 5, scale: 2 }), // -1 to 1
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory items
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  minimumStock: decimal("minimum_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  parLevel: decimal("par_level", { precision: 10, scale: 2 }), // Target par level
  unit: text("unit").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull().default("0"),
  supplier: text("supplier"), // Legacy field, kept for compatibility
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Recipes
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  servingSize: integer("serving_size").notNull().default(1),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  category: text("category").notNull(),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recipe ingredients (junction table)
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: varchar("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
});

// Targets for operational goals
export const targets = pgTable("targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'sales', 'cost', 'waste', 'labor', etc.
  targetValue: decimal("target_value", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull().default("0"),
  unit: text("unit").notNull(), // '$', '%', 'lbs', 'hours', etc.
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics data points
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: text("metric").notNull(), // 'daily_sales', 'food_cost', 'labor_hours', etc.
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  metadata: jsonb("metadata"), // Additional context data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Variance tracking
export const variances = pgTable("variances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetId: varchar("target_id").notNull().references(() => targets.id, { onDelete: "cascade" }),
  actualValue: decimal("actual_value", { precision: 12, scale: 2 }).notNull(),
  expectedValue: decimal("expected_value", { precision: 12, scale: 2 }).notNull(),
  variance: decimal("variance", { precision: 12, scale: 2 }).notNull(),
  variancePercentage: decimal("variance_percentage", { precision: 5, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales events from POS systems
export const salesEvents = pgTable("sales_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(), // 'square', 'toast', 'clover', etc.
  locationId: text("location_id"),
  timestamp: timestamp("timestamp").notNull(),
  items: jsonb("items").notNull(), // array of sold items
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  metadata: jsonb("metadata"), // POS-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// POS integration configurations
export const posIntegrations = pgTable("pos_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // 'square', 'toast', 'clover', etc.
  status: text("status").notNull(), // 'active', 'inactive', 'error', 'pending'
  authData: jsonb("auth_data"), // encrypted OAuth tokens
  locations: jsonb("locations"), // array of location configs
  webhookUrl: text("webhook_url"), // webhook endpoint URL
  signingKey: text("signing_key"), // for webhook verification
  lastSync: timestamp("last_sync"),
  syncErrors: jsonb("sync_errors"), // error log for troubleshooting
  metadata: jsonb("metadata"), // provider-specific config
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Inventory count sessions for user entry
export const countSessions = pgTable("count_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  area: text("area"), // 'kitchen', 'bar', 'storage', etc.
  userId: varchar("user_id"), // reference to user who did the count
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual count entries
export const countLines = pgTable("count_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => countSessions.id, { onDelete: "cascade" }),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  countedQuantity: decimal("counted_quantity", { precision: 10, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// AI-generated par level recommendations
export const parRecommendations = pgTable("par_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryItemId: varchar("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  recommendedPar: decimal("recommended_par", { precision: 10, scale: 2 }).notNull(),
  safetyStock: decimal("safety_stock", { precision: 10, scale: 2 }).notNull(),
  rationale: jsonb("rationale"), // explanation of the calculation
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0-1 confidence score
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Demand forecasts
export const forecasts = pgTable("forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: text("metric").notNull(), // 'demand', 'sales', 'usage'
  skuId: varchar("sku_id"), // inventory item or recipe
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  horizon: integer("horizon").notNull(), // forecast periods ahead
  values: jsonb("values").notNull(), // array of forecast values
  algorithm: text("algorithm").notNull(), // 'MAPO', 'simple_average', etc.
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // historical accuracy %
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ISCE (Inventory-Sales Coupling Engine) - Waste detection system
export const wasteDetections = pgTable("waste_detections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryItemId: varchar("inventory_item_id").notNull(),
  salesEventId: varchar("sales_event_id"),
  recipeId: varchar("recipe_id"),
  wasteType: text("waste_type").notNull(), // 'overproduction', 'spoilage', 'portion_control', 'theft', 'unknown'
  expectedUsage: decimal("expected_usage", { precision: 10, scale: 2 }).notNull(),
  actualUsage: decimal("actual_usage", { precision: 10, scale: 2 }).notNull(),
  wasteAmount: decimal("waste_amount", { precision: 10, scale: 2 }).notNull(),
  wasteCost: decimal("waste_cost", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100 confidence score
  detectionAlgorithm: text("detection_algorithm").notNull(), // 'ISCE_v1', 'manual', etc.
  metadata: jsonb("metadata"), // Additional context and analysis data
  status: text("status").notNull().default("detected"), // 'detected', 'investigating', 'confirmed', 'false_positive', 'resolved'
  notes: text("notes"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Waste tracking patterns for trend analysis
export const wastePatterns = pgTable("waste_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patternType: text("pattern_type").notNull(), // 'daily_spike', 'weekly_trend', 'seasonal', 'ingredient_specific'
  description: text("description").notNull(),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  affectedItems: jsonb("affected_items").notNull(), // Array of inventory item IDs
  costImpact: decimal("cost_impact", { precision: 10, scale: 2 }).notNull(),
  detectionCount: integer("detection_count").notNull().default(1),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  algorithm: text("algorithm").notNull(), // 'ISCE_pattern_v1'
  metadata: jsonb("metadata"), // Pattern-specific analysis data
  firstDetected: timestamp("first_detected").defaultNow().notNull(),
  lastDetected: timestamp("last_detected").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // 'active', 'resolved', 'monitoring'
});

// P&L monthly tracking
// Comprehensive P&L with Budget, Actual, Last Year, and YTD tracking
export const plMonthly = pgTable("pl_monthly", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(), // 'January', 'February', etc.
  year: integer("year").notNull(),
  restaurantName: text("restaurant_name").default("My Restaurant"),
  
  // REVENUE - Actual
  actualFoodSales: decimal("actual_food_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  actualBeverageSales: decimal("actual_beverage_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  actualOtherRevenue: decimal("actual_other_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // REVENUE - Budget
  budgetFoodSales: decimal("budget_food_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetBeverageSales: decimal("budget_beverage_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetOtherRevenue: decimal("budget_other_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // COGS - Actual
  actualFoodCost: decimal("actual_food_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  actualBeverageCost: decimal("actual_beverage_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // COGS - Budget
  budgetFoodCostPct: decimal("budget_food_cost_pct", { precision: 5, scale: 2 }).notNull().default("30"),
  budgetBeverageCostPct: decimal("budget_beverage_cost_pct", { precision: 5, scale: 2 }).notNull().default("22"),
  
  // LABOR - Actual
  actualKitchenLabor: decimal("actual_kitchen_labor", { precision: 12, scale: 2 }).notNull().default("0"),
  actualFohLabor: decimal("actual_foh_labor", { precision: 12, scale: 2 }).notNull().default("0"),
  actualManagementLabor: decimal("actual_management_labor", { precision: 12, scale: 2 }).notNull().default("0"),
  actualPayrollTaxes: decimal("actual_payroll_taxes", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // LABOR - Budget
  budgetLaborCostPct: decimal("budget_labor_cost_pct", { precision: 5, scale: 2 }).notNull().default("28"),
  budgetPayrollTaxesPct: decimal("budget_payroll_taxes_pct", { precision: 5, scale: 2 }).notNull().default("7"),
  
  // OPERATING EXPENSES - Actual
  actualRent: decimal("actual_rent", { precision: 12, scale: 2 }).notNull().default("0"),
  actualUtilities: decimal("actual_utilities", { precision: 12, scale: 2 }).notNull().default("0"),
  actualMarketing: decimal("actual_marketing", { precision: 12, scale: 2 }).notNull().default("0"),
  actualRepairsMaintenance: decimal("actual_repairs_maintenance", { precision: 12, scale: 2 }).notNull().default("0"),
  actualSupplies: decimal("actual_supplies", { precision: 12, scale: 2 }).notNull().default("0"),
  actualInsurance: decimal("actual_insurance", { precision: 12, scale: 2 }).notNull().default("0"),
  actualCreditCardFees: decimal("actual_credit_card_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  actualOtherExpenses: decimal("actual_other_expenses", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // OPERATING EXPENSES - Budget
  budgetRent: decimal("budget_rent", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetUtilities: decimal("budget_utilities", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetMarketing: decimal("budget_marketing", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetRepairsMaintenance: decimal("budget_repairs_maintenance", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetSupplies: decimal("budget_supplies", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetInsurance: decimal("budget_insurance", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetCreditCardFees: decimal("budget_credit_card_fees", { precision: 12, scale: 2 }).notNull().default("0"),
  budgetOtherExpenses: decimal("budget_other_expenses", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // TARGET PERCENTAGES (Industry Benchmarks)
  targetFoodCostPct: decimal("target_food_cost_pct", { precision: 5, scale: 2 }).notNull().default("30"),
  targetBeverageCostPct: decimal("target_beverage_cost_pct", { precision: 5, scale: 2 }).notNull().default("22"),
  targetLaborCostPct: decimal("target_labor_cost_pct", { precision: 5, scale: 2 }).notNull().default("30"),
  targetPrimeCostPct: decimal("target_prime_cost_pct", { precision: 5, scale: 2 }).notNull().default("60"),
  targetNetProfitPct: decimal("target_net_profit_pct", { precision: 5, scale: 2 }).notNull().default("10"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Physical inventory counts for IVALPS
export const inventoryCounts = pgTable("inventory_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => countSessions.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  countDate: timestamp("count_date").defaultNow().notNull(),
  actualCount: decimal("actual_count", { precision: 10, scale: 3 }).notNull(),
  countedBy: text("counted_by"),
  countMethod: text("count_method").notNull().default("physical"), // 'physical', 'scale', 'estimated'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Variance reports for IVALPS
export const varianceReports = pgTable("variance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportDate: timestamp("report_date").defaultNow().notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalItems: integer("total_items").notNull(),
  itemsWithVariance: integer("items_with_variance").notNull(),
  totalValueVariance: decimal("total_value_variance", { precision: 12, scale: 2 }).notNull(),
  averageVariancePct: decimal("average_variance_pct", { precision: 5, scale: 2 }).notNull(),
  suspectedTheftCount: integer("suspected_theft_count").notNull().default(0),
  portionControlIssuesCount: integer("portion_control_issues_count").notNull().default(0),
  spoilageRelatedCount: integer("spoilage_related_count").notNull().default(0),
  immediateActions: jsonb("immediate_actions"), // Array of action items
  processImprovements: jsonb("process_improvements"), // Array of improvements
  trainingNeeds: jsonb("training_needs"), // Array of training items
  reportData: jsonb("report_data"), // Full report details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual variance analyses for IVALPS
export const varianceAnalyses = pgTable("variance_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => varianceReports.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  countId: varchar("count_id").notNull().references(() => inventoryCounts.id),
  
  // Theoretical calculations
  theoreticalQuantity: decimal("theoretical_quantity", { precision: 10, scale: 2 }).notNull(),
  theoreticalValue: decimal("theoretical_value", { precision: 10, scale: 2 }).notNull(),
  
  // Actual counts
  actualQuantity: decimal("actual_quantity", { precision: 10, scale: 2 }).notNull(),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }).notNull(),
  
  // Variance metrics
  quantityVariance: decimal("quantity_variance", { precision: 10, scale: 2 }).notNull(),
  quantityVariancePct: decimal("quantity_variance_pct", { precision: 5, scale: 2 }).notNull(),
  valueVariance: decimal("value_variance", { precision: 10, scale: 2 }).notNull(),
  valueVariancePct: decimal("value_variance_pct", { precision: 5, scale: 2 }).notNull(),
  
  // Analysis
  varianceType: text("variance_type").notNull(), // 'overage', 'shortage', 'within_tolerance'
  severityLevel: text("severity_level").notNull(), // 'low', 'medium', 'high', 'critical'
  possibleCauses: jsonb("possible_causes"), // Array of possible causes
  recommendations: jsonb("recommendations"), // Array of recommendations
  
  // Pattern detection
  theftProbability: decimal("theft_probability", { precision: 5, scale: 2 }),
  portionControlScore: decimal("portion_control_score", { precision: 5, scale: 2 }),
  spoilageScore: decimal("spoilage_score", { precision: 5, scale: 2 }),
  
  // Historical context
  historicalVariancePct: decimal("historical_variance_pct", { precision: 5, scale: 2 }),
  trendDirection: text("trend_direction"), // 'improving', 'worsening', 'stable'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  lastUpdated: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
});

export const insertTargetSchema = createInsertSchema(targets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertVarianceSchema = createInsertSchema(variances).omit({
  id: true,
  createdAt: true,
});

export const insertCountSessionSchema = createInsertSchema(countSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCountLineSchema = createInsertSchema(countLines).omit({
  id: true,
});

export const insertParRecommendationSchema = createInsertSchema(parRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
  createdAt: true,
});

export const insertWasteDetectionSchema = createInsertSchema(wasteDetections).omit({
  id: true,
  detectedAt: true,
});

export const insertWastePatternSchema = createInsertSchema(wastePatterns).omit({
  id: true,
  firstDetected: true,
  lastDetected: true,
});

export const insertSalesEventSchema = createInsertSchema(salesEvents).omit({
  id: true,
  createdAt: true,
}).extend({
  timestamp: z.coerce.date(),
});

export const insertPosIntegrationSchema = createInsertSchema(posIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlMonthlySchema = createInsertSchema(plMonthly).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({
  id: true,
  createdAt: true,
});

export const insertVarianceReportSchema = createInsertSchema(varianceReports).omit({
  id: true,
  createdAt: true,
});

export const insertVarianceAnalysisSchema = createInsertSchema(varianceAnalyses).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Variance = typeof variances.$inferSelect;
export type InsertVariance = z.infer<typeof insertVarianceSchema>;

export type SalesEvent = typeof salesEvents.$inferSelect;
export type InsertSalesEvent = z.infer<typeof insertSalesEventSchema>;

export type PosIntegration = typeof posIntegrations.$inferSelect;
export type InsertPosIntegration = z.infer<typeof insertPosIntegrationSchema>;

export type CountSession = typeof countSessions.$inferSelect;
export type InsertCountSession = z.infer<typeof insertCountSessionSchema>;

export type CountLine = typeof countLines.$inferSelect;
export type InsertCountLine = z.infer<typeof insertCountLineSchema>;

export type ParRecommendation = typeof parRecommendations.$inferSelect;
export type InsertParRecommendation = z.infer<typeof insertParRecommendationSchema>;

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type WasteDetection = typeof wasteDetections.$inferSelect;
export type InsertWasteDetection = z.infer<typeof insertWasteDetectionSchema>;

export type WastePattern = typeof wastePatterns.$inferSelect;
export type InsertWastePattern = z.infer<typeof insertWastePatternSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type PlMonthly = typeof plMonthly.$inferSelect;
export type InsertPlMonthly = z.infer<typeof insertPlMonthlySchema>;

export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;

export type VarianceReport = typeof varianceReports.$inferSelect;
export type InsertVarianceReport = z.infer<typeof insertVarianceReportSchema>;

export type VarianceAnalysis = typeof varianceAnalyses.$inferSelect;
export type InsertVarianceAnalysis = z.infer<typeof insertVarianceAnalysisSchema>;

// Extended types for API responses
export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & { inventoryItem: InventoryItem })[];
};

export type TargetWithVariances = Target & {
  recentVariances: Variance[];
};

export type DashboardMetrics = {
  totalInventoryValue: number;
  lowStockItems: number;
  activeRecipes: number;
  targetsOnTrack: number;
  avgVariance: number;
  dailySales: number;
  foodCostPercentage: number;
  laborHours: number;
  // ARCC color indicators
  colorIndicators: {
    inventoryHealth: 'critical' | 'warning' | 'good' | 'excellent';
    salesTrend: 'critical' | 'warning' | 'good' | 'excellent';
    costControl: 'critical' | 'warning' | 'good' | 'excellent';
    operationalEfficiency: 'critical' | 'warning' | 'good' | 'excellent';
  };
};