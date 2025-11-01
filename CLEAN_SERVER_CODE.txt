const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

// CORS for Azure
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

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'Restaurant Intelligence Platform',
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
    ]
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🍽️ Restaurant Intelligence Platform running on port ${PORT}`);
});

module.exports = app;