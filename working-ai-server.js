// Load environment variables
require('dotenv').config();

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());

// Serve static files for downloads
app.use('/download', express.static(path.join(__dirname, 'generated-spreadsheets')));

// Serve static HTML files (pricing page, success page, etc.)
app.use(express.static(__dirname));

// Homepage route - serve pricing page as main landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pricing.html'));
});

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-oracle.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'AI Features Demo Server is running!'
  });
});

// AI Oracle test endpoint
app.post('/api/ai/test-direct', async (req, res) => {
  try {
    console.log('🧠 AI Oracle Direct Test Request');
    
    const query = req.body.query || "What's the secret to Viking restaurant success?";
    
    // Call the Python Oracle
    const python = spawn('python', ['ai-agents/restaurant_oracle.py', '--query', query]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0 && result.trim()) {
        try {
          const response = JSON.parse(result.trim());
          res.json({
            success: true,
            oracle_response: response,
            query: query,
            timestamp: new Date().toISOString()
          });
        } catch (parseError) {
          res.json({
            success: true,
            oracle_response: { advice: result.trim() },
            query: query,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.error('Python Oracle Error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get Oracle response',
          details: error || 'No error details available'
        });
      }
    });
    
  } catch (error) {
    console.error('AI Oracle Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// AI-powered spreadsheet generation with full Excel functionality
app.post('/api/ai/generate-spreadsheet', async (req, res) => {
  try {
    console.log('🔥 Generating AI-Powered Restaurant Spreadsheet...');
    
    const { goals, query } = req.body;
    const businessGoals = goals || "Increase profitability and optimize operations";
    const aiQuery = query || "Analyze restaurant performance and provide strategic recommendations";
    
    // Get AI consultation first
    const python = spawn('python', ['ai-agents/restaurant_oracle.py', '--query', aiQuery]);
    
    let aiResult = '';
    let aiError = '';
    
    python.stdout.on('data', (data) => {
      aiResult += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      aiError += data.toString();
    });
    
    python.on('close', async (code) => {
      if (code === 0 && aiResult.trim()) {
        try {
          // Parse AI response
          const aiResponse = JSON.parse(aiResult.trim());
          
          // Generate Excel file with AI insights
          const ExcelJS = require('exceljs');
          const workbook = new ExcelJS.Workbook();
          
          // Create AI Consultation Sheet
          const aiSheet = workbook.addWorksheet('AI Oracle Consultation', {
            properties: { tabColor: { argb: 'FF1e3a8a' } }
          });
          
          // Header
          aiSheet.getCell('A1').value = '🔮 ODIN\'S ORACLE CONSULTATION';
          aiSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF1e3a8a' } };
          aiSheet.mergeCells('A1:D1');
          
          aiSheet.getCell('A3').value = 'Business Goals:';
          aiSheet.getCell('A3').font = { bold: true };
          aiSheet.getCell('B3').value = businessGoals;
          
          aiSheet.getCell('A5').value = 'AI Consultation:';
          aiSheet.getCell('A5').font = { bold: true };
          aiSheet.getCell('A6').value = aiResponse.response;
          aiSheet.getCell('A6').alignment = { wrapText: true };
          
          // Create Financial Analysis Sheet
          const financeSheet = workbook.addWorksheet('Financial Analysis', {
            properties: { tabColor: { argb: 'FF059669' } }
          });
          
          // Sample P&L Structure
          financeSheet.getCell('A1').value = 'RESTAURANT P&L ANALYSIS';
          financeSheet.getCell('A1').font = { size: 14, bold: true };
          financeSheet.mergeCells('A1:C1');
          
          const plData = [
            ['Revenue', '', ''],
            ['Food Sales', 45000, '75%'],
            ['Beverage Sales', 15000, '25%'],
            ['Total Revenue', 60000, '100%'],
            ['', '', ''],
            ['Cost of Goods Sold', '', ''],
            ['Food Costs', 13500, '30%'],
            ['Beverage Costs', 3750, '25%'],
            ['Total COGS', 17250, '28.75%'],
            ['', '', ''],
            ['Gross Profit', 42750, '71.25%'],
            ['', '', ''],
            ['Operating Expenses', '', ''],
            ['Labor Costs', 18000, '30%'],
            ['Rent', 6000, '10%'],
            ['Utilities', 1800, '3%'],
            ['Marketing', 1200, '2%'],
            ['Insurance', 600, '1%'],
            ['Other Expenses', 2400, '4%'],
            ['Total OpEx', 30000, '50%'],
            ['', '', ''],
            ['Net Profit', 12750, '21.25%']
          ];
          
          plData.forEach((row, index) => {
            financeSheet.getCell(`A${index + 3}`).value = row[0];
            financeSheet.getCell(`B${index + 3}`).value = row[1];
            financeSheet.getCell(`C${index + 3}`).value = row[2];
            
            if (row[0].includes('Total') || row[0].includes('Profit')) {
              financeSheet.getRow(index + 3).font = { bold: true };
            }
          });
          
          // Create Menu Engineering Sheet
          const menuSheet = workbook.addWorksheet('Menu Engineering', {
            properties: { tabColor: { argb: 'FFdc2626' } }
          });
          
          menuSheet.getCell('A1').value = 'MENU ENGINEERING ANALYSIS';
          menuSheet.getCell('A1').font = { size: 14, bold: true };
          menuSheet.mergeCells('A1:E1');
          
          const menuHeaders = ['Item Name', 'Food Cost', 'Selling Price', 'Profit Margin', 'Popularity'];
          menuHeaders.forEach((header, index) => {
            const cell = menuSheet.getCell(`${String.fromCharCode(65 + index)}3`);
            cell.value = header;
            cell.font = { bold: true };
          });
          
          const menuItems = [
            ['Viking Feast Platter', 12.50, 28.00, 15.50, 'High'],
            ['Thor\'s Thunder Burger', 8.00, 18.00, 10.00, 'High'],
            ['Odin\'s Wisdom Soup', 3.50, 12.00, 8.50, 'Medium'],
            ['Valhalla Salad', 4.00, 14.00, 10.00, 'Low'],
            ['Berserker Ribs', 15.00, 32.00, 17.00, 'High']
          ];
          
          menuItems.forEach((item, index) => {
            item.forEach((value, colIndex) => {
              menuSheet.getCell(`${String.fromCharCode(65 + colIndex)}${index + 4}`).value = value;
            });
          });
          
          // Auto-fit columns
          [aiSheet, financeSheet, menuSheet].forEach(sheet => {
            sheet.columns.forEach(column => {
              column.width = 20;
            });
          });
          
          // Save file
          const filename = `Viking_Restaurant_Analysis_${Date.now()}.xlsx`;
          const filepath = path.join(__dirname, 'generated-spreadsheets', filename);
          
          await workbook.xlsx.writeFile(filepath);
          
          res.json({
            success: true,
            message: "🔥 AI-Powered Restaurant Analysis Complete!",
            ai_consultation: aiResponse.response,
            download_url: `/download/${filename}`,
            filename: filename,
            features: [
              "🔮 AI Oracle Business Consultation",
              "📊 Complete P&L Analysis", 
              "🍽️ Menu Engineering Matrix",
              "💰 Profit Optimization Recommendations",
              "📈 Performance Metrics Dashboard"
            ],
            timestamp: new Date().toISOString()
          });
          
        } catch (parseError) {
          console.error('Excel generation error:', parseError);
          res.status(500).json({
            success: false,
            error: 'Failed to generate Excel file',
            message: parseError.message
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: 'AI consultation failed',
          details: aiError
        });
      }
    });
    
  } catch (error) {
    console.error('Spreadsheet generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Spreadsheet generation error',
      message: error.message
    });
  }
});

// Import Stripe with error handling
let stripe;
try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set. Stripe features will be disabled.');
  }
  console.log('🔑 Initializing Stripe with key:', stripeKey.substring(0, 10) + '...');
  stripe = require('stripe')(stripeKey);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization error:', error.message);
  stripe = null;
  console.log('⚠️  Stripe features will be disabled');
}

// Import P&L Calculator
const PLCalculator = require('./pl-calculator.js');
const plCalc = new PLCalculator();

// Comprehensive P&L endpoint
app.post('/api/pl/comprehensive', async (req, res) => {
  try {
    const { formData, results } = req.body;
    
    // Store P&L data (in production, save to database)
    console.log('📊 Comprehensive P&L calculated:', {
      restaurant: formData.restaurantName,
      period: `${formData.month} ${formData.year}`,
      revenue: results.revenue.actualTotal,
      netProfit: results.margins.actualNetProfit,
      netMargin: results.margins.actualNetProfitPct
    });
    
    res.json({
      success: true,
      message: 'P&L analysis completed successfully',
      summary: {
        restaurant: formData.restaurantName,
        period: `${formData.month} ${formData.year}`,
        totalRevenue: results.revenue.actualTotal,
        netProfit: results.margins.actualNetProfit,
        profitMargin: `${results.margins.actualNetProfitPct.toFixed(1)}%`,
        overallHealth: results.analysis?.kpis?.overallHealth?.rating || 'unknown'
      }
    });
    
  } catch (error) {
    console.error('❌ P&L calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to process P&L analysis',
      details: error.message 
    });
  }
});

// Export comprehensive P&L to Excel
app.post('/api/export/comprehensive-pl', async (req, res) => {
  try {
    const { results, formData } = req.body;
    
    // Import ExcelJS
    const ExcelJS = require('exceljs');
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    
    // Summary Sheet
    const summarySheet = workbook.addWorksheet('P&L Summary');
    
    // Header
    summarySheet.mergeCells('A1:F1');
    summarySheet.getCell('A1').value = `${formData.restaurantName} - Comprehensive P&L Analysis`;
    summarySheet.getCell('A1').font = { bold: true, size: 16 };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };
    
    summarySheet.mergeCells('A2:F2');
    summarySheet.getCell('A2').value = `Period: ${formData.month} ${formData.year}`;
    summarySheet.getCell('A2').font = { bold: true, size: 12 };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Column Headers
    summarySheet.getCell('A3').value = 'Line Item';
    summarySheet.getCell('B3').value = 'Actual $';
    summarySheet.getCell('C3').value = 'Budget $';
    summarySheet.getCell('D3').value = 'Variance $';
    summarySheet.getCell('E3').value = 'Actual %';
    summarySheet.getCell('F3').value = 'Target %';
    
    ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
      summarySheet.getCell(cell).font = { bold: true };
      summarySheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } };
    });
    
    // Revenue Section
    let row = 4;
    summarySheet.getCell(`A${row}`).value = 'REVENUE';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    row++;
    
    summarySheet.getCell(`A${row}`).value = 'Food Sales';
    summarySheet.getCell(`B${row}`).value = parseFloat(formData.actualFoodSales || 0);
    summarySheet.getCell(`C${row}`).value = parseFloat(formData.budgetFoodSales || 0);
    summarySheet.getCell(`D${row}`).value = parseFloat(formData.actualFoodSales || 0) - parseFloat(formData.budgetFoodSales || 0);
    row++;
    
    summarySheet.getCell(`A${row}`).value = 'Beverage Sales';
    summarySheet.getCell(`B${row}`).value = parseFloat(formData.actualBeverageSales || 0);
    summarySheet.getCell(`C${row}`).value = parseFloat(formData.budgetBeverageSales || 0);
    summarySheet.getCell(`D${row}`).value = parseFloat(formData.actualBeverageSales || 0) - parseFloat(formData.budgetBeverageSales || 0);
    row++;
    
    summarySheet.getCell(`A${row}`).value = 'TOTAL REVENUE';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = results.revenue.actualTotal;
    summarySheet.getCell(`B${row}`).font = { bold: true };
    summarySheet.getCell(`C${row}`).value = results.revenue.budgetTotal;
    summarySheet.getCell(`C${row}`).font = { bold: true };
    summarySheet.getCell(`D${row}`).value = results.revenue.variance;
    summarySheet.getCell(`D${row}`).font = { bold: true };
    row += 2;
    
    // COGS Section
    summarySheet.getCell(`A${row}`).value = 'COST OF GOODS SOLD';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    row++;
    
    summarySheet.getCell(`A${row}`).value = 'Food Cost';
    summarySheet.getCell(`B${row}`).value = parseFloat(formData.actualFoodCost || 0);
    summarySheet.getCell(`E${row}`).value = results.revenue.actualTotal > 0 ? (parseFloat(formData.actualFoodCost || 0) / results.revenue.actualTotal) : 0;
    summarySheet.getCell(`F${row}`).value = parseFloat(formData.budgetFoodCostPct || 30) / 100;
    row++;
    
    summarySheet.getCell(`A${row}`).value = 'TOTAL COGS';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = results.costs.actualCOGS;
    summarySheet.getCell(`B${row}`).font = { bold: true };
    summarySheet.getCell(`E${row}`).value = results.costs.actualCOGSPct / 100;
    summarySheet.getCell(`E${row}`).font = { bold: true };
    row += 2;
    
    // Net Profit
    summarySheet.getCell(`A${row}`).value = 'NET PROFIT';
    summarySheet.getCell(`A${row}`).font = { bold: true, color: { argb: results.margins.actualNetProfit >= 0 ? 'FF00AA00' : 'FFAA0000' } };
    summarySheet.getCell(`B${row}`).value = results.margins.actualNetProfit;
    summarySheet.getCell(`B${row}`).font = { bold: true, color: { argb: results.margins.actualNetProfit >= 0 ? 'FF00AA00' : 'FFAA0000' } };
    summarySheet.getCell(`E${row}`).value = results.margins.actualNetProfitPct / 100;
    summarySheet.getCell(`E${row}`).font = { bold: true, color: { argb: results.margins.actualNetProfit >= 0 ? 'FF00AA00' : 'FFAA0000' } };
    summarySheet.getCell(`F${row}`).value = parseFloat(formData.targetNetProfitPct || 10) / 100;
    summarySheet.getCell(`F${row}`).font = { bold: true };
    
    // Format currency columns
    ['B', 'C', 'D'].forEach(col => {
      summarySheet.getColumn(col).numFmt = '$#,##0;[Red]-$#,##0';
    });
    
    // Format percentage columns
    ['E', 'F'].forEach(col => {
      summarySheet.getColumn(col).numFmt = '0.0%';
    });
    
    // Auto-fit columns
    summarySheet.columns.forEach(column => {
      column.width = 18;
    });
    
    // Set filename
    const filename = `Comprehensive_PL_${formData.restaurantName.replace(/[^a-zA-Z0-9]/g, '_')}_${formData.month}_${formData.year}.xlsx`;
    
    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    await workbook.xlsx.write(res);
    res.end();
    
    console.log(`📊 Exported comprehensive P&L: ${filename}`);
    
  } catch (error) {
    console.error('❌ Excel export error:', error);
    res.status(500).json({ 
      error: 'Failed to generate Excel export',
      details: error.message 
    });
  }
});

