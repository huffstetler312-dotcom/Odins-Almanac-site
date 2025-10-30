/**
 * ODIN'S ALMANAC - AI CONSULTATION ROUTES ⚔️
 * ==========================================
 * 
 * API routes for AI-powered restaurant intelligence and consultation.
 * These routes provide access to the Oracle's wisdom for business insights,
 * menu optimization, inventory forecasting, and strategic recommendations.
 * 
 * All routes require authentication and appropriate permissions.
 */

const express = require('express');
const router = express.Router();
const { OdinsAIConsultant } = require('../lib/ai/ai-consultant');

// Import authentication middleware from main auth system
const { 
  middleware,
  presets
} = require('../lib/auth');

// Initialize AI consultant
const aiConsultant = new OdinsAIConsultant();

// Initialize AI system on first load
let aiInitialized = false;
const initializeAI = async () => {
    if (!aiInitialized) {
        aiInitialized = await aiConsultant.initialize();
        if (aiInitialized) {
            console.log('🧙‍♂️ Odin\'s Oracle awakens and ready for consultation!');
        } else {
            console.log('💀 Odin\'s Oracle remains dormant. Check configuration.');
        }
    }
    return aiInitialized;
};

/**
 * @route   GET /api/ai/status
 * @desc    Check AI system status
 * @access  Private (requires authentication)
 */
router.get('/status', presets.authenticatedUser, async (req, res) => {
    try {
        const isReady = await initializeAI();
        
        res.json({
            success: true,
            ai_status: isReady ? 'ready' : 'unavailable',
            oracle_awakened: isReady,
            message: isReady 
                ? '🧙‍♂️ Odin\'s Oracle is awakened and ready for consultation!' 
                : '💀 The Oracle slumbers. Check your configuration.',
            github_token_configured: !!process.env.GITHUB_TOKEN,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to check AI status',
            details: error.message
        });
    }
});

/**
 * @route   POST /api/ai/consultation
 * @desc    Get AI consultation on business questions
 * @access  Private (requires manager or higher permissions)
 */
router.post('/consultation', presets.managerOrHigher, async (req, res) => {
    try {
        await initializeAI();
        
        const { question, restaurant_context } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'Question is required for consultation'
            });
        }

        // Add user restaurant context if not provided
        const context = restaurant_context || {
            restaurant_id: req.user.restaurantId,
            user_role: req.user.battleRank,
            consultation_timestamp: new Date().toISOString()
        };

        const consultation = await aiConsultant.getInteractiveConsultation(question, context);

        res.json({
            success: true,
            oracle_response: consultation,
            question_asked: question,
            context_provided: !!restaurant_context,
            user_role: req.user.battleRank,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Consultation failed',
            details: error.message,
            oracle_message: '💀 The Oracle encounters difficulty divining your answer.'
        });
    }
});

/**
 * @route   POST /api/ai/analyze/menu
 * @desc    Analyze menu performance with AI
 * @access  Private (requires manager or higher permissions)  
 */
router.post('/analyze/menu', presets.managerOrHigher, async (req, res) => {
    try {
        await initializeAI();

        const { menu_items, sales_data } = req.body;

        if (!menu_items || !Array.isArray(menu_items)) {
            return res.status(400).json({
                success: false,
                error: 'Menu items array is required'
            });
        }

        if (!sales_data || !Array.isArray(sales_data)) {
            return res.status(400).json({
                success: false,
                error: 'Sales data array is required'
            });
        }

        const analysis = await aiConsultant.analyzeMenuPerformance(menu_items, sales_data);

        res.json({
            success: true,
            menu_analysis: analysis,
            items_analyzed: menu_items.length,
            sales_records_analyzed: sales_data.length,
            analysis_type: 'ai_menu_performance',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Menu analysis failed',
            details: error.message,
            oracle_message: '💀 The Oracle cannot divine the menu\'s secrets at this time.'
        });
    }
});

/**
 * @route   POST /api/ai/predict/inventory
 * @desc    Predict inventory needs using AI
 * @access  Private (requires staff or higher permissions)
 */
router.post('/predict/inventory', presets.authenticatedUser, async (req, res) => {
    try {
        await initializeAI();

        const { inventory_data, forecast_params } = req.body;

        if (!inventory_data || !Array.isArray(inventory_data)) {
            return res.status(400).json({
                success: false,
                error: 'Inventory data array is required'
            });
        }

        const predictions = await aiConsultant.predictInventoryNeeds(inventory_data, forecast_params);

        res.json({
            success: true,
            inventory_predictions: predictions,
            items_analyzed: inventory_data.length,
            forecast_horizon: '7 days',
            analysis_type: 'ai_inventory_forecast',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Inventory prediction failed',
            details: error.message,
            oracle_message: '💀 The Oracle cannot foresee your inventory needs at this moment.'
        });
    }
});

/**
 * @route   POST /api/ai/analyze/sales
 * @desc    Analyze sales trends with AI
 * @access  Private (requires manager or higher permissions)
 */
