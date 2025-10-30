const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple server is running!' });
});

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-oracle.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});