const request = require('supertest');
const express = require('express');
const stripeRouter = require('../routes/stripe');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn()
      }
    }
  }));
});

describe('Stripe Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/stripe', stripeRouter);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/stripe/pricing-plans', () => {
    it('should return pricing plans', async () => {
      const response = await request(app)
        .get('/api/stripe/pricing-plans')
        .expect(200);

      expect(response.body).toHaveProperty('plans');
      expect(Array.isArray(response.body.plans)).toBe(true);
      expect(response.body.plans.length).toBe(4); // starter, pro, platinum, enterprise

      // Check structure of first plan
      const firstPlan = response.body.plans[0];
      expect(firstPlan).toHaveProperty('id');
      expect(firstPlan).toHaveProperty('name');
      expect(firstPlan).toHaveProperty('amount');
      expect(firstPlan).toHaveProperty('price');
      expect(firstPlan).toHaveProperty('priceId');
    });

    it('should include all expected plans', async () => {
      const response = await request(app)
        .get('/api/stripe/pricing-plans')
        .expect(200);

      const planIds = response.body.plans.map(plan => plan.id);
      expect(planIds).toContain('starter');
      expect(planIds).toContain('pro');
      expect(planIds).toContain('platinum');
      expect(planIds).toContain('enterprise');
    });
  });

  describe('POST /api/stripe/create-checkout-session', () => {
    it('should return error when Stripe is not configured', async () => {
      const response = await request(app)
        .post('/api/stripe/create-checkout-session')
        .send({ plan: 'pro' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Stripe not configured');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid plan', async () => {
      // Set up environment for this test
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key';
      
      const response = await request(app)
        .post('/api/stripe/create-checkout-session')
        .send({ plan: 'invalid-plan' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid plan');
      
      // Clean up
      delete process.env.STRIPE_SECRET_KEY;
    });

    it('should handle placeholder price IDs gracefully', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key';
      
      const response = await request(app)
        .post('/api/stripe/create-checkout-session')
        .send({ plan: 'pro' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Pricing configuration in progress');
      expect(response.body).toHaveProperty('plan', 'Pro Plan');
      expect(response.body).toHaveProperty('amount', '$100');
      
      delete process.env.STRIPE_SECRET_KEY;
    });
  });
});