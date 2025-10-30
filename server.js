// Production Server - Restaurant Intelligence Platform
// Viking Restaurant Consultants - Enterprise Grade

// Application Insights (must be first)
const appInsights = require('applicationinsights');
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
}

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const { listMissingEnv } = require('./server/lib/env-check');

// Initialize Express app
const app = express();

// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Configure Winston logger
const logger = winston.createLogger({
  level: IS_PRODUCTION ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'restaurant-intelligence' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// In development, also log to console
if (!IS_PRODUCTION) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.applicationinsights.azure.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stripe webhook rate limiting (more restrictive)
const stripeWebhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit to 10 webhook calls per 5 minutes
  skip: (req) => req.path !== '/api/stripe/webhook'
});

app.use('/api/stripe/webhook', stripeWebhookLimiter);

// Logging middleware
if (IS_PRODUCTION) {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev'));
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      process.env.FRONTEND_URL,
      process.env.AZURE_APP_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (important for Azure App Service)
app.set('trust proxy', 1);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});

// ============================================
// API ROUTES (MUST COME BEFORE STATIC FILES)
// ============================================

// Health check endpoint (Azure App Service ready)
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Restaurant Intelligence Platform is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    memory: process.memoryUsage(),
    pid: process.pid
  };

  logger.info('Health check requested', healthCheck);
  res.status(200).json(healthCheck);
});

// Readiness probe (for Azure App Service)
app.get('/ready', (req, res) => {
  // Check if all required environment variables are present
  const requiredEnvVars = [
    'STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_SECRET_KEY',
    'DATABASE_URL',
    'NODE_ENV'
  ];
  
  const missingEnvVars = listMissingEnv(requiredEnvVars);
  
  if (missingEnvVars.length > 0) {
    logger.warn('Readiness check failed - missing environment variables:', missingEnvVars);
    return res.status(503).json({ 
      status: 'not ready', 
      error: 'Missing required environment variables',
      missing: missingEnvVars
    });
  }

  res.status(200).json({ 
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'All systems operational'
  });
});

