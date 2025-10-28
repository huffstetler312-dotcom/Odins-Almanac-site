import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCountSessionSchema, insertCountLineSchema, insertParRecommendationSchema, insertForecastSchema, insertPosIntegrationSchema, insertSalesEventSchema, insertPlMonthlySchema } from "@shared/schema";
import { z } from "zod";
import { PredictiveInventoryOptimizationEngine } from "./services/pioe";
import { IntelligentWastePredictionSystem } from "./services/iwpps";
import { InventoryVarianceAnalysisSystem } from "./services/ivalps";
import { setupAuth, isAuthenticated, getOidcConfig } from "./replitAuth";
import Stripe from "stripe";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

// Validation schemas for patentable algorithm endpoints
const pioeParamsSchema = z.object({
  itemId: z.string().uuid(),
});

const pioeDemandBodySchema = z.object({
  forecastHours: z.number().int().min(1).max(168).optional().default(24),
});

const pioeOrderBodySchema = z.object({
  leadTimeDays: z.number().int().min(1).max(30).optional().default(3),
});

const iwppsPredictBodySchema = z.object({
  forecastHours: z.number().int().min(1).max(168).optional().default(72),
});

const ivalpsAnalyzeBodySchema = z.object({
  itemId: z.string().uuid(),
  countId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const ivalpsReportBodySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  countIds: z.array(z.string()).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Health check endpoint to test auth infrastructure
  app.get('/api/health', async (req, res) => {
    const health: any = {
      server: 'ok',
      timestamp: new Date().toISOString(),
      stripe: !!stripe,
      auth: 'unknown',
      database: 'unknown'
    };

    try {
      // Test if auth system can be reached
      await getOidcConfig();
      health.auth = 'ok';
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      const cause = error.cause?.message || String(error.cause || '');
      const isDnsFailure = errorMsg.includes('EAI_AGAIN') || errorMsg.includes('helium') || 
                          cause.includes('EAI_AGAIN') || cause.includes('helium') ||
                          errorMsg.includes('ENOTFOUND') || cause.includes('ENOTFOUND');
      
      health.auth = isDnsFailure ? 'dns_failure' : 'error';
      health.authError = errorMsg; // Include error for debugging
    }

    try {
      // Test database
      await storage.getAllInventoryItems();
      health.database = 'ok';
    } catch (error: any) {
      health.database = 'error';
      health.databaseError = error.message || String(error);
    }

    const allOk = health.auth === 'ok' && health.database === 'ok' && health.stripe;
    res.status(allOk ? 200 : 503).json(health);
  });

  // Auth routes - Public endpoint that returns user or null
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stripe Checkout Session (simpler redirect method)
  app.post('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const userId = req.user.claims.sub;
    let user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      // Create Stripe customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        user = await storage.upsertUser({ ...user, stripeCustomerId: customerId });
      }

      // Create Stripe Checkout Session
      // Ensure URLs have https:// protocol for Replit domains
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? (process.env.REPLIT_DEV_DOMAIN.startsWith('http') 
            ? process.env.REPLIT_DEV_DOMAIN 
            : `https://${process.env.REPLIT_DEV_DOMAIN}`)
        : 'http://localhost:5000';

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_placeholder',
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${baseUrl}/?payment=success`,
        cancel_url: `${baseUrl}/pricing?payment=cancelled`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout session error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Stripe Customer Portal Session
  app.post('/api/create-portal-session', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer ID found. Please subscribe first." });
    }

    try {
      // Ensure URLs have https:// protocol for Replit domains
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? (process.env.REPLIT_DEV_DOMAIN.startsWith('http') 
            ? process.env.REPLIT_DEV_DOMAIN 
            : `https://${process.env.REPLIT_DEV_DOMAIN}`)
        : 'http://localhost:5000';

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe portal session error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Webhook handler for Stripe events - uses raw body from express.raw()
  app.post('/api/stripe-webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Webhook secret not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }
    
    try {
      // req.body is raw Buffer from express.raw() middleware
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle checkout session completion
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId && session.subscription) {
          await storage.updateUserStripeInfo(userId, session.customer as string, session.subscription as string);
          await storage.updateUserTier(userId, 'pro');
        }
      }

      // Handle subscription deletion
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        // For mem storage, we'd need to iterate through users
        // In production with DB, we'd query by stripeCustomerId directly
        // For now, we rely on the checkout.session.completed event to set the user
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      return res.status(400).json({ error: error.message });
    }
  });

  // Dashboard endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // ISCE - Waste Detection endpoints
  app.get("/api/waste-detections", async (req, res) => {
    try {
      const detections = await storage.getAllWasteDetections();
      res.json(detections);
    } catch (error) {
      console.error("Waste detections fetch error:", error);
      res.status(500).json({ error: "Failed to fetch waste detections" });
    }
  });

  app.get("/api/waste-detections/status/:status", async (req, res) => {
    try {
      const paramSchema = z.object({
        status: z.enum(['detected', 'investigating', 'confirmed', 'false_positive', 'resolved']),
      });
      
      const { status } = paramSchema.parse(req.params);
      const detections = await storage.getWasteDetectionsByStatus(status);
      res.json(detections);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status parameter", details: error.errors });
      }
      console.error("Waste detections by status fetch error:", error);
      res.status(500).json({ error: "Failed to fetch waste detections by status" });
    }
  });

  app.post("/api/waste-analysis/:salesEventId", async (req, res) => {
    try {
      const paramSchema = z.object({
        salesEventId: z.string().uuid(),
      });
      
      const { salesEventId } = paramSchema.parse(req.params);
      const detections = await storage.runWasteAnalysis(salesEventId);
      res.json(detections);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid sales event ID", details: error.errors });
      }
      console.error("Waste analysis error:", error);
      res.status(500).json({ error: "Failed to run waste analysis" });
    }
  });

  app.get("/api/waste-patterns", async (req, res) => {
    try {
      const patterns = await storage.getAllWastePatterns();
      res.json(patterns);
    } catch (error) {
      console.error("Waste patterns fetch error:", error);
      res.status(500).json({ error: "Failed to fetch waste patterns" });
    }
  });

  app.get("/api/waste-report", async (req, res) => {
    try {
      const querySchema = z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      });
      
      const { startDate, endDate } = querySchema.parse(req.query);
      const report = await storage.generateWasteReport(
        new Date(startDate), 
        new Date(endDate)
      );
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid date parameters", details: error.errors });
      }
      console.error("Waste report error:", error);
      res.status(500).json({ error: "Failed to generate waste report" });
    }
  });

  // Inventory endpoints
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      console.error("Low stock fetch error:", error);
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  // Recipe endpoints
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Recipes fetch error:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipeWithIngredients(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Recipe fetch error:", error);
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  // Target endpoints
  app.get("/api/targets", async (req, res) => {
    try {
      const targets = await storage.getAllTargets();
      res.json(targets);
    } catch (error) {
      console.error("Targets fetch error:", error);
      res.status(500).json({ error: "Failed to fetch targets" });
    }
  });

  app.get("/api/targets/active", async (req, res) => {
    try {
      const targets = await storage.getActiveTargets();
      res.json(targets);
    } catch (error) {
      console.error("Active targets fetch error:", error);
      res.status(500).json({ error: "Failed to fetch active targets" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAllAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/analytics/:metric", async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsByMetric(req.params.metric);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics by metric fetch error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Variance endpoints
  app.get("/api/variances", async (req, res) => {
    try {
      const variances = await storage.getAllVariances();
      res.json(variances);
    } catch (error) {
      console.error("Variances fetch error:", error);
      res.status(500).json({ error: "Failed to fetch variances" });
    }
  });

  app.get("/api/variances/target/:targetId", async (req, res) => {
    try {
      const variances = await storage.getVariancesByTarget(req.params.targetId);
      res.json(variances);
    } catch (error) {
      console.error("Variances by target fetch error:", error);
      res.status(500).json({ error: "Failed to fetch variances" });
    }
  });

  // Count Session endpoints
  app.post("/api/count-sessions", async (req, res) => {
    try {
      const result = insertCountSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid count session data", details: result.error });
      }
      const session = await storage.createCountSession(result.data);
      res.status(201).json(session);
    } catch (error) {
      console.error("Create count session error:", error);
      res.status(500).json({ error: "Failed to create count session" });
    }
  });

  app.get("/api/count-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllCountSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Get count sessions error:", error);
      res.status(500).json({ error: "Failed to fetch count sessions" });
    }
  });

  app.get("/api/count-sessions/active", async (req, res) => {
    try {
      const sessions = await storage.getActiveCountSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Get active count sessions error:", error);
      res.status(500).json({ error: "Failed to fetch active count sessions" });
    }
  });

  app.get("/api/count-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getCountSessionById(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Count session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Get count session error:", error);
      res.status(500).json({ error: "Failed to fetch count session" });
    }
  });

  app.patch("/api/count-sessions/:id/close", async (req, res) => {
    try {
      const session = await storage.closeCountSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Count session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Close count session error:", error);
      res.status(500).json({ error: "Failed to close count session" });
    }
  });

  app.post("/api/count-sessions/:id/apply", async (req, res) => {
    try {
      const result = await storage.applyCountSession(req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Apply count session error:", error);
      res.status(500).json({ error: "Failed to apply count session" });
    }
  });

  // Count Line endpoints
  app.post("/api/count-lines", async (req, res) => {
    try {
      const result = insertCountLineSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid count line data", details: result.error });
      }
      const countLine = await storage.createCountLine(result.data);
      res.status(201).json(countLine);
    } catch (error) {
      console.error("Create count line error:", error);
      res.status(500).json({ error: "Failed to create count line" });
    }
  });

  app.get("/api/count-sessions/:sessionId/lines", async (req, res) => {
    try {
      const lines = await storage.getCountLinesBySession(req.params.sessionId);
      res.json(lines);
    } catch (error) {
      console.error("Get count lines error:", error);
      res.status(500).json({ error: "Failed to fetch count lines" });
    }
  });

  app.patch("/api/count-lines/:id", async (req, res) => {
    try {
      const countLine = await storage.updateCountLine(req.params.id, req.body);
      if (!countLine) {
        return res.status(404).json({ error: "Count line not found" });
      }
      res.json(countLine);
    } catch (error) {
      console.error("Update count line error:", error);
      res.status(500).json({ error: "Failed to update count line" });
    }
  });

  app.delete("/api/count-lines/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCountLine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Count line not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete count line error:", error);
      res.status(500).json({ error: "Failed to delete count line" });
    }
  });

  // Par Recommendations (MAPO Algorithm) Routes
  app.get("/api/par-recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getAllParRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching par recommendations:", error);
      res.status(500).json({ error: "Failed to fetch par recommendations" });
    }
  });

  app.get("/api/par-recommendations/:id", async (req, res) => {
    try {
      const recommendation = await storage.getParRecommendation(req.params.id);
      if (!recommendation) {
        return res.status(404).json({ error: "Par recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      console.error("Error fetching par recommendation:", error);
      res.status(500).json({ error: "Failed to fetch par recommendation" });
    }
  });

  app.get("/api/inventory-items/:id/par-recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getParRecommendationsByItem(req.params.id);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching par recommendations for item:", error);
      res.status(500).json({ error: "Failed to fetch par recommendations for item" });
    }
  });

  app.post("/api/par-recommendations/generate", async (req, res) => {
    try {
      const recommendations = await storage.generateMAPORecommendations();
      res.json({ 
        message: `Generated ${recommendations.length} MAPO recommendations`,
        recommendations 
      });
    } catch (error) {
      console.error("Error generating MAPO recommendations:", error);
      res.status(500).json({ error: "Failed to generate MAPO recommendations" });
    }
  });

  app.post("/api/par-recommendations", async (req, res) => {
    try {
      const validation = insertParRecommendationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid par recommendation data", 
          details: validation.error.issues 
        });
      }

      const recommendation = await storage.createParRecommendation(validation.data);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating par recommendation:", error);
      res.status(500).json({ error: "Failed to create par recommendation" });
    }
  });

  app.patch("/api/par-recommendations/:id", async (req, res) => {
    try {
      const recommendation = await storage.updateParRecommendation(req.params.id, req.body);
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating par recommendation:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Par recommendation not found" });
      }
      res.status(500).json({ error: "Failed to update par recommendation" });
    }
  });

  // Forecasts Routes
  app.get("/api/forecasts", async (req, res) => {
    try {
      const forecasts = await storage.getAllForecasts();
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      res.status(500).json({ error: "Failed to fetch forecasts" });
    }
  });

  app.post("/api/forecasts", async (req, res) => {
    try {
      const validation = insertForecastSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid forecast data", 
          details: validation.error.issues 
        });
      }

      const forecast = await storage.createForecast(validation.data);
      res.status(201).json(forecast);
    } catch (error) {
      console.error("Error creating forecast:", error);
      res.status(500).json({ error: "Failed to create forecast" });
    }
  });

  // POS Integration Routes
  app.get("/api/pos-integrations", async (req, res) => {
    try {
      const integrations = await storage.getAllPosIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching POS integrations:", error);
      res.status(500).json({ error: "Failed to fetch POS integrations" });
    }
  });

  app.get("/api/pos-integrations/:id", async (req, res) => {
    try {
      const integration = await storage.getPosIntegration(req.params.id);
      if (!integration) {
        return res.status(404).json({ error: "POS integration not found" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error fetching POS integration:", error);
      res.status(500).json({ error: "Failed to fetch POS integration" });
    }
  });

  app.post("/api/pos-integrations", async (req, res) => {
    try {
      const validation = insertPosIntegrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid POS integration data", 
          details: validation.error.issues 
        });
      }

      const integration = await storage.createPosIntegration(validation.data);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating POS integration:", error);
      res.status(500).json({ error: "Failed to create POS integration" });
    }
  });

  app.patch("/api/pos-integrations/:id", async (req, res) => {
    try {
      const integration = await storage.updatePosIntegration(req.params.id, req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error updating POS integration:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "POS integration not found" });
      }
      res.status(500).json({ error: "Failed to update POS integration" });
    }
  });

  app.delete("/api/pos-integrations/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePosIntegration(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "POS integration not found" });
      }
      res.json({ message: "POS integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting POS integration:", error);
      res.status(500).json({ error: "Failed to delete POS integration" });
    }
  });

  // Sales Events Routes
  app.get("/api/sales-events", async (req, res) => {
    try {
      const { source, startDate, endDate } = req.query;
      
      let events;
      if (source) {
        events = await storage.getSalesEventsBySource(source as string);
      } else if (startDate && endDate) {
        events = await storage.getSalesEventsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        events = await storage.getAllSalesEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching sales events:", error);
      res.status(500).json({ error: "Failed to fetch sales events" });
    }
  });

  app.post("/api/sales-events", async (req, res) => {
    try {
      const validation = insertSalesEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid sales event data", 
          details: validation.error.issues 
        });
      }

      const event = await storage.createSalesEvent(validation.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating sales event:", error);
      res.status(500).json({ error: "Failed to create sales event" });
    }
  });

  // POS Webhook Endpoints
  app.post("/api/webhooks/pos/square", async (req, res) => {
    try {
      // Verify Square webhook signature here in production
      const signature = req.get('X-Square-Signature');
      console.log('Received Square webhook:', req.body);
      
      await storage.processPosWebhook('square', req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing Square webhook:", error);
      res.status(500).json({ error: "Failed to process Square webhook" });
    }
  });

  app.post("/api/webhooks/pos/toast", async (req, res) => {
    try {
      // Verify Toast webhook signature here in production
      console.log('Received Toast webhook:', req.body);
      
      await storage.processPosWebhook('toast', req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing Toast webhook:", error);
      res.status(500).json({ error: "Failed to process Toast webhook" });
    }
  });

  app.post("/api/webhooks/pos/clover", async (req, res) => {
    try {
      // Verify Clover webhook signature here in production
      console.log('Received Clover webhook:', req.body);
      
      await storage.processPosWebhook('clover', req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing Clover webhook:", error);
      res.status(500).json({ error: "Failed to process Clover webhook" });
    }
  });

  // POS Integration Test Endpoint
  app.post("/api/pos-integrations/:id/test", async (req, res) => {
    try {
      const integration = await storage.getPosIntegration(req.params.id);
      if (!integration) {
        return res.status(404).json({ error: "POS integration not found" });
      }

      // Simulate a test webhook based on provider
      const testPayload = req.body.testPayload || generateTestPayload(integration.provider);
      
      await storage.processPosWebhook(integration.provider, testPayload);
      
      res.json({ 
        message: `Test webhook processed successfully for ${integration.provider}`,
        testPayload 
      });
    } catch (error) {
      console.error("Error testing POS integration:", error);
      res.status(500).json({ error: "Failed to test POS integration" });
    }
  });

  // Initialize patentable algorithm services
  const pioeEngine = new PredictiveInventoryOptimizationEngine(storage);
  const iwppsSystem = new IntelligentWastePredictionSystem(storage, pioeEngine);
  const ivalpsSystem = new InventoryVarianceAnalysisSystem(storage);

  // PIOE (Predictive Inventory Optimization Engine) Routes - PATENT PENDING
  app.post("/api/pioe/predict-demand/:itemId", async (req, res) => {
    try {
      const params = pioeParamsSchema.parse(req.params);
      const body = pioeDemandBodySchema.parse(req.body);
      
      const prediction = await pioeEngine.predictDemand(params.itemId, body.forecastHours);
      res.json(prediction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("PIOE demand prediction error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to predict demand" });
    }
  });

  app.post("/api/pioe/optimize-par/:itemId", async (req, res) => {
    try {
      const params = pioeParamsSchema.parse(req.params);
      
      // Use predictDemand to derive par optimization
      const prediction = await pioeEngine.predictDemand(params.itemId, 168); // 7-day forecast
      res.json({
        itemId: params.itemId,
        currentParLevel: 0,
        recommendedParLevel: prediction.recommendedParLevel,
        safetyStock: Math.ceil(prediction.demandForecast * 0.2),
        confidenceLevel: prediction.confidenceLevel,
        rationale: prediction.rationale,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("PIOE par optimization error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to optimize par level" });
    }
  });

  app.post("/api/pioe/generate-order/:itemId", async (req, res) => {
    try {
      const params = pioeParamsSchema.parse(req.params);
      const body = pioeOrderBodySchema.parse(req.body);
      
      // Use predictDemand to derive order suggestion
      const prediction = await pioeEngine.predictDemand(params.itemId, body.leadTimeDays * 24);
      const item = await storage.getInventoryItem(params.itemId);
      const currentStock = item ? Number(item.currentStock) : 0;
      res.json({
        itemId: params.itemId,
        recommendedOrderQuantity: Math.max(0, prediction.demandForecast - currentStock),
        orderTiming: "immediate",
        confidenceLevel: prediction.confidenceLevel,
        estimatedCost: 0,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("PIOE order generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate order suggestion" });
    }
  });

  // Truck Order Generation - Generate full order for all items
  app.post("/api/pioe/generate-truck-order", async (req, res) => {
    try {
      const truckOrder = await pioeEngine.generateTruckOrder();
      res.json(truckOrder);
    } catch (error) {
      console.error("Truck order generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate truck order" });
    }
  });

  // IWPPS (Intelligent Waste Prediction System) Routes - PATENT PENDING
  app.post("/api/iwpps/predict-waste/:itemId", async (req, res) => {
    try {
      const params = pioeParamsSchema.parse(req.params);
      const body = iwppsPredictBodySchema.parse(req.body);
      
      const wastePrediction = await iwppsSystem.predictWaste(params.itemId, body.forecastHours);
      res.json(wastePrediction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("IWPPS waste prediction error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to predict waste" });
    }
  });

  app.post("/api/iwpps/optimize-rotation/:itemId", async (req, res) => {
    try {
      const params = pioeParamsSchema.parse(req.params);
      
      const rotationOptimization = await iwppsSystem.optimizeInventoryRotation(params.itemId);
      res.json(rotationOptimization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("IWPPS rotation optimization error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to optimize rotation" });
    }
  });

  app.get("/api/iwpps/supplier-performance", async (req, res) => {
    try {
      const performance = await iwppsSystem.analyzeSupplierPerformance();
      res.json(performance);
    } catch (error) {
      console.error("IWPPS supplier performance error:", error);
      res.status(500).json({ error: "Failed to analyze supplier performance" });
    }
  });

  app.get("/api/iwpps/menu-optimization", async (req, res) => {
    try {
      const recommendations = await iwppsSystem.generateMenuOptimizationRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("IWPPS menu optimization error:", error);
      res.status(500).json({ error: "Failed to generate menu recommendations" });
    }
  });

  // IVALPS (Inventory Variance Analysis System) Routes - PATENT PENDING
  app.post("/api/ivalps/analyze-variance", async (req, res) => {
    try {
      const body = ivalpsAnalyzeBodySchema.parse(req.body);
      
      const item = await storage.getInventoryItem(body.itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Mock count for now - would fetch actual count in real implementation
      const mockCount = {
        id: body.countId || 'mock',
        itemId: body.itemId,
        actualCount: String(Number(item.currentStock) * 0.95), // Simulate 5% shortage
        timestamp: new Date().toISOString(),
        countedBy: 'system',
      };
      
      const analysis = await ivalpsSystem.analyzeVariance(
        item, 
        mockCount as any, 
        body.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        body.endDate || new Date().toISOString()
      );
      res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid parameters", details: error.errors });
      }
      console.error("IVALPS variance analysis error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to analyze variance" });
    }
  });

  app.post("/api/ivalps/generate-report", async (req, res) => {
    try {
      const body = ivalpsReportBodySchema.parse(req.body);
      
      // Mock inventory counts for now
      const items = await storage.getAllInventoryItems();
      const mockCounts = items.slice(0, 5).map((item: any) => ({
        id: `count_${item.id}`,
        itemId: item.id,
        actualCount: String(Number(item.currentStock) * (0.9 + Math.random() * 0.2)),
        timestamp: new Date().toISOString(),
        countedBy: 'system',
      }));
      
      const report = await ivalpsSystem.generateVarianceReport(
        body.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        body.endDate || new Date().toISOString(),
        mockCounts as any
      );
      res.json(report);
    } catch (error) {
      console.error("IVALPS report generation error:", error);
      res.status(500).json({ error: "Failed to generate variance report" });
    }
  });

  app.get("/api/ivalps/export-spreadsheet", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Generate report first
      const items = await storage.getAllInventoryItems();
      const mockCounts = items.slice(0, 5).map((item: any) => ({
        id: `count_${item.id}`,
        itemId: item.id,
        actualCount: String(Number(item.currentStock) * (0.9 + Math.random() * 0.2)),
        timestamp: new Date().toISOString(),
        countedBy: 'system',
      }));
      
      const report = await ivalpsSystem.generateVarianceReport(
        (startDate as string) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        (endDate as string) || new Date().toISOString(),
        mockCounts as any
      );
      
      const csv = ivalpsSystem.exportVarianceSpreadsheet(report);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=variance-report-${Date.now()}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("IVALPS export error:", error);
      res.status(500).json({ error: "Failed to export variance spreadsheet" });
    }
  });

  // P&L Dashboard Routes
  const plSchema = z.object({
    month: z.string(),
    year: z.number(),
  });

  app.get("/api/pl", async (req, res) => {
    try {
      const plData = await storage.getAllPlMonthly();
      res.json(plData);
    } catch (error) {
      console.error("Error fetching P&L data:", error);
      res.status(500).json({ error: "Failed to fetch P&L data" });
    }
  });

  app.get("/api/pl/:id", async (req, res) => {
    try {
      const pl = await storage.getPlMonthly(req.params.id);
      if (!pl) {
        return res.status(404).json({ error: "P&L record not found" });
      }
      res.json(pl);
    } catch (error) {
      console.error("Error fetching P&L record:", error);
      res.status(500).json({ error: "Failed to fetch P&L record" });
    }
  });

  app.get("/api/pl/period/:month/:year", async (req, res) => {
    try {
      const { month, year } = req.params;
      const pl = await storage.getPlMonthlyByPeriod(month, parseInt(year));
      if (!pl) {
        return res.status(404).json({ error: "P&L record not found for this period" });
      }
      res.json(pl);
    } catch (error) {
      console.error("Error fetching P&L by period:", error);
      res.status(500).json({ error: "Failed to fetch P&L by period" });
    }
  });

  app.get("/api/pl/history/:months", async (req, res) => {
    try {
      const months = parseInt(req.params.months) || 12;
      const history = await storage.getPlHistory(months);
      res.json(history);
    } catch (error) {
      console.error("Error fetching P&L history:", error);
      res.status(500).json({ error: "Failed to fetch P&L history" });
    }
  });

  app.post("/api/pl", async (req, res) => {
    try {
      console.log("POST /api/pl - Request body:", JSON.stringify(req.body, null, 2));
      
      const validation = insertPlMonthlySchema.safeParse(req.body);
      if (!validation.success) {
        console.error("P&L validation failed:", JSON.stringify(validation.error.issues, null, 2));
        return res.status(400).json({
          error: "Invalid P&L data",
          details: validation.error.issues,
        });
      }

      const pl = await storage.createPlMonthly(validation.data);
      res.status(201).json(pl);
    } catch (error) {
      console.error("Error creating P&L record:", error);
      res.status(500).json({ error: "Failed to create P&L record" });
    }
  });

  app.patch("/api/pl/:id", async (req, res) => {
    try {
      const pl = await storage.updatePlMonthly(req.params.id, req.body);
      res.json(pl);
    } catch (error) {
      console.error("Error updating P&L record:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "P&L record not found" });
      }
      res.status(500).json({ error: "Failed to update P&L record" });
    }
  });

  app.delete("/api/pl/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePlMonthly(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "P&L record not found" });
      }
      res.json({ message: "P&L record deleted successfully" });
    } catch (error) {
      console.error("Error deleting P&L record:", error);
      res.status(500).json({ error: "Failed to delete P&L record" });
    }
  });

  app.post("/api/pl/calculate", async (req, res) => {
    try {
      const { targets, actuals } = req.body;
      
      console.log("P&L Calculate - Request Body:", JSON.stringify(req.body, null, 2));
      
      if (!targets || !actuals) {
        console.error("P&L Calculate - Missing data:", { targets, actuals });
        return res.status(400).json({ error: "Missing targets or actuals data" });
      }
      
      // Convert to numbers safely
      const targetRevenue = Number(targets.targetRevenue) || 0;
      const targetFoodCostPct = Number(targets.targetFoodCostPct) || 0;
      const targetLaborCostPct = Number(targets.targetLaborCostPct) || 0;
      const targetOverheadPct = Number(targets.targetOverheadPct) || 0;
      const targetProfitMarginPct = Number(targets.targetProfitMarginPct) || 0;
      
      const actualRevenue = Number(actuals.actualRevenue) || 0;
      const actualFoodCost = Number(actuals.actualFoodCost) || 0;
      const actualLaborCost = Number(actuals.actualLaborCost) || 0;
      const actualOverhead = Number(actuals.actualOverhead) || 0;
      
      // Calculate P&L metrics
      const targetFoodCost = (targetRevenue * targetFoodCostPct) / 100;
      const targetLaborCost = (targetRevenue * targetLaborCostPct) / 100;
      const targetOverhead = (targetRevenue * targetOverheadPct) / 100;
      const targetProfit = (targetRevenue * targetProfitMarginPct) / 100;
      
      const actualFoodCostPct = actualRevenue > 0 
        ? (actualFoodCost / actualRevenue) * 100 
        : 0;
      const actualLaborCostPct = actualRevenue > 0 
        ? (actualLaborCost / actualRevenue) * 100 
        : 0;
      const actualOverheadPct = actualRevenue > 0 
        ? (actualOverhead / actualRevenue) * 100 
        : 0;
      
      const actualProfit = actualRevenue - actualFoodCost - actualLaborCost - actualOverhead;
      const actualProfitMargin = actualRevenue > 0 
        ? (actualProfit / actualRevenue) * 100 
        : 0;
      
      const calculations = {
        targetFoodCost,
        targetLaborCost,
        targetOverhead,
        targetProfit,
        actualFoodCostPct,
        actualLaborCostPct,
        actualOverheadPct,
        actualProfit,
        actualProfitMargin,
        varianceFoodCost: targetFoodCost - actualFoodCost,
        varianceLaborCost: targetLaborCost - actualLaborCost,
        varianceOverhead: targetOverhead - actualOverhead,
        varianceProfit: actualProfit - targetProfit,
      };
      
      console.log("P&L Calculate - Response:", JSON.stringify(calculations, null, 2));
      res.json(calculations);
    } catch (error) {
      console.error("Error calculating P&L:", error);
      res.status(500).json({ error: "Failed to calculate P&L" });
    }
  });

  // Get comprehensive P&L data for export with comparisons
  app.get("/api/pl/comprehensive/:month/:year", async (req, res) => {
    try {
      const { month, year } = req.params;
      const currentYear = parseInt(year);
      
      // Get current period data
      const current = await storage.getPlMonthlyByPeriod(month, currentYear);
      if (!current) {
        return res.status(404).json({ error: "P&L record not found for this period" });
      }
      
      // Get last year same period
      const lastYear = await storage.getPlMonthlyByPeriod(month, currentYear - 1);
      
      // Get YTD data (all months in current year up to this month)
      const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonthIndex = allMonths.indexOf(month);
      const ytdMonths = allMonths.slice(0, currentMonthIndex + 1);
      
      const ytdData = await Promise.all(
        ytdMonths.map(m => storage.getPlMonthlyByPeriod(m, currentYear))
      );
      const ytdFiltered = ytdData.filter(d => d !== undefined);
      
      res.json({
        current,
        lastYear: lastYear || null,
        ytd: ytdFiltered
      });
    } catch (error) {
      console.error("Error fetching comprehensive P&L data:", error);
      res.status(500).json({ error: "Failed to fetch comprehensive P&L data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to generate test webhook payloads
function generateTestPayload(provider: string): any {
  const timestamp = new Date().toISOString();
  
  switch (provider) {
    case 'square':
      return {
        type: 'payment.updated',
        data: {
          object: {
            payment: {
              id: 'test_payment_' + Date.now(),
              status: 'COMPLETED',
              location_id: 'TEST_LOCATION',
              created_at: timestamp,
              amount_money: { amount: 2500, currency: 'USD' },
              processing_fee_money: { amount: 75, currency: 'USD' },
              tax_money: { amount: 200, currency: 'USD' },
              order_id: 'test_order_' + Date.now(),
              order: {
                line_items: [
                  {
                    name: 'Test Burger',
                    quantity: '1',
                    variation_price: 1299
                  },
                  {
                    name: 'Test Fries',  
                    quantity: '1',
                    variation_price: 499
                  }
                ]
              }
            }
          }
        }
      };
      
    case 'toast':
      return {
        eventType: 'order_completed',
        details: {
          guid: 'test_order_' + Date.now(),
          restaurantGuid: 'TEST_RESTAURANT',
          date: timestamp,
          totalAmount: 25.00,
          netAmount: 23.00,
          taxAmount: 2.00,
          checkNumber: 'TEST-001',
          selections: [
            {
              itemName: 'Test Pasta',
              quantity: 1,
              unitPrice: 15.99,
              totalPrice: 15.99
            },
            {
              itemName: 'Test Salad',
              quantity: 1,
              unitPrice: 9.01,
              totalPrice: 9.01
            }
          ]
        }
      };
      
    case 'clover':
      return {
        type: 'order_paid',
        data: {
          id: 'test_order_' + Date.now(),
          createdTime: Date.now(),
          total: 2800,
          tipAmount: 300,
          taxAmount: 200,
          paymentId: 'test_payment_' + Date.now(),
          merchant: { id: 'TEST_MERCHANT' },
          lineItems: [
            {
              name: 'Test Sandwich',
              quantity: 1,
              price: 1200
            },
            {
              name: 'Test Drink',
              quantity: 2,
              price: 800
            }
          ]
        }
      };
      
    default:
      return {
        type: 'test_event',
        data: { message: 'Test webhook payload' }
      };
  }
}