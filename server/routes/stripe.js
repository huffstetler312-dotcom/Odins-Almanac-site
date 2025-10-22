const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (_req, res) => {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
      return res.status(500).json({ 
        error: 'Stripe not configured', 
        message: 'Please contact support to complete your subscription setup.' 
      });
    }

    // Check if price ID is configured
    const priceId = process.env.STRIPE_PRICE_ID || 'price_REPLACE_WITH_YOUR_ACTUAL_PRICE_ID';
    if (priceId.includes('REPLACE')) {
      return res.status(500).json({ 
        error: 'Pricing not configured', 
        message: 'Subscription pricing is being configured. Please contact support.' 
      });
    }

    const baseUrl = process.env.APP_BASE_URL || 'https://odinsalmanac-drbxbhewetbghqdu.westcentralus-01.azurewebsites.net';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });
    
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e);
    res.status(500).json({ 
      error: 'Checkout error', 
      message: 'Unable to create checkout session. Please contact support.' 
    });
  }
});

module.exports = router;