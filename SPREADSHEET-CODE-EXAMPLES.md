# 📝 Spreadsheet Generation Code Examples

This document provides ready-to-use code examples for implementing spreadsheet generation features similar to those in the Odin's Almanac platform.

---

## 🚀 Quick Start Example

### Minimal Excel Generation

```javascript
const ExcelJS = require('exceljs');
const path = require('path');

async function createSimpleSpreadsheet() {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Add a worksheet
  const sheet = workbook.addWorksheet('My Sheet');
  
  // Add data
  sheet.addRow(['Name', 'Value']);
  sheet.addRow(['Revenue', 50000]);
  sheet.addRow(['Expenses', 30000]);
  sheet.addRow(['Profit', 20000]);
  
  // Style the header row
  sheet.getRow(1).font = { bold: true };
  
  // Save the file
  await workbook.xlsx.writeFile('simple-report.xlsx');
  
  console.log('Spreadsheet created!');
}

createSimpleSpreadsheet();
```

---

## 📊 Restaurant P&L Spreadsheet

### Complete P&L Generator

```javascript
const ExcelJS = require('exceljs');

async function createRestaurantPL(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('P&L Statement');
  
  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `${data.restaurantName} - P&L Statement`;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  // Subtitle
  sheet.mergeCells('A2:D2');
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = `${data.month} ${data.year}`;
  subtitleCell.font = { size: 12, bold: true };
  subtitleCell.alignment = { horizontal: 'center' };
  
  // Headers
  sheet.getCell('A4').value = 'Line Item';
  sheet.getCell('B4').value = 'Amount';
  sheet.getCell('C4').value = '% of Revenue';
  sheet.getCell('D4').value = 'Budget';
  
  // Style headers
  ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
    sheet.getCell(cell).font = { bold: true };
    sheet.getCell(cell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
  });
  
  // Revenue Section
  let row = 5;
  sheet.getCell(`A${row}`).value = 'REVENUE';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;
  
  sheet.getCell(`A${row}`).value = 'Food Sales';
  sheet.getCell(`B${row}`).value = data.foodSales;
  sheet.getCell(`C${row}`).value = data.foodSales / data.totalRevenue;
  sheet.getCell(`D${row}`).value = data.budgetFoodSales;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Beverage Sales';
  sheet.getCell(`B${row}`).value = data.beverageSales;
  sheet.getCell(`C${row}`).value = data.beverageSales / data.totalRevenue;
  sheet.getCell(`D${row}`).value = data.budgetBeverageSales;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Total Revenue';
  sheet.getCell(`A${row}`).font = { bold: true };
  sheet.getCell(`B${row}`).value = data.totalRevenue;
  sheet.getCell(`B${row}`).font = { bold: true };
  sheet.getCell(`C${row}`).value = 1.0;
  sheet.getCell(`C${row}`).font = { bold: true };
  row += 2;
  
  // COGS Section
  sheet.getCell(`A${row}`).value = 'COST OF GOODS SOLD';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;
  
  sheet.getCell(`A${row}`).value = 'Food Cost';
  sheet.getCell(`B${row}`).value = data.foodCost;
  sheet.getCell(`C${row}`).value = data.foodCost / data.totalRevenue;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Beverage Cost';
  sheet.getCell(`B${row}`).value = data.beverageCost;
  sheet.getCell(`C${row}`).value = data.beverageCost / data.totalRevenue;
  row++;
  
  const totalCOGS = data.foodCost + data.beverageCost;
  sheet.getCell(`A${row}`).value = 'Total COGS';
  sheet.getCell(`A${row}`).font = { bold: true };
  sheet.getCell(`B${row}`).value = totalCOGS;
  sheet.getCell(`B${row}`).font = { bold: true };
  sheet.getCell(`C${row}`).value = totalCOGS / data.totalRevenue;
  sheet.getCell(`C${row}`).font = { bold: true };
  row += 2;
  
  // Gross Profit
  const grossProfit = data.totalRevenue - totalCOGS;
  sheet.getCell(`A${row}`).value = 'GROSS PROFIT';
  sheet.getCell(`A${row}`).font = { bold: true, color: { argb: 'FF006400' } };
  sheet.getCell(`B${row}`).value = grossProfit;
  sheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FF006400' } };
  sheet.getCell(`C${row}`).value = grossProfit / data.totalRevenue;
  sheet.getCell(`C${row}`).font = { bold: true, color: { argb: 'FF006400' } };
  row += 2;
  
  // Operating Expenses
  sheet.getCell(`A${row}`).value = 'OPERATING EXPENSES';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;
  
  sheet.getCell(`A${row}`).value = 'Labor';
  sheet.getCell(`B${row}`).value = data.laborCost;
  sheet.getCell(`C${row}`).value = data.laborCost / data.totalRevenue;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Rent';
  sheet.getCell(`B${row}`).value = data.rent;
  sheet.getCell(`C${row}`).value = data.rent / data.totalRevenue;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Utilities';
  sheet.getCell(`B${row}`).value = data.utilities;
  sheet.getCell(`C${row}`).value = data.utilities / data.totalRevenue;
  row++;
  
  sheet.getCell(`A${row}`).value = 'Other Expenses';
  sheet.getCell(`B${row}`).value = data.otherExpenses;
  sheet.getCell(`C${row}`).value = data.otherExpenses / data.totalRevenue;
  row++;
  
  const totalOpEx = data.laborCost + data.rent + data.utilities + data.otherExpenses;
  sheet.getCell(`A${row}`).value = 'Total Operating Expenses';
  sheet.getCell(`A${row}`).font = { bold: true };
  sheet.getCell(`B${row}`).value = totalOpEx;
  sheet.getCell(`B${row}`).font = { bold: true };
  sheet.getCell(`C${row}`).value = totalOpEx / data.totalRevenue;
  sheet.getCell(`C${row}`).font = { bold: true };
  row += 2;
  
  // Net Profit
  const netProfit = grossProfit - totalOpEx;
  const profitColor = netProfit >= 0 ? 'FF006400' : 'FF8B0000';
  sheet.getCell(`A${row}`).value = 'NET PROFIT';
  sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: profitColor } };
  sheet.getCell(`B${row}`).value = netProfit;
  sheet.getCell(`B${row}`).font = { bold: true, size: 12, color: { argb: profitColor } };
  sheet.getCell(`C${row}`).value = netProfit / data.totalRevenue;
  sheet.getCell(`C${row}`).font = { bold: true, size: 12, color: { argb: profitColor } };
  
  // Format currency columns
  sheet.getColumn('B').numFmt = '$#,##0.00;[Red]-$#,##0.00';
  sheet.getColumn('D').numFmt = '$#,##0.00;[Red]-$#,##0.00';
  
  // Format percentage column
  sheet.getColumn('C').numFmt = '0.0%';
  
  // Set column widths
  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 15;
  sheet.getColumn('D').width = 15;
  
  // Save
  await workbook.xlsx.writeFile(`PL_${data.restaurantName}_${data.month}_${data.year}.xlsx`);
  
  return {
    filename: `PL_${data.restaurantName}_${data.month}_${data.year}.xlsx`,
    netProfit: netProfit,
    profitMargin: (netProfit / data.totalRevenue) * 100
  };
}

// Example usage
const restaurantData = {
  restaurantName: "Viking's Tavern",
  month: "October",
  year: "2024",
  totalRevenue: 60000,
  foodSales: 45000,
  beverageSales: 15000,
  budgetFoodSales: 43000,
  budgetBeverageSales: 14000,
  foodCost: 13500,
  beverageCost: 3750,
  laborCost: 18000,
  rent: 6000,
  utilities: 1800,
  otherExpenses: 2400
};

createRestaurantPL(restaurantData).then(result => {
  console.log('P&L created:', result.filename);
  console.log('Net Profit:', result.netProfit);
  console.log('Profit Margin:', result.profitMargin.toFixed(2) + '%');
});
```