router.post('/analyze/sales', presets.managerOrHigher, async (req, res) => {
    try {
        await initializeAI();

        const { sales_history, time_period } = req.body;

        if (!sales_history || !Array.isArray(sales_history)) {
            return res.status(400).json({
                success: false,
                error: 'Sales history array is required'
            });
        }

        const analysis = await aiConsultant.analyzeSalesTrends(sales_history, time_period);

        res.json({
            success: true,
            sales_analysis: analysis,
            records_analyzed: sales_history.length,
            time_period_analyzed: time_period || '30_days',
            analysis_type: 'ai_sales_trends',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Sales analysis failed',
            details: error.message,
            oracle_message: '💀 The Oracle\'s vision of your sales patterns is clouded.'
        });
    }
});

/**
 * @route   POST /api/ai/insights/business
 * @desc    Generate comprehensive business insights
 * @access  Private (requires owner permissions)
 */
router.post('/insights/business', presets.ownerOnly, async (req, res) => {
    try {
        await initializeAI();

        const { restaurant_data } = req.body;

        if (!restaurant_data) {
            return res.status(400).json({
                success: false,
                error: 'Restaurant data is required for business insights'
            });
        }

        const insights = await aiConsultant.generateBusinessInsights(restaurant_data);

        res.json({
            success: true,
            business_insights: insights,
            restaurant_analyzed: restaurant_data.name || 'Unknown',
            analysis_type: 'ai_business_insights',
            confidentiality: 'owner_only',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Business insights generation failed',
            details: error.message,
            oracle_message: '💀 The Oracle cannot peer into your business future at this time.'
        });
    }
});

/**
 * @route   POST /api/ai/forecast/revenue
 * @desc    Forecast future revenue using AI
 * @access  Private (requires manager or higher permissions)
 */
router.post('/forecast/revenue', presets.managerOrHigher, async (req, res) => {
    try {
        await initializeAI();

        const { historical_data, forecast_params } = req.body;

        if (!historical_data || !Array.isArray(historical_data)) {
            return res.status(400).json({
                success: false,
                error: 'Historical revenue data array is required'
            });
        }

        const forecast = await aiConsultant.forecastRevenue(historical_data, forecast_params);

        res.json({
            success: true,
            revenue_forecast: forecast,
            historical_periods: historical_data.length,
            forecast_horizon: '30 days',
            analysis_type: 'ai_revenue_forecast',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Revenue forecasting failed',
            details: error.message,
            oracle_message: '💀 The Oracle\'s prophecy of future revenues is obscured.'
        });
    }
});

/**
 * @route   GET /api/ai/examples
 * @desc    Get example queries and use cases for the AI system
 * @access  Private (requires authentication)
 */
router.get('/examples', presets.authenticatedUser, async (req, res) => {
    try {
        const examples = {
            consultations: [
                {
                    category: 'Menu Optimization',
                    questions: [
                        'How can I increase the profitability of my menu items?',
                        'Which dishes should I promote to maximize revenue?',
                        'Should I add more vegetarian options to my menu?',
                        'How can I reduce food waste while maintaining quality?'
                    ]
                },
                {
                    category: 'Inventory Management', 
                    questions: [
                        'What inventory levels should I maintain for peak season?',
                        'How can I optimize my ordering schedule to reduce costs?',
                        'Which suppliers offer the best value for my restaurant type?',
                        'How do I balance inventory costs with stockout risks?'
                    ]
                },
                {
                    category: 'Business Strategy',
                    questions: [
                        'How can I increase my average order value?',
                        'What pricing strategy works best for my market?',
                        'Should I extend my operating hours?',
                        'How can I improve customer retention rates?'
                    ]
                },
                {
                    category: 'Seasonal Planning',
                    questions: [
                        'How should I adjust my menu for the upcoming season?',
                        'What marketing strategies work best during slow periods?',
                        'How can I prepare for holiday rushes?',
                        'What are the best staff scheduling practices for seasonal fluctuations?'
                    ]
                }
            ],
            data_requirements: {
                menu_analysis: 'Menu items with costs, prices, and sales data',
                inventory_prediction: 'Current inventory levels and usage history',
                sales_analysis: 'Historical sales data with timestamps and item details',
                business_insights: 'Comprehensive restaurant data including revenue, costs, and operations',
                revenue_forecast: 'Historical revenue data with dates and amounts'
            },
            sample_api_calls: {
                consultation: 'POST /api/ai/consultation with {"question": "How can I improve my profit margins?"}',
                menu_analysis: 'POST /api/ai/analyze/menu with menu_items and sales_data arrays',
                inventory_forecast: 'POST /api/ai/predict/inventory with inventory_data array',
                sales_trends: 'POST /api/ai/analyze/sales with sales_history array'
            }
        };

        res.json({
            success: true,
            ai_examples: examples,
            oracle_wisdom: '🧙‍♂️ Ask, and the Oracle shall provide insights to guide your restaurant to prosperity!',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load examples',
            details: error.message
        });
    }
});

module.exports = router;