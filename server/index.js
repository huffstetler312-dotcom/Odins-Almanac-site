/**
 * Odin's Eye Restaurant Intelligence Platform - Server
 * Viking-themed backend with Azure Cosmos DB integration
 */

try { require('dotenv').config(); } catch (error) { console.log('dotenv not available, using Azure environment variables'); }

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database layer
const { 
  initializeDatabase, 
  getDatabaseHealth, 
  shutdownDatabase,
  restaurantRepo,
  inventoryRepo 
} = require('./lib/database');

// Import authentication layer
const { 
  initializeAuth,
  getAuthRouter,
  middleware,
  presets,
  utils
} = require('./lib/auth');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://checkout.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
const allowedOrigins = [
  process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : 'http://localhost:3000',
  process.env.NODE_ENV === 'production' ? process.env.AZURE_WEBAPP_URL : null,
  'http://localhost:3001'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); 

// Additional CORS headers for Azure deployment compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, the Vikings have temporarily blocked your path. Try again later.'
  }
});
app.use('/api/', limiter);

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// Serve static files from public
const clientPath = path.join(__dirname, 'public');
app.use(express.static(clientPath));

// Health check endpoint with database and authentication status
app.get('/healthz', async (req, res) => {
  try {
    const dbHealth = await getDatabaseHealth();
    const authStatus = await initializeAuth();
    
    res.status(200).json({
      status: 'healthy',
      service: 'Odin\'s Eye Restaurant Intelligence',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
      database: {
        status: dbHealth.status,
        service: dbHealth.service,
        duration: dbHealth.duration
      },
      authentication: {
        status: authStatus.status,
        canAuthenticate: authStatus.canAuthenticate,
        message: authStatus.message
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'Odin\'s Eye Restaurant Intelligence',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'unhealthy',
        error: error.message
      }
    });
  }
});

// Authentication routes
app.use('/api/auth', getAuthRouter());

// AI Consultation routes (The Oracle's Wisdom) ⚔️
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// API Routes