---

## 🎨 Advanced Formatting Examples

### Color-Coded Performance Sheet

```javascript
async function createPerformanceSheet(metrics) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Performance Metrics');
  
  // Headers
  sheet.addRow(['Metric', 'Target', 'Actual', 'Status']);
  sheet.getRow(1).font = { bold: true, size: 12 };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  sheet.getRow(1).font.color = { argb: 'FFFFFFFF' };
  
  // Add metrics with conditional formatting
  metrics.forEach(metric => {
    const row = sheet.addRow([
      metric.name,
      metric.target,
      metric.actual,
      metric.actual >= metric.target ? 'On Target' : 'Below Target'
    ]);
    
    // Color code based on performance
    const statusCell = row.getCell(4);
    if (metric.actual >= metric.target) {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' }
      };
      statusCell.font = { color: { argb: 'FF006400' }, bold: true };
    } else {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCB' }
      };
      statusCell.font = { color: { argb: 'FF8B0000' }, bold: true };
    }
  });
  
  // Auto-fit columns
  sheet.columns = [
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];
  
  await workbook.xlsx.writeFile('performance-metrics.xlsx');
}

// Example usage
createPerformanceSheet([
  { name: 'Revenue', target: 50000, actual: 52000 },
  { name: 'Food Cost %', target: 30, actual: 28.5 },
  { name: 'Labor Cost %', target: 32, actual: 34.2 },
  { name: 'Guest Count', target: 1000, actual: 1100 }
]);
```

