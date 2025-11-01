const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Pricing plan configuration
const pricingPlans = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
    name: 'Starter Plan',
    amount: 4500, // $45.00 in cents
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    name: 'Pro Plan',
    amount: 9900, // $99.00 in cents
  },
  platinum: {
    priceId: process.env.STRIPE_PLATINUM_PRICE_ID || 'price_platinum_monthly',
    name: 'Platinum Plan',
    amount: 29900, // $299.00 in cents
  }
};

router.post('/create-checkout-session', async (req, res) => {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('REPLACE')) {
      return res.status(500).json({ 
        error: 'Stripe not configured', 
        message: 'Please contact support to complete your subscription setup.' 
      });
    }

    // Get plan from request body, default to pro plan
    const { plan = 'pro', priceId: requestPriceId, planName } = req.body;
    
    // Validate the plan
    if (plan && !pricingPlans[plan]) {
      return res.status(400).json({ 
        error: 'Invalid plan', 
        message: 'Please select a valid subscription plan.' 
      });
    }

    // Get pricing configuration
    const selectedPlan = pricingPlans[plan];
    const priceId = requestPriceId || selectedPlan.priceId;
    
    // Check if price ID is configured
    if (priceId.includes('REPLACE') || priceId.includes('_monthly')) {
      // For demo purposes, create a dynamic price if using placeholder IDs
      console.log(`Creating checkout for ${selectedPlan.name} at $${selectedPlan.amount / 100}`);
      
      return res.status(500).json({ 
        error: 'Pricing configuration in progress', 
        message: `${selectedPlan.name} subscription is being configured. Please contact our team to activate your ${selectedPlan.name} plan immediately.`,
        plan: selectedPlan.name,
        amount: `$${selectedPlan.amount / 100}`
      });
    }

    const baseUrl = process.env.APP_BASE_URL || 'https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.STRIPE_PRICE_ID || priceId, quantity: 1 }
      ],
      success_url: `${baseUrl}/?success=true&plan=${plan}`,
      cancel_url: `${baseUrl}/?canceled=true&plan=${plan}`,
      metadata: {
        plan: plan,
        planName: selectedPlan.name
      },
      // Add trial period for all plans
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          plan: plan,
          planName: selectedPlan.name
        }
      }
    });
    
    res.json({ 
      url: session.url,
      plan: selectedPlan.name,
      amount: `$${selectedPlan.amount / 100}/month`
    });
  } catch (e) {
    console.error('Stripe checkout error:', e);
    res.status(500).json({ 
      error: 'Checkout error', 
      message: 'Unable to create checkout session. Please contact support.',
      details: e.message
    });
  }
});

// Get available pricing plans
router.get('/pricing-plans', (req, res) => {
  const plans = Object.keys(pricingPlans).map(key => ({
    id: key,
    name: pricingPlans[key].name,
    amount: pricingPlans[key].amount,
    price: `$${pricingPlans[key].amount / 100}`,
    priceId: pricingPlans[key].priceId
  }));
  
  res.json({ plans });
});

module.exports = router;