// Serve test page
app.get('/test', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'test-oracle.html'));
  } catch (error) {
    logger.error('Error serving test page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Oracle test endpoint
app.post('/api/ai/test-direct', async (req, res) => {
  try {
    logger.info('AI Oracle Direct Test Request');
    
    const query = req.body.query || "What's the secret to Viking restaurant success?";
    
    // Simulate AI response for now (replace with actual AI integration)
    const responses = [
      "🏴‍☠️ The secret to Viking restaurant success lies in bold flavors, fierce hospitality, and treating every meal like a feast worthy of Valhalla!",
      "⚔️ Channel the Viking spirit: Use fresh, local ingredients like they raided the best farms, serve portions that would satisfy a warrior after battle!",
      "🛡️ Vikings valued community and storytelling - create an atmosphere where guests feel like they're part of the clan, sharing tales over hearty meals!",
      "🔥 Master the art of fire cooking! Vikings were experts with flame - grilled meats, smoky flavors, and dishes that warm the soul through winter!",
      "🌊 Like Viking explorers, never stop innovating your menu. Discover new flavor territories while honoring traditional cooking methods!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    logger.info('AI Oracle response generated', { query, responseLength: response.length });
    
    res.json({
      success: true,
      query: query,
      response: response,
      timestamp: new Date().toISOString(),
      source: "Viking AI Oracle",
      confidence: 0.95
    });
    
  } catch (error) {
    logger.error('AI Oracle test error:', error);
    res.status(500).json({
      success: false,
      error: 'AI Oracle temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// P&L Spreadsheet Generation - Excel (.xlsx)
app.post('/api/demo/generate-pl-excel', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const fs = require('fs');
    
    logger.info('Excel P&L Generation Request');
    
    // Get data from request or use defaults
    const data = req.body || {};
    const restaurantName = data.restaurantName || 'Sample Restaurant';
    
    // Generate sample P&L data
    const plData = {
      restaurantName,
      year: data.year || new Date().getFullYear(),
      revenue: {
        food: data.foodSales || 800000,
        beverage: data.beverageSales || 200000,
        other: data.otherRevenue || 50000
      },
      costs: {
        foodCost: data.foodCost || 224000,
        beverageCost: data.beverageCost || 50000,
        laborCost: data.laborCost || 315000,
        rent: data.rent || 80000,
        utilities: data.utilities || 42000,
        marketing: data.marketing || 21000,
        supplies: data.supplies || 31500,
        insurance: data.insurance || 15000,
        other: data.otherExpenses || 20000
      }
    };
    
    // Calculate totals
    plData.totalRevenue = plData.revenue.food + plData.revenue.beverage + plData.revenue.other;
    plData.totalCOGS = plData.costs.foodCost + plData.costs.beverageCost;
    plData.grossProfit = plData.totalRevenue - plData.totalCOGS;
    plData.totalOperatingExpenses = plData.costs.laborCost + plData.costs.rent + 
                                    plData.costs.utilities + plData.costs.marketing + 
                                    plData.costs.supplies + plData.costs.insurance + 
                                    plData.costs.other;
    plData.netProfit = plData.grossProfit - plData.totalOperatingExpenses;
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Viking Restaurant Consultants';
    workbook.created = new Date();
    
    // Add worksheet
    const worksheet = workbook.addWorksheet('P&L Statement');
    
    // Set column widths
    worksheet.columns = [
      { key: 'description', width: 35 },
      { key: 'amount', width: 15 }
    ];
    
    // Add header
    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${plData.restaurantName} - Profit & Loss Statement`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:B2');
    const yearCell = worksheet.getCell('A2');
    yearCell.value = `Year: ${plData.year}`;
    yearCell.font = { size: 12 };
    yearCell.alignment = { horizontal: 'center' };
    
    worksheet.addRow([]);
    
    // Revenue Section
    worksheet.addRow(['REVENUE', '']).font = { bold: true, size: 12 };
    worksheet.addRow(['Food Sales', plData.revenue.food]);
    worksheet.addRow(['Beverage Sales', plData.revenue.beverage]);
    worksheet.addRow(['Other Revenue', plData.revenue.other]);
    const totalRevenueRow = worksheet.addRow(['Total Revenue', plData.totalRevenue]);
    totalRevenueRow.font = { bold: true };
    totalRevenueRow.getCell(2).numFmt = '$#,##0.00';
    
    worksheet.addRow([]);
    
    // COGS Section
    worksheet.addRow(['COST OF GOODS SOLD', '']).font = { bold: true, size: 12 };
    worksheet.addRow(['Food Cost', plData.costs.foodCost]);
    worksheet.addRow(['Beverage Cost', plData.costs.beverageCost]);
    const totalCOGSRow = worksheet.addRow(['Total COGS', plData.totalCOGS]);
    totalCOGSRow.font = { bold: true };
    totalCOGSRow.getCell(2).numFmt = '$#,##0.00';
    
    worksheet.addRow([]);
    
    const grossProfitRow = worksheet.addRow(['GROSS PROFIT', plData.grossProfit]);
    grossProfitRow.font = { bold: true, size: 12 };
    grossProfitRow.getCell(2).numFmt = '$#,##0.00';
    
    worksheet.addRow([]);
    
    // Operating Expenses Section
    worksheet.addRow(['OPERATING EXPENSES', '']).font = { bold: true, size: 12 };
    worksheet.addRow(['Labor Cost', plData.costs.laborCost]);
    worksheet.addRow(['Rent', plData.costs.rent]);
    worksheet.addRow(['Utilities', plData.costs.utilities]);
    worksheet.addRow(['Marketing', plData.costs.marketing]);
    worksheet.addRow(['Supplies', plData.costs.supplies]);
    worksheet.addRow(['Insurance', plData.costs.insurance]);
    worksheet.addRow(['Other Expenses', plData.costs.other]);
    const totalOpExRow = worksheet.addRow(['Total Operating Expenses', plData.totalOperatingExpenses]);
    totalOpExRow.font = { bold: true };
    totalOpExRow.getCell(2).numFmt = '$#,##0.00';
    
    worksheet.addRow([]);
    
    const netProfitRow = worksheet.addRow(['NET PROFIT', plData.netProfit]);
    netProfitRow.font = { bold: true, size: 14 };
    netProfitRow.getCell(2).numFmt = '$#,##0.00';
    netProfitRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: plData.netProfit >= 0 ? 'FFD4EDDA' : 'FFF8D7DA' }
    };
    
    // Format all amount cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        const amountCell = row.getCell(2);
        if (amountCell.value && typeof amountCell.value === 'number') {
          amountCell.numFmt = '$#,##0.00';
        }
      }
    });
    
    // Ensure generated-spreadsheets directory exists
    const outputDir = path.join(__dirname, 'generated-spreadsheets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `PL_${restaurantName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.xlsx`;
    const filepath = path.join(outputDir, filename);
    
    // Write file
    await workbook.xlsx.writeFile(filepath);
    
    logger.info(`Excel P&L generated: ${filename}`);
    
    res.json({
      success: true,
      filename,
      downloadUrl: `/download/${filename}`,
      data: plData
    });
    
  } catch (error) {
    logger.error('Excel P&L generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Excel P&L spreadsheet',
      message: error.message
    });
  }
});

// P&L Spreadsheet Generation - CSV (for Google Sheets)
app.post('/api/demo/generate-pl-csv', async (req, res) => {
  try {
    const fs = require('fs');
    
    logger.info('CSV P&L Generation Request');
    
    // Get data from request or use defaults
    const data = req.body || {};
    const restaurantName = data.restaurantName || 'Sample Restaurant';
    
    // Generate sample P&L data
    const plData = {
      restaurantName,
      year: data.year || new Date().getFullYear(),
      revenue: {
        food: data.foodSales || 800000,
        beverage: data.beverageSales || 200000,
        other: data.otherRevenue || 50000
      },
      costs: {
        foodCost: data.foodCost || 224000,
        beverageCost: data.beverageCost || 50000,
        laborCost: data.laborCost || 315000,
        rent: data.rent || 80000,
        utilities: data.utilities || 42000,
        marketing: data.marketing || 21000,
        supplies: data.supplies || 31500,
        insurance: data.insurance || 15000,
        other: data.otherExpenses || 20000
      }
    };
    
    // Calculate totals
    plData.totalRevenue = plData.revenue.food + plData.revenue.beverage + plData.revenue.other;
    plData.totalCOGS = plData.costs.foodCost + plData.costs.beverageCost;
    plData.grossProfit = plData.totalRevenue - plData.totalCOGS;
    plData.totalOperatingExpenses = plData.costs.laborCost + plData.costs.rent + 
                                    plData.costs.utilities + plData.costs.marketing + 
                                    plData.costs.supplies + plData.costs.insurance + 
                                    plData.costs.other;
    plData.netProfit = plData.grossProfit - plData.totalOperatingExpenses;
    
    // Create CSV content
    const csvLines = [];
    csvLines.push(`"${plData.restaurantName} - Profit & Loss Statement"`);
    csvLines.push(`"Year: ${plData.year}"`);
    csvLines.push('');
    csvLines.push('"REVENUE",""');
    csvLines.push(`"Food Sales","${plData.revenue.food}"`);
    csvLines.push(`"Beverage Sales","${plData.revenue.beverage}"`);
    csvLines.push(`"Other Revenue","${plData.revenue.other}"`);
    csvLines.push(`"Total Revenue","${plData.totalRevenue}"`);
    csvLines.push('');
    csvLines.push('"COST OF GOODS SOLD",""');
    csvLines.push(`"Food Cost","${plData.costs.foodCost}"`);
    csvLines.push(`"Beverage Cost","${plData.costs.beverageCost}"`);
    csvLines.push(`"Total COGS","${plData.totalCOGS}"`);
    csvLines.push('');
    csvLines.push(`"GROSS PROFIT","${plData.grossProfit}"`);
    csvLines.push('');
    csvLines.push('"OPERATING EXPENSES",""');
    csvLines.push(`"Labor Cost","${plData.costs.laborCost}"`);
    csvLines.push(`"Rent","${plData.costs.rent}"`);
    csvLines.push(`"Utilities","${plData.costs.utilities}"`);
    csvLines.push(`"Marketing","${plData.costs.marketing}"`);
    csvLines.push(`"Supplies","${plData.costs.supplies}"`);
    csvLines.push(`"Insurance","${plData.costs.insurance}"`);
    csvLines.push(`"Other Expenses","${plData.costs.other}"`);
    csvLines.push(`"Total Operating Expenses","${plData.totalOperatingExpenses}"`);
    csvLines.push('');
    csvLines.push(`"NET PROFIT","${plData.netProfit}"`);
    
    const csvContent = csvLines.join('\n');
    
    // Ensure generated-spreadsheets directory exists
    const outputDir = path.join(__dirname, 'generated-spreadsheets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `PL_${restaurantName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.csv`;
    const filepath = path.join(outputDir, filename);
    
    // Write file
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    logger.info(`CSV P&L generated: ${filename}`);
    
    res.json({
      success: true,
      filename,
      downloadUrl: `/download/${filename}`,
      data: plData
    });
    
  } catch (error) {
    logger.error('CSV P&L generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSV P&L spreadsheet',
      message: error.message
    });
  }
});

// Stripe Checkout Session - CREATE SUBSCRIPTION
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
      return res.status(500).json({ 
        error: 'Stripe not configured', 
        message: 'Please contact support to complete your subscription setup.' 
      });
    }

    // Import Stripe dynamically to handle potential configuration issues
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Pricing plan configuration
    const pricingPlans = {
      starter: {
        priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
        name: 'Starter Plan',
        amount: 4500, // $45.00 in cents
      },
      pro: {
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly', 
        name: 'Pro Plan',
        amount: 9900, // $99.00 in cents
      },
      platinum: {
        priceId: process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum_monthly',
        name: 'Platinum Plan',
        amount: 29900, // $299.00 in cents
      }
    };

    // Get plan from request body, default to pro plan
    const { plan = 'pro', priceId: requestPriceId, planName } = req.body;
    
    // Validate the plan
    if (plan && !pricingPlans[plan]) {
      return res.status(400).json({ 
        error: 'Invalid plan', 
        message: 'Please select a valid subscription plan.' 
      });
    }

    // Get pricing configuration
    const selectedPlan = pricingPlans[plan];
    const priceId = requestPriceId || selectedPlan.priceId;
    
    logger.info('Creating Stripe checkout session', { 
      plan: selectedPlan.name, 
      amount: selectedPlan.amount,
      priceId 
    });

    const baseUrl = req.get('host').includes('localhost') 
      ? `http://${req.get('host')}` 
      : `https://${req.get('host')}`;
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${baseUrl}/?canceled=true&plan=${plan}`,
      metadata: {
        plan: plan,
        planName: selectedPlan.name
      },
      // Add trial period for all plans
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          plan: plan,
          planName: selectedPlan.name
        }
      }
    });
    
    logger.info('Stripe checkout session created', { 
      sessionId: session.id, 
      url: session.url,
      plan: selectedPlan.name 
    });

    res.json({ 
      url: session.url,
      plan: selectedPlan.name,
      amount: `$${selectedPlan.amount / 100}/month`,
      sessionId: session.id
    });

  } catch (error) {
    logger.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Checkout error', 
      message: 'Unable to create checkout session. Please contact support.',
      details: IS_PRODUCTION ? 'Internal server error' : error.message
    });
  }
});

// Stripe webhook endpoint (must handle raw body)
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Stripe webhook verification logic would go here
    logger.info('Stripe webhook received', { signature: sig ? 'present' : 'missing' });
    
    // For now, just acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

// ============================================
// STATIC FILES & HOMEPAGE (AFTER API ROUTES)
// ============================================

// Serve static files for downloads
app.use('/download', express.static(path.join(__dirname, 'generated-spreadsheets'), {
  maxAge: IS_PRODUCTION ? '1d' : '0',
  etag: true
}));

// Homepage route - serve pricing page as main landing page
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'pricing.html'));
  } catch (error) {
    logger.error('Error serving homepage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static HTML files (pricing page, success page, etc.) - LAST!
app.use(express.static(__dirname, {
  maxAge: IS_PRODUCTION ? '1h' : '0',
  etag: true,
  index: false // Prevent auto-serving index.html
}));

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = IS_PRODUCTION ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found:', { url: req.url, method: req.method, ip: req.ip });
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found',
    timestamp: new Date().toISOString()
  });
});

// Response time logging
app.use((req, res, next) => {
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🏴‍☠️ Viking Restaurant Intelligence Platform started`, {
    port: PORT,
    environment: NODE_ENV,
    nodeVersion: process.version,
    pid: process.pid
  });
  
  console.log(`
🏴‍☠️ VIKING RESTAURANT INTELLIGENCE PLATFORM 🏴‍☠️
═══════════════════════════════════════════════════
⚔️  Server Status: READY FOR BATTLE!
🌐 Port: ${PORT}
🛡️  Environment: ${NODE_ENV.toUpperCase()}
🔥 Node.js: ${process.version}
📊 Process ID: ${process.pid}
═══════════════════════════════════════════════════
🚀 Ready to serve restaurant intelligence!
  `);
});

// Export for testing
module.exports = { app, server };