---

## 📈 Multi-Sheet Workbook

### Complete Analysis Workbook

```javascript
async function createAnalysisWorkbook(data) {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Executive Summary
  const summarySheet = workbook.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: 'FF1E90FF' } }
  });
  
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = 'Executive Summary';
  summarySheet.getCell('A1').font = { size: 18, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };
  
  summarySheet.addRow([]);
  summarySheet.addRow(['Key Metric', 'Value', 'Target', 'Variance']);
  summarySheet.addRow(['Total Revenue', data.revenue, data.targetRevenue, data.revenue - data.targetRevenue]);
  summarySheet.addRow(['Net Profit', data.netProfit, data.targetProfit, data.netProfit - data.targetProfit]);
  summarySheet.addRow(['Profit Margin', data.profitMargin + '%', data.targetMargin + '%', (data.profitMargin - data.targetMargin) + '%']);
  
  // Sheet 2: Detailed P&L
  const plSheet = workbook.addWorksheet('P&L Details', {
    properties: { tabColor: { argb: 'FF32CD32' } }
  });
  
  plSheet.mergeCells('A1:C1');
  plSheet.getCell('A1').value = 'Profit & Loss Statement';
  plSheet.getCell('A1').font = { size: 16, bold: true };
  plSheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // Add P&L data...
  plSheet.addRow([]);
  plSheet.addRow(['Category', 'Amount', '% of Revenue']);
  plSheet.addRow(['Revenue', data.revenue, '100.0%']);
  plSheet.addRow(['COGS', data.cogs, (data.cogs / data.revenue * 100).toFixed(1) + '%']);
  plSheet.addRow(['Labor', data.labor, (data.labor / data.revenue * 100).toFixed(1) + '%']);
  plSheet.addRow(['Operating Expenses', data.opex, (data.opex / data.revenue * 100).toFixed(1) + '%']);
  
  // Sheet 3: Recommendations
  const recsSheet = workbook.addWorksheet('Recommendations', {
    properties: { tabColor: { argb: 'FFFFA500' } }
  });
  
  recsSheet.mergeCells('A1:B1');
  recsSheet.getCell('A1').value = 'Strategic Recommendations';
  recsSheet.getCell('A1').font = { size: 16, bold: true };
  recsSheet.getCell('A1').alignment = { horizontal: 'center' };
  
  recsSheet.addRow([]);
  recsSheet.addRow(['Priority', 'Recommendation']);
  recsSheet.getCell('A3').font = { bold: true };
  recsSheet.getCell('B3').font = { bold: true };
  
  data.recommendations.forEach((rec, index) => {
    recsSheet.addRow([index + 1, rec]);
  });
  
  recsSheet.getColumn('A').width = 10;
  recsSheet.getColumn('B').width = 60;
  recsSheet.getColumn('B').alignment = { wrapText: true };
  
  await workbook.xlsx.writeFile('complete-analysis.xlsx');
}

// Example usage
createAnalysisWorkbook({
  revenue: 60000,
  targetRevenue: 55000,
  netProfit: 12000,
  targetProfit: 10000,
  profitMargin: 20,
  targetMargin: 18,
  cogs: 18000,
  labor: 19200,
  opex: 10800,
  recommendations: [
    'Reduce food cost by negotiating bulk pricing with suppliers',
    'Optimize labor scheduling during slow hours to reduce overtime',
    'Implement dynamic pricing for high-demand menu items',
    'Launch targeted marketing campaign for weekday lunch'
  ]
});
```