// Stripe Checkout Session Creation
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, tier, successUrl, cancelUrl } = req.body;
    
    // In production, you would create these prices in Stripe Dashboard
    const priceConfig = {
      'price_pro_monthly': {
        unit_amount: 999, // $9.99 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: {
          name: 'Restaurant Intelligence Platform Pro',
          description: 'Complete AI-powered restaurant analytics and management'
        }
      }
    };
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceConfig[priceId] || priceConfig['price_pro_monthly'],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'professional-demo.html?session_id={CHECKOUT_SESSION_ID}&success=true',
      cancel_url: cancelUrl || 'pricing.html?canceled=true',
      metadata: {
        tier: tier,
        platform: 'restaurant_intelligence'
      }
    });

    console.log('💳 Stripe checkout session created:', {
      sessionId: session.id,
      tier: tier,
      amount: '$9.99/month'
    });

    res.json({ url: session.url });
    
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Create Customer Portal Session (for managing subscriptions)
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    
    // In production, get customerId from authenticated user
    const defaultCustomerId = 'cus_default'; // Replace with actual customer ID
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId || defaultCustomerId,
      return_url: returnUrl || 'http://localhost:3001/pricing.html',
    });

    console.log('🏢 Customer portal session created:', session.id);
    
    res.json({ url: session.url });
    
  } catch (error) {
    console.error('❌ Portal session error:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      details: error.message 
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // In production, use your webhook signing secret from Stripe Dashboard
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Subscription created:', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        tier: session.metadata?.tier
      });
      
      // In production: Update user's subscription status in database
      // updateUserSubscription(session.customer, 'pro', session.subscription);
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('💰 Payment succeeded:', {
        customerId: invoice.customer,
        amount: invoice.amount_paid / 100,
        subscriptionId: invoice.subscription
      });
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('❌ Payment failed:', {
        customerId: failedInvoice.customer,
        subscriptionId: failedInvoice.subscription
      });
      
      // In production: Send payment failed email, update user status
      break;
      
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      console.log('🔴 Subscription canceled:', {
        customerId: deletedSub.customer,
        subscriptionId: deletedSub.id
      });
      
      // In production: Downgrade user to free tier
      // updateUserSubscription(deletedSub.customer, 'free', null);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Subscription status check endpoint
