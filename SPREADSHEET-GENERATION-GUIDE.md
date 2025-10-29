# 📊 Spreadsheet Generation Features - Technical Documentation

## Overview

This document explains how the spreadsheet generation features work in the Odin's Almanac Restaurant Intelligence Platform. The system uses **ExcelJS** to create sophisticated Excel workbooks with multiple sheets, formulas, formatting, and AI-powered insights.

---

## 🏗️ Architecture

### Key Technologies

1. **ExcelJS** (v4.4.0) - Core Excel generation library
2. **Express.js** - Web server and API endpoints
3. **Python AI Agents** - AI consultation integration
4. **Node.js Child Processes** - Communication with Python scripts

### File Structure

```
├── working-ai-server.js              # Main server with spreadsheet endpoints
├── pl-calculator.js                  # P&L calculation logic
├── test-spreadsheet-generation.js    # Test suite for spreadsheet features
├── server/
│   └── lib/
│       └── ai/
│           └── ai-consultant.js      # AI consultation integration
└── generated-spreadsheets/           # Output directory for Excel files
```

---

## 🔥 How Spreadsheet Generation Works

### 1. AI-Powered Spreadsheet Endpoint

**Location:** `working-ai-server.js` (lines 104-284)

**Endpoint:** `POST /api/ai/generate-spreadsheet`

**Request Body:**
```json
{
  "goals": {
    "restaurantName": "Vikings Feast",
    "restaurantType": "casual-dining",
    "salesGoal": 1200000,
    "foodCostPercentage": 28,
    "laborCostPercentage": 30,
    "targetProfitPercentage": 15
  },
  "query": "Generate comprehensive P&L spreadsheet with formulas"
}
```

**Process Flow:**

```
┌─────────────────────────────────────────────────────┐
│ 1. Client sends request with business goals         │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 2. Server spawns Python AI agent subprocess         │
│    Command: python ai-agents/restaurant_oracle.py   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 3. AI agent analyzes goals and generates insights   │
│    Returns JSON with consultation/advice            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 4. Create ExcelJS Workbook with multiple sheets:    │
│    - AI Oracle Consultation                         │
│    - Financial Analysis (P&L)                       │
│    - Menu Engineering                               │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 5. Apply formatting, formulas, and styling          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 6. Save file to generated-spreadsheets/ directory   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│ 7. Return download URL to client                    │
│    /download/Viking_Restaurant_Analysis_[timestamp] │
└─────────────────────────────────────────────────────┘
```

### 2. Key Code Sections

#### Creating a Workbook

```javascript
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
```

#### Adding a Worksheet

```javascript
const aiSheet = workbook.addWorksheet('AI Oracle Consultation', {
  properties: { tabColor: { argb: 'FF1e3a8a' } }
});
```

#### Adding Headers with Formatting

```javascript
// Merge cells and add title
aiSheet.getCell('A1').value = '🔮 ODIN\'S ORACLE CONSULTATION';
aiSheet.getCell('A1').font = { 
  size: 16, 
  bold: true, 
  color: { argb: 'FF1e3a8a' } 
};
aiSheet.mergeCells('A1:D1');
```

#### Adding Data Rows

```javascript
const plData = [
  ['Revenue', '', ''],
  ['Food Sales', 45000, '75%'],
  ['Beverage Sales', 15000, '25%'],
  ['Total Revenue', 60000, '100%']
];

plData.forEach((row, index) => {
  aiSheet.getCell(`A${index + 3}`).value = row[0];
  aiSheet.getCell(`B${index + 3}`).value = row[1];
  aiSheet.getCell(`C${index + 3}`).value = row[2];
});
```

#### Saving the File

```javascript
const filename = `Viking_Restaurant_Analysis_${Date.now()}.xlsx`;
const filepath = path.join(__dirname, 'generated-spreadsheets', filename);
await workbook.xlsx.writeFile(filepath);
```

---

## 📈 Comprehensive P&L Export

### Endpoint

**Location:** `working-ai-server.js` (lines 343-471)

**Endpoint:** `POST /api/export/comprehensive-pl`

**Request Body:**
```json
{
  "formData": {
    "restaurantName": "Odin's Feast Hall",
    "month": "October",
    "year": "2024",
    "actualFoodSales": 45000,
    "actualBeverageSales": 15000,
    "actualFoodCost": 13500,
    "actualKitchenLabor": 9000,
    "actualFohLabor": 6000,
    "actualRent": 6000,
    "actualUtilities": 1800
  },
  "results": {
    "revenue": {
      "actualTotal": 60000,
      "budgetTotal": 55000,
      "variance": 5000
    },
    "costs": {
      "actualCOGS": 17250,
      "actualCOGSPct": 28.75
    },
    "margins": {
      "actualNetProfit": 12750,
      "actualNetProfitPct": 21.25
    }
  }
}
```

### Features

