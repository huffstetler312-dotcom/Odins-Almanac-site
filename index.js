const path = require('path');
const express = require('express');

const app = module.exports.app || require('./app') || express();

app.use(express.json());

// Serve static files from build directory
app.use(express.static('build'));

// Health check
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ success: true, service: 'Restaurant Intelligence', status: 'active' });
});

// Serve frontend for all other routes  
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server (if this is your main entry point)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;