---

## 🔗 Express.js Integration

### API Endpoint for Excel Generation

```javascript
const express = require('express');
const ExcelJS = require('exceljs');
const app = express();

app.use(express.json());

// Generate and download Excel file
app.post('/api/generate-report', async (req, res) => {
  try {
    const { restaurantName, data } = req.body;
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    
    // Add title
    sheet.mergeCells('A1:C1');
    sheet.getCell('A1').value = `${restaurantName} - Financial Report`;
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Add data
    sheet.addRow([]);
    sheet.addRow(['Metric', 'Value', 'Notes']);
    data.forEach(item => {
      sheet.addRow([item.metric, item.value, item.notes]);
    });
    
    // Set response headers for download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${restaurantName}-report.xlsx"`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Save to File System

```javascript
const path = require('path');
const fs = require('fs');

app.post('/api/save-report', async (req, res) => {
  try {
    const { restaurantName, data } = req.body;
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    
    // ... add data to sheet ...
    
    // Create directory if it doesn't exist
    const outputDir = path.join(__dirname, 'generated-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save file
    const filename = `${restaurantName}-${Date.now()}.xlsx`;
    const filepath = path.join(outputDir, filename);
    
    await workbook.xlsx.writeFile(filepath);
    
    // Return download URL
    res.json({
      success: true,
      filename: filename,
      downloadUrl: `/download/${filename}`
    });
    
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Serve downloaded files
app.use('/download', express.static(path.join(__dirname, 'generated-reports')));
```

---

## 🧮 Formula Examples

### Using Excel Formulas

```javascript
async function createSpreadsheetWithFormulas() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Calculations');
  
  // Headers
  sheet.addRow(['Item', 'Price', 'Quantity', 'Total']);
  
  // Data rows
  sheet.addRow(['Burger', 12.99, 100]);
  sheet.addRow(['Pizza', 15.99, 75]);
  sheet.addRow(['Salad', 9.99, 50]);
  
  // Add formulas for total column
  sheet.getCell('D2').value = { formula: 'B2*C2' };
  sheet.getCell('D3').value = { formula: 'B3*C3' };
  sheet.getCell('D4').value = { formula: 'B4*C4' };
  
  // Grand total
  sheet.addRow(['', '', 'Grand Total:']);
  sheet.getCell('D5').value = { formula: 'SUM(D2:D4)' };
  sheet.getCell('D5').font = { bold: true };
  
  // Format currency
  sheet.getColumn('B').numFmt = '$#,##0.00';
  sheet.getColumn('D').numFmt = '$#,##0.00';
  
  await workbook.xlsx.writeFile('formulas-example.xlsx');
}
```

---

## 🎯 Complete Working Example

### Full Restaurant Report Generator

