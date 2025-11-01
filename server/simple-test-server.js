const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());

// Serve static files from build directory
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

// API Routes
app.get('/api/status', (req, res) => {
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

app.get('/api/inventory', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Viking Ale', current: 45, par: 60, variance: -25 },
      { id: 2, name: 'Mjolnir Mead', current: 30, par: 40, variance: -25 },
      { id: 3, name: "Odin's Bread", current: 85, par: 80, variance: 6.25 },
      { id: 4, name: 'Berserker Beef', current: 12, par: 20, variance: -40 }
    ],
    totalVariance: -21.25,
    criticalItems: 2
  });
});

app.get('/api/variance-analysis', (req, res) => {
  res.json({
    analysis: {
      totalVariance: -1247.5,
      topVariances: [
        { item: 'Berserker Beef', variance: -520, percentage: -40 },
        { item: 'Viking Ale', variance: -375, percentage: -25 },
        { item: 'Mjolnir Mead', variance: -300, percentage: -25 }
      ],
      recommendations: [
        'Review portion sizes for Berserker Beef',
        'Check for theft/waste in beverage storage',
        'Implement stricter inventory controls'
      ]
    }
  });
});

app.get('/api/pos-status', (req, res) => {
  res.json({
    integrations: [
      { name: 'Square POS', status: 'active', lastSync: '2 minutes ago' },
      { name: 'Toast Integration', status: 'syncing', lastSync: '5 minutes ago' },
      { name: 'Clover Support', status: 'available', lastSync: 'Never' },
      { name: 'Custom API', status: 'ready', lastSync: 'Real-time' }
    ]
  });
});

// Basic Stripe checkout (without actual Stripe for testing)
app.post('/create-checkout-session', (req, res) => {
  res.json({
    url: 'https://checkout.stripe.com/test-session-url'
  });
});

// Catch-all for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Simple test server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${buildPath}`);
  console.log(`🔗 API endpoints available:
    GET /api/status
    GET /api/inventory  
    GET /api/variance-analysis
    GET /api/pos-status
    POST /create-checkout-session`);
});