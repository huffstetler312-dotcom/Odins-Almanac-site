const path = require('path');
const express = require('express');

// Load environment variables (optional for Azure deployment)
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using environment variables from Azure App Service');
}

const app = express();

// Enable CORS for Azure deployments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());

// Serve static files from public
const clientPath = path.join(__dirname, 'public');
app.use(express.static(clientPath));

// Health check
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// API Status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    services: {
      stripe: 'connected',
      database: 'simulated',
      pos: 'demo_mode'
    },
    timestamp: new Date().toISOString()
  });
});

// Demo inventory data endpoint
app.get('/api/inventory', (_req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Viking Ale', current: 45, par: 60, variance: -25 },
      { id: 2, name: 'Mjolnir Mead', current: 30, par: 40, variance: -25 },
      { id: 3, name: 'Odin\'s Bread', current: 85, par: 80, variance: +6.25 },
      { id: 4, name: 'Berserker Beef', current: 12, par: 20, variance: -40 }
    ],
    totalVariance: -21.25,
    criticalItems: 2
  });
});

// Demo variance analysis endpoint
app.get('/api/variance-analysis', (_req, res) => {
  res.json({
    analysis: {
      totalVariance: -1247.50,
      topVariances: [
        { item: 'Berserker Beef', variance: -520.00, percentage: -40 },
        { item: 'Viking Ale', variance: -375.00, percentage: -25 },
        { item: 'Mjolnir Mead', variance: -300.00, percentage: -25 }
      ],
      recommendations: [
        'Review portion sizes for Berserker Beef',
        'Check for theft/waste in beverage storage',
        'Implement stricter inventory controls'
      ]
    }
  });
});

// Demo POS integration status
app.get('/api/pos-status', (_req, res) => {
  res.json({
    integrations: [
      { name: 'Square POS', status: 'active', lastSync: '2 minutes ago' },
      { name: 'Toast Integration', status: 'syncing', lastSync: '5 minutes ago' },
      { name: 'Clover Support', status: 'available', lastSync: 'Never' },
      { name: 'Custom API', status: 'ready', lastSync: 'Real-time' }
    ]
  });
});

// Direct checkout route (for frontend compatibility)
app.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
      ],
      success_url: `${process.env.APP_BASE_URL}/?success=true`,
      cancel_url: `${process.env.APP_BASE_URL}/?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe error:', e);
    res.status(500).json({ error: 'Stripe checkout error', message: e.message });
  }
});

// Stripe routes (full API)
const stripeRoutes = require('./routes/stripe');
app.use('/api/stripe', stripeRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API endpoints available:');
  console.log('  GET /api/status - API status');
  console.log('  GET /api/inventory - Demo inventory data');
  console.log('  GET /api/variance-analysis - Variance analysis');
  console.log('  GET /api/pos-status - POS integration status');
  console.log('  POST /create-checkout-session - Stripe checkout');
});

module.exports = app;