```javascript
const ExcelJS = require('exceljs');
const express = require('express');
const path = require('path');

class RestaurantReportGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, 'reports');
  }
  
  async generateMonthlyReport(data) {
    const workbook = new ExcelJS.Workbook();
    
    // Configure workbook properties
    workbook.creator = 'Restaurant Intelligence Platform';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Create sheets
    await this.createSummarySheet(workbook, data);
    await this.createPLSheet(workbook, data);
    await this.createMetricsSheet(workbook, data);
    
    // Save file
    const filename = `${data.restaurantName}_${data.month}_${data.year}.xlsx`;
    const filepath = path.join(this.outputDir, filename);
    
    await workbook.xlsx.writeFile(filepath);
    
    return {
      success: true,
      filename: filename,
      filepath: filepath
    };
  }
  
  async createSummarySheet(workbook, data) {
    const sheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FF1E90FF' } }
    });
    
    // Title
    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').value = `${data.restaurantName} - Monthly Summary`;
    sheet.getCell('A1').font = { size: 18, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Key metrics
    sheet.addRow([]);
    sheet.addRow(['Period:', `${data.month} ${data.year}`]);
    sheet.addRow(['Total Revenue:', data.revenue]);
    sheet.addRow(['Net Profit:', data.netProfit]);
    sheet.addRow(['Profit Margin:', `${data.profitMargin}%`]);
    
    // Format
    sheet.getColumn('A').width = 20;
    sheet.getColumn('B').width = 20;
    sheet.getCell('B4').numFmt = '$#,##0.00';
    sheet.getCell('B5').numFmt = '$#,##0.00';
  }
  
  async createPLSheet(workbook, data) {
    const sheet = workbook.addWorksheet('P&L Statement', {
      properties: { tabColor: { argb: 'FF32CD32' } }
    });
    
    // Add P&L structure
    sheet.mergeCells('A1:C1');
    sheet.getCell('A1').value = 'Profit & Loss Statement';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Headers
    sheet.addRow([]);
    sheet.addRow(['Line Item', 'Amount', '% of Revenue']);
    
    // Data
    const plData = [
      ['Revenue', data.revenue, 100],
      ['Food Cost', data.foodCost, (data.foodCost / data.revenue * 100)],
      ['Labor Cost', data.laborCost, (data.laborCost / data.revenue * 100)],
      ['Operating Expenses', data.opex, (data.opex / data.revenue * 100)],
      ['Net Profit', data.netProfit, (data.netProfit / data.revenue * 100)]
    ];
    
    plData.forEach(row => {
      const addedRow = sheet.addRow(row);
      if (row[0] === 'Revenue' || row[0] === 'Net Profit') {
        addedRow.font = { bold: true };
      }
    });
    
    // Format
    sheet.getColumn('B').numFmt = '$#,##0.00';
    sheet.getColumn('C').numFmt = '0.0%';
    sheet.columns.forEach(col => col.width = 20);
  }
  
  async createMetricsSheet(workbook, data) {
    const sheet = workbook.addWorksheet('KPIs', {
      properties: { tabColor: { argb: 'FFFFA500' } }
    });
    
    // Title
    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').value = 'Key Performance Indicators';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Headers
    sheet.addRow([]);
    sheet.addRow(['KPI', 'Target', 'Actual', 'Status']);
    
    // KPIs
    const kpis = [
      ['Food Cost %', '30%', `${data.foodCostPct}%`, data.foodCostPct <= 30 ? '✓' : '✗'],
      ['Labor Cost %', '32%', `${data.laborCostPct}%`, data.laborCostPct <= 32 ? '✓' : '✗'],
      ['Prime Cost %', '62%', `${data.primeCostPct}%`, data.primeCostPct <= 62 ? '✓' : '✗']
    ];
    
    kpis.forEach(kpi => {
      const row = sheet.addRow(kpi);
      const statusCell = row.getCell(4);
      statusCell.font = { 
        bold: true,
        color: { argb: kpi[3] === '✓' ? 'FF006400' : 'FF8B0000' }
      };
    });
    
    sheet.columns.forEach(col => col.width = 15);
  }
}

// Express server
const app = express();
app.use(express.json());

const generator = new RestaurantReportGenerator();

app.post('/api/generate-monthly-report', async (req, res) => {
  try {
    const result = await generator.generateMonthlyReport(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Report generator running on port 3000');
});

// Example data
const exampleData = {
  restaurantName: "Viking's Tavern",
  month: "October",
  year: "2024",
  revenue: 60000,
  foodCost: 18000,
  laborCost: 19200,
  opex: 10800,
  netProfit: 12000,
  profitMargin: 20,
  foodCostPct: 30,
  laborCostPct: 32,
  primeCostPct: 62
};
```

---

## 📚 Summary

These examples demonstrate:

- ✅ Basic Excel file creation with ExcelJS
- ✅ Advanced formatting (colors, fonts, alignment)
- ✅ Multi-sheet workbooks
- ✅ Conditional formatting
- ✅ Formula integration
- ✅ Express.js API endpoints
- ✅ Direct downloads and file system saves
- ✅ Complete restaurant reporting system

Copy and adapt these examples for your own spreadsheet generation needs!