app.get('/api/subscription/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In production: Look up user's subscription in database
    // For demo, return mock data
    const mockSubscription = {
      userId: userId,
      tier: 'free', // or 'pro'
      status: 'active', // 'active', 'canceled', 'past_due'
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      features: {
        advancedInventory: false,
        predictiveAnalytics: false,
        multiLocation: false,
        prioritySupport: false,
        apiAccess: false
      }
    };
    
    // Update features based on tier
    if (mockSubscription.tier === 'pro') {
      mockSubscription.features = {
        advancedInventory: true,
        predictiveAnalytics: true,
        multiLocation: true,
        prioritySupport: true,
        apiAccess: true
      };
    }
    
    res.json(mockSubscription);
    
  } catch (error) {
    console.error('❌ Subscription status error:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription status',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;

console.log('🚀 Starting server on port:', PORT);

app.listen(PORT, () => {
  console.log(`⚡ ========================================`);
  console.log(`🚀 RESTAURANT INTELLIGENCE PLATFORM`);
  console.log(`⚡ ========================================`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Spreadsheet API: /api/ai/generate-spreadsheet`);
  console.log(`🧠 AI Testing API: /api/ai/test-direct`);
  console.log(`💼 P&L Analysis API: /api/pl/comprehensive`);
  console.log(`📋 P&L Export API: /api/export/comprehensive-pl`);
  console.log(`💳 Stripe Checkout: /api/create-checkout-session`);
  console.log(`🏢 Customer Portal: /api/create-portal-session`);
  console.log(`🔔 Stripe Webhook: /webhook/stripe`);
  console.log(`📋 Subscription Status: /api/subscription/status/:userId`);
  console.log(`💰 Pricing Page: /pricing.html`);
  console.log(`📊 Professional Dashboard: /dashboard.html`);
  console.log(`📁 Downloads: /download/`);
  console.log(`💚 Health Check: /health`);
  console.log(`⚡ ========================================`);
}).on('error', (err) => {
  console.error('❌ Server Error:', err);
});