#### 1. Dynamic Headers
```javascript
summarySheet.mergeCells('A1:F1');
summarySheet.getCell('A1').value = `${formData.restaurantName} - Comprehensive P&L Analysis`;
summarySheet.getCell('A1').font = { bold: true, size: 16 };
summarySheet.getCell('A1').alignment = { horizontal: 'center' };
```

#### 2. Column Headers with Styling
```javascript
summarySheet.getCell('A3').value = 'Line Item';
summarySheet.getCell('B3').value = 'Actual $';
summarySheet.getCell('C3').value = 'Budget $';

['A3', 'B3', 'C3'].forEach(cell => {
  summarySheet.getCell(cell).font = { bold: true };
  summarySheet.getCell(cell).fill = { 
    type: 'pattern', 
    pattern: 'solid', 
    fgColor: { argb: 'FFE5E5E5' } 
  };
});
```

#### 3. Currency Formatting
```javascript
['B', 'C', 'D'].forEach(col => {
  summarySheet.getColumn(col).numFmt = '$#,##0;[Red]-$#,##0';
});
```

#### 4. Percentage Formatting
```javascript
['E', 'F'].forEach(col => {
  summarySheet.getColumn(col).numFmt = '0.0%';
});
```

#### 5. Conditional Color Formatting
```javascript
summarySheet.getCell('B${row}').font = { 
  bold: true, 
  color: { 
    argb: results.margins.actualNetProfit >= 0 ? 'FF00AA00' : 'FFAA0000' 
  } 
};
```

#### 6. Direct Download Response
```javascript
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
await workbook.xlsx.write(res);
res.end();
```

---

## 🧮 P&L Calculator Integration

### Overview

The `pl-calculator.js` module provides the business logic for P&L calculations extracted from the mobile app.

**Location:** `pl-calculator.js`

### Key Methods

#### 1. Calculate Comprehensive P&L
```javascript
calculateComprehensivePL(data) {
  const results = {
    period: { month, year, restaurantName },
    revenue: {},
    costs: {},
    margins: {},
    analysis: {}
  };
  
  // Revenue Calculations
  results.revenue.actualTotal = 
    parseNumber(data.actualFoodSales) + 
    parseNumber(data.actualBeverageSales) + 
    parseNumber(data.actualOtherRevenue);
  
  // COGS Calculations
  results.costs.actualCOGS = 
    parseNumber(data.actualFoodCost) + 
    parseNumber(data.actualBeverageCost);
  
  // Prime Cost (COGS + Labor)
  results.costs.actualPrimeCost = 
    results.costs.actualCOGS + results.costs.actualLabor;
  
  // Net Profit
  results.margins.actualNetProfit = 
    results.revenue.actualTotal - 
    results.costs.actualPrimeCost - 
    actualOpEx;
    
  return results;
}
```

#### 2. Helper Methods
```javascript
parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}
```

---

## 🤖 AI Consultation Integration

### Python AI Agent Communication

**Location:** `server/lib/ai/ai-consultant.js`

### How It Works

```javascript
class OdinsAIConsultant {
  async getAIConsultation(query, restaurantContext = null) {
    return new Promise((resolve, reject) => {
      // Spawn Python subprocess
      const pythonProcess = spawn('python', [
        this.pythonScriptPath,
        '--query', query,
        '--context', JSON.stringify(restaurantContext || {})
      ]);

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
          const result = JSON.parse(outputData);
          resolve({
            success: true,
            consultation: result.response,
            timestamp: new Date().toISOString()
          });
        } else {
          reject(new Error(errorData));
        }
      });
    });
  }
}
```

### Integration in Spreadsheet Generation

```javascript
// Get AI consultation first
const python = spawn('python', [
  'ai-agents/restaurant_oracle.py', 
  '--query', aiQuery
]);

python.on('close', async (code) => {
  if (code === 0 && aiResult.trim()) {
    const aiResponse = JSON.parse(aiResult.trim());
    
    // Create AI Consultation Sheet
    const aiSheet = workbook.addWorksheet('AI Oracle Consultation');
    aiSheet.getCell('A6').value = aiResponse.response;
    
    // ... continue with other sheets
  }
});
```

---

## 📦 ExcelJS Features Used

### 1. Workbook Management
```javascript
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Sheet Name', {
  properties: { tabColor: { argb: 'FF1e3a8a' } }
});
```

### 2. Cell Manipulation
```javascript
// Set value
sheet.getCell('A1').value = 'Header';

// Merge cells
sheet.mergeCells('A1:D1');

// Formatting
sheet.getCell('A1').font = { size: 16, bold: true };
sheet.getCell('A1').alignment = { horizontal: 'center', wrapText: true };
sheet.getCell('A1').fill = { 
  type: 'pattern', 
  pattern: 'solid', 
  fgColor: { argb: 'FFE5E5E5' } 
};
```

### 3. Number Formatting
```javascript
// Currency
column.numFmt = '$#,##0;[Red]-$#,##0';

// Percentage
column.numFmt = '0.0%';

// Custom
column.numFmt = '#,##0.00';
```

