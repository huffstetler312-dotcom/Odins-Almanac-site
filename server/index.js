
const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

// CORS for Azure
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

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    service: 'Restaurant Intelligence Platform',
    timestamp: new Date().toISOString()
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

// REAL spreadsheet generation endpoint
app.post('/api/generate-spreadsheet', async (req, res) => {
  try {
    
    const { restaurantName, reportType } = req.body;
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');
    
    // Add headers
    worksheet.columns = [
      { header: 'Item', key: 'item', width: 20 },
      { header: 'Expected', key: 'expected', width: 15 },
      { header: 'Actual', key: 'actual', width: 15 },
      { header: 'Variance', key: 'variance', width: 15 },
      { header: 'Cost', key: 'cost', width: 15 }
    ];
    
    // Add data
    const inventoryData = [
      { item: "Prime Beef", expected: 100, actual: 95, variance: -5, cost: 500 },
      { item: "Fresh Salmon", expected: 50, actual: 48, variance: -2, cost: 240 },
      { item: "Organic Vegetables", expected: 200, actual: 205, variance: 5, cost: 300 }
    ];
    
    inventoryData.forEach(row => {
      worksheet.addRow(row);
    });
    
    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    
    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // Generate filename
    const filename = `${restaurantName || 'Restaurant'}_${reportType || 'Report'}_${Date.now()}.xlsx`;
    const filepath = path.join(downloadsDir, filename);
    
    // Save file
    await workbook.xlsx.writeFile(filepath);
    
    res.json({
      success: true,
      message: 'Spreadsheet generated successfully',
      filename: filename,
      downloadUrl: `/downloads/${filename}`,
      filepath: filepath
    });
    
  } catch (error) {
    console.error('Spreadsheet generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve downloads
app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;

process.on('uncaughtException', (error) => {
  console.error('💀 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💀 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🍽️ Restaurant Intelligence Platform running on port ${PORT}`);
  console.log(`📊 ExcelJS version: ${require('exceljs/package.json').version}`);
  console.log(`🎯 API endpoints available:`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   GET  http://localhost:${PORT}/api/inventory`);
  console.log(`   POST http://localhost:${PORT}/api/generate-spreadsheet`);
});

module.exports = app;