// Restaurant Management Routes (Protected)
app.get('/api/restaurants', 
  presets.authenticatedUser,
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      
      // Filter restaurants based on user access
      let restaurantFilter = {};
      if (warrior.battleRank !== 'Jarl') {
        // Non-Jarls can only see their accessible restaurants
        restaurantFilter.restaurantIds = warrior.restaurantAccess;
      }
      
      const options = {
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        status: req.query.status || 'active',
        ...restaurantFilter
      };
      
      const restaurants = await restaurantRepo.getRestaurants(options);
      
      res.json({
        success: true,
        data: restaurants,
        count: restaurants.length,
        warrior: {
          name: warrior.warriorName,
          battleRank: warrior.battleRank,
          accessibleCount: warrior.restaurantAccess.length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(error.code || 500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

app.get('/api/restaurants/:id', 
  ...middleware.requireRestaurantAccess('id'),
  async (req, res) => {
    try {
      const restaurant = await restaurantRepo.getRestaurant(req.params.id);
      const warrior = utils.getUser(req);
      
      res.json({
        success: true,
        data: restaurant,
        message: `Welcome to ${restaurant.name}, ${warrior.warriorName}!`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`Error fetching restaurant ${req.params.id}:`, error);
      const statusCode = error.code === 404 ? 404 : (error.code || 500);
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

app.post('/api/restaurants', 
  ...middleware.requirePermission(['restaurant:write']),
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      const restaurantData = {
        ...req.body,
        createdBy: warrior.objectId,
        createdByWarrior: warrior.warriorName
      };
      
      const restaurant = await restaurantRepo.createRestaurant(restaurantData);
      
      res.status(201).json({
        success: true,
        data: restaurant,
        message: `Restaurant '${restaurant.name}' has been conquered by ${warrior.warriorName} and joined the Viking realm!`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error creating restaurant:', error);
      res.status(error.code || 500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Inventory Intelligence Routes (Protected)
app.get('/api/restaurants/:restaurantId/inventory', 
  presets.inventoryManager,
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      const options = {
        category: req.query.category,
        showOnlyVariances: req.query.showOnlyVariances === 'true',
        varianceThreshold: parseInt(req.query.varianceThreshold) || 15,
        limit: parseInt(req.query.limit) || 100
      };
      
      const inventory = await inventoryRepo.getInventoryWithAnalysis(req.params.restaurantId, options);
      
      res.json({
        success: true,
        data: inventory,
        count: inventory.length,
        restaurantId: req.params.restaurantId,
        options,
        warrior: {
          name: warrior.warriorName,
          battleRank: warrior.battleRank
        },
        message: `Inventory arsenal retrieved for ${warrior.warriorName}`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`Error fetching inventory for restaurant ${req.params.restaurantId}:`, error);
      res.status(error.code || 500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

app.post('/api/restaurants/:restaurantId/inventory', 
  presets.inventoryManager,
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      const inventoryData = {
        ...req.body,
        restaurantId: req.params.restaurantId,
        createdBy: warrior.objectId,
        createdByWarrior: warrior.warriorName
      };
      
      const item = await inventoryRepo.createInventoryItem(inventoryData);
      
      res.status(201).json({
        success: true,
        data: item,
        message: `Inventory item '${item.itemName}' added to the Viking arsenal by ${warrior.warriorName}!`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(error.code || 500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

app.put('/api/restaurants/:restaurantId/inventory/:itemId/actual', 
  presets.inventoryManager,
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      const { quantity, reason } = req.body;
      
      const item = await inventoryRepo.updateActualInventory(
        req.params.restaurantId,
        req.params.itemId,
        quantity,
        reason || `manual-update-by-${warrior.warriorName}`
      );
      
      res.json({
        success: true,
        data: item,
        message: `Actual inventory updated with variance analysis by warrior ${warrior.warriorName}`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating actual inventory:', error);
      const statusCode = error.code === 404 ? 404 : (error.code || 500);
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Battle Stats Route (Protected)
app.put('/api/restaurants/:restaurantId/battle-stats', 
  presets.restaurantManager,
  async (req, res) => {
    try {
      const warrior = utils.getUser(req);
      const restaurant = await restaurantRepo.updateBattleStats(req.params.restaurantId, req.body);
      
      res.json({
        success: true,
        data: restaurant.battleStats,
        message: `Viking battle stats updated by ${warrior.warriorName}! The realm grows stronger.`,
        warrior: {
          name: warrior.warriorName,
          battleRank: warrior.battleRank
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating battle stats:', error);
      const statusCode = error.code === 404 ? 404 : (error.code || 500);
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Legacy Stripe routes (keeping for compatibility)
const stripeRoutes = require('./routes/stripe');
app.use('/api/stripe', stripeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error - The Vikings are investigating this battle wound',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Path '${req.path}' not found in the Viking realm`,
    timestamp: new Date().toISOString()
  });
});

// Server startup
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('🏰 Starting Odin\'s Eye Restaurant Intelligence Platform...');
    
    // Initialize database connections
    await initializeDatabase();
    
    // Initialize authentication system
    const authStatus = await initializeAuth();
    console.log('🛡️  Authentication system status:', authStatus.message);
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`⚔️  Odin's Eye server ready for battle on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/healthz`);
      console.log(`📊 API base: http://localhost:${PORT}/api`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Export server reference for compatibility
    module.exports.server = server;
    
    // Graceful shutdown handlers
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    
  } catch (error) {
    console.error('💀 Failed to start Odin\'s Eye server:', error.message);
    process.exit(1);
  }
}

async function gracefulShutdown(server, signal) {
  console.log(`\n🛡️ Received ${signal}. Shutting down Odin's Eye gracefully...`);
  
  // Set hard timeout for forced shutdown
  const forceExitTimer = setTimeout(() => {
    console.error('⚠️  Forced shutdown after 10s timeout - some connections may not have closed gracefully');
    process.exit(1);
  }, 10000);
  
  try {
    // Stop accepting new connections
    server.close(async () => {
      console.log('📡 HTTP server closed');
      
      try {
        // Close database connections
        await shutdownDatabase();
        
        // Attempt to close additional DB clients if they exist
        if (global.dbClient && typeof global.dbClient.close === 'function') {
          await global.dbClient.close();
          console.log('🗄️  Global dbClient closed');
        }
        
        if (global.cosmosClient && typeof global.cosmosClient.dispose === 'function') {
          global.cosmosClient.dispose();
          console.log('🌌 Cosmos client disposed');
        }
        
        if (global.prisma && typeof global.prisma.$disconnect === 'function') {
          await global.prisma.$disconnect();
          console.log('🔗 Prisma client disconnected');
        }
        
        if (global.pgClient && typeof global.pgClient.end === 'function') {
          await global.pgClient.end();
          console.log('🐘 PostgreSQL client closed');
        }
        
        clearTimeout(forceExitTimer);
        console.log('✅ Odin\'s Eye shutdown complete. Until Valhalla!');
        process.exit(0);
      } catch (cleanupError) {
        console.error('❌ Error during cleanup:', cleanupError.message);
        clearTimeout(forceExitTimer);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
module.exports.server = undefined; // Will be set after server starts