### 4. Column Management
```javascript
// Auto-fit
sheet.columns.forEach(column => {
  column.width = 20;
});

// Specific width
sheet.getColumn('A').width = 30;
```

### 5. Row Styling
```javascript
sheet.getRow(3).font = { bold: true };
sheet.getRow(3).fill = { 
  type: 'pattern', 
  pattern: 'solid', 
  fgColor: { argb: 'FFE5E5E5' } 
};
```

---

## 🎨 Styling Patterns

### Header Styling
```javascript
const header = sheet.getCell('A1');
header.value = 'RESTAURANT P&L ANALYSIS';
header.font = { size: 14, bold: true };
header.alignment = { horizontal: 'center' };
sheet.mergeCells('A1:C1');
```

### Section Headers
```javascript
sheet.getCell('A${row}').value = 'REVENUE';
sheet.getCell('A${row}').font = { bold: true };
```

### Totals with Color
```javascript
const cell = sheet.getCell('B${row}');
cell.value = totalValue;
cell.font = { 
  bold: true, 
  color: { argb: totalValue >= 0 ? 'FF00AA00' : 'FFAA0000' } 
};
```

---

## 🧪 Testing

### Test File

**Location:** `test-spreadsheet-generation.js`

### Sample Test
```javascript
async function testSpreadsheetGeneration() {
  const testGoals = {
    restaurantName: "Vikings Feast",
    restaurantType: "casual-dining", 
    salesGoal: 1200000,
    foodCostPercentage: 28,
    laborCostPercentage: 30,
    targetProfitPercentage: 15
  };

  const response = await fetch('http://localhost:3001/api/ai/generate-spreadsheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goals: testGoals,
      query: 'Generate comprehensive P&L spreadsheet with formulas'
    })
  });

  const data = await response.json();
  console.log('Success:', data.success);
  console.log('Download URL:', data.excelFile.downloadPath);
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# AI Features (optional)
GITHUB_TOKEN=your_github_token_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

### Required Dependencies

```json
{
  "dependencies": {
    "exceljs": "^4.4.0",
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3"
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Generate AI-Powered Spreadsheet

```javascript
const response = await fetch('/api/ai/generate-spreadsheet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goals: {
      restaurantName: "Odin's Tavern",
      salesGoal: 1000000,
      foodCostPercentage: 30,
      laborCostPercentage: 32
    },
    query: "Provide strategic recommendations for improving profitability"
  })
});

const result = await response.json();
// result.download_url contains the path to download the Excel file
```

### Example 2: Export Comprehensive P&L

```javascript
const response = await fetch('/api/export/comprehensive-pl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formData: {
      restaurantName: "Viking's Den",
      month: "October",
      year: "2024",
      actualFoodSales: 50000,
      actualBeverageSales: 15000,
      // ... other fields
    },
    results: plCalculator.calculateComprehensivePL(formData)
  })
});

// Browser will automatically download the Excel file
```

---

## 💡 Key Insights

### What Makes This System Work

1. **ExcelJS Library** - Powerful, server-side Excel generation without Excel installed
2. **Multi-Sheet Workbooks** - Organize data into logical sections
3. **Rich Formatting** - Colors, fonts, alignment, and number formats
4. **AI Integration** - Python subprocess communication for AI insights
5. **Direct Download** - Stream Excel files directly to client
6. **Reusable Calculator** - Shared business logic between mobile app and web

### Best Practices

1. **Always validate input data** before calculations
2. **Use helper functions** for number parsing and formatting
3. **Apply consistent styling** across sheets
4. **Save files with timestamps** to avoid conflicts
5. **Handle errors gracefully** with try-catch blocks
6. **Clean up generated files** periodically

---

## 🔗 Related Files

- `working-ai-server.js` - Main server implementation
- `pl-calculator.js` - P&L calculation logic
- `server/lib/ai/ai-consultant.js` - AI consultation integration
- `test-spreadsheet-generation.js` - Test suite
- `package.json` - Dependencies including ExcelJS

---

## 📚 Additional Resources

### ExcelJS Documentation
- GitHub: https://github.com/exceljs/exceljs
- API Docs: https://github.com/exceljs/exceljs#interface

### Related Technologies
- Express.js: https://expressjs.com/
- Node.js Child Processes: https://nodejs.org/api/child_process.html
- Stream API: https://nodejs.org/api/stream.html

---

## ✅ Summary

The spreadsheet generation features in this system use **ExcelJS** to create sophisticated Excel workbooks with:

- ✅ Multiple worksheets with tab colors
- ✅ Rich formatting (fonts, colors, alignment)
- ✅ Number formatting (currency, percentages)
- ✅ Cell merging and headers
- ✅ AI-powered insights integration
- ✅ P&L calculations and analysis
- ✅ Direct download functionality
- ✅ Reusable business logic

This creates a powerful restaurant intelligence platform that generates professional, data-rich Excel reports with AI-powered recommendations.
