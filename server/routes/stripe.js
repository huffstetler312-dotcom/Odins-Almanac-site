const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: 'price_REPLACE_WITH_YOUR_ACTUAL_PRICE_ID', quantity: 1 }
      ],
      success_url: `${process.env.APP_BASE_URL}/?success=true`,
      cancel_url: `${process.env.APP_BASE_URL}/?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
});

module.exports = router;