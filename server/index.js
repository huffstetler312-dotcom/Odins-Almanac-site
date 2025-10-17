const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());

// Serve static files from public
const clientPath = path.join(__dirname, 'public');
app.use(express.static(clientPath));

// Health check
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Stripe routes
const stripeRoutes = require('./routes/stripe');
app.use('/api/stripe', stripeRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
