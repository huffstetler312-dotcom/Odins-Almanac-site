const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Basic API Routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'Restaurant Intelligence Platform',
    timestamp: new Date().toISOString(),
    exceljs: 'loaded successfully'
  });
});

app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    inventory: [
      { item: "Prime Beef", expected: 100, actual: 95, variance: -5, cost: 500 },
      { item: "Fresh Salmon", expected: 50, actual: 48, variance: -2, cost: 240 },
      { item: "Organic Vegetables", expected: 200, actual: 205, variance: 5, cost: 300 }
    ]
  });
});

// REAL SPREADSHEET GENERATION
app.post('/api/generate-spreadsheet', async (req, res) => {
  try {
    console.log('📊 Generating Excel spreadsheet...');
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Restaurant Data');
    
    // Set up columns
    worksheet.columns = [
      { header: 'Item', key: 'item', width: 20 },
      { header: 'Expected', key: 'expected', width: 15 },
      { header: 'Actual', key: 'actual', width: 15 },
      { header: 'Variance', key: 'variance', width: 15 },
      { header: 'Cost', key: 'cost', width: 15 }
    ];
    
    // Add sample data
    const inventoryData = [
      { item: "Prime Beef", expected: 100, actual: 95, variance: -5, cost: 500 },
      { item: "Fresh Salmon", expected: 50, actual: 48, variance: -2, cost: 240 },
      { item: "Organic Vegetables", expected: 200, actual: 205, variance: 5, cost: 300 }
    ];
    
    inventoryData.forEach(row => worksheet.addRow(row));
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'FF4472C4' } 
    };
    
    // Create downloads directory
    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // Generate filename
    const filename = `Restaurant_Report_${Date.now()}.xlsx`;
    const filepath = path.join(downloadsDir, filename);
    
    // Write file
    await workbook.xlsx.writeFile(filepath);
    
    console.log('✅ Excel file created:', filename);
    
    res.json({
      success: true,
      message: 'Spreadsheet generated successfully',
      filename: filename,
      downloadUrl: `/downloads/${filename}`
    });
    
  } catch (error) {
    console.error('❌ Spreadsheet generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve Excel files
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '..', 'downloads', filename);
  
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('💀 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💀 Unhandled Rejection:', reason);
});

app.listen(PORT, () => {
  console.log(`🍽️ Restaurant Intelligence Platform running on port ${PORT}`);
  console.log(`📊 ExcelJS loaded successfully`);
  console.log(`🎯 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   GET  http://localhost:${PORT}/api/inventory`);
  console.log(`   POST http://localhost:${PORT}/api/generate-spreadsheet`);
  console.log(`🔥 Server is READY for spreadsheet generation!`);
});

module.exports = app;