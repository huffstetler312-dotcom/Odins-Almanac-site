const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('build'));

// API Routes - Simple and working
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    service: 'Odins Restaurant Intelligence',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    data: [
      { item: "Prime Beef", expected: 100, actual: 95, variance: -5 },
      { item: "Fresh Salmon", expected: 50, actual: 48, variance: -2 },
      { item: "Organic Vegetables", expected: 200, actual: 205, variance: 5 }
    ],
    message: "Demo inventory data"
  });
});

app.get('/api/variance-analysis', (req, res) => {
  res.json({
    success: true,
    data: {
      totalVariance: "$347.50",
      criticalItems: 3,
      recommendations: ["Audit beef receiving", "Check salmon storage"]
    }
  });
});

app.get('/api/pos-status', (req, res) => {
  res.json({
    success: true,
    connected: true,
    lastSync: new Date().toISOString()
  });
});

app.post('/create-checkout-session', (req, res) => {
  res.json({
    success: true,
    url: "https://checkout.stripe.com/demo",
    message: "Checkout session created"
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;