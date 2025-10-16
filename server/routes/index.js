const express = require('express');
const router = express.Router();

// Mount the Stripe routes at the root of /api/stripe
router.use('/', require('./stripe'));

module.exports = router;