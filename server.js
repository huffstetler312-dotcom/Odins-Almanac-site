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
