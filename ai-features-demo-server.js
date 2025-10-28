const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const { RestaurantPLGenerator } = require('./utils/excel-generator');

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());

// Serve static files for downloads
app.use('/download', express.static(path.join(__dirname, 'generated-spreadsheets')));

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-oracle.html'));
});

// AI-powered spreadsheet generation endpoint
app.post('/api/ai/generate-spreadsheet', async (req, res) => {
  try {
    const { goals, query } = req.body;
    
    if (!goals || !query) {
      return res.status(400).json({
        success: false,
        error: 'Goals and query are required'
      });
    }

    console.log(`🧠 Generating AI P&L Spreadsheet for: ${goals.restaurantName}`);
    console.log(`📊 Sales Goal: $${goals.salesGoal?.toLocaleString()}`);
    console.log(`🍽️ Food Cost Target: ${goals.foodCostPercentage}%`);

    // Enhanced query for spreadsheet generation
    const enhancedQuery = `Create a comprehensive restaurant P&L spreadsheet for ${goals.restaurantName} (${goals.restaurantType}):

FINANCIAL GOALS:
- Annual Sales Goal: $${goals.salesGoal?.toLocaleString()}
- Food Cost Target: ${goals.foodCostPercentage}%
- Labor Cost Target: ${goals.laborCostPercentage}%
- Target Profit Margin: ${goals.targetProfitPercentage}%
- Previous Year Sales: $${goals.previousYearSales?.toLocaleString()}

Generate specific Excel formulas for:
1. Revenue calculations (monthly, quarterly, annual)
2. COGS formulas (food cost, labor cost, supplies)
3. Prime cost calculations
4. Profit margin formulas
5. Break-even analysis
6. Variance analysis (actual vs budget)
7. Previous year comparison formulas
8. Percentage calculations for all expense categories

Provide the exact Excel formulas that should be locked in each cell, and explain the plug-and-play data entry process for restaurant owners.`;

    const aiAgentsPath = path.join(__dirname, 'ai-agents');
    const pythonScript = path.join(aiAgentsPath, 'restaurant_oracle.py');

    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        pythonScript,
        '--query', enhancedQuery
      ], { cwd: aiAgentsPath });

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            const aiResult = JSON.parse(outputData);
            
            // Generate actual Excel file
            const plGenerator = new RestaurantPLGenerator();
            const excelFile = await plGenerator.generatePLSpreadsheet(goals, aiResult);
            
            // Generate comprehensive spreadsheet response
            const spreadsheetData = {
              success: true,
              consultation: aiResult.response,
              model: aiResult.model,
              timestamp: aiResult.timestamp,
              restaurantInfo: {
                name: goals.restaurantName,
                type: goals.restaurantType,
                salesGoal: goals.salesGoal,
                previousYear: goals.previousYearSales
              },
              excelFile: {
                filename: excelFile.filename,
                downloadPath: excelFile.downloadPath,
                sheets: excelFile.sheets
              },
              formulas: {
                // Revenue Formulas (Updated to match Excel generator)
                monthlyRevenue: `=B7`, // Monthly sales input (highlighted cell)
                quarterlyRevenue: `=B7*3`, // Monthly * 3
                annualRevenue: `=B7*12`, // Monthly * 12
                
                // COGS Formulas
                foodCostDollar: `=B7*${goals.foodCostPercentage/100}`, // Revenue * Food %
                laborCostDollar: `=B7*${goals.laborCostPercentage/100}`, // Revenue * Labor %
                suppliesCostDollar: `=B7*${(goals.supplyCostPercentage || 3)/100}`, // Revenue * Supplies %
                
                // Key Calculations
                primeCost: `=B10+B11`, // Food Cost + Labor Cost (rows 10-11)
                primeCostPercent: `=B17/B7*100`, // Prime Cost / Revenue * 100
                totalExpenses: `=SUM(B10:B16)`, // Sum all expense rows
                netProfit: `=B7-B18`, // Revenue - Total Expenses
                profitMargin: `=B19/B7*100`, // Profit / Revenue * 100
                
                // Variance Analysis
                foodCostVariance: `=B10-D10`, // Actual - Budget
                laborVariance: `=B11-D11`, // Actual - Budget
                profitVariance: `=B19-D19`, // Actual - Budget
                
                // Break-even Analysis
                breakEvenRevenue: `=B18/(1-${(goals.foodCostPercentage + goals.laborCostPercentage)/100})`,
                
                // Target vs Actual
                salesVsGoal: `=B7/${goals.salesGoal/12}*100`, // Monthly actual vs goal
                profitVsTarget: `=(B19/B7*100)/${goals.targetProfitPercentage}*100` // Profit % vs target
              },
              spreadsheetStructure: {
                sheets: ['Monthly P&L', 'Quarterly Summary', 'Annual View', 'Variance Analysis'],
                lockedCells: ['All formula cells', 'Header rows', 'Calculation columns'],
                inputCells: ['B7 (Monthly Sales - highlighted yellow)', 'Cost input cells', 'Actual expense entries'],
                protectedFormulas: true,
                mainInputCell: 'B7',
                instructions: 'Enter monthly sales in the yellow highlighted cell (B7). All other calculations will update automatically.'
              }
            };
            
            resolve(spreadsheetData);
          } catch (parseError) {
            reject(new Error('Failed to parse AI response'));
          }
        } else {
          reject(new Error(`AI process failed: ${errorData}`));
        }
      });
    });

    console.log(`✅ AI P&L spreadsheet generated for: ${goals.restaurantName}`);
    res.json(result);

  } catch (error) {
    console.error('❌ Spreadsheet generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      consultation: '💀 The Oracle temporarily cannot create spreadsheets. Please ensure your AI system is configured.'
    });
  }
});

// Direct AI testing endpoint for patentable features demo
app.post('/api/ai/test-direct', async (req, res) => {
  try {
    const { query, feature } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`🔮 AI Feature Test: ${feature}`);
    console.log(`📝 Query: ${query}`);

    const aiAgentsPath = path.join(__dirname, '..', 'ai-agents');
    const pythonScript = path.join(aiAgentsPath, 'restaurant_oracle.py');

    // Call the AI Oracle directly
    const result = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        pythonScript,
        '--query', query
      ], { cwd: aiAgentsPath });

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const aiResult = JSON.parse(outputData);
            resolve({
              success: true,
              consultation: aiResult.response,
              model: aiResult.model,
              timestamp: aiResult.timestamp,
              feature: feature
            });
          } catch (parseError) {
            reject(new Error('Failed to parse AI response'));
          }
        } else {
          reject(new Error(`AI process failed: ${errorData}`));
        }
      });
    });

    console.log(`✅ AI consultation completed for: ${feature}`);
    res.json(result);

  } catch (error) {
    console.error('❌ AI consultation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      consultation: '💀 The Oracle temporarily slumbers. Please ensure your AI system is properly configured.'
    });
  }
});

// Excel file download endpoint
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'generated-spreadsheets', filename);
  
  res.download(filePath, (err) => {
    if (err) {
      console.error('❌ Download error:', err);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AI Features Demo API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`� ========================================`);
  console.log(`🚀 AI FEATURES DEMO SERVER ONLINE!`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(`� Spreadsheet API: /api/ai/generate-spreadsheet`);
  console.log(`🧠 AI Testing API: /api/ai/test-direct`);
  console.log(`📁 Downloads: /download/`);
  console.log(`💚 Health Check: /health`);
  console.log(`🎯 ========================================`